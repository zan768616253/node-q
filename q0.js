var defer = function () {
    var tasks = [],
        state = 'pending',
        value,
        reason;

    return {
        resolve: function (_value) {
            if (tasks) {
                value = _value;
                tasks.forEach(function (task) {
                    task(value);
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
            then: function (callback) {
                if (tasks) {
                    tasks.push(callback);
                } else {
                    callback(value);
                }
            }
        }
    }
};

module.exports = defer;