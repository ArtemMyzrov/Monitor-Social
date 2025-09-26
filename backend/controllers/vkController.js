const VKParser = require('../utils/vk-parser');
const { dbHelpers } = require('../database');

class VKController {
    constructor() {
        this.parser = new VKParser(process.env.VK_ACCESS_TOKEN);
    }

    async monitorSaratov() {
        console.log('🔍 Мониторинг групп...');

        try {
            // Используем группы из парсера
            const posts = await this.parser.monitorGroups();

            let savedCount = 0;
            for (const post of posts) {
                try {
                    await dbHelpers.saveMention(post);
                    savedCount++;
                } catch (saveError) {
                    console.log(`⚠️ Ошибка сохранения: ${saveError.message}`);
                }
            }

            console.log(`💾 Сохранено постов: ${savedCount}/${posts.length}`);
            return posts;

        } catch (error) {
            console.error('❌ Ошибка мониторинга:', error);
            throw error;
        }
    }

    // Методы для управления группами
    getGroups() {
        return this.parser.getGroups();
    }

    updateGroups(newGroups) {
        return this.parser.setGroups(newGroups);
    }

    async testGroup(screenName) {
        return await this.parser.testGroup(screenName);
    }

    // Методы для ключевых слов
    getKeywords() {
        return this.parser.getKeywords();
    }

    updateKeywords(newKeywords) {
        return this.parser.setKeywords(newKeywords);
    }
}

module.exports = new VKController();