const VKParser = require('../utils/vk-parser');
const { dbHelpers } = require('../database'); // Измененный импорт

class VKController {
    constructor() {
        this.parser = new VKParser(process.env.VK_ACCESS_TOKEN);
        this.keywords = [
            'льготная карта', 'транспортная льготная карта', 'не работает', 'оплата',
            'терминал', 'остановка', 'проезд', 'кондуктор',
            'водитель', 'пассажир', 'перевозчик', 'льготная',
        ];
    }

    async monitorSaratov() {
        console.log('🔍 Мониторинг ВК Саратова...');

        let allPosts = []; const VKParser = require('../services/VKParser');
        const { dbHelpers } = require('../database');

        class VKController {
            constructor() {
                this.parser = new VKParser(process.env.VK_ACCESS_TOKEN);
            }

            async monitorSaratov() {
                try {
                    const posts = await this.parser.monitorSaratovGroups();

                    // Сохраняем посты в базу
                    for (const post of posts) {
                        try {
                            await dbHelpers.saveMention({
                                text: post.text,
                                source: post.source,
                                url: post.url,
                                vk_post_id: post.vk_post_id,
                                likes: post.likes,
                                reposts: post.reposts,
                                views: post.views
                            });
                        } catch (error) {
                            console.error('Error saving post:', error);
                        }
                    }

                    return posts;
                } catch (error) {
                    console.error('Error monitoring Saratov:', error);
                    throw error;
                }
            }

            async searchInSaratov(query) {
                try {
                    const posts = await this.parser.searchInSaratov(query);
                    return posts;
                } catch (error) {
                    console.error('Error searching in Saratov:', error);
                    throw error;
                }
            }
        }

        module.exports = new VKController();

        // 1. Поиск по ключевым словам
        for (const keyword of this.keywords) {
            try {
                const posts = await this.parser.searchInSaratov(keyword, 15);
                const parsedPosts = posts.map(post => this.parser.parsePost(post, `Поиск: ${keyword}`));
                allPosts = allPosts.concat(parsedPosts);

                console.log(`✅ По слову "${keyword}": ${posts.length} постов`);

                await this.delay(1000);
            } catch (error) {
                console.error(`❌ Ошибка слова "${keyword}":`, error);
            }
        }

        // 2. Мониторинг групп Саратова
        try {
            const groupPosts = await this.parser.monitorSaratovGroups();
            allPosts = allPosts.concat(groupPosts);
            console.log(`✅ Группы Саратова: ${groupPosts.length} постов`);
        } catch (error) {
            console.error('❌ Ошибка мониторинга групп:', error);
        }

        // 3. Сохранение в базу данных
        const savedCount = await this.saveToDatabase(allPosts);

        console.log(`🎯 Всего найдено постов: ${allPosts.length}`);
        console.log(`💾 Сохранено новых постов: ${savedCount}`);

        return allPosts;
    }

    async saveToDatabase(posts) {
        let savedCount = 0;

        for (const post of posts) {
            try {
                // Используем новый метод сохранения с дополнительными данными
                const mentionId = await dbHelpers.saveMention({
                    text: post.text,
                    source: post.source,
                    url: post.url,
                    vk_post_id: post.vk_post_id, // Добавьте это поле в parsePost
                    likes: post.likes || 0,
                    reposts: post.reposts || 0,
                    views: post.views || 0
                });

                if (mentionId) {
                    savedCount++;
                }
            } catch (error) {
                if (!error.message.includes('UNIQUE constraint failed')) {
                    console.error('Ошибка сохранения:', error);
                }
            }
        }

        return savedCount;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = new VKController();