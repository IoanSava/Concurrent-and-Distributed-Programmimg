module.exports = Object.freeze({
    WEBSOCKET_URL: 'ws://news-provider:8080',
    AWS_REGION: 'us-west-2',
    NEWS_TOPIC_ARN: `arn:aws:sns:us-west-2:${process.env.AWS_ACCOUNT_ID}:NewsTopic`
});