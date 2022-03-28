const constants = require('./constants.js');

const NewsAPI = require('newsapi');
const newsApi = new NewsAPI(constants.NEWS_API_KEY);

const WebSocket = require('ws');
const webSocketServer = new WebSocket.Server({ port: constants.WEBSOCKET_PORT });

webSocketServer.on('connection', webSocket => {
    setInterval(() => {
        newsApi.v2.everything({
            sources: 'bbc-news,the-verge',
            domains: 'bbc.co.uk, techcrunch.com',
            sortBy: 'relevancy',
        }).then(response => {
            console.log(response);
            webSocket.send(JSON.stringify(response.articles.slice(0, 5)));
        });
    }, constants.NEWS_FETCHING_INTERVAL);
});
