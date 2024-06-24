class ServiceError extends Error {
    constructor(errorMessage) {
        super(errorMessage);
        this.name = 'ServiceError';
    }
}

module.exports = ServiceError;