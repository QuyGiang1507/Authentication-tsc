class HttpError extends Error {
    constructor(public message: string, public status: number = 500) {
        super(message);
        this.status = status;
    }
}

export default HttpError;