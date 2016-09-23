const _ = require('lodash');
const q = require('q');
const redux = require('redux');

q.longStackSupport = true;

const level_order = [
    'fatal',
    'error',
    'warn',
    'debug'
];

function get_level_index(level) {
    return _.indexOf(level_order, level.toLowerCase());
}

function level_reducer(state, action) {
    switch (action.type) {
    case 'level':
        return get_level_index(action.level);
    default:
        if (typeof state === 'undefined') {
            return level_order.length - 1;
        }

        return state;
    }
}

function logger_reducer(state, action) {
    switch (action.type) {
    case 'console':
        return new console.Console(action.stdout, action.stderr);
    default:
        if (typeof state === 'undefined') {
            return console;
        }

        return state;
    }
}

const level_store = redux.createStore(level_reducer);
const logger_store = redux.createStore(logger_reducer);

function get_writer(level) {
    switch (level) {
    case 'debug':
        return logger_store.getState().log;
    case 'warn':
        return logger_store.getState().warn;
    default:
        return logger_store.getState().error;
    }
}

function log(level) {
    const level_index = get_level_index(level);

    if (level_store.getState() >= level_index) {
        const writer = get_writer(level);
        const time = (new Date()).toISOString();
        const args = _.toArray(arguments).slice(1);

        writer.apply(
            null,
            [level.toUpperCase(), time]
            .concat(_.toArray(_.omit(args, _.isError)))
        );

        _.every(
            _.map(_.filter(args, _.isError), 'stack'),
            logger_store.getState().trace
        );
    }
}

function dispatch_level(level) {
    level_store.dispatch({
        type: 'level',
        level: level
    });

    return wrapper;
}

function dispatch_logger(stdout, stderr) {
    logger_store.dispatch({
        type: 'console',
        stdout: stdout,
        stderr: stderr
    });

    return wrapper;
}

const wrapper = Object.assign(
    log,
    {
        level: dispatch_level,
        logger: dispatch_logger
    }
);

module.exports = wrapper;
