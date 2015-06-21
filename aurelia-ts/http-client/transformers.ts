import {HttpClient} from './http-client';
import {RequestMessageProcessor} from './request-message-processor';
import {IXHRequest, IRequestMessage} from './interfaces';

export function timeoutTransformer(client: HttpClient, processor: RequestMessageProcessor, message: IRequestMessage, xhr: IXHRequest): void {
    if (message.timeout !== undefined) {
        xhr.timeout = message.timeout;
    }
}

export function callbackParameterNameTransformer(client: HttpClient, processor: RequestMessageProcessor, message: IRequestMessage, xhr: IXHRequest): void {
    if (message.callbackParameterName !== undefined) {
        xhr.callbackParameterName = message.callbackParameterName;
    }
}

export function credentialsTransformer(client: HttpClient, processor: RequestMessageProcessor, message: IRequestMessage, xhr: IXHRequest): void {
    if (message.withCredentials !== undefined) {
        xhr.withCredentials = message.withCredentials;
    }
}

export function progressTransformer(client: HttpClient, processor: RequestMessageProcessor, message: IRequestMessage, xhr: IXHRequest): void {
    if (message.progressCallback) {
        xhr.upload.onprogress = message.progressCallback;
    }
}

export function responseTypeTransformer(client: HttpClient, processor: RequestMessageProcessor, message: IRequestMessage, xhr: IXHRequest): void {
    var responseType = message.responseType;

    if (responseType === 'json') {
        responseType = 'text'; //IE does not support json
    }

    xhr.responseType = responseType;
}

export function headerTransformer(client: HttpClient, processor: RequestMessageProcessor, message: IRequestMessage, xhr: IXHRequest): void {
    message.headers.configureXHR(xhr);
}

declare var ArrayBufferView: {
    prototype: ArrayBufferView;
    new (): ArrayBufferView;
}

export function contentTransformer(client: HttpClient, processor: RequestMessageProcessor, message: IRequestMessage, xhr: IXHRequest): void {
    if ((<any>window).FormData && message.content instanceof FormData) {
        return;
    }

    if ((<any>window).Blob && message.content instanceof Blob) {
        return;
    }

    if ((<any>window).ArrayBufferView && message.content instanceof ArrayBufferView) {
        return;
    }

    if (message.content instanceof Document) {
        return;
    }

    if (typeof message.content === 'string') {
        return;
    }

    if (message.content === null || message.content === undefined) {
        return;
    }

    message.content = JSON.stringify(message.content, message.replacer);
}
