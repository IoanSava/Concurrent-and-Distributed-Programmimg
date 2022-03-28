const NewsRecordProcessingError = require('./errors/news-record-processing-error.js');

class SqsRecordProcessor {
    constructor(newsDao, languagesDao, translateService) {
        this.newsDao = newsDao;
        this.languagesDao = languagesDao;
        this.translateService = translateService;
    }
    
    processNewsRecord = async (record) => {
        try {
            const news = this.#extractNewsFromSqsRecord(record);
            console.log(`News to process: ${JSON.stringify(news)}`);
            
            const languages = await this.languagesDao.getAll();
            console.log(`Languages successfully retrieved from DynamoDB: ${languages}.`);
            
            for (const language of languages) {
                try {
                    const translatedNews = await this.#translateNews(news, language);
                    await this.newsDao.save(translatedNews);
                    console.log(`Translated news (${language}) successfully saved in DynamoDB.`);
                } catch (error) {
                    console.error(`${error.message}. Dropping request.`);
                }
            }
        } catch (error) {
            console.error(error.message);
            throw new NewsRecordProcessingError(error.message);
        }
    }
    
    #extractNewsFromSqsRecord = (record) => {
        const recordBody = JSON.parse(record.body);
        return JSON.parse(recordBody.Message);
    }
    
    #translateNews = async (news, language) => {
        return {
            title: await this.translateService.translateText(news.title, language),
            description: await this.translateService.translateText(news.description, language),
            author: news.author,
            url: news.url,
            publishedAt: news.publishedAt,
            language: language
        };
    }
}

module.exports = SqsRecordProcessor;