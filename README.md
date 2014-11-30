## Introduction

json-patch-gen is a small, [thoroughly tested] [tests] library for
generating a [JSON Patch] [rfc6902] from two JavaScript
objects or arrays.

This library has no dependencies. It supports generating patches of
arbitrarily nested objects and arrays to any depth.

json-patch-gen does not apply patches. There are several libraries
that can perform this for you:

* [jsonpatch](https://www.npmjs.org/package/jsonpatch)
* [jsonpatch-js](https://github.com/bruth/jsonpatch-js)
* [fast-json-patch](https://github.com/Starcounter-Jack/Fast-JSON-Patch)
* [rfc6902][rfcproj]

If you wish to modify an object and then generate a patch from the
modifications just performed, [this library] [starcounter] may work
better for you. It uses an observer to achieve this. Json-patch-gen
takes a different approach: it recursively compares the two values
given.

It appears that [rfc6902][rfcproj] can also generate patches. I missed
this while researching a solution to this problem. I've not compared
the projects. There is room for different approaches to generating
patches so I suggest trying both libraries to see which works better
for you.

[tests]: https://github.com/gregsexton/json-patch-gen/blob/master/test/diff.js
[rfc6902]: https://tools.ietf.org/html/rfc6902
[starcounter]: https://github.com/Starcounter-Jack/Fast-JSON-Patch
[rfcproj]: https://www.npmjs.org/package/rfc6902

## Installation

    npm install json-patch-gen --save

or

    bower install json-patch-gen

Once installed, the module exports a single function that takes two
values to diff.

    var diff = require('json-patch-gen');

You can also use this library in the browser by loading with a script
tag. A single 'diff' function will be exported to the global scope.

## Examples

Here is a simple example repl session:

    > var diff = require('json-patch-gen');
    undefined

    > diff({},{});
    []

    > diff([],[1])
    [ { op: 'add', path: '/0', value: 1 } ]

    > diff({foo: 'bar'}, {foo: 'baz'})
    [ { op: 'replace', path: '/foo', value: 'baz' } ]

    > diff({foo: 'bar'}, {})
    [ { op: 'remove', path: '/foo' } ]

    > diff({}, {foo: 'bar'})
    [ { op: 'add', path: '/foo', value: 'bar' } ]

    > diff({foo: {bar: 'baz'}}, {foo: {bar: 'quux'}})
    [ { op: 'replace', path: '/foo/bar', value: 'quux' } ]

    > diff([1,2,3], [2,3,4])
    [ { op: 'add', path: '/3', value: 4 },
      { op: 'remove', path: '/0' } ]

    > diff([{foo: 'bar'},3], [{foo: 'baz'},3,4])
    [ { op: 'add', path: '/2', value: 4 },
      { op: 'replace', path: '/0/foo', value: 'baz' } ]

    > diff({foo: {bar: [1,2,3]}}, {foo: {bar: [2,3,4]}})
    [ { op: 'add', path: '/foo/bar/3', value: 4 },
      { op: 'remove', path: '/foo/bar/0' } ]
