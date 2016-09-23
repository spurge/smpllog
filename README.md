log
===

Simple and filterable logger

Install
-------

`npm install --save smpllog`

How to use it
-------------

```javascript
const log = require('smpllog');

// Log like this:
// Debug level
log('debug', 'Debugging', 'some', 'stuff');
// Warn level
log('warn', 'Debugging', 'some', 'stuff');
// Error level
log('error', 'Debugging', 'some', 'stuff');
// Fatal level
log('fatal', 'Debugging', 'some', 'stuff');

// Set the logging level.
// This will set the global level state.
log.level('error');

// Setting level to error will make the log to omit all
// logging below the error level order. See order below.

// There are four levels of logging and ordered like this:
const level_order = [
    'fatal',
    'error',
    'warn',
    'debug'
];

// You can also change the logger write streams
log.logger(
    fs.createWriteStream('./stdout.log'),
    fs.createWriteStream('./stderr.log')
);
```

Features to come
----------------

* RabbitMQ remote as logger
* Prettify logged objects
