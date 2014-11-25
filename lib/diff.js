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

var buildPatch = function( val1, val2, path ) {
    'use strict';
    var acc = [],
        x;

    if (typeof val1 !== 'object' || typeof val2 !== 'object') {
        if (val1 === val2) {
            return [];
        }

        return [{op: 'replace', path: buildPath(path), value: val2}];
    }

    for (x in val2) {
        if (! val2.hasOwnProperty(x)) {
            throw new Error(val2.toString() + ' has a prototype');
        }

        if (x in val1) {
            acc = acc.concat(buildPatch(val1[x], val2[x], path.concat(x)));
        } else {
            acc.push({op: 'add', path: buildPath(path.concat(x)), value: checkIsJsonValue(val2[x])});
        }
    }

    for (x in val1) {
        if (! val1.hasOwnProperty(x)) {
            throw new Error(val1.toString() + ' has a prototype');
        }

        if (!(x in val2)) {
            acc.push({op: 'remove', path: buildPath(path.concat(x))});
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
