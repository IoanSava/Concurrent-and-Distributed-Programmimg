const constants = require('./constants.js');

const WebSocket = require('ws');
const connection = new WebSocket(constants.WEBSOCKET_URL);

const AWS = require('aws-sdk');
AWS.config.update({ region: constants.AWS_REGION });

const snsClient = new AWS.SNS({ apiVersion: '2010-03-31' });

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const publishSnsMessageParams = (snsMessage) => {
    return {
        TopicArn: constants.NEWS_TOPIC_ARN,
        Message: JSON.stringify(snsMessage)
    };
}

connection.onmessage = async (event) => {
    const news = JSON.parse(event.data);

    for (const element of news) {
        const snsMessage = {
            title: element.title,
            author: element.author,
            description: element.description,
            publishedAt: element.publishedAt,
            url: element.url
        };

        await snsClient.publish(publishSnsMessageParams(snsMessage)).promise()
            .then((data) => console.log(`SNS message with id ${data.MessageId} sent successfully.`))
            .catch((error) => console.error(error.message));

        await sleep(3000);
    }
}