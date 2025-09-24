const VKParser = require('../utils/vk-parser');
const { dbHelpers } = require('../database');

class VKController {
    constructor() {
        this.parser = new VKParser(process.env.VK_ACCESS_TOKEN);
    }

    async monitorSaratov() {
        console.log('🔍 Мониторинг с фильтрацией по ключевым словам...');

        try {
            const allPosts = await this.parser.monitorSaratovGroups();
            if (allPosts.length > 0) {
                let savedCount = 0;
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

            return {
                posts: allPosts,
                keywords: this.parser.keywords,
                stats: {
                    totalFound: allPosts.length,
                    savedCount: savedCount
                }
            };

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