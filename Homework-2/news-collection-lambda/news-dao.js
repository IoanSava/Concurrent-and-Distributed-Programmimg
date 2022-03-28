const constants = require('./constants.js');
const NewsRetrievalError = require('./errors/news-retrieval-error.js');

class NewsDao {
    constructor(dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
    }
    
    getLastNewsByLanguage = async (numberOfNewsToRetrieve, language) => {
        const params = this.#getLastNewsByLanguageParams(numberOfNewsToRetrieve, language);
        try {
            const response = await this.dynamoDbClient.query(params).promise();
            return response.Items.map(item => {
                return {
                    title: item.title.S,
                    description: item.description.S,
                    author: item.author.S,
                    url: item.newsUrl.S
                };
            });
        } catch (error) {
            console.error(error.message);
            throw new NewsRetrievalError(error.message);
        }
    }
    
    #getLastNewsByLanguageParams = (numberOfNewsToRetrieve, language) => {
        return {
            TableName: process.env[constants.NEWS_DYNAMO_DB_TABLE_NAME_KEY],
            Limit: numberOfNewsToRetrieve,
            ScanIndexForward: false,
            ProjectionExpression: 'title, description, author, newsUrl',
            KeyConditionExpression: 'lang = :lang',
            ExpressionAttributeValues: {
              ":lang": { S: language }
            }
        };
    }
}

module.exports = NewsDao;