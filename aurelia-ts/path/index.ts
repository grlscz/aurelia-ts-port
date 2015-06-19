import {Dictionary} from 'aurelia-tsutil';
import {QueryStringScalarValueSource, QueryStringValuesSource} from './interfaces';

function trimDots(ary: string[]) {
    var i: number, part: string;
    for (i = 0; i < ary.length; ++i) {
        part = ary[i];
        if (part === '.') {
            ary.splice(i, 1);
            i -= 1;
        } else if (part === '..') {
            // If at the start, or previous value is still ..,
            // keep them so that when converted to a path it may
            // still work when converted to a path, even though
            // as an ID it is less than ideal. In larger point
            // releases, may be better to just kick out an error.
            if (i === 0 || (i == 1 && ary[2] === '..') || ary[i - 1] === '..') {
                continue;
            } else if (i > 0) {
                ary.splice(i - 1, 2);
                i -= 2;
            }
        }
    }
}

export function relativeToFile(name: string, file: string): string {
    var lastIndex: number,
        normalizedBaseParts: string[],
        fileParts = (file && file.split('/'));

    name = name.trim();
    name = <any>name.split('/');

    if ((<string[]><any>name)[0].charAt(0) === '.' && fileParts) {
        //Convert file to array, and lop off the last part,
        //so that . matches that 'directory' and not name of the file's
        //module. For instance, file of 'one/two/three', maps to
        //'one/two/three.js', but we want the directory, 'one/two' for
        //this normalization.
        normalizedBaseParts = fileParts.slice(0, fileParts.length - 1);
        name = <any>normalizedBaseParts.concat(name);
    }

    trimDots(<string[]><any>name);

    return (<string[]><any>name).join('/');
}

export function join(path1: string, path2: string): string {
    var url1: string[], url2: string[], url3: string[], i: number, ii: number, urlPrefix: string, trailingSlash: string;

    if (!path1) {
        return path2;
    }

    if (!path2) {
        return path1;
    }

    urlPrefix = path1.indexOf('//') === 0 ? '//' :
        path1.indexOf('/') === 0 ? '/' : '';
    trailingSlash = path2.slice(-1) == '/' ? '/' : '';

    url1 = path1.split('/');
    url2 = path2.split('/');
    url3 = [];

    for (i = 0, ii = url1.length; i < ii; ++i) {
        if (url1[i] == '..') {
            url3.pop();
        } else if (url1[i] == '.' || url1[i] == '') {
            continue;
        } else {
            url3.push(url1[i]);
        }
    }

    for (i = 0, ii = url2.length; i < ii; ++i) {
        if (url2[i] == '..') {
            url3.pop();
        } else if (url2[i] == '.' || url2[i] == '') {
            continue;
        } else {
            url3.push(url2[i]);
        }
    }

    return urlPrefix + url3.join('/').replace(/\:\//g, '://') + trailingSlash;
}

var r20 = /%20/g,
    rbracket = /\[\]$/,
    class2type: Dictionary<string> = {};

'Boolean Number String Function Array Date RegExp Object Error'.split(' ').forEach((name, i) => {
    class2type['[object ' + name + ']'] = name.toLowerCase();
});

function type(obj): string {
    if (obj == null) {
        return obj + "";
    }

    // Support: Android<4.0 (functionish RegExp)
    return typeof obj === 'object' || typeof obj === 'function'
        ? class2type[toString.call(obj)] || 'object'
        : typeof obj;
}

export function buildQueryString(a: Dictionary<QueryStringValuesSource>, traditional?: boolean): string {
    var prefix: string,
        s: string[] = [],
        add = function (key: string, value: QueryStringScalarValueSource) {
            // If value is a function, invoke it and return its value
            value = typeof value === 'function' ? value() : (value == null ? '' : value);
            s[s.length] = encodeURIComponent(key) + '=' + encodeURIComponent(<string>value);
        };

    for (prefix in a) {
        _buildQueryString(prefix, a[prefix], traditional, add);
    }

    // Return the resulting serialization
    return s.join('&').replace(r20, '+');
}

function _buildQueryString(prefix: string, obj: QueryStringValuesSource, traditional: boolean, add: (key: string, value: QueryStringScalarValueSource) => void) {
    var name: string;

    if (Array.isArray(obj)) {
        // Serialize array item.
        (<Array<QueryStringValuesSource>>obj).forEach((v, i) => {
            if (traditional || rbracket.test(prefix)) {
                // Treat each array item as a scalar.
                add(prefix, <QueryStringScalarValueSource>v);
            } else {
                // Item is non-scalar (array or object), encode its numeric index.
                _buildQueryString(
                    prefix + '[' + (typeof v === 'object' ? i : '') + ']',
                    v,
                    traditional,
                    add
                    );
            }
        });
    } else if (!traditional && type(obj) === 'object') {
        // Serialize object item.
        for (name in <Dictionary<QueryStringValuesSource>>obj) {
            _buildQueryString(prefix + '[' + name + ']', obj[name], traditional, add);
        }
    } else {
        // Serialize scalar item.
        add(prefix, <QueryStringScalarValueSource>obj);
    }
}
