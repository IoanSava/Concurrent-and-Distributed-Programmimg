const constants = require('./constants.js');
const NewsSaveError = require('./errors/news-save-error.js');

class NewsDao {
    constructor(dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
    }
    
    save = async (news) => {
        const params = this.#getPutItemParams(news);
        try {
            await this.dynamoDbClient.putItem(params).promise();   
        } catch (error) {
            console.error(error.message);
            throw new NewsSaveError(error.message);
        }
    }
    
    #convertDateToTimestamp = (date) => {
        return new Date(date).getTime();
    }
    
    #getPutItemParams = (news) => {
        const publishedAtTimestamp = this.#convertDateToTimestamp(news.publishedAt);
        return {
            TableName: process.env[constants.NEWS_DYNAMO_DB_TABLE_NAME_KEY],
            Item: {
                title: { S: news.title },
                description: { S: news.description },
                newsUrl: { S: news.url },
                publishedAt: { N: publishedAtTimestamp.toString() },
                author: { S: news.author },
                lang: { S: news.language }
            }
        };
    }
}

module.exports = NewsDao;