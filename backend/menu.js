/**
 * Created by kalias_90 on 09.08.17.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const moduleName = require('../module-name');

function getMenuFromFS(p, instrumentSettings) {
  let stat = fs.lstatSync(p);
  let name = path.basename(p, '.ejs');
  let caption = instrumentSettings[name] ? instrumentSettings[name].caption || name : name;
  let result = {
    id: name,
    caption: caption,
    hint: instrumentSettings[name] ? instrumentSettings[name].hint || caption : caption,
    nodes: [],
    url: ''
  };
  if (instrumentSettings[name] && instrumentSettings[name].backend) {
    result.backend = instrumentSettings[name].backend;
  }
  if (stat.isDirectory()) {
    fs.readdirSync(p).forEach(function (nm) {
      result.nodes.push(getMenuFromFS(path.join(p, nm), instrumentSettings));
    });
  } else if (stat.isFile()) {
    result.url = encodeURI('/' + moduleName + '/' + caption);
  }
  return result.url || result.nodes.length ? result : null;
}

module.exports.buildMenu = function (moduleName, templates, instrumentSettings) {
  let menu = [];
  fs.readdirSync(templates).forEach(function (nm) {
    let node = getMenuFromFS(path.join(templates, nm), instrumentSettings);
    if (node) {
      menu.push(node);
    }
  });
  return menu;
};

function dirs(dir) {
  let res = [];
  fs.readdirSync(dir).forEach(function (nm) {
    let p = path.join(dir, nm);
    if (fs.lstatSync(p).isDirectory()) {
      res.push(p);
      Array.prototype.push.apply(res, dirs(p));
    }
  });
  return res;
}

module.exports.getViewsDirectories = dirs;

function find(nodes, caption) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].nodes.length) {
      let r = find(nodes[i].nodes, caption);
      if (r) {
        return r;
      }
    } else if (nodes[i].caption === caption || !caption) {
      return nodes[i];
    }
  }
  return null;
}

module.exports.findInstrument = find;
