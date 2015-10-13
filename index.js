'use strict';
const util = require('util');

function parseArgs(args) {
  let o = {};

  let len = args.length;
  let err;

  // Special case for error-ish object (anything with stack)
  if (len > 0 && args[args.length - 1] && args[args.length - 1].stack) {
    err = args.pop();
    len--;
  }

  if (len === 1 && util.isObject(args[0])) {
    // JSONable
    o = args[0];
  } else if (len >= 1) {
    o.message = args.map(arg => {
      return util.isPrimitive(arg) ? arg : util.inspect(arg);
    }).join(' ');
  }

  if (err) {
    o.err = err;
  }
  return o;
}

const Severities = {};

{
  let v = 2;

  for (const s of ['verbose', 'debug', 'info', 'warn', 'error', 'assert']) {
    const us = s.toUpperCase();

    Object.defineProperty(Severities, us, {
      value: v,
      enumerable: true
    });

    Object.defineProperty(Severities, v, {
      value: us,
      enumerable: true
    });

    v++;
  }
}

class Logger {
  constructor(level) {
    this.transports = [];
    this.filters = [];

    this.v = this.println.bind(this, Severities.VERBOSE);
    this.d = this.println.bind(this, Severities.DEBUG);
    this.i = this.println.bind(this, Severities.INFO);
    this.w = this.println.bind(this, Severities.WARN);
    this.e = this.println.bind(this, Severities.ERROR);
    this.wtf = this.println.bind(this, Severities.ASSERT);

    this.level = level || Severities.INFO;
  }

  setLevel(severity) {
    this.level = severity;
  }

  addTransport(fmt) {
    this.transports.push(fmt);
  }

  addFilter(tag) {
    this.filters.push(tag);
  }

  println(severity, tag) {
    if (severity < this.level || this.filters.indexOf(tag) > -1) {
      return;
    }

    // pseudo-spread operator
    const args = parseArgs([].slice.call(arguments, 2));
    const ts = new Date();

    for (const transport of this.transports) {
      transport.call(this, ts, severity, tag, args);
    }
  }
}

module.exports = { Logger, Severities };
