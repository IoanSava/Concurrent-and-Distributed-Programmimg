class InvalidNumberOfSqsRecordsError extends Error {
    constructor(numberOfRecords) {
        const message = `Expected a single SQS record, but received ${numberOfRecords} instead.`;
        super(message);
    }
}

module.exports = InvalidNumberOfSqsRecordsError;