/**
 * Created by kalias_90 on 03.08.17.
 */

const path = require('path');
const express = require('express');
const di = require('core/di');
const config = require('./config');
const rootConfig = require('../../config');
const moduleName = require('./module-name');
const ejsLocals = require('ejs-locals');
const extendDi = require('core/extendModuleDi');
const theme = require('lib/util/theme');
const staticRouter = require('lib/util/staticRouter');
const extViews = require('lib/util/extViews');
const alias = require('core/scope-alias');
const errorSetup = require('core/error-setup');
const i18nSetup = require('core/i18n-setup');
const strings = require('core/strings');

const app = module.exports = express();
const router = express.Router();

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
app.locals.s = strings.s;
app.locals.__ = (str, params) => strings.s(moduleName, str, params);

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
    .then(scope => alias(scope, scope.settings.get(moduleName + '.di-alias')))
    .then((scope) => {
      // i18n
      const lang = config.lang || rootConfig.lang || 'ru';
      const i18nDir = path.join(__dirname, 'i18n');
      scope.translate.setup(lang, config.i18n || i18nDir, moduleName);
      let themePath = scope.settings.get(moduleName + '.theme') || config.theme || 'default';
      themePath = theme.resolve(__dirname, themePath);
      const themeI18n = path.join(themePath, 'i18n');
      scope.translate.setup(lang, themeI18n, moduleName);
      //
      theme(
        app,
        moduleName,
        __dirname,
        themePath,
        scope.sysLog
      );
      extViews(app, scope.settings.get(moduleName + '.templates'));
      let statics = staticRouter(scope.settings.get(moduleName + '.statics'));
      if (statics) {
        app.use('/' + moduleName, statics);
      }
      app.locals.toolbar = scope.settings.get(moduleName + '.toolbar') || {};
      scope.auth.bindAuth(app, moduleName, {profile: 'profile', chpwd: 'chpwd'});
      app.use('/' + moduleName, router);
            app.locals.pageTitle = scope.settings.get(moduleName + '.pageTitle')
        || scope.settings.get('pageTitle')
        || `ION ${config.sysTitle}`;
      app.locals.pageEndContent = scope.settings.get(moduleName +'.pageEndContent') || scope.settings.get('pageEndContent') || '';
    });
};
