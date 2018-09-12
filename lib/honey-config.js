class Config {
  constructor() {
    this._config = {
      cursorSecret: 'shhhhh'
    };
  }

  update(newConfig) {
    this._config = Object.assign({}, this.config, newConfig);
  }

  get() {
    return this._config;
  }
}

export default new Config();
