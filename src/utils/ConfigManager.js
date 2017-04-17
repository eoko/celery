const _ = require('lodash');

/**
 * ConfigManager that simplify the use of config file
 * @class ConfigManager
 * @type Object
 */
class ConfigManager {

  /**
   * @param {string} filename
   */
  constructor(filename = `${__dirname}/../config/index.js`) {
    this.config = require(filename);
  }

  /**
   * @param namespace
   * @returns {getConfig}
   */
  namespacedConfig(namespace) {

    /**
     * @typedef {function} getConfig
     * @param {string} path Path for namespaced config
     * @param {*} defaultValue Default value
     * @see get
     */
    return (path, defaultValue) => this.get(`${namespace}.${path}`, defaultValue);
  }

  /**
   * @param {string} path
   * @param {*} defaultValue
   * @returns {*}
   */
  get(path, defaultValue = {}) {
    return _.get(this.config, path, defaultValue);
  }

  /**
   * @param {string} key
   * @param {*} value
   * @returns {*}
   */
  merge(key, value = {}) {
    this.config[key] = _.merge(this.config[key], value);
    return this;
  }
}

/**
 * @type ConfigManager
 */
module.exports = ConfigManager;