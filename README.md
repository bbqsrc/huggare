# Huggare

**Huggare** is a Swedish word for woodcutter. Whatever.

# Usage

```javascript
var Log = require('huggare');

var TAG = "MyCrapModule";

Log.setLevel(Log.VERBOSE);

/* Some time passes, nightmares are happening... */

function whatever() {
  Log.i(TAG, "I am interacting in a whateverish way.");
}
```

You'll get output something like:

`2015-08-02T05:14:23.924Z [I] MyCrapModule: I am interacting in a whateverish way.`

Good. If you want more formatters, look at the sauce.

# License

ISC because whatever.
