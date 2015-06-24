declare module 'aurelia-http-client/http-response-message' {
	import { IXHResponse, IRequestMessage, TResponseReviver, IHeaders } from 'aurelia-http-client/interfaces';
	export class HttpResponseMessage {
	    requestMessage: IRequestMessage;
	    statusCode: number;
	    response: any;
	    isSuccess: boolean;
	    statusText: string;
	    reviver: TResponseReviver;
	    mimeType: string;
	    responseType: string;
	    headers: IHeaders;
	    private _content;
	    constructor(requestMessage: IRequestMessage, xhr: IXHResponse, responseType: string, reviver?: TResponseReviver);
	    content: any;
	}
	/**
	 * MimeTypes mapped to responseTypes
	 *
	 * @type {Object}
	 */
	export var mimeTypes: {
	    "text/html": string;
	    "text/javascript": string;
	    "application/javascript": string;
	    "text/json": string;
	    "application/json": string;
	    "application/rss+xml": string;
	    "application/atom+xml": string;
	    "application/xhtml+xml": string;
	    "text/markdown": string;
	    "text/xml": string;
	    "text/mathml": string;
	    "application/xml": string;
	    "text/yml": string;
	    "text/csv": string;
	    "text/css": string;
	    "text/less": string;
	    "text/stylus": string;
	    "text/scss": string;
	    "text/sass": string;
	    "text/plain": string;
	};

}
declare module 'aurelia-http-client/request-message-processor' {
	import { IXHRType, IXHR, IRequestMessage, IRequestTransformer } from 'aurelia-http-client/interfaces';
	import { HttpResponseMessage } from 'aurelia-http-client/http-response-message';
	import { HttpClient } from 'aurelia-http-client/http-client';
	export class RequestMessageProcessor {
	    XHRType: IXHRType;
	    transformers: IRequestTransformer[];
	    xhr: IXHR;
	    constructor(xhrType: IXHRType, transformers: IRequestTransformer[]);
	    abort(): void;
	    process(client: HttpClient, message: IRequestMessage): Promise<HttpResponseMessage>;
	}

}
declare module 'aurelia-http-client/transformers' {
	import { HttpClient } from 'aurelia-http-client/http-client';
	import { RequestMessageProcessor } from 'aurelia-http-client/request-message-processor';
	import { IXHRequest, IRequestMessage } from 'aurelia-http-client/interfaces';
	export function timeoutTransformer(client: HttpClient, processor: RequestMessageProcessor, message: IRequestMessage, xhr: IXHRequest): void;
	export function callbackParameterNameTransformer(client: HttpClient, processor: RequestMessageProcessor, message: IRequestMessage, xhr: IXHRequest): void;
	export function credentialsTransformer(client: HttpClient, processor: RequestMessageProcessor, message: IRequestMessage, xhr: IXHRequest): void;
	export function progressTransformer(client: HttpClient, processor: RequestMessageProcessor, message: IRequestMessage, xhr: IXHRequest): void;
	export function responseTypeTransformer(client: HttpClient, processor: RequestMessageProcessor, message: IRequestMessage, xhr: IXHRequest): void;
	export function headerTransformer(client: HttpClient, processor: RequestMessageProcessor, message: IRequestMessage, xhr: IXHRequest): void;
	export function contentTransformer(client: HttpClient, processor: RequestMessageProcessor, message: IRequestMessage, xhr: IXHRequest): void;

}
declare module 'aurelia-http-client/http-request-message' {
	import { IRequestMessage } from 'aurelia-http-client/interfaces';
	import { Headers } from 'aurelia-http-client/headers';
	import { RequestMessageProcessor } from 'aurelia-http-client/request-message-processor';
	export class HttpRequestMessage implements IRequestMessage {
	    method: string;
	    uri: string;
	    content: any;
	    headers: Headers;
	    responseType: string;
	    constructor(method?: string, uri?: string, content?: any, headers?: Headers);
	}
	export function createHttpRequestMessageProcessor(): RequestMessageProcessor;

}
declare module 'aurelia-http-client/jsonp-request-message' {
	import { IRequestMessage } from 'aurelia-http-client/interfaces';
	import { Headers } from 'aurelia-http-client/headers';
	import { RequestMessageProcessor } from 'aurelia-http-client/request-message-processor';
	export class JSONPRequestMessage implements IRequestMessage {
	    method: string;
	    uri: string;
	    content: any;
	    headers: Headers;
	    responseType: string;
	    callbackParameterName: string;
	    constructor(uri?: string, callbackParameterName?: string);
	}
	export function createJSONPRequestMessageProcessor(): RequestMessageProcessor;

}
declare module 'aurelia-http-client/request-builder' {
	import { IRequestMessageTransformer, TResponseReviver, IJSONContentReplacer, ICancellablePromise } from 'aurelia-http-client/interfaces';
	import { HttpClient } from 'aurelia-http-client/http-client';
	import { Dictionary } from 'tsutil';
	import { HttpResponseMessage } from 'aurelia-http-client/http-response-message';
	import { TQueryStringSource } from 'aurelia-path';
	/**
	* A builder class allowing fluent composition of HTTP requests.
	*
	* @class RequestBuilder
	* @constructor
	*/
	export class RequestBuilder {
	    client: HttpClient;
	    transformers: IRequestMessageTransformer[];
	    useJsonp: boolean;
	    constructor(client: HttpClient);
	    /**
	    * Adds a user-defined request transformer to the RequestBuilder.
	    *
	    * @method addHelper
	    * @param {String} name The name of the helper to add.
	    * @param {Function} fn The helper function.
	    * @chainable
	    */
	    static addHelper(name: string, fn: (...args) => IRequestMessageTransformer): void;
	    /**
	    * Sends the request.
	    *
	    * @method send
	    * @return {Promise} A cancellable promise object.
	    */
	    send(): ICancellablePromise<HttpResponseMessage>;
	    asDelete: () => RequestBuilder;
	    asGet: () => RequestBuilder;
	    asHead: () => RequestBuilder;
	    asOptions: () => RequestBuilder;
	    asPatch: () => RequestBuilder;
	    asPost: () => RequestBuilder;
	    asPut: () => RequestBuilder;
	    asJsonp: (callbackParameterName: string) => RequestBuilder;
	    withUri: (uri: string) => RequestBuilder;
	    withContent: (content: any) => RequestBuilder;
	    withBaseUrl: (baseUrl: string) => RequestBuilder;
	    withParams: (params: Dictionary<TQueryStringSource>) => RequestBuilder;
	    withResponseType: (responseType: string) => RequestBuilder;
	    withTimeout: (timeout: number) => RequestBuilder;
	    withHeader: (key: string, value: string) => RequestBuilder;
	    withCredentials: (value: boolean) => RequestBuilder;
	    withReviver: (reviver: TResponseReviver) => RequestBuilder;
	    withReplacer: (replacer: IJSONContentReplacer) => RequestBuilder;
	    withProgressCallback: (progressCallback: (ev: ProgressEvent) => any) => RequestBuilder;
	    withCallbackParameterName: (callbackParameterName: string) => RequestBuilder;
	}

}
declare module 'aurelia-http-client/http-client' {
	import { IRequestMessageTransformer, IRequestMessage, ICancellablePromise } from 'aurelia-http-client/interfaces';
	import { RequestMessageProcessor } from 'aurelia-http-client/request-message-processor';
	import { HttpResponseMessage } from 'aurelia-http-client/http-response-message';
	import { RequestBuilder } from 'aurelia-http-client/request-builder';
	/**
	* The main HTTP client object.
	*
	* @class HttpClient
	* @constructor
	*/
	export class HttpClient {
	    requestTransformers: IRequestMessageTransformer[];
	    requestProcessorFactories: Map<Function, () => RequestMessageProcessor>;
	    pendingRequests: RequestMessageProcessor[];
	    isRequesting: boolean;
	    constructor();
	    /**
	     * Configure this HttpClient with default settings to be used by all requests.
	     *
	     * @method configure
	     * @param {Function} fn A function that takes a RequestBuilder as an argument.
	     * @chainable
	     */
	    configure(fn: (RequestBuilder) => void): HttpClient;
	    /**
	     * Returns a new RequestBuilder for this HttpClient instance that can be used to build and send HTTP requests.
	     *
	     * @method createRequest
	     * @param uri The target URI.
	     * @type RequestBuilder
	     */
	    createRequest(uri: string): RequestBuilder;
	    /**
	     * Sends a message using the underlying networking stack.
	     *
	     * @method send
	     * @param message A configured HttpRequestMessage or JSONPRequestMessage.
	     * @param {Array} transformers A collection of transformers to apply to the HTTP request.
	     * @return {Promise} A cancellable promise object.
	     */
	    send(message: IRequestMessage, transformers: IRequestMessageTransformer[]): ICancellablePromise<HttpResponseMessage>;
	    /**
	     * Sends an HTTP DELETE request.
	     *
	     * @method delete
	     * @param {String} uri The target URI.
	     * @return {Promise} A cancellable promise object.
	     */
	    delete(uri: any): ICancellablePromise<HttpResponseMessage>;
	    /**
	     * Sends an HTTP GET request.
	     *
	     * @method get
	     * @param {String} uri The target URI.
	     * @return {Promise} A cancellable promise object.
	     */
	    get(uri: any): ICancellablePromise<HttpResponseMessage>;
	    /**
	     * Sends an HTTP HEAD request.
	     *
	     * @method head
	     * @param {String} uri The target URI.
	     * @return {Promise} A cancellable promise object.
	     */
	    head(uri: any): ICancellablePromise<HttpResponseMessage>;
	    /**
	     * Sends a JSONP request.
	     *
	     * @method jsonp
	     * @param {String} uri The target URI.
	     * @return {Promise} A cancellable promise object.
	     */
	    jsonp(uri: any, callbackParameterName?: string): ICancellablePromise<HttpResponseMessage>;
	    /**
	     * Sends an HTTP OPTIONS request.
	     *
	     * @method options
	     * @param {String} uri The target URI.
	     * @return {Promise} A cancellable promise object.
	     */
	    options(uri: any): ICancellablePromise<HttpResponseMessage>;
	    /**
	     * Sends an HTTP PUT request.
	     *
	     * @method put
	     * @param {String} uri The target URI.
	     * @param {Object} uri The request payload.
	     * @return {Promise} A cancellable promise object.
	     */
	    put(uri: any, content: any): ICancellablePromise<HttpResponseMessage>;
	    /**
	     * Sends an HTTP PATCH request.
	     *
	     * @method patch
	     * @param {String} uri The target URI.
	     * @param {Object} uri The request payload.
	     * @return {Promise} A cancellable promise object.
	     */
	    patch(uri: any, content: any): ICancellablePromise<HttpResponseMessage>;
	    /**
	     * Sends an HTTP POST request.
	     *
	     * @method post
	     * @param {String} uri The target URI.
	     * @param {Object} uri The request payload.
	     * @return {Promise} A cancellable promise object.
	     */
	    post(uri: any, content: any): ICancellablePromise<HttpResponseMessage>;
	}

}
declare module 'aurelia-http-client/interfaces' {
	import { HttpClient } from 'aurelia-http-client/http-client';
	import { RequestMessageProcessor } from 'aurelia-http-client/request-message-processor';
	import { TQueryStringSource } from 'aurelia-path';
	import { Dictionary } from 'tsutil';
	import { Headers } from 'aurelia-http-client/headers';
	export interface ICancellablePromise<T> extends Promise<T> {
	    abort(): any;
	    cancel(): any;
	}
	export interface IJSONResponseReviver {
	    (key: any, value: any): any;
	}
	export interface INonJSONResponseReviver {
	    (response: any): any;
	}
	export type TResponseReviver = IJSONResponseReviver | INonJSONResponseReviver;
	export interface IJSONContentReplacer {
	    (key: string, value: any): any;
	}
	export interface IHeaders {
	    headers: Dictionary<string>;
	}
	export interface IRequestTransformer {
	    (client: HttpClient, processor: RequestMessageProcessor, message: IRequestMessage, xhr: IXHR): void;
	}
	export interface IRequestMessageTransformer {
	    (client: HttpClient, processor: RequestMessageProcessor, message: IRequestMessage): void;
	}
	export interface IRequestMessage {
	    method: string;
	    uri: string;
	    headers: Headers;
	    baseUri?: string;
	    params?: Dictionary<TQueryStringSource>;
	    content?: any;
	    fullUri?: string;
	    responseType?: string;
	    reviver?: TResponseReviver;
	    replacer?: IJSONContentReplacer;
	    timeout?: number;
	    callbackParameterName?: string;
	    withCredentials?: boolean;
	    progressCallback?: (ev: ProgressEvent) => any;
	}
	export interface IXHResponse {
	    response: any;
	    status: number;
	    statusText: string;
	    responseText?: string;
	    getAllResponseHeaders?(): string;
	}
	export interface IXHRequest {
	    timeout?: number;
	    callbackParameterName?: string;
	    withCredentials?: boolean;
	    upload?: XMLHttpRequestUpload;
	    responseType?: string;
	    setRequestHeader(header: string, value: string): void;
	}
	export interface IXHR extends IXHResponse, IXHRequest {
	    abort(): void;
	    open(method: string, url: string, async?: boolean): void;
	    send(data?: string): void;
	    onabort: (e: any) => any;
	    onerror: (e: any) => any;
	    onload: (e: any) => any;
	    ontimeout: (e: any) => any;
	}
	export interface IXHRType {
	    new (): IXHR;
	}

}
declare module 'aurelia-http-client/headers' {
	import { Dictionary } from 'tsutil';
	import { IHeaders, IXHRequest } from 'aurelia-http-client/interfaces';
	export class Headers implements IHeaders {
	    headers: Dictionary<string>;
	    constructor(headers?: Dictionary<string>);
	    add(key: string, value: string): void;
	    get(key: string): string;
	    clear(): void;
	    configureXHR(xhr: IXHRequest): void;
	    /**
	     * XmlHttpRequest's getAllResponseHeaders() method returns a string of response
	     * headers according to the format described here:
	     * http://www.w3.org/TR/XMLHttpRequest/#the-getallresponseheaders-method
	     * This method parses that string into a user-friendly key/value pair object.
	     */
	    static parse(headerStr: string): Headers;
	}

}
declare module 'aurelia-http-client/index' {
	/**
	 * An extensible HTTP client provided by Aurelia.
	 *
	 * @module HttpClient
	 */
	export { HttpClient } from 'aurelia-http-client/http-client';
	export { HttpRequestMessage } from 'aurelia-http-client/http-request-message';
	export { HttpResponseMessage, mimeTypes } from 'aurelia-http-client/http-response-message';
	export { JSONPRequestMessage } from 'aurelia-http-client/jsonp-request-message';
	export { Headers } from 'aurelia-http-client/headers';
	export { RequestBuilder } from 'aurelia-http-client/request-builder';

}
declare module 'aurelia-http-client' {
	export * from 'aurelia-http-client/index';
}
