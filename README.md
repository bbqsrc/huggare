# Huggare

**Huggare** is a Swedish word for woodcutter. Let's log.

# Usage

```javascript
var huggare = require('huggare');
var Log = require('huggare-log');

var TAG = "MyCrapModule";

Log.setLevel(huggare.Severities.VERBOSE);

/* Some time passes, nightmares are happening... */

function whatever() {
  Log.v(TAG, "I am interacting in a whateverish way.");
  Log.i(TAG, {
    message: "This is a message",
    someData: { a: "data item that might be used by another transport" }
  });

  try {
    notAMethod();
  } catch (err) {
    Log.e(TAG, "There was a sickening error", err);
    return;
  }
}
```

You'll get output something like:

```
2015-08-02T05:14:23.924Z [V] MyCrapModule: I am interacting in a whateverish way.
2015-08-02T05:14:24.001Z [I] MyCrapModule: This is a message.
2015-08-02T05:14:24:025Z [E] MyCrapModule: There was a sickening error
ReferenceError: notAMethod is not defined
    at repl:1:1
    at REPLServer.defaultEval (repl.js:164:27)
    at bound (domain.js:250:14)
    at REPLServer.runBound [as eval] (domain.js:263:12)
    at REPLServer.<anonymous> (repl.js:392:12)
    at emitOne (events.js:82:20)
    at REPLServer.emit (events.js:169:7)
    at REPLServer.Interface._onLine (readline.js:210:10)
    at REPLServer.Interface._line (readline.js:546:8)
    at REPLServer.Interface._ttyWrite (readline.js:823:14)
```

## API

Just look at the code for now.

## Changelog

* 0.4.0: **Breaking change**: use `huggare-log` for old `Log#defaults` feature.
* 0.3.2: Fix misplaced constants
* 0.3.1: Publishing fail
* 0.3.0: No transports by default now. Use `Log#defaults` as provided in example for old behaviour
* 0.2.0: Changed how the logger handles objects, allowing metadata
* 0.1.0: First release

# License

ISC - see LICENSE file.
