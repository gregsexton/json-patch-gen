var checkIsJsonValue = function( value ) {
    'use strict';
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'object') {
        return value;
    }

    throw new Error(value.toString() + ' is not a valid JSON value');
};

var buildPath = function( segments ) {
    'use strict';
    return segments.join('/');
};

var buildPatch = function( obj1, obj2, path ) {
    'use strict';
    var acc = [];

    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
        return [];
    }

    for (var x in obj2) {
        if (! obj2.hasOwnProperty(x)) {
            throw new Error(obj2.toString() + ' has a prototype');
        }

        if (x in obj1) {
            acc = acc.concat(buildPatch(obj1[x], obj2[x], path.concat(x)));
        } else {
            acc.push({op: 'add', path: buildPath(path.concat(x)), value: checkIsJsonValue(obj2[x])});
        }
    }

    for (var y in obj1) {
        if (! obj1.hasOwnProperty(y)) {
            throw new Error(obj1.toString() + ' has a prototype');
        }

        if (!(y in obj2)) {
            acc.push({op: 'add', path: buildPath(path.concat(x)), value: checkIsJsonValue(obj1[y])});
        }
    }

    return acc;
};

var diff = function( obj1, obj2 ) {
    'use strict';
    if (typeof obj1 !== 'object') {
        throw new TypeError('obj1 is not an object: ' + obj1.toString());
    }

    if (typeof obj2 !== 'object') {
        throw new TypeError('obj2 is not an object: ' + obj2.toString());
    }

    return buildPatch(obj1, obj2, ['']);
};

module.exports.diff = diff;
