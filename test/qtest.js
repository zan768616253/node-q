var expect = require('chai').expect;

describe('q0', function (done) {
    var defer = require('../q0.js');

    var defered,
        promise;

    beforeEach(function () {
        defered = defer();
        promise = defered.promise;
    });

    it('the argument of then should be the value of defer.resolve', function (done) {
        defered.resolve('zhangsan');
        promise.then(function (value) {
            expect(value).to.eql('zhangsan');
            done();
        })
    });

    it('defer should be resolve once', function () {
        defered.resolve('zhangsan');
        expect((function () {
            defered.resolve('lisi');
        })).to.throw('A promise should been resolved once.');
    });
});

describe('q1', function (done) {
    var defer = require('../q1.js').defer;

    var defered,
        promise;

    beforeEach(function () {
        defered = defer();
        promise = defered.promise;
    });

    it('the promise return a promise', function (done) {
        defered.resolve('zhangsan');
        promise.then(function (value) {
            console.log('q1-test: ' + value);
            expect(value).to.eql('zhangsan');
            return 'lisi';
        }).then(function (value) {
            console.log('q1-test: ' + value);
            expect(value).to.eql('lisi');
            done();
        })
    });
});

describe('q2', function (done) {
    var defer = require('../q2.js');

    var defered,
        promise;

    beforeEach(function () {
        defered = defer();
        promise = defered.promise;
    });

    it('reject should work', function (done) {
        //setTimeout(function () {
        //    defered.reject('zhangsan');
        //}, 100);

        defered.reject('zhangsan');

        promise.then(function () {}, function (value) {
            expect(value).to.eql('zhangsan');
            done();
        })
    })
});