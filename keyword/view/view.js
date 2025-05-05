class KeywordView {
  constructor(iframe) {
    this._container = this.generateKeywordViewSection();
    this._iframe = iframe;
    this._header;
    this._body;
  }

  get container() {
    return this._container;
  }

  get iframe() {
    return this._iframe;
  }

  get header() {
    return this._header;
  }

  get body() {
    return this._body;
  }

  set header(header) {
    this._header = header;
  }

  set body(body) {
    this._body = body;
  }

  generateKeywordViewSection() {

  }
}