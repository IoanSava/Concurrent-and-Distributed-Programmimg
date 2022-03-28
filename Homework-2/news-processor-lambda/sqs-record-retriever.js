const InvalidNumberOfSqsRecordsError = require('./errors/invalid-number-of-sqs-records-error.js');

class SqsRecordRetriever {
    getSqsRecord = (event) => {
        console.log(`Validating the number of record from the SQS event ${JSON.stringify(event)}`);
        
        const records = event.Records;
        const numberOfRecords = records.length;
        
        if (numberOfRecords === 0) {
            console.warn("The SQS event received contains no record to process");
            return null;
        }
        
        if (numberOfRecords !== 1) {
            throw new InvalidNumberOfSqsRecordsError(numberOfRecords);
        }
        
        const record = records[0];
        if (record === null || record.body === null || record.body.length === 0) {
            console.warn("The SQS event received contains no record with a valid request body to process.");
            return null;
        }
        
        return record;
    }
}

module.exports = SqsRecordRetriever;