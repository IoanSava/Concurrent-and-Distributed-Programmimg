class NewsRecordProcessingError extends Error {
    constructor(message) {
        const errorMessage = `News record processing error: ${message}`;
        super(errorMessage);
    }
}

module.exports = NewsRecordProcessingError;