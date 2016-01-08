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

var defer = function () {
    var tasks = [],
        progresses = [],
        value,
        reason;

    return {
        resolve: function (_value) {

        },
        reject: function (reason) {

        },
        promise: {
            then: function (_callback, _errback, _notifyback) {

            }
        }
    }
}