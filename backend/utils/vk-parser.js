const axios = require('axios')
const KeywordMatcher = require('./keywordMatcher');

class VKParser {
    constructor(accessToken) {
        this.accessToken = accessToken || process.env.VK_ACCESS_TOKEN;
        this.apiVersion = '5.131';
        this.baseURL = 'https://api.vk.com/method';
        this.groupIdCache = new Map();
        this.keywordMatcher = new KeywordMatcher()

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
    // В VKParser полностью перепишем метод monitorGroups
    async monitorGroups() {
        console.log('🔍 Мониторинг групп...');

        let allPosts = [];

        for (const group of this.groups) {
            try {
                const groupId = await this.resolveGroupScreenName(group.screenName);
                if (!groupId) {
                    console.error(`❌ Пропускаем группу "${group.name}" - ID не получен`);
                    continue;
                }

                // Получаем посты за последние 7 дней (как при фильтрации)
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 7); // Последние 7 дней

                const startTimestamp = Math.floor(startDate.getTime() / 1000);
                const endTimestamp = Math.floor(endDate.getTime() / 1000);

                // Используем тот же метод, что и в monitorByDateRange
                const posts = await this.getPostsByDateRange(groupId, startTimestamp, endTimestamp);
                const filteredPosts = posts.filter(post => this.containsKeywords(post.text));
                const parsedPosts = filteredPosts.map(post => {
                    console.log(`📅 Пост из ${group.name}:`, {
                        date: post.date,
                        text: post.text?.substring(0, 50)
                    });
                    return this.parsePost(post, group.name);
                });

                allPosts = allPosts.concat(parsedPosts);
                console.log(`✅ Группа "${group.name}": ${filteredPosts.length} релевантных постов`);

                await this.delay(300);
            } catch (error) {
                console.error(`❌ Ошибка группы ${group.name}:`, error.message);
            }
        }

        const uniquePosts = this.removeDuplicates(allPosts);
        console.log(`🎯 Всего найдено постов: ${uniquePosts.length}`);

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

            // Обновляем словоформы в KeywordMatcher если нужно
            // Например, добавляем новые словоформы для новых ключевых слов
            newKeywords.forEach(keyword => {
                if (!this.keywordMatcher.wordForms[keyword]) {
                    // Можно добавить базовые словоформы или оставить пустым
                    console.log(`ℹ️ Новое ключевое слово: "${keyword}"`);
                }
            });
        }
        return this.keywords;
    }

    getKeywords() {
        return this.keywords;
    }

    // Существующие методы без изменений
    containsKeywords(text) {
        if (!text) return false;

        console.log(`\n🔍 ПРОВЕРКА: "${text.substring(0, 100)}..."`);

        const lowerText = text.toLowerCase();
        let found = false;

        this.keywords.forEach(keyword => {
            if (keyword.includes(' ')) {
                // Для фраз ищем точное вхождение
                if (lowerText.includes(keyword.toLowerCase())) {
                    console.log(`✅ Найдена фраза: "${keyword}"`);
                    found = true;
                }
            } else if (keyword === 'водитель') {
                // Для "водитель" ищем только отдельные слова
                const regex = new RegExp(`\\b${keyword}\\b`, 'i');
                if (regex.test(text)) {
                    console.log(`✅ Найдено слово: "${keyword}"`);
                    found = true;
                }
            } else {
                // Для остальных слов ищем любое вхождение
                if (lowerText.includes(keyword.toLowerCase())) {
                    console.log(`✅ Найдено слово: "${keyword}"`);
                    found = true;
                }
            }
        });

        if (!found) {
            console.log('❌ Ничего не найдено');
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
        // Правильно преобразуем Unix timestamp из VK
        const postDate = new Date(post.date * 1000);

        return {
            text: post.text,
            source: `VK: ${groupName}`,
            url: `https://vk.com/wall${post.owner_id}_${post.id}`,
            date: postDate.toISOString(), // 🔥 ПЕРЕДАЕМ ДАТУ ИЗ VK
            vk_post_id: `${post.owner_id}_${post.id}`,
            likes: post.likes?.count || 0,
            reposts: post.reposts?.count || 0,
            views: post.views?.count || 0
        };
    }
    async monitorByDateRange(startDate, endDate = new Date()) {
        const startTimestamp = Math.floor(startDate.getTime() / 1000);
        const endTimestamp = Math.floor(endDate.getTime() / 1000);

        console.log(`⏰ Поиск постов с ${startDate.toLocaleString('ru-RU')} по ${endDate.toLocaleString('ru-RU')}`);

        let allPosts = [];

        for (const group of this.groups) {
            try {
                const groupId = await this.resolveGroupScreenName(group.screenName);
                if (!groupId) {
                    console.error(`❌ Пропускаем группу "${group.name}" - ID не получен`);
                    continue;
                }

                // Получаем посты за указанный период
                const posts = await this.getPostsByDateRange(groupId, startTimestamp, endTimestamp);
                const filteredPosts = posts.filter(post => this.containsKeywords(post.text));
                const parsedPosts = filteredPosts.map(post => this.parsePost(post, group.name));
                allPosts = allPosts.concat(parsedPosts);

                console.log(`✅ Группа "${group.name}": ${filteredPosts.length} релевантных постов за период`);
                await this.delay(300);
            } catch (error) {
                console.error(`❌ Ошибка группы ${group.name}:`, error.message);
            }
        }

        const uniquePosts = this.removeDuplicates(allPosts);
        console.log(`🎯 Всего найдено постов за период: ${uniquePosts.length}`);

        return uniquePosts;
    }

    async getPostsByDateRange(groupId, startTimestamp, endTimestamp) {
        try {
            let allPosts = [];
            let offset = 0;
            const count = 100; // Максимум по VK API

            while (true) {
                const response = await axios.get(`${this.baseURL}/wall.get`, {
                    params: {
                        owner_id: groupId,
                        access_token: this.accessToken,
                        v: this.apiVersion,
                        count: count,
                        offset: offset,
                        extended: 0
                    }
                });

                if (response.data.error || !response.data.response) {
                    break;
                }

                const posts = response.data.response.items || [];
                if (posts.length === 0) break;

                // Фильтруем посты по дате
                const postsInRange = posts.filter(post =>
                    post.date >= startTimestamp && post.date <= endTimestamp
                );

                allPosts = allPosts.concat(postsInRange);

                // Если самый старый пост старше нужного периода - выходим
                const oldestPost = posts[posts.length - 1];
                if (oldestPost.date < startTimestamp) {
                    break;
                }

                offset += count;
                await this.delay(200); // Задержка между запросами
            }

            // Сортируем от новых к старым
            allPosts.sort((a, b) => b.date - a.date);

            return allPosts;
        } catch (error) {
            console.error('VK Parser Error:', error.message);
            return [];
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = VKParser;