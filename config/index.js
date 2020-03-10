/**
 * Created by kalias_90 on 03.08.17.
 */

'use strict';

var read = require('lib/config-reader');
var config = require('./config.json');

module.exports = read(config, __dirname);
