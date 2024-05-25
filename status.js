class Status {
    constructor(status, title, message) {
        this.status = status;
        this.title = title;
        this.message = message;
    }

    getStatus() {
        return this.status;
    }
    
    getTitle() {
        return this.title;
    }

    getMessage() {
        return this.message;
    }
}