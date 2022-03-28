const SqsRecordRetriever = require('./sqs-record-retriever.js');
const SqsRecordProcessor = require('./sqs-record-processor.js');
const NewsDao = require('./news-dao.js');
const LanguagesDao = require('./languages-dao.js');
const TranslateService = require('./translate-service.js');

var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

const dynamoDbClient = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
const amazonTranslateClient = new AWS.Translate();

exports.handler = async (event) => {
    try {
        const record = new SqsRecordRetriever().getSqsRecord(event);
        if (record !== null) {
            const newsDao = new NewsDao(dynamoDbClient);
            const languagesDao = new LanguagesDao(dynamoDbClient);
            
            const translateService = new TranslateService(amazonTranslateClient);
            
            const sqsRecordProcessor = new SqsRecordProcessor(newsDao, languagesDao, translateService);
            await sqsRecordProcessor.processNewsRecord(record);
        }
    } catch (error) {
        console.error(`Encountered error: ${error.message}`);
        throw error;
    }
};
