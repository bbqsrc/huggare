'use strict';

var util = require('util');

function parseArgs(args) {
  var o = {};

  var len = args.length;
  var err;
  if (len > 0) {
    if (args[args.length-1] && args[args.length-1].stack) {
      err = args.pop();
      len--;
    }
  }

  if (len === 1 && util.isObject(args[0])) {
    // JSONable
    o = args[0];
  } else if (len >= 1) {
    o.message = args.map(function(arg) {
      return util.isPrimitive(arg) ? arg : util.inspect(arg);
    }).join(' ');
  }

  if (err) {
    o.err = err;
  }
  return o;
}

function createLog() {
  var Log = {
    formatters: [],

    setLevel: function(prio) {
      this.level = prio;
    },

    addFormatter: function(fmt) {
      this.formatters.push(fmt);
    },

    println: function(priority, tag /*, varargs */) {
      if (priority < this.level) {
        return;
      }

      var args = Array.prototype.constructor.apply(null, arguments).slice(2);
      args = parseArgs(args);

      var ts = new Date;
      var len = Log.formatters.length;
      for (var i = 0; i < len; ++i) {
        this.formatters[i].call(this, ts, priority, tag, args);
      }
    }
  };

  Object.defineProperties(Log, {
    'VERBOSE': { value: 2 },
    'DEBUG': { value: 3 },
    'INFO': { value: 4 },
    'WARN': { value: 5 },
    'ERROR': { value: 6 },
    'ASSERT': { value: 7 }
  });

  Log.v = Log.println.bind(Log, Log.VERBOSE);
  Log.d = Log.println.bind(Log, Log.DEBUG);
  Log.i = Log.println.bind(Log, Log.INFO);
  Log.w = Log.println.bind(Log, Log.WARN);
  Log.e = Log.println.bind(Log, Log.ERROR);
  Log.wtf = Log.println.bind(Log, Log.ASSERT);

  Log.setLevel(Log.INFO);

  return Log;
}

var Log = createLog();

var ConsoleFormatter = function(ts, prio, tag, args) {
  /*eslint-disable no-console */
  var p = [undefined,undefined,'V','D','I','W','E','A'];

  switch (prio) {
    case Log.VERBOSE:
    case Log.DEBUG:
    case Log.INFO:
      if (args.message) {
        console.log(ts.toISOString() + ' [' + p[prio] + '] ' + tag + ': ' + args.message);
      }
      if (args.err) {
        console.log(args.err.stack);
      }
      break;
    case Log.WARN:
    case Log.ERROR:
    case Log.ASSERT:
      if (args.message) {
        console.error(ts.toISOString() + ' [' + p[prio] + '] ' + tag + ': ' + args.message);
      }
      if (args.err) {
        console.error(args.err.stack);
      }
      break;
    default:
      Log.wtf('ConsoleFormatter', 'invalid priority specified: ', prio, ', logging as error.');
      Log.e(tag, args);
  }
};

Log.addFormatter(ConsoleFormatter);

module.exports = Log;
