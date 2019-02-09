module.exports = class APIError extends Error {
    /**
     * Instantiates a new APIError
     * @param {Number} status  The HTTP status code
     * @param {String} message The error description
     * @param {Object}  details Any other relative information
     */
    constructor(module, status, message, details) {
        super(message);
        this.name = this.constructor.name;

        Error.captureStackTrace(this, this.constructor);

        this.module = module;
        this.message = message;
        this.status = status;

        if (details instanceof Error && details.stack) {
            this.details = details.stack;
        } else {
            this.details = details;
        }
    }

    toJSON() {
        return {
            status: this.status,
            message: this.message
        };
    }
};
