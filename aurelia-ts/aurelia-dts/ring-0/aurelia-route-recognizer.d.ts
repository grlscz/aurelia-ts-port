declare module 'aurelia-route-recognizer/interfaces' {
	import { Dictionary } from 'aurelia-tsutil';
	export interface ISegment {
	    name?: string;
	    eachChar(callback: (charSpec: ICharacterSpecification) => void): void;
	    regex(): string;
	    generate(params: Dictionary<string>, consumed: Dictionary<boolean>): string;
	}
	export interface ICharacterSpecification {
	    validChars?: string;
	    invalidChars?: string;
	    repeat?: boolean;
	}
	export interface IState {
	    get(charSpec: ICharacterSpecification): IState;
	    put(charSpec: ICharacterSpecification): IState;
	    match(ch: string): IState[];
	}
	export interface IAcceptingState extends IState {
	    get(charSpec: ICharacterSpecification): IAcceptingState;
	    put(charSpec: ICharacterSpecification): IAcceptingState;
	    match(ch: string): IAcceptingState[];
	    regex: RegExp;
	    handlers: IHandlerWithParameterNames[];
	    types: ISegmentTypesInfo;
	}
	export interface IHandler {
	    name: string;
	}
	export interface IHandlerWithParameterNames {
	    handler: IHandler;
	    names: string[];
	}
	export interface ISegmentTypesInfo {
	    statics: number;
	    dynamics: number;
	    stars: number;
	}
	export interface IRoure {
	    path: string;
	    handler: IHandler;
	}
	export interface IRoutesArray extends Array<RoutesCollection> {
	}
	export type RoutesCollection = IRoure | IRoutesArray;
	export interface IRoureMatch {
	    handler: IHandler;
	    params: Dictionary<string>;
	    isDynamic: boolean;
	}
	export interface IQueryParams extends Dictionary<boolean | string | string[]> {
	}
	export interface IPreparedRoute {
	    segments: ISegment[];
	    handlers: IHandlerWithParameterNames[];
	}

}
declare module 'aurelia-route-recognizer/state' {
	import { ICharacterSpecification, IState } from 'aurelia-route-recognizer/interfaces';
	export class State implements IState {
	    charSpec: ICharacterSpecification;
	    nextStates: State[];
	    constructor(charSpec?: ICharacterSpecification);
	    get(charSpec: ICharacterSpecification): State;
	    put(charSpec: ICharacterSpecification): State;
	    match(ch: string): State[];
	}

}
declare module 'aurelia-route-recognizer/segments' {
	import { Dictionary } from 'aurelia-tsutil';
	import { ISegment, ICharacterSpecification } from 'aurelia-route-recognizer/interfaces';
	export class StaticSegment implements ISegment {
	    string: string;
	    constructor(string: string);
	    eachChar(callback: (charSpec: ICharacterSpecification) => void): void;
	    regex(): string;
	    generate(): string;
	}
	export class DynamicSegment implements ISegment {
	    name: string;
	    constructor(name: string);
	    eachChar(callback: (charSpec: ICharacterSpecification) => void): void;
	    regex(): string;
	    generate(params: Dictionary<string>, consumed: Dictionary<boolean>): string;
	}
	export class StarSegment implements ISegment {
	    name: string;
	    constructor(name: string);
	    eachChar(callback: (charSpec: ICharacterSpecification) => void): void;
	    regex(): string;
	    generate(params: Dictionary<string>, consumed: Dictionary<boolean>): string;
	}
	export class EpsilonSegment implements ISegment {
	    eachChar(): void;
	    regex(): string;
	    generate(): string;
	}

}
declare module 'aurelia-route-recognizer/index' {
	import { Dictionary } from 'aurelia-tsutil';
	import { IAcceptingState, IHandlerWithParameterNames, RoutesCollection, IRoureMatch, IQueryParams, ISegment } from 'aurelia-route-recognizer/interfaces';
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
	    constructor();
	    /**
	     * Parse a route pattern and add it to the collection of recognized routes.
	     *
	     * @method add
	     * @param {Object} route The route to add.
	     */
	    add(route: RoutesCollection): IAcceptingState;
	    /**
	     * Retrieve the handlers registered for the named route.
	     *
	     * @method handlersFor
	     * @param {String} name The name of the route.
	     * @return {Array} The handlers.
	     */
	    handlersFor(name: string): IHandlerWithParameterNames[];
	    /**
	     * Check if this RouteRecognizer recognizes a named route.
	     *
	     * @method hasRoute
	     * @param {String} name The name of the route.
	     * @return {Boolean} True if the named route is recognized.
	     */
	    hasRoute(name: string): boolean;
	    /**
	     * Generate a path and query string from a route name and params object.
	     *
	     * @method generate
	     * @param {String} name The name of the route.
	     * @param {Object} params The route params to use when populating the pattern.
	     *  Properties not required by the pattern will be appended to the query string.
	     * @return {String} The generated absolute path and query string.
	     */
	    generate(name: string, params: Dictionary<string>): string;
	    /**
	     * Generate a query string from an object.
	     *
	     * @method generateQueryString
	     * @param {Object} params Object containing the keys and values to be used.
	     * @return {String} The generated query string, including leading '?'.
	     */
	    generateQueryString(params: Dictionary<string | string[]>): string;
	    /**
	     * Parse a query string.
	     *
	     * @method parseQueryString
	     * @param {String} The query string to parse.
	     * @return {Object} Object with keys and values mapped from the query string.
	     */
	    parseQueryString(queryString: string): IQueryParams;
	    /**
	     * Match a path string against registered route patterns.
	     *
	     * @method recognize
	     * @param {String} path The path to attempt to match.
	     * @return {Array} Array of objects containing `handler`, `params`, and
	     *  `isDynanic` values for the matched route(s), or undefined if no match
	     *  was found.
	     */
	    recognize(path: string): RecognizeResults;
	}
	export class RecognizeResults implements ArrayLike<IRoureMatch> {
	    splice: {
	        (start: number): IRoureMatch[];
	        (start: number, deleteCount: number, ...items: IRoureMatch[]): IRoureMatch[];
	    };
	    slice: {
	        (start?: number, end?: number): IRoureMatch[];
	    };
	    push: {
	        (...items: IRoureMatch[]): number;
	    };
	    [i: number]: IRoureMatch;
	    length: number;
	    queryParams: IQueryParams;
	    constructor(queryParams: IQueryParams);
	}

}
declare module 'aurelia-route-recognizer' {
	export * from 'aurelia-route-recognizer/index';
}
