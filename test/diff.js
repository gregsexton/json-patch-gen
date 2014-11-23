var diff = require('../lib/diff');
var chai = require('chai');
var expect = chai.expect;

describe('#diff()', function() {
    'use strict';

    it('should blow up when given something other than an object or array', function(){
        expect(function() {
            diff.diff({}, '');
        }).to.throw(TypeError);

        expect(function() {
            diff.diff('', {});
        }).to.throw(TypeError);

        expect(function() {
            diff.diff([], {});
        }).to.not.throw(TypeError);
    });

    it('should blow up when an object has a prototype', function(){
        var proto = { foo: 'bar' };

        var WithPrototype = function() {};
        WithPrototype.prototype = proto;

        var obj1 = new WithPrototype(),
            obj2 = { key: 'value' };

        expect(function() {
            diff.diff(obj1, obj2);
        }).to.throw(/has a prototype/);

        expect(function() {
            diff.diff(obj2, obj1);
        }).to.throw(/has a prototype/);
    });

    it('should blow up when an object contains a function', function(){
        var obj1 = {foo: 'bar'},
            obj2 = {f: function() {}};

        expect(function() {
            diff.diff(obj1, obj2);
        }).to.throw(/valid JSON value/);

        expect(function() {
            diff.diff(obj2, obj1);
        }).to.throw(/valid JSON value/);
    });

    it('should support comparing empty objects', function(){
        expect(diff.diff({}, {})).to.be.empty();
    });

    it('should support comparing equal objects', function(){
        var obj1 = {foo: {bar: 'baz'}},
            obj2 = {foo: {bar: 'baz'}};
        expect(diff.diff(obj1, obj2)).to.be.empty();
    });

    it('should support single top-level add', function(){
        var obj1 = {},
            obj2 = {foo: 'bar'};
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'add', path: '/foo', value: 'bar' });
    });

    it('should support multiple top-level adds', function(){
        var obj1 = {},
            obj2 = {foo: 'bar', baz: 5};
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'add', path: '/foo', value: 'bar' });
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'add', path: '/baz', value: 5 });
    });

    it('should support nested object adds', function(){
        var obj1 = {foo: 'bar', nested: {baz: {}}},
            obj2 = {foo: 'bar', nested: {baz: {key: 'value'}}};
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'add', path: '/nested/baz/key', value: 'value' });
    });

    // TODO: removes
    // TODO: changes
    // TODO: moves
    // TODO: json patch escaping

    // TODO: arrays

    // TODO: use quick check
});
