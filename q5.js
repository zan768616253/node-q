var nextTick = function (callback) {
    setTimeout(callback, 0);
}

var ref = function (value) {
    if (value && value.then === 'function') {
        return value;
    }
    return {
        then: function (callback) {
            var defered = defer();
            nextTick(function () {
                defered.resolve(callback(value));
            })
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
            })
            return defered.promise;
        }
    }
}

var defer = function () {
    var tasks = [],
        progresses = [],
        state = 'pending',
        value,
        reason

    return {
        resolve: function (_value) {
            if (tasks) {
                value = ref(_value);
                tasks.forEach(function (task) {
                    nextTick(function () {
                        value.then.apply(value, task);
                    })
                });
                tasks = undefined;
                state = 'resolved';
            } else {
                if (state === 'resolved') {
                    throw new Error('A promise should been resolved once.');
                }
            }
        },
        reject: function (reason) {
            if (tasks) {
                value = reject(reason);
                tasks.forEach(function (task) {
                    value.then.apply(value, [task[0], task[1]]);
                })
                tasks = undefined;
                state = 'rejected';
            } else {
                if (state === 'rejected') {
                    throw new Error('A promise should been rejected once.');
                }
            }
        },
        notify: function (progress) {
            if (state === 'resolved' || state === 'rejected') {
                return ;
            }
            progresses.push(progress);
        },
        promise: {
            then: function (_callback, _errback, _notifyback) {
                var defered = defer();
                _callback = _callback || function (value) {return value}
                _errback = _errback || function (reason) {return reject(reason)}
                _notifyback = _notifyback || function (progress) {return progress}
                var callback = function (value) {
                    var result;
                    try {
                        result = _callback(value);
                    } catch (e) {
                        defered.reject(e)
                    } finally {
                        defered.resolve(result);
                    }
                }
                var errback = function (reason) {
                    var result;
                    try {
                        result = _errback(reason)
                    } catch (e) {
                        defered.reject(e);
                    } finally {
                        defered.resolve(result);
                    }
                }

                nextTick(function () {
                    while (progresses.length) {
                        try {
                            _notifyback(progresses.shift());
                        } catch (e) {
                            defered.reject(e);
                            break;
                        }
                    }
                })

                if (tasks) {
                    tasks.push([callback, errback])
                } else {
                    nextTick(function () {
                        if (state === 'rejected') {
                            value.then(errback);
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