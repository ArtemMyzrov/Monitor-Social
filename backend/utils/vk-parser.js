const axios = require('axios')

class VKParser {
    constructor(accessToken) {
        this.accessToken = accessToken || process.env.VK_ACCESS_TOKEN;
        this.apiVersion = '5.131';
        this.baseURL = 'https://api.vk.com/method';
        this.groupIdCache = new Map();


        this.keywords = [
            'льготная карта', 'транспортная льготная карта', 'не работает',
            'остановка', 'проезд', 'кондуктор', 'водитель', 'пассажир', 'перевозчик', 'льготная'
        ];
    }


    containsKeywords(text) {
        if (!text) return false;

        const lowerText = text.toLowerCase();
        return this.keywords.some(keyword =>
            lowerText.includes(keyword.toLowerCase())
        );
    }

    removeDuplicates(posts) {
        const seen = new Set();
        return posts.filter(post => {
            if (seen.has(post.url)) {
                return false;
            }
            seen.add(post.url);
            return true;
        });
    }

    async resolveGroupScreenName(screenName) {
        if (this.groupIdCache.has(screenName)) {
            return this.groupIdCache.get(screenName);
        }

        try {
            const response = await axios.get(`${this.baseURL}/utils.resolveScreenName`, {
                params: {
                    screen_name: screenName,
                    access_token: this.accessToken,
                    v: this.apiVersion
                }
            });

            if (response.data.response && response.data.response.type === 'group' && response.data.response.object_id) {
                const groupId = -Math.abs(response.data.response.object_id);
                this.groupIdCache.set(screenName, groupId);
                console.log(`🔍 ${screenName} → ID: ${groupId}`);
                return groupId;
            }

            console.error(`❌ Группа ${screenName} не найдена`);
            return null;
        } catch (error) {
            console.error(`❌ Ошибка получения ID для ${screenName}:`, error.message);
            return null;
        }
    }

    async monitorSaratovGroups() {
        const saratovGroups = [
            { screenName: 'volodin_saratov', name: 'Вячеслав Володин' },
            { screenName: 'rus_crime_saratov', name: 'Новости Саратова сегодня' },
            { screenName: 'saratov.life', name: 'Саратов Life' },
            { screenName: '64saratov', name: 'Типичный Саратов' },
            { screenName: 'capatoff', name: 'Регион 64' },
            { screenName: 'saratov_story', name: 'Подслушано Саратов' },
            { screenName: 'saratov_atypical', name: 'Нетипичный Саратов' },
            { screenName: 'sarobl', name: 'Саратовщина - Саратов и Саратовская область' },
            { screenName: 'saratov24', name: 'Саратов24' }
        ];

        let allPosts = [];


        for (const group of saratovGroups) {
            try {
                const groupId = await this.resolveGroupScreenName(group.screenName);
                if (!groupId) {
                    console.error(`❌ Пропускаем группу "${group.name}" - ID не получен`);
                    continue;
                }

                const posts = await this.getGroupPosts(groupId, 5);

                const filteredPosts = posts.filter(post =>
                    this.containsKeywords(post.text)
                );

                const parsedPosts = filteredPosts.map(post => this.parsePost(post, group.name));
                allPosts = allPosts.concat(parsedPosts);

                console.log(`✅ Группа "${group.name}": ${filteredPosts.length}/${posts.length} релевантных постов`);
                await this.delay(500);
            } catch (error) {
                console.error(`❌ Ошибка группы ${group.name}:`, error.message);
            }
        }


        console.log('🔍 Дополнительный поиск по ключевым словам...');
        for (const keyword of this.keywords) {
            try {
                const searchPosts = await this.searchInSaratov(keyword, 3);
                // Фильтруем результаты поиска
                const filteredPosts = searchPosts.filter(post =>
                    this.containsKeywords(post.text)
                );
                const parsedPosts = filteredPosts.map(post =>
                    this.parsePost(post, `Поиск: ${keyword}`)
                );
                allPosts = allPosts.concat(parsedPosts);

                console.log(`✅ Поиск "${keyword}": ${filteredPosts.length} постов`);
                await this.delay(300); // Уменьшенная задержка
            } catch (error) {
                console.error(`❌ Ошибка поиска "${keyword}":`, error.message);
            }
        }


        const uniquePosts = this.removeDuplicates(allPosts);
        console.log(`🎯 Всего уникальных релевантных постов: ${uniquePosts.length}`);

        return uniquePosts;
    }


    async searchInSaratov(query, count = 10) {
        console.log(`🔍 Поиск по Саратову: "${query}"`);

        try {
            const response = await axios.get(`${this.baseURL}/newsfeed.search`, {
                params: {
                    q: `${query} Саратов`,
                    access_token: this.accessToken,
                    v: this.apiVersion,
                    count: count,
                    extended: 0
                }
            });

            if (response.data.error) {
                console.error('VK API Search Error:', response.data.error);
                return [];
            }

            const posts = response.data.response.items || [];
            console.log(`✅ Найдено постов по запросу "${query}": ${posts.length}`);
            return posts;
        } catch (error) {
            console.error('VK Search Error:', error.message);
            return [];
        }
    }


    async getGroupPosts(groupId, count = 5) {
        try {
            const response = await axios.get(`${this.baseURL}/wall.get`, {
                params: {
                    owner_id: groupId,
                    access_token: this.accessToken,
                    v: this.apiVersion,
                    count: count,
                    extended: 0
                }
            });

            if (response.data.error) {
                console.error('VK API Error:', response.data.error);
                return [];
            }

            return response.data.response.items || [];
        } catch (error) {
            console.error('VK Parser Error:', error.message);
            return [];
        }
    }


    parsePost(post, groupName = 'VK') {
        return {
            text: post.text,
            source: `VK: ${groupName}`,
            url: `https://vk.com/wall${post.owner_id}_${post.id}`,
            vk_post_id: `${post.owner_id}_${post.id}`,
            date: new Date(post.date * 1000),
            likes: post.likes?.count || 0,
            reposts: post.reposts?.count || 0,
            views: post.views?.count || 0
        };
    }


    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = VKParser;