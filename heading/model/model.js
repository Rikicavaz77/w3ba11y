class HModel {
  constructor(tag, level, text, parent = null) {
    this._tag = tag;
    this._level = level;
    this._text = text,
    this._parent = parent;
    this._error = parent ? parent.level + 1 !== level : level !== 1;
  }

  get tag() {
    return this._tag;
  }

  get level() {
    return this._level;
  }

  get text() {
    return this._text;
  }

  get parent() {
    return this._parent;
  }

  getHeadingData() {
    return {
      tag: this._tag,
      level: this._level,
      text: this._text,
      parent: this._parent,
      error: this._error
    };
  }
}