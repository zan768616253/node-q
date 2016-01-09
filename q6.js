function Q () {}
Q.prototype.defer = defer;
Q.prototype.all = all;
Q.prototype.any = any;

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
            // return ref(errback(reason));
            var deferred = defer();
            nextTick(function () {
                deferred.resolve(errback(reason))
            });
            return deferred.promise;
        }
    }
};

var noopFn = function () {};

var defer = function () {
    var tasks      = [],
        progresses = [],
        state      = 'pending',
        value,
        reason,
        _finallyback;

    return {
        resolve: function (_value) {
            if (tasks) {
                value = ref(_value);
                tasks.forEach(function (task) {
                    // value.then.apply(value, task);
                    nextTick(function () {
                        value.then.apply(value, task);
                    })
                })
                tasks = undefined;
                state = 'resolved';
            } else {
                if (state === 'resolved') {
                    throw new Error('A promise should been resolved once.');
                }
            }

            if (_finallyback) {
                nextTick(function () {
                    _finallyback && (_finallyback());
                    _finallyback = undefined;
                })
            }
        },
        reject: function (reason) {
            if (tasks) {
                value = ref(reason);
                tasks.forEach(function (task) {
                    // value.then.apply(value, [task[1], task[0]]);
                    nextTick(function () {
                        value.then.apply(value, [task[1], task[0]]);
                    })
                })

                tasks = undefined;
                state = 'rejected';
            } else {
                if (state === 'rejected') {
                    throw new Error('A promise should been rejected once.');
                }
            }

            if (_finallyback) {
                nextTick(function () {
                    _finallyback && (_finallyback());
                    _finallyback = undefined;
                })
            }
        },
        noitfy: function (progress) {
            if (state === 'resolved' || state === 'rejected') {
                return ;
            }
            progresses.push(progress);
        },
        promise: {
            then: function (_callback, _errback, _notifyback) {
                var self = this;
                var deferred = defer();
                _callback = _callback || function (value) {
                        return value;
                    }
                _errback = _errback || function (reason) {
                        return reject(reason);
                    }
                _notifyback  = _notifyback || function (progress) {
                        return progress;
                    }
                var callback = function (value) {
                    // deferred.resolve(_callback(value));
                    var result;
                    try {
                        result = _callback(value)
                    } catch (e) {
                        deferred.reject(e);
                    } finally {
                        deferred.resolve(result);
                    }
                };
                var errback = function (reason) {
                    // deferred.resolve(_errback(reason));
                    var result;
                    try {
                        result = _errback(reason)
                    } catch (e) {
                        deferred.reject(e);
                    } finally {
                        deferred.resolve(result);
                    }
                }

                nextTick(function () {
                    while(progresses.length) {
                        // _notifyback(progresses.shift());
                        try {
                            _notifyback(progresses.shift());
                        } catch (e) {
                            if (_catchback) {
                                _catchback(e);
                                catchback = undefined;
                                return;
                            }
                            deferred.reject(e);
                            break;
                        }
                    }
                });

                if (tasks) {
                    tasks.push([callback, errback]);
                } else {
                    nextTick(function (){
                        if (state === 'rejected') {
                            value.then(errback);
                        } else if (state === 'resolved') {
                            value.then(callback);
                        }
                    })
                }

                if (_finallyback) {
                    nextTick(function () {
                        _finallyback && (_finallyback());
                        _finallyback = undefined;
                    })
                }
                return deferred.promise;
            },
            done: function (_callback) {
                return  this.then(_callback, noopFn);
            },
            fail: function (_errback) {
                return this.then(noopFn, _errback);
            },
            'finally': function (finallyback) {
                _finallyback = finallyback;
            },
            'catch': function (catchback) {
                // _catchback = catchback;
                return this.then(noopFn, catchback);
            }
        }
    }
}

function any (arr) {
    var deferred = defer();
    arr.forEach(function (item) {
        ref(item).then(function (value) {
            deferred.resolve(value);
        })
    })
    return deferred.promise();
}

module.exports = Q;