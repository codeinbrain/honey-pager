class Config {
  constructor() {
    this._hasBeenGot = false;
    this._config = {
      cursorSecret: 'shhhhh',
      methodName: 'paginateResult'
    };
  }

  update(newConfig) {
    if (this._hasBeenGot) throw new Error('HoneyPager config cannot be updated after it has been got.');
    this._config = Object.assign({}, this._config, newConfig);
  }

  get() {
    this._hasBeenGot = true;
    return this._config;
  }
}

export default new Config();
