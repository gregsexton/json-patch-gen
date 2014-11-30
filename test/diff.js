/*global require, it, describe*/

var diff = require('../lib/diff'),
    expect = require('chai').expect,
    jsc = require('jsverify'),
    patch = require('jsonpatch'),
    _ = require('underscore');

describe('#diff()', function() {
    'use strict';

    it('should blow up when given something other than an object or array', function(){
        expect(function() {
            diff({}, '');
        }).to.throw(TypeError);

        expect(function() {
            diff('', {});
        }).to.throw(TypeError);

        expect(function() {
            diff([], {});
        }).to.not.throw(TypeError);
    });

    it('should blow up when an object has a prototype', function(){
        var proto = { foo: 'bar' };

        var WithPrototype = function() {};
        WithPrototype.prototype = proto;

        var obj1 = new WithPrototype(),
            obj2 = { key: 'value' };

        expect(function() {
            diff(obj1, obj2);
        }).to.throw(/has a prototype/);

        expect(function() {
            diff(obj2, obj1);
        }).to.throw(/has a prototype/);
    });

    it('should blow up when an object contains a function', function(){
        var obj1 = {foo: 'bar'},
            obj2 = {f: function() {}};

        expect(function() {
            diff(obj1, obj2);
        }).to.throw(/valid JSON value/);
    });

    it('should support comparing empty objects', function(){
        expect(diff({}, {})).to.be.empty();
    });

    it('should support comparing equal objects', function(){
        var obj1 = {foo: {bar: 'baz'}},
            obj2 = {foo: {bar: 'baz'}};
        expect(diff(obj1, obj2)).to.be.empty();
    });

    it('should support single top-level add', function(){
        var obj1 = {},
            obj2 = {foo: 'bar'};
        expect(diff(obj1, obj2)).to.contain({ op: 'add', path: '/foo', value: 'bar' });
    });

    it('should support multiple top-level adds', function(){
        var obj1 = {},
            obj2 = {foo: 'bar', baz: 5};
        expect(diff(obj1, obj2)).to.contain({ op: 'add', path: '/foo', value: 'bar' });
        expect(diff(obj1, obj2)).to.contain({ op: 'add', path: '/baz', value: 5 });
    });

    it('should support nested object adds', function(){
        var obj1 = {foo: 'bar', nested: {baz: {}}},
            obj2 = {foo: 'bar', nested: {baz: {key: 'value'}}};
        expect(diff(obj1, obj2)).to.contain({ op: 'add', path: '/nested/baz/key', value: 'value' });
    });

    it('should support single a top-level remove', function(){
        var obj1 = {foo: 'bar'},
            obj2 = {};
        expect(diff(obj1, obj2)).to.contain({ op: 'remove', path: '/foo' });
    });

    it('should support multiple top-level removes', function(){
        var obj1 = {foo: 'bar', baz: 5},
            obj2 = {};
        expect(diff(obj1, obj2)).to.contain({ op: 'remove', path: '/foo' });
        expect(diff(obj1, obj2)).to.contain({ op: 'remove', path: '/baz' });
    });

    it('should support nested object removes', function(){
        var obj1 = {nested: {inner: {something: 5}}},
            obj2 = {nested: {inner: {}}};
        expect(diff(obj1, obj2)).to.contain({ op: 'remove', path: '/nested/inner/something' });
    });

    it('should support a single top-level replace', function(){
        var obj1 = {foo: 'bar'},
            obj2 = {foo: 'baz'};
        expect(diff(obj1, obj2)).to.contain({ op: 'replace', path: '/foo', value: 'baz' });
    });

    it('should support multiple top-level replaces', function(){
        var obj1 = {foo: 'bar', baz: 5},
            obj2 = {foo: 'baz', baz: 8};
        expect(diff(obj1, obj2)).to.contain({ op: 'replace', path: '/foo', value: 'baz' });
        expect(diff(obj1, obj2)).to.contain({ op: 'replace', path: '/baz', value: 8 });
    });

    it('should support nested object replaces', function(){
        var obj1 = {nested: {inner: {something: 5}}},
            obj2 = {nested: {inner: {something: 8}}};
        expect(diff(obj1, obj2)).to.contain({ op: 'replace', path: '/nested/inner/something', value: 8 });
    });

    it('should support a single top-level remove in an array leaving it empty', function(){
        var obj1 = ['foo'],
            obj2 = [];
        expect(diff(obj1, obj2)).to.contain({ op: 'remove', path: '/0' });
    });

    it('should support a single top-level add to an empty array', function(){
        var obj1 = [],
            obj2 = ['foo'];
        expect(diff(obj1, obj2)).to.contain({ op: 'add', path: '/0', value: 'foo' });
    });

    it('should support an add at the beginning of an array', function(){
        var obj1 = ['foo'],
            obj2 = ['bar', 'foo'];
        expect(diff(obj1, obj2)).to.contain({ op: 'add', path: '/0', value: 'bar' });
    });

    it('should support an add at the end of an array', function(){
        var obj1 = ['foo'],
            obj2 = ['foo', 'bar'];
        expect(diff(obj1, obj2)).to.contain({ op: 'add', path: '/1', value: 'bar' });
    });

    it('should support an add in the middle of an array', function(){
        var obj1 = ['foo', 'baz'],
            obj2 = ['foo', 'bar', 'baz'];
        expect(diff(obj1, obj2)).to.contain({ op: 'add', path: '/1', value: 'bar' });
    });

    it('should support a remove at the beginning of an array', function(){
        var obj1 = ['bar', 'foo'],
            obj2 = ['foo'];
        expect(diff(obj1, obj2)).to.contain({ op: 'remove', path: '/0' });
    });

    it('should support a remove at the end of an array', function(){
        var obj1 = ['foo', 'bar'],
            obj2 = ['foo'];
        expect(diff(obj1, obj2)).to.contain({ op: 'remove', path: '/1' });
    });

    it('should support a remove in the middle of an array', function(){
        var obj1 = ['foo', 'bar', 'baz'],
            obj2 = ['foo', 'baz'];
        expect(diff(obj1, obj2)).to.contain({ op: 'remove', path: '/1' });
    });

    it('should support a replace at the beginning of an array', function(){
        var obj1 = ['foo', 'bar'],
            obj2 = ['baz', 'bar'];
        expect(diff(obj1, obj2)).to.contain({ op: 'replace', path: '/0', value: 'baz' });
    });

    it('should support a replace at the end of an array', function(){
        var obj1 = ['foo', 'bar'],
            obj2 = ['foo', 'baz'];
        expect(diff(obj1, obj2)).to.contain({ op: 'replace', path: '/1', value: 'baz' });
    });

    it('should support a replace in the middle of an array', function(){
        var obj1 = ['foo', 'bar', 'baz'],
            obj2 = ['foo', 'quux', 'baz'];
        expect(diff(obj1, obj2)).to.contain({ op: 'replace', path: '/1', value: 'quux' });
    });

    it('should support an add, remove and replace from different areas of an array', function(){
        var obj1 = [1,2,3,4,5,6,7,8,9,0],
            obj2 = [1,3,4,5,11,7,8,9,44,0];
        expect(diff(obj1, obj2)).to.deep.equal([{ op: 'add', path: '/9', value: 44 },
                                                     { op: 'replace', path: '/5', value: 11 },
                                                     { op: 'remove', path: '/1' }]);
    });

    it('should support comparing an array nested in an object', function(){
        var obj1 = {foo: {bar: [1,2,3]}},
            obj2 = {foo: {bar: [2,3,4]}};
        expect(diff(obj1, obj2)).to.deep.equal([{ op: 'add', path: '/foo/bar/3', value: 4 },
                                                     { op: 'remove', path: '/foo/bar/0' }]);
    });

    it('should support comparing an array nested within an array', function(){
        var obj1 = {foo: {bar: [1,[],3]}},
            obj2 = {foo: {bar: [1,[2],3]}};
        expect(diff(obj1, obj2)).to.contain({ op: 'add', path: '/foo/bar/1/0', value: 2 });
    });

    it('should support comparing an object nested in an array', function(){
        var obj1 = [{foo: {bar: [1,[],3]}}],
            obj2 = [{foo: {bar: [1,[2],3]}, baz: 3}];
        expect(diff(obj1, obj2)).to.contain({ op: 'add', path: '/0/foo/bar/1/0', value: 2 });
        expect(diff(obj1, obj2)).to.contain({ op: 'add', path: '/0/baz', value: 3 });
    });

    it('should support comparing an array to an object', function(){
        var obj1 = [],
            obj2 = {};
        expect(diff(obj1, obj2)).to.contain({ op: 'replace', path: '', value: {} });
        expect(diff(obj2, obj1)).to.contain({ op: 'replace', path: '', value: [] });
    });

    it('should support json parsed objects', function(){
        var obj1 = JSON.parse('{"foo": "bar"}'),
            obj2 = JSON.parse('{"foo": "baz"}');
        expect(diff(obj1, obj2)).to.contain({ op: 'replace', path: '/foo', value: 'baz' });
    });

    it('should support escaping a forward slash in the path', function(){
        var obj1 = {'a/b': 'val'},
            obj2 = {'a/b': 'new-val'};
        expect(diff(obj1, obj2)).to.contain({ op: 'replace', path: '/a~1b', value: 'new-val' });
    });

    it('should support escaping a tilde in the path', function(){
        var obj1 = {'a~b': 'val'},
            obj2 = {'a~b': 'new-val'};
        expect(diff(obj1, obj2)).to.contain({ op: 'replace', path: '/a~0b', value: 'new-val' });
    });

    it('should support randomly generated objects', function(){
        var appliedPatchEqualsOriginal =
                jsc.forall('map(json)', 'map(json)', function( obj1, obj2 ) {
                    var p = diff(obj1, obj2);
                    var patched = patch.apply_patch(obj1, p);
                    return _.isEqual(obj2, patched);
                });

        jsc.assert(appliedPatchEqualsOriginal);
    });

    it('should support randomly generated arrays', function(){
        var appliedPatchEqualsOriginal =
                jsc.forall('array(json)', 'array(json)', function( obj1, obj2 ) {
                    var p = diff(obj1, obj2);
                    var patched = patch.apply_patch(obj1, p);
                    return _.isEqual(obj2, patched);
                });

        jsc.assert(appliedPatchEqualsOriginal);
    });
});
