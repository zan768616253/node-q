var nextTick = function (callback) {
    setTimeout(callback, 0);
}

var ref = function (value) {
    if (value && typeof value.then === 'function') {
        return value;
    }
    return {
        then: function (callback) {
            var defered = defer();
            nextTick(function () {
                defered.resolve(callback(value))
            });
            return defered.promise;
        }
    }
}

var reject = function (reason) {
    return {
        then: function (callback, errback) {
            var defered = defer();
            nextTick(function () {
                defered.resolve(errback(reason));
            });
            return defered.promise;
        }
    }
}

var defer = function () {
    var tasks = [],
        value,
        state,
        reason;

    return {
        resolve: function (_value) {
            if (tasks) {
                value = ref(_value);
                tasks.forEach(function (task) {
                    nextTick(function () {
                       value.then.apply(value, task);
                    });
                });
                tasks = undefined;
                state = 'resolved';
            } else {
                if (state === 'resolved') {
                    throw new Error('A promise should been resolved once.');
                }
            }
        },
        reject: function (_reason) {
            if (tasks) {
                value = reject(_reason);
                tasks.forEach(function (task) {
                    nextTick(function () {
                        value.then.apply(value, [task[0], task[1]]);
                    })
                });
                tasks = undefined;
                state = 'rejected';
            } else {
                if (state === 'rejected') {
                    throw new Error('A promise should been rejected once.');
                }
            }
        },
        promise: {
            then: function (_callback, _errback) {
                var defered = defer();
                _callback = _callback || function (value) { return value; };
                _errback = _errback || function (reason) { return reject(reason); }
                var callback = function (value) {
                    defered.resolve(_callback(value));
                }
                var errback = function (reason) {
                    defered.resolve(_errback(reason));
                }

                if (tasks) {
                    tasks.push([callback, errback])
                } else {
                    nextTick(function () {
                        if (state === 'rejected') {
                            value.then(callback, errback);
                        } else if (state === 'resolved') {
                            value.then(callback);
                        }
                    })
                }
                return defered.promise;
            }
        }
    }
}

module.exports = defer;