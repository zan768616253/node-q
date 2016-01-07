var ref = function (value) {
    if (value && typeof value.then === 'function') {
        return value;
    }
    return {
        then: function (callback) {
            return ref(callback(value));
        }
    }
};

var reject = function (reason) {
    return {
        then: function (callback, errback) {
            return ref(errback(reason));
        }
    }
};

var defer = function () {
    var tasks = [],
        state = 'pending',
        value,
        reason;

    return {
        resolve: function (_value) {
            if (tasks) {
                value = ref(_value);
                tasks.forEach(function (task) {
                   value.then.apply(value, task);
                });
                tasks = undefined;
                state = 'resolved'
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
              });
              tasks = undefined;
              state = 'rejected'
          } else {
              if (state === 'rejected') {
                  throw new Error('A promise should been rejected once.');
              }
          }
        },
        promise: {
            then: function (_callback, _errback) {
                var defered = defer();
                var callback = function (value) {
                    defered.resolve(_callback(value));
                };
                var errback = function (reason) {
                    defered.resolve(_errback(reason));
                };
                if (tasks) {
                    tasks.push([callback, errback]);
                } else {
                    if (state === 'rejected') {
                        value.then(callback, errback);
                    } else if (state === 'resolved') {
                        value.then(callback);
                    }
                }
                return defered.promise;
            }
        }
    }
}

module.exports = defer;