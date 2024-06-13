class Status {
  constructor(status, title, message) {
    this._status = status;
    this._title = title;
    this._message = message;
  }

  get status() {
    return this._status;
  }

  get title() {
    return this._title;
  }

  get message() {
    return this._message;
  }

  set status(status) {
    this._status = status;
  }
}