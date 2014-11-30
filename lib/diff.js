/*global module*/

(function() {
    'use strict';

    var checkIsJsonValue = function( value ) {
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
        if (segments.length === 0) {
            return '';
        }

        return '/' + segments.map(function( seg ) {
            if (typeof seg === 'string') {
                return seg.replace(/~/g, '~0').replace(/\//g, '~1');
            }
            return seg;
        }).join('/');
    };

    // TODO: look at Hirschberg's algorithm to do better than O(n^2) space
    var arrayDiff = function( arr1, arr2, path ) {
        var len = Math.max(arr1.length, arr2.length)+1;

        var init = function ( len ) {
            var table = new Array(len);
            for (var i = 0; i < len; ++i) {
                table[i] = new Array(len);
                table[0][i] = { cost: i, op: i > 0 ? 'i' : undefined };
                table[i][0] = { cost: i, op: i > 0 ? 'd' : undefined };
            }
            return table;
        };

        var diff = function ( table ) {
            var arr1val, arr2val, match, ins, del, cost, eql;

            for (var i = 1; i <= arr1.length; ++i) {
                for (var j = 1; j <= arr2.length; ++j) {
                    arr1val = arr1[i-1];
                    arr2val = arr2[j-1];
                    eql = arr1val === arr2val;

                    match = table[i-1][j-1].cost + (eql ? 0 : 1);
                    ins = table[i][j-1].cost + 1;
                    del = table[i-1][j].cost + 1;

                    cost = Math.min(match, ins, del);
                    table[i][j] = {};
                    table[i][j].cost = cost;
                    table[i][j].op = cost === match ? (eql ? 'm' : 'r') : (cost === ins ? 'i' : 'd');
                }
            }
            return table;
        };

        var constructPath = function ( table ) {
            var i = arr1.length,
                j = arr2.length,
                entry = table[i][j],
                acc = [];

            while (entry.op !== undefined) {
                if (entry.op === 'i') {
                    acc.push({op: 'add', path: buildPath(path.concat(i)), value: arr2[--j]});
                } else if (entry.op === 'd') {
                    acc.push({op: 'remove', path: buildPath(path.concat(--i))});
                } else if (entry.op === 'r') {
                    acc.push({op: 'replace', path: path.concat(--i), value: arr2[--j]});
                } else if (entry.op === 'm') {
                    i--; j--;
                } else {
                    throw new Error('Unknown op: ' + entry.op);
                }
                entry = table[i][j];
            }

            return acc;
        };

        var deepDiff = function( patches ) {
            var idx, patch, patchIdx;

            for (idx in patches) {
                patch = patches[idx];
                if (patch.op === 'replace') {
                    patchIdx = patch.path[patch.path.length - 1];
                    patches[idx] = valueDiff(arr1[patchIdx], patch.value, patch.path);
                }
            }

            return patches;
        };

        var flatten = function( arr ) {
            return arr.map(function( x ) {
                return Array.isArray(x) ? x : [x];
            }).reduce(function(a, b) {
                return a.concat(b);
            }, []);
        };

        return flatten(deepDiff(constructPath(diff(init(len)))));
    };

    var valueDiff = function( val1, val2, path ) {
        var acc = [],
            x;

        if (Array.isArray(val1) && Array.isArray(val2)) {
            return arrayDiff(val1, val2, path);
        }

        if (Array.isArray(val1) !== Array.isArray(val2)) {
            return [{op: 'replace', path: buildPath(path), value: val2}];
        }

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
                acc = acc.concat(valueDiff(val1[x], val2[x], path.concat(x)));
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
        if (typeof obj1 !== 'object') {
            throw new TypeError('obj1 is not an object: ' + obj1.toString());
        }

        if (typeof obj2 !== 'object') {
            throw new TypeError('obj2 is not an object: ' + obj2.toString());
        }

        return valueDiff(obj1, obj2, []);
    };


    if( typeof module !== 'undefined' && module.exports ) {
        module.exports = diff;
    } else {
        this.diff = diff;
    }

}).call(this);
