﻿import {HttpClient} from './http-client';
import {RequestMessageProcessor} from './request-message-processor';
import {TQueryStringSource} from 'aurelia-path';
import {Dictionary} from 'tsutil';
import {Headers} from './headers';

export interface ICancellablePromise<T> extends Promise<T> {
    abort();
    cancel();
}

export interface IJSONResponseReviver { (key: any, value: any): any; }
export interface INonJSONResponseReviver { (response: any): any; }
export type TResponseReviver = IJSONResponseReviver | INonJSONResponseReviver;
export interface IJSONContentReplacer { (key: string, value: any): any; }

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