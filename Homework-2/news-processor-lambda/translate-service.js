const TranslationError = require('./errors/translation-error.js');

class TranslateService {
    constructor(awsTranslateClient) {
        this.awsTranslateClient = awsTranslateClient;
    }
    
    translateText = async (text, language) => {
        const params = this.#getTranslateParams(text, language);
        try {
            const response = await this.awsTranslateClient.translateText(params).promise();
            return response.TranslatedText;   
        } catch (error) {
            console.error(error.message);
            throw new TranslationError(error.message);
        }
    }
    
    #getTranslateParams = (text, language) => {
        return {
            SourceLanguageCode: 'auto',
            TargetLanguageCode: language,
            Text: text
        };
    }
}

module.exports = TranslateService;