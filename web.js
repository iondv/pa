/**
 * Created by kalias_90 on 03.08.17.
 */

const express = require('express');
const di = require('core/di');
const config = require('./config');
const moduleName = require('./module-name');
const ejsLocals = require('ejs-locals');
const extendDi = require('core/extendModuleDi');
const theme = require('lib/util/theme');
const staticRouter = require('lib/util/staticRouter');
const extViews = require('lib/util/extViews');
const alias = require('core/scope-alias');

let app = module.exports = express();
let router = express.Router();

router.get('/', function (req, res) {
  let scope = di.context(moduleName);
  let defaultPath = scope.settings.get(moduleName + '.default');

  if (defaultPath) {
    res.redirect('/' + moduleName + '/' + encodeURI(defaultPath));
  } else {
    let user = scope.auth.getUser(req);
    res.render('index', {user: user});
  }
});

app.locals.sysTitle = config.sysTitle;
app.locals.staticsSuffix = process.env.ION_ENV === 'production' ? '.min' : '';
app.locals.module = moduleName;

app.engine('ejs', ejsLocals);
app.set('view engine', 'ejs');

app._init = function () {
  return di(
    moduleName,
    extendDi(moduleName, config.di),
    {module: app},
    'app',
    [],
    'modules/' + moduleName)
    .then((scope) => alias(scope, scope.settings.get(moduleName + '.di-alias')))
    .then((scope) => {
      theme(
        app,
        moduleName,
        __dirname,
        scope.settings.get(moduleName + '.theme') ||
        config.theme || 'default',
        scope.sysLog
      );
      extViews(app, scope.settings.get(moduleName + '.templates'));
      let statics = staticRouter(scope.settings.get(moduleName + '.statics'));
      if (statics) {
        app.use('/' + moduleName, statics);
      }
      app.locals.toolbar = scope.settings.get(moduleName + '.toolbar') || {};

      if (scope.settings.get(moduleName + '.noAuth')) {
        scope.auth.exclude(`\\/${moduleName}\\/\\w.*`);
      } else {
        scope.auth.bindAuth(app, moduleName, {profile: 'profile', chpwd: 'chpwd'});
      }

      app.use('/' + moduleName, router);
      app.locals.pageTitle = scope.settings.get(moduleName + '.pageTitle')
        || scope.settings.get('pageTitle')
        || `ION ${config.sysTitle}`;
      app.locals.pageEndContent = scope.settings.get(moduleName +'.pageEndContent') || scope.settings.get('pageEndContent') || '';
    });
};
