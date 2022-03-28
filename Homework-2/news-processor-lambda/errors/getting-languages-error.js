class GettingLanguagesError extends Error {
    constructor(message) {
        const errorMessage = `Getting languages error: ${message}`;
        super(errorMessage);
    }
}

module.exports = GettingLanguagesError;