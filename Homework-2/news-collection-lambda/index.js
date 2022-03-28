const constants = require('./constants.js');
const NewsDao = require('./news-dao.js');

var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

const dynamoDbClient = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

exports.handler = async (event) => {
    const language = getLanguage(event.queryStringParameters);
    const numberOfNewsToRetrieve = getNumberOfNews(event.queryStringParameters);
    
    const newsDao = new NewsDao(dynamoDbClient);
    const news = await newsDao.getLastNewsByLanguage(numberOfNewsToRetrieve, language);
    
    return {
        statusCode: 200,
        body: JSON.stringify(news),
    };
};

const getLanguage = (queryParams) => {
    let language = process.env[constants.DEFAULT_LANGUAGE_KEY];
    if (queryParams !== null && "lang" in queryParams) {
        language = queryParams.lang;
    }
    return language;
};

const getNumberOfNews = (queryParams) => {
    let numberOfNewsToRetrieve = parseInt(process.env[constants.DEFAULT_LAST_NEWS_TO_RETRIEVE_KEY]);
    if (queryParams !== null && "num" in queryParams) {
       const maxNumberOfNewsToRetrieve = parseInt(process.env[constants.MAX_LAST_NEWS_TO_RETRIEVE_KEY]);
       const numOfNewsToRetrieve = parseInt(queryParams.num);
       if (numOfNewsToRetrieve > maxNumberOfNewsToRetrieve) {
           numberOfNewsToRetrieve = maxNumberOfNewsToRetrieve;
       } else {
           numberOfNewsToRetrieve = numOfNewsToRetrieve;
       }
    }
    return numberOfNewsToRetrieve;
};