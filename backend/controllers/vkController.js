const VKParser = require('../utils/vk-parser');
const db = require('../database');

class VKController {
    constructor() {
        this.parser = new VKParser(process.env.VK_ACCESS_TOKEN);
        this.keywords = [
            'автобус', 'троллейбус', 'трамвай', 'маршрутка',
            'транспорт', 'остановка', 'проезд', 'кондуктор',
            'водитель', 'пассажир', 'опоздание', 'перевозчик'
        ];
    }

    async monitorSaratov() {
        console.log('🔍 Мониторинг ВК Саратова...');

        let allPosts = [];

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

        // 2. Мониторим группы Саратова
        const groupPosts = await this.parser.monitorSaratovGroups();
        allPosts = allPosts.concat(groupPosts);


        await this.saveToDatabase(allPosts);

        console.log(`🎯 Всего найдено постов: ${allPosts.length}`);
        return allPosts;
    }

    async saveToDatabase(posts) {
        let savedCount = 0;

        for (const post of posts) {
            try {
                await new Promise((resolve, reject) => {
                    db.run(
                        `INSERT OR IGNORE INTO mentions (text, source, url, date_found) VALUES (?, ?, ?, ?)`,
                        [post.text, post.source, post.url, post.date.toISOString()],
                        function (err) {
                            if (err) reject(err);
                            else {
                                if (this.changes > 0) savedCount++;
                                resolve();
                            }
                        }
                    );
                });
            } catch (error) {
                if (!error.message.includes('UNIQUE constraint failed')) {
                    console.error('Ошибка сохранения:', error);
                }
            }
        }

        console.log(`💾 Сохранено новых постов: ${savedCount}`);
        return savedCount;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = new VKController();