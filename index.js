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

  this.v = this.println.bind(this, this.VERBOSE);
  this.d = this.println.bind(this, this.DEBUG);
  this.i = this.println.bind(this, this.INFO);
  this.w = this.println.bind(this, this.WARN);
  this.e = this.println.bind(this, this.ERROR);
  this.wtf = this.println.bind(this, this.ASSERT);

  this.level = this.INFO;
}

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

    var args = [].slice.call(arguments, 2);
    args = parseArgs(args);

    var ts = new Date;
    var len = this.transports.length;
    for (var i = 0; i < len; ++i) {
      this.transports[i].call(this, ts, severity, tag, args);
    }
  }
};

var constants = {
  'VERBOSE': 2,
  'DEBUG': 3,
  'INFO': 4,
  'WARN': 5,
  'ERROR': 6,
  'ASSERT': 7,

  'SHORT_NAMES': [undefined, undefined, 'V', 'D', 'I', 'W', 'E', 'A']
};

Object.keys(constants).forEach(function(key) {
  Object.defineProperty(Log.prototype, key, {
    value: constants[key],
    enumerable: true
  });
});

var instance = new Log;

instance.defaults = function() {
  if (this.transports.length || this.filters.length) {
    throw new Error('Already configured.');
  }

  this.addTransport(ConsoleTransport);

  return this;
};

function ConsoleTransport(ts, severity, tag, args) {
  /*eslint-disable no-console */
  var m;

  switch (severity) {
    case this.VERBOSE:
    case this.DEBUG:
    case this.INFO:
      m = 'log';
      break;
    case this.WARN:
    case this.ERROR:
    case this.ASSERT:
      m = 'error';
      break;
    default:
      this.wtf('ConsoleTransport', 'invalid severity specified: ', severity, ', logging as error.');
      this.e(tag, args);
      return;
  }

  console[m](ts.toISOString() + ' [' + this.SHORT_NAMES[severity] + '] ' + tag + ': ' + (args.message || ''));

  if (args.err) {
    console[m](args.err.stack);
  }
}

// Oh.
instance.Log = Log;
instance.ConsoleTransport = ConsoleTransport;

module.exports = instance;
