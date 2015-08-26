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

function Log() {
  if (!(this instanceof Log)) {
    return new Log;
  }

  this.transports = [];
  this.filters = [];

  this.v = this.println.bind(this, Log.VERBOSE);
  this.d = this.println.bind(this, Log.DEBUG);
  this.i = this.println.bind(this, Log.INFO);
  this.w = this.println.bind(this, Log.WARN);
  this.e = this.println.bind(this, Log.ERROR);
  this.wtf = this.println.bind(this, Log.ASSERT);

  this.setLevel(Log.INFO);
}

Object.defineProperties(Log, {
  'VERBOSE': { value: 2 },
  'DEBUG': { value: 3 },
  'INFO': { value: 4 },
  'WARN': { value: 5 },
  'ERROR': { value: 6 },
  'ASSERT': { value: 7 },

  'SHORT_NAMES': {
    value: [undefined, undefined, 'V', 'D', 'I', 'W', 'E', 'A']
  }
});

Log.prototype = {
  setLevel: function(severity) {
    this.level = severity;
  },

  addTransport: function(fmt) {
    this.transports.push(fmt);
  },

  addFilter: function(tag) {
    this.filters.push(tag);
  },

  println: function(severity, tag /*, varargs */) {
    if (severity < this.level || this.filters.indexOf(tag) > -1) {
      return;
    }

    var args = Array.prototype.constructor.apply(null, arguments).slice(2);
    args = parseArgs(args);

    var ts = new Date;
    var len = Log.transports.length;
    for (var i = 0; i < len; ++i) {
      this.transports[i].call(this, ts, severity, tag, args);
    }
  },

  defaults: function() {
    this.transports = [];
    this.filters = [];

    this.addTransport(ConsoleTransport);
  }
};

function ConsoleTransport(ts, severity, tag, args) {
  /*eslint-disable no-console */
  var m;

  switch (severity) {
    case Log.VERBOSE:
    case Log.DEBUG:
    case Log.INFO:
      m = 'log';
      break;
    case Log.WARN:
    case Log.ERROR:
    case Log.ASSERT:
      m = 'error';
      break;
    default:
      Log.wtf('ConsoleTransport', 'invalid severity specified: ', severity, ', logging as error.');
      Log.e(tag, args);
      return;
  }

  console[m](ts.toISOString() + ' [' + this.SHORT_NAMES[severity] + '] ' + tag + ': ' + (args.message || ''));

  if (args.err) {
    console[m](args.err.stack);
  }
}

var instance = new Log;

// Oh.
instance.Log = Log;
instance.ConsoleTransport = ConsoleTransport;

module.exports = instance;
