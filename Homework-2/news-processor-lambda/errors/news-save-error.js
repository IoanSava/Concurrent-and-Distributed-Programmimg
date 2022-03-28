class NewsSaveError extends Error {
    constructor(message) {
        const errorMessage = `Error at saving news: ${message}`;
        super(errorMessage);
    }
}

module.exports = NewsSaveError;