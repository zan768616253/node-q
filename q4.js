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
                callback(value);
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
            });
            return defered.promise;
        }
    }
}

var defer = function () {
    var tasks = [],
        progresses = [],
        status = 'pending',
        value,
        reason

    return {
        resolve: function (_value) {
            if (tasks) {
                value = ref(_value);
                tasks.forEach(function (task) {
                    value.then.apply(value, task);
                });
                tasks = undefined;
                status = 'resolved';
            } else {
                if (status === 'resolved') {
                    throw new Error('A promise should been resolved once.');
                }
            }
        },
        reject: function (_reason) {
            if (tasks) {
                value = reject(_reason);
                tasks.forEach(function (task) {
                    value.then.apply(value, [task[0], task[1]]);
                })
                tasks = undefined;
                status = 'rejected';
            } else {
                if (status === 'rejected') {
                    throw new Error('A promise should been rejected once.');
                }
            }
        },
        noitfy: function (progress) {
            if (status === 'resolved' || status === 'rejected') {
                return ;
            }
            progresses.push(progress);
        },
        promise: {
            then: function (_callback,  _errback, _notifyback) {
                var defered = defer();
                _callback = _callback || function (value) { return value; }
                _errback = _errback || function (reason) { return reject(reason); }
                _notifyback = _notifyback || function (progress) { return progress; }

                var callback = function (value) {
                    defered.resolve(_callback(value));
                }
                var errback = function (reason) {
                    defered.resolve(_errback(reason));
                }

                nextTick(function () {
                    while (progresses.length) {
                        _notifyback(progresses.shift());
                    }
                })

                if (tasks) {
                    tasks.push([callback, errback]);
                } else {
                    nextTick(function () {
                        if (status === 'rejected') {
                            value.then(callback, errback);
                        } else if (status === 'resolved') {
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