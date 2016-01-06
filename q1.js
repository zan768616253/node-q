var ref = function (value) {
    if (value && typeof value.then === 'function') {
        console.log('ref-value: ' + value);
        return value;
    }
    return {
        then: function (callback) {
            console.log('ref-then: ' + value);
            return ref(callback(value));
        }
    }
}

var defer = function () {
    var tasks = [],
        state = 'pending',
        value;

    return {
        resolve: function (_value) {
            if (tasks) {
                value = ref(_value);
                tasks.forEach(function (task) {
                    var fname = task.toString().substr('function '.length).substr(0, ret.indexOf('('));
                    console.log('defer-tasks: ' + fname);
                    value.then(task);
                });
                tasks = undefined;
                state = 'resolved';
            } else {
                if (state === 'resolved') {
                    throw new Error('A promise should been resolved once.');
                }
            }
        },
        promise: {
            then: function (_callback) {
                var defered = defer();
                var callback = function (value) {
                  defered.resolve(_callback(value));
                };

                if (tasks) {
                    value.then(function (v) {
                        console.log('defer-promise-tasks: ' + v);
                    });
                    tasks.push(callback);
                } else {
                    value.then(function (v) {
                        console.log('defer-promise-tasks-null: ' + v);
                    });
                    value.then(callback);
                }
                return defered.promise;
            }
        }
    }
}

module.exports.defer = defer;
module.exports.ref = ref;