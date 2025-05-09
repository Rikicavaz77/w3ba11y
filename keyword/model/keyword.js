class Keyword {
  constructor(name, frequency = 0) {
    this._name = name;
    this._frequency = frequency;
  }

  get name() {
    return this._name;
  }

  get frequency() {
    return this._frequency;
  }
}