import {Dictionary} from 'aurelia-tsutil';
import {IState, IAcceptingState, IHandler, IHandlerWithParameterNames, ISegmentTypesInfo, IRoure, IRoutesArray, RoutesCollection, IRoureMatch, IQueryParams, ISegment} from './interfaces';

import core from 'core-js';
import {State} from './state';
import {
StaticSegment,
DynamicSegment,
StarSegment,
EpsilonSegment
} from './segments';


/**
 * Class that parses route patterns and matches path strings.
 *
 * @class RouteRecognizer
 * @constructor
 */
export class RouteRecognizer {
    rootState: IAcceptingState;
    names: Dictionary<{
        segments: ISegment[];
        handlers: IHandlerWithParameterNames[];
    }>;
    constructor() {
        this.rootState = <IAcceptingState><IState>new State();
        this.names = {};
    }

    /**
     * Parse a route pattern and add it to the collection of recognized routes.
     *
     * @method add
     * @param {Object} route The route to add.
     */
    add(route: RoutesCollection): IAcceptingState {
        if (Array.isArray(route)) {
            for (let r of <IRoutesArray>route) {
                this.add(r);
            }

            return;
        }

        var currentState = this.rootState, regex = '^',
            types: ISegmentTypesInfo = { statics: 0, dynamics: 0, stars: 0 },
            names: string[] = [], routeName = (<IRoure>route).handler.name,
            isEmpty = true;

        var segments: ISegment[] = parse((<IRoure>route).path, names, types);
        for (let segment of segments) {
            if (segment instanceof EpsilonSegment) {
                continue;
            }

            isEmpty = false;

            // Add a '/' for the new segment
            currentState = currentState.put({ validChars: '/' });
            regex += '/';

            // Add a representation of the segment to the NFA and regex
            currentState = addSegment(currentState, segment);
            regex += segment.regex();
        }

        if (isEmpty) {
            currentState = currentState.put({ validChars: '/' });
            regex += '/';
        }

        var handlers: IHandlerWithParameterNames[] = [{ handler: (<IRoure>route).handler, names: names }];

        if (routeName) {
            this.names[routeName] = {
                segments: segments,
                handlers: handlers
            };
        }

        currentState.handlers = handlers;
        currentState.regex = new RegExp(regex + '$');
        currentState.types = types;

        return currentState;
    }

    /**
     * Retrieve the handlers registered for the named route.
     *
     * @method handlersFor
     * @param {String} name The name of the route.
     * @return {Array} The handlers.
     */
    handlersFor(name: string): IHandlerWithParameterNames[] {
        var route = this.names[name],
            result: IHandlerWithParameterNames[] = [];

        if (!route) {
            throw new Error(`There is no route named ${name}`);
        }

        for (var i = 0, l = route.handlers.length; i < l; i++) {
            result.push(route.handlers[i]);
        }

        return result;
    }

    /**
     * Check if this RouteRecognizer recognizes a named route.
     *
     * @method hasRoute
     * @param {String} name The name of the route.
     * @return {Boolean} True if the named route is recognized.
     */
    hasRoute(name: string): boolean {
        return !!this.names[name];
    }

    /**
     * Generate a path and query string from a route name and params object.
     *
     * @method generate
     * @param {String} name The name of the route.
     * @param {Object} params The route params to use when populating the pattern.
     *  Properties not required by the pattern will be appended to the query string.
     * @return {String} The generated absolute path and query string.
     */
    generate(name: string, params: Dictionary<string>): string {
        params = Object.assign({}, params);

        var route = this.names[name],
            consumed: Dictionary<boolean> = {}, output = '';

        if (!route) {
            throw new Error(`There is no route named ${name}`);
        }

        var segments = route.segments;

        for (var i = 0, l = segments.length; i < l; i++) {
            var segment = segments[i];

            if (segment instanceof EpsilonSegment) {
                continue;
            }

            output += '/';
            var segmentValue = segment.generate(params, consumed);
            if (segmentValue === null || segmentValue === undefined) {
                throw new Error(`A value is required for route parameter '${segment.name}' in route '${name}'.`);
            }

            output += segmentValue;
        }

        if (output.charAt(0) !== '/') {
            output = '/' + output;
        }

        // remove params used in the path and add the rest to the querystring
        for (var param in consumed) {
            delete params[param];
        }

        output += this.generateQueryString(params);

        return output;
    }

    /**
     * Generate a query string from an object.
     *
     * @method generateQueryString
     * @param {Object} params Object containing the keys and values to be used.
     * @return {String} The generated query string, including leading '?'.
     */
    generateQueryString(params: Dictionary<string|string[]>): string {
        var pairs: string[] = [], keys: string[] = [], encode = encodeURIComponent;

        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                keys.push(key);
            }
        }

        keys.sort();
        for (var i = 0, len = keys.length; i < len; i++) {
            key = keys[i];
            var value = params[key];
            if (value === null || value === undefined) {
                continue;
            }

            if (Array.isArray(value)) {
                var arrayKey = `${encode(key) }[]`;
                for (var j = 0, l = value.length; j < l; j++) {
                    pairs.push(`${arrayKey}=${encode(value[j]) }`);
                }
            } else {
                pairs.push(`${encode(key) }=${encode(<string>value) }`);
            }
        }

        if (pairs.length === 0) {
            return '';
        }

        return '?' + pairs.join('&');
    }

    /**
     * Parse a query string.
     *
     * @method parseQueryString
     * @param {String} The query string to parse.
     * @return {Object} Object with keys and values mapped from the query string.
     */
    parseQueryString(queryString: string): IQueryParams {
        var queryParams: IQueryParams = {};
        if (!queryString || typeof queryString !== 'string') {
            return queryParams;
        }

        if (queryString.charAt(0) === '?') {
            queryString = queryString.substr(1);
        }

        var pairs = queryString.split('&');
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split('='),
                key = decodeURIComponent(pair[0]),
                keyLength = key.length,
                isArray = false,
                value: boolean|string|string[];

            if (!key) {
                continue;
            } else if (pair.length === 1) {
                value = true;
            } else {
                //Handle arrays
                if (keyLength > 2 && key.slice(keyLength - 2) === '[]') {
                    isArray = true;
                    key = key.slice(0, keyLength - 2);
                    if (!queryParams[key]) {
                        queryParams[key] = [];
                    }
                }
                value = pair[1] ? decodeURIComponent(pair[1]) : '';
            }
            if (isArray) {
                (<string[]>queryParams[key]).push(<string>value);
            } else {
                queryParams[key] = value;
            }
        }
        return queryParams;
    }

    /**
     * Match a path string against registered route patterns.
     *
     * @method recognize
     * @param {String} path The path to attempt to match.
     * @return {Array} Array of objects containing `handler`, `params`, and
     *  `isDynanic` values for the matched route(s), or undefined if no match
     *  was found.
     */
    recognize(path: string): RecognizeResults {
        var states = [this.rootState],
            pathLen: number, i: number, l: number, queryStart: number, queryParams: IQueryParams = {},
            isSlashDropped = false;

        queryStart = path.indexOf('?');
        if (queryStart !== -1) {
            var queryString = path.substr(queryStart + 1, path.length);
            path = path.substr(0, queryStart);
            queryParams = this.parseQueryString(queryString);
        }

        path = decodeURI(path);

        if (path.charAt(0) !== '/') {
            path = '/' + path;
        }

        pathLen = path.length;
        if (pathLen > 1 && path.charAt(pathLen - 1) === '/') {
            path = path.substr(0, pathLen - 1);
            isSlashDropped = true;
        }

        for (i = 0, l = path.length; i < l; i++) {
            states = recognizeChar(states, path.charAt(i));
            if (!states.length) {
                break;
            }
        }

        var solutions: IAcceptingState[] = [];
        for (i = 0, l = states.length; i < l; i++) {
            if (states[i].handlers) {
                solutions.push(states[i]);
            }
        }

        states = sortSolutions(solutions);

        var state = solutions[0];
        if (state && state.handlers) {
            // if a trailing slash was dropped and a star segment is the last segment
            // specified, put the trailing slash back
            if (isSlashDropped && state.regex.source.slice(-5) === '(.+)$') {
                path = path + '/';
            }
            return findHandler(state, path, queryParams);
        }
    }
}

export class RecognizeResults {
    splice: { (start: number): IRoureMatch[]; (start: number, deleteCount: number, ...items: IRoureMatch[]): IRoureMatch[] };
    slice: { (start?: number, end?: number): IRoureMatch[] };
    push: { (...items: IRoureMatch[]): number };
    [i: number]: IRoureMatch;
    length: number;
    queryParams: IQueryParams;
    constructor(queryParams: IQueryParams) {
        this.splice = Array.prototype.splice;
        this.slice = Array.prototype.slice;
        this.push = Array.prototype.push;
        this.length = 0;
        this.queryParams = queryParams || {};
    }
}

function parse(route: string, names: string[], types: ISegmentTypesInfo): ISegment[] {
    // normalize route as not starting with a '/'. Recognition will
    // also normalize.
    if (route.charAt(0) === '/') {
        route = route.substr(1);
    }

    var results: ISegment[] = [];

    for (let segment of route.split('/')) {
        let match: RegExpMatchArray;

        if (match = segment.match(/^:([^\/]+)$/)) {
            results.push(new DynamicSegment(match[1]));
            names.push(match[1]);
            types.dynamics++;
        } else if (match = segment.match(/^\*([^\/]+)$/)) {
            results.push(new StarSegment(match[1]));
            names.push(match[1]);
            types.stars++;
        } else if (segment === '') {
            results.push(new EpsilonSegment());
        } else {
            results.push(new StaticSegment(segment));
            types.statics++;
        }
    }

    return results;
}

// This is a somewhat naive strategy, but should work in a lot of cases
// A better strategy would properly resolve /posts/:id/new and /posts/edit/:id.
//
// This strategy generally prefers more static and less dynamic matching.
// Specifically, it
//
//  * prefers fewer stars to more, then
//  * prefers using stars for less of the match to more, then
//  * prefers fewer dynamic segments to more, then
//  * prefers more static segments to more
function sortSolutions(states: IAcceptingState[]): IAcceptingState[] {
    return states.sort((a, b) => {
        if (a.types.stars !== b.types.stars) {
            return a.types.stars - b.types.stars;
        }

        if (a.types.stars) {
            if (a.types.statics !== b.types.statics) {
                return b.types.statics - a.types.statics;
            }
            if (a.types.dynamics !== b.types.dynamics) {
                return b.types.dynamics - a.types.dynamics;
            }
        }

        if (a.types.dynamics !== b.types.dynamics) {
            return a.types.dynamics - b.types.dynamics;
        }

        if (a.types.statics !== b.types.statics) {
            return b.types.statics - a.types.statics;
        }

        return 0;
    });
}

function recognizeChar<T>(states: IAcceptingState[], ch: string): IAcceptingState[] {
    var nextStates: IAcceptingState[] = [];

    for (var i = 0, l = states.length; i < l; i++) {
        var state = states[i];

        nextStates = nextStates.concat(state.match(ch));
    }

    return nextStates;
}

function findHandler(state: IAcceptingState, path: string, queryParams: IQueryParams): RecognizeResults {
    var handlers = state.handlers, regex = state.regex;
    var captures = path.match(regex), currentCapture = 1;
    var result = new RecognizeResults(queryParams);

    for (var i = 0, l = handlers.length; i < l; i++) {
        var handler = handlers[i], names = handler.names, params: Dictionary<string> = {};

        for (var j = 0, m = names.length; j < m; j++) {
            params[names[j]] = captures[currentCapture++];
        }

        result.push({ handler: handler.handler, params: params, isDynamic: !!names.length });
    }

    return result;
}

function addSegment(currentState: IAcceptingState, segment: ISegment) {
    segment.eachChar(ch => {
        currentState = currentState.put(ch);
    });

    return currentState;
}
