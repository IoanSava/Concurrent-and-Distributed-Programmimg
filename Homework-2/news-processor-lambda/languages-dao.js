const constants = require('./constants.js');
const GettingLanguagesError = require('./errors/getting-languages-error.js');

class LanguagesDao {
    constructor(dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
    }
    
    getAll = async () => {
        const params = this.#getScanParams();
        try {
            const data = await this.dynamoDbClient.scan(params).promise();
            return data.Items.map(item => item.code.S);
        } catch (error) {
            console.error(error.message);
            throw new GettingLanguagesError(error.message);
        }
    }
    
    #getScanParams = () => {
        return {
            TableName: process.env[constants.LANGUAGES_DYNAMO_DB_TABLE_NAME_KEY],
            ProjectionExpression: "code"
        };
    }
}

module.exports = LanguagesDao;