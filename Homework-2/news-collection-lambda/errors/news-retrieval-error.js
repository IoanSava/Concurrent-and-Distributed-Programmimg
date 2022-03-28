class NewsRetrievalError extends Error {
    constructor(message) {
        const errorMessage = `News retrieval error: ${message}`;
        super(errorMessage);
    }
}

module.exports = NewsRetrievalError;