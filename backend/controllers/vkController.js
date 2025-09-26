const VKParser = require('../utils/vk-parser');
const { dbHelpers } = require('../database');

class VKController {
    constructor() {
        this.parser = new VKParser(process.env.VK_ACCESS_TOKEN);
    }

    async monitorSaratov() {
        console.log('🔍 Мониторинг саратовских групп...');

        try {
            const allPosts = await this.parser.monitorSaratovGroups();

            // ПЕРЕМЕЩАЕМ объявление переменной ВНЕ блока if
            let savedCount = 0;

            if (allPosts.length > 0) {
                for (const post of allPosts) {
                    try {
                        const result = await dbHelpers.saveMention(post);
                        if (result) savedCount++;
                    } catch (saveError) {
                        console.log(`⚠️ Ошибка сохранения: ${saveError.message}`);
                    }
                }
                console.log(`💾 Сохранено новых постов: ${savedCount}/${allPosts.length}`);
            }

            // Теперь savedCount доступен здесь
            console.log(`🎯 Всего найдено постов: ${allPosts.length}`);
            return allPosts;

        } catch (error) {
            console.error('❌ Ошибка мониторинга:', error);
            throw error;
        }
    }


    getKeywords() {
        return this.parser.keywords;
    }

    updateKeywords(newKeywords) {
        this.parser.keywords = newKeywords;
        console.log('✅ Ключевые слова обновлены:', newKeywords);
        return this.parser.keywords;
    }
}

module.exports = new VKController();