class KeywordMatcher {
    constructor() {
        // База словоформ для ключевых слов
        this.wordForms = {
            'водитель': ['водитель', 'водителя', 'водителю', 'водителем', 'водителе', 'водители', 'водителей', 'водителям', 'водителями', 'водителях'],
            'пассажир': ['пассажир', 'пассажира', 'пассажиру', 'пассажиром', 'пассажире', 'пассажиры', 'пассажиров', 'пассажирам', 'пассажирами', 'пассажирах'],
            'кондуктор': ['кондуктор', 'кондуктора', 'кондуктору', 'кондуктором', 'кондукторе', 'кондукторы', 'кондукторов', 'кондукторам', 'кондукторами', 'кондукторах'],
            'перевозчик': ['перевозчик', 'перевозчика', 'перевозчику', 'перевозчиком', 'перевозчике', 'перевозчики', 'перевозчиков', 'перевозчикам', 'перевозчиками', 'перевозчиках'],
            'льготная': ['льготная', 'льготной', 'льготную', 'льготною', 'льготные', 'льготных', 'льготным', 'льготными'],
            'остановка': ['остановка', 'остановки', 'остановке', 'остановку', 'остановкой', 'остановкою', 'остановок', 'остановкам', 'остановками', 'остановках'],
            'проезд': ['проезд', 'проезда', 'проезду', 'проездом', 'проезде', 'проезды', 'проездов', 'проездам', 'проездами', 'проездах'],
            'карта': ['карта', 'карты', 'карте', 'карту', 'картой', 'картою', 'карт', 'картам', 'картами', 'картах'],
            'транспортная': ['транспортная', 'транспортной', 'транспортную', 'транспортною', 'транспортные', 'транспортных', 'транспортным', 'транспортными'],
            'не работает': ['не работает', 'не работают', 'не работал', 'не работала', 'не работало', 'не работали', 'не работающий', 'не работающая', 'не работающее', 'не работающие']
        };
    }

    // Основной метод проверки
    containsKeywords(text, keywords, options = {}) {
        if (!text) {
            if (options.debug) console.log('❌ Текст пустой');
            return false;
        }

        if (!keywords || keywords.length === 0) {
            if (options.debug) console.log('❌ Нет ключевых слов для поиска');
            return false;
        }

        let foundAny = false;

        if (options.debug) {
            console.log(`🔍 Проверяем текст: "${text.substring(0, 100)}..."`);
            console.log(`🔍 Ключевые слова:`, keywords);
        }

        keywords.forEach(keyword => {
            if (this.checkKeyword(text, keyword, options)) {
                foundAny = true;
            }
        });

        if (options.debug) {
            if (!foundAny) {
                console.log('❌ Ни одного ключевого слова не найдено в тексте');
            } else {
                console.log('✅ Найдены ключевые слова в тексте');
            }
        }

        return foundAny;
    }

    // Проверка одного ключевого слова
    checkKeyword(text, keyword, options = {}) {
        if (keyword.includes(' ')) {
            return this.checkPhrase(text, keyword, options);
        } else {
            return this.checkSingleWord(text, keyword, options);
        }
    }

    // Проверка фразы (несколько слов)
    checkPhrase(text, phrase, options = {}) {
        const phraseWords = phrase.split(' ');
        let allWordsFound = true;

        // Проверяем, что все слова фразы есть в тексте
        phraseWords.forEach(phraseWord => {
            if (!this.checkSingleWord(text, phraseWord, { ...options, silent: true })) {
                allWordsFound = false;
            }
        });

        // Дополнительно проверяем точное вхождение фразы
        const exactPhraseFound = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(text);

        const found = allWordsFound || exactPhraseFound;

        if (options.debug && !options.silent) {
            if (found) {
                console.log(`✅ Найдена фраза: "${phrase}"`);
            } else {
                console.log(`❌ Не найдена фраза: "${phrase}"`);
            }
        }

        return found;
    }

    // Проверка одного слова
    checkSingleWord(text, word, options = {}) {
        const forms = this.wordForms[word] || [word];
        const found = forms.some(form => {
            const regex = new RegExp(`\\b${form}\\b`, 'i');
            const isFound = regex.test(text);

            if (isFound && options.debug && !options.silent) {
                console.log(`✅ Найдена словоформа: "${form}" (исходное: "${word}")`);
            }

            return isFound;
        });

        if (!found && options.debug && !options.silent) {
            console.log(`❌ Не найдено слово: "${word}"`);
        }

        return found;
    }


    addWordForms(word, forms) {
        this.wordForms[word] = forms;
    }

    getWordForms(word) {
        return this.wordForms[word] || [word];
    }
}

module.exports = KeywordMatcher;