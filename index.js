'use strict';

function createLog() {
  var Log = {
    formatters: [],

    setLevel: function(prio) {
      this.level = prio;
    },

    addFormatter: function(fmt) {
      this.formatters.push(fmt);
    },

    println: function(priority, tag, msg, tr) {
      if (priority < this.level) {
        return;
      }

      var ts = new Date;
      var len = Log.formatters.length;
      for (var i = 0; i < len; ++i) {
        this.formatters[i].call(this, ts, priority, tag, msg, tr);
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

var ConsoleFormatter = function(ts, prio, tag, msg, tr) {
  /*eslint-disable no-console */
  var p = [undefined,undefined,'V','D','I','W','E','A'];

  if (msg.stack) {
    tr = msg;
    msg = '';
  }

  switch (prio) {
    case Log.VERBOSE:
    case Log.DEBUG:
    case Log.INFO:
      console.log(ts.toISOString() + ' [' + p[prio] + '] ' + tag + ': ' + msg);
      if (tr) {
        console.log(tr.stack);
      }
      break;
    case Log.WARN:
    case Log.ERROR:
    case Log.ASSERT:
      console.error(ts.toISOString() + ' [' + p[prio] + '] ' + tag + ': ' + msg);
      if (tr) {
        console.error(tr.stack);
      }
      break;
    default:
      Log.wtf('ConsoleFormatter', 'invalid priority specified: ' + prio + ', logging as error.');
      Log.e(tag, msg, tr);
  }
};

Log.addFormatter(ConsoleFormatter);

module.exports = Log;
