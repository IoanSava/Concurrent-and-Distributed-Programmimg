class TranslationError extends Error {
    constructor(message) {
        const errorMessage = `Translation error: ${message}`;
        super(errorMessage);
    }
}

module.exports = TranslationError;