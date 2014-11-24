/*global require, describe, it*/

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

    it('should support single a top-level remove', function(){
        var obj1 = {foo: 'bar'},
            obj2 = {};
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'remove', path: '/foo' });
    });

    it('should support multiple top-level removes', function(){
        var obj1 = {foo: 'bar', baz: 5},
            obj2 = {};
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'remove', path: '/foo' });
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'remove', path: '/baz' });
    });

    it('should support nested object removes', function(){
        var obj1 = {nested: {inner: {something: 5}}},
            obj2 = {nested: {inner: {}}};
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'remove', path: '/nested/inner/something' });
    });

    it('should support a single top-level replace', function(){
        var obj1 = {foo: 'bar'},
            obj2 = {foo: 'baz'};
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'replace', path: '/foo', value: 'baz' });
    });

    it('should support multiple top-level replaces', function(){
        var obj1 = {foo: 'bar', baz: 5},
            obj2 = {foo: 'baz', baz: 8};
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'replace', path: '/foo', value: 'baz' });
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'replace', path: '/baz', value: 8 });
    });

    it('should support nested object replaces', function(){
        var obj1 = {nested: {inner: {something: 5}}},
            obj2 = {nested: {inner: {something: 8}}};
        expect(diff.diff(obj1, obj2)).to.contain({ op: 'replace', path: '/nested/inner/something', value: 8 });
    });

    // TODO: arrays
    it('should support a single top-level remove in an array leaving it empty', function(){
    });

    it('should support a single top-level add to an empty array', function(){
    });

    it('should support an add at the beginning of an array', function(){
    });

    it('should support an add at the end of an array', function(){
    });

    it('should support an add in the middle of an array', function(){
    });

    it('should support a remove at the beginning of an array', function(){
    });

    it('should support a remove at the end of an array', function(){
    });

    it('should support a remove in the middle of an array', function(){
    });

    it('should support a replace at the beginning of an array', function(){
    });

    it('should support a replace at the end of an array', function(){
    });

    it('should support a replace in the middle of an array', function(){
    });

    it('should support an add, remove and replace from different areas of an array', function(){
    });

    it('should support comparing an array at a nested level', function(){
    });

    // TODO: works with json parsed objects

    // TODO: json pointer escaping

    // TODO: use quick check
});
