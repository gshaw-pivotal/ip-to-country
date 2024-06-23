class VendorError extends Error {
    constructor(errorMessage) {
        super(errorMessage);
        this.name = 'VendorError';
    }
}

module.exports = VendorError;