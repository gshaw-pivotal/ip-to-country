class RateLimitExceededError extends Error {
    constructor(errorMessage) {
        super(errorMessage);
        this.name = 'RateLimitExceededError';
    }
}

module.exports = RateLimitExceededError;