const deep_freeze = require('deep-freeze');
const chai = require('chai');
const log = require('../');
const q = require('q');
const stream = require('stream');
const format = require('util').format;

const assert = chai.assert;
const expect = chai.expect;

const levels = [
    'fatal',
    'error',
    'warn',
    'debug'
];

const logger = test_levels => {
    const writer = new stream.Writable();

    const flush = () => {
        return levels.reduce(
            (promise, lvl) => {
                return promise.then(() => {
                    const deferred = q.defer();

                    writer._write = (chunk, encoding, callback) => {
                        if (test_levels.indexOf(lvl) >= 0) {
                            const re = new RegExp(format(
                                '^%s [0-9TZ:.-]{24} hello %s',
                                lvl.toUpperCase(),
                                lvl
                            ));
                            expect(chunk.toString()).to.match(re);
                        } else {
                            assert.fail(lvl, 'Null', lvl + ' shouldn\'t been logged.');
                        }

                        callback();
                        deferred.resolve();
                    };

                    log(lvl, 'hello', lvl);

                    return deferred.promise;
                })
                .timeout(100, 'timedout')
                .catch(err => {
                    if (err.message === 'timedout') {
                        expect(test_levels.indexOf(lvl)).to.equal(-1);
                        return q();
                    }

                    return q.reject(err);
                });
            },
            q()
        );
    };

    return {
        flush: flush,
        writer: writer
    };
};

describe('Log', () => {
    it('shall set logger and log all levels', done => {
        deep_freeze(log);

        const logger_tester = logger(levels);

        log.logger(logger_tester.writer, logger_tester.writer);

        logger_tester.flush().done(done);
    });

    it('shall set logger and log fatal level', done => {
        deep_freeze(log);

        const logger_tester = logger(['fatal']);

        log.logger(logger_tester.writer, logger_tester.writer)
        .level('fatal');

        logger_tester.flush().done(done);
    });

    it('shall set logger and log error level', done => {
        deep_freeze(log);

        const logger_tester = logger(['fatal', 'error']);

        log.logger(logger_tester.writer, logger_tester.writer)
        .level('error');

        logger_tester.flush().done(done);
    });

    it('shall set logger and log warn level', done => {
        deep_freeze(log);

        const logger_tester = logger(['fatal', 'error', 'warn']);

        log.logger(logger_tester.writer, logger_tester.writer)
        .level('warn');

        logger_tester.flush().done(done);
    });
});
