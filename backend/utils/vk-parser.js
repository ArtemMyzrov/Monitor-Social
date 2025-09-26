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

        // Группы по умолчанию
        this.defaultGroups = [
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

        this.groups = [...this.defaultGroups];
    }

    // Методы для управления группами
    setGroups(newGroups) {
        if (Array.isArray(newGroups)) {
            this.groups = newGroups.filter(group =>
                group && group.screenName && group.name
            );
            console.log('✅ Группы установлены:', this.groups.length, 'групп');
        }
        return this.groups;
    }

    getGroups() {
        return this.groups;
    }

    addGroup(screenName, name) {
        const existingGroup = this.groups.find(g => g.screenName === screenName);
        if (!existingGroup) {
            this.groups.push({ screenName, name });
            console.log(`✅ Добавлена группа: ${name} (@${screenName})`);
        }
        return this.groups;
    }

    removeGroup(screenName) {
        this.groups = this.groups.filter(g => g.screenName !== screenName);
        console.log(`✅ Удалена группа: @${screenName}`);
        return this.groups;
    }

    // Основной метод мониторинга с поддержкой динамических групп
    async monitorGroups(customGroups = null) {
        const groupsToMonitor = customGroups || this.groups;

        if (!groupsToMonitor || groupsToMonitor.length === 0) {
            console.log('❌ Нет групп для мониторинга');
            return [];
        }

        let allPosts = [];

        console.log('🔍 Мониторинг групп:');
        groupsToMonitor.forEach(group => {
            console.log(`   - ${group.name} (@${group.screenName})`);
        });

        for (const group of groupsToMonitor) {
            try {
                const groupId = await this.resolveGroupScreenName(group.screenName);
                if (!groupId) {
                    console.error(`❌ Пропускаем группу "${group.name}" - ID не получен`);
                    continue;
                }

                const posts = await this.getGroupPosts(groupId, 5);
                const filteredPosts = posts.filter(post => this.containsKeywords(post.text));
                const parsedPosts = filteredPosts.map(post => this.parsePost(post, group.name));
                allPosts = allPosts.concat(parsedPosts);

                console.log(`✅ Группа "${group.name}": ${filteredPosts.length}/${posts.length} релевантных постов`);
                await this.delay(500);
            } catch (error) {
                console.error(`❌ Ошибка группы ${group.name}:`, error.message);
            }
        }

        const uniquePosts = this.removeDuplicates(allPosts);
        console.log(`🎯 Всего постов из ${groupsToMonitor.length} групп: ${uniquePosts.length}`);

        return uniquePosts;
    }

    // Метод для обратной совместимости
    async monitorSaratovGroups() {
        return this.monitorGroups(); // Использует группы по умолчанию
    }

    // Метод для проверки группы
    async testGroup(screenName) {
        try {
            const groupId = await this.resolveGroupScreenName(screenName);
            if (!groupId) {
                throw new Error('Группа не найдена');
            }

            // Пробуем получить несколько постов для проверки доступности
            const posts = await this.getGroupPosts(groupId, 1);

            return {
                screenName,
                groupId,
                exists: true,
                accessible: posts !== null,
                postCount: posts ? posts.length : 0
            };
        } catch (error) {
            throw new Error(`Ошибка проверки группы: ${error.message}`);
        }
    }

    // Методы для управления ключевыми словами
    setKeywords(newKeywords) {
        if (Array.isArray(newKeywords)) {
            this.keywords = newKeywords;
            console.log('✅ Ключевые слова установлены:', this.keywords.length, 'слов');
        }
        return this.keywords;
    }

    getKeywords() {
        return this.keywords;
    }

    // Существующие методы без изменений
    containsKeywords(text) {
        if (!text) {
            console.log('❌ Текст пустой');
            return false;
        }

        const lowerText = text.toLowerCase();
        const found = this.keywords.some(keyword =>
            lowerText.includes(keyword.toLowerCase())
        );

        if (!found) {
            console.log('❌ Ключевые слова не найдены в тексте');
        }

        return found;
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

            const posts = response.data.response.items || [];
            return posts;
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