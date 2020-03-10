/**
 * Created by kalias_90 on 09.08.17.
 */
'use strict';

const Logger = require('core/interfaces/Logger');

module.exports = function (scope, err, res, errorCode, user) {
  if (scope.logRecorder) {
    scope.logRecorder.stop();
  }

  if (scope && scope.sysLog && scope.sysLog instanceof Logger) {
    scope.sysLog.error(err);
  } else {
    console.error(err);
  }

  errorCode = errorCode || 500;

  res.status(errorCode).render('error', {
    user: user,
    error: err,
    title: errorCode
  });
};
