var chai = require('chai');
var spies = require('chai-spies');
var expect = chai.expect;
var should  = chai.should;
chai.use(spies);

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
            //console.log('q1-test: ' + value);
            expect(value).to.eql('zhangsan');
            return 'lisi';
        }).then(function (value) {
            //console.log('q1-test: ' + value);
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

    it('q2 reject should work', function (done) {
        setTimeout(function () {
            defered.reject('zhangsan');
        }, 300);

        promise.then(function () {}, function (value) {
            expect(value).to.eql('zhangsan');
            done();
        })
    })
});

describe('q3', function (done) {
    var defer = require('../q3.js');

    var defered,
        promise;

    beforeEach(function () {
        defered = defer();
        promise = defered.promise;
    });

    it('q3 reject should work', function (done) {
        setTimeout(function () {
            defered.reject('lisi');
        }, 300);

        promise.then(function () {},  function (value) {
            expect(value).to.eql('lisi');
            return 'zhangsan';
        }).then(function (value) {
            expect(value).to.eql('zhangsan');
            done();
        })
    })
})

describe('q4', function (done) {
    var defer = require('../q4.js');

    var defered,
        promise;

    beforeEach(function () {
        defered = defer();
        promise = defered.promise;
    })

    it('q3 reject should work', function (done) {
        setTimeout(function () {
            defered.reject('lisi');
        }, 300);

        promise.then(function () {},  function (value) {
            expect(value).to.eql('lisi');
            return 'zhangsan';
        }).then(function (value) {
            expect(value).to.eql('zhangsan');
            done();
        })
    })

    it('q4 notify should work', function (done) {
        var spy = chai.spy(function (progress) {
            console.log(progress);
        });

        setTimeout(function () {
            defered.reject('zhangsan');
        }, 100);

        for (var i = 0; i < 10; i++) {
            defered.noitfy(i);
        }

        promise.then(function () {}, function (value) {
            expect(value).to.eql('zhangsan');
            expect(spy).to.have.been.called.exactly(10);
            done();
        }, spy)
    })
})

