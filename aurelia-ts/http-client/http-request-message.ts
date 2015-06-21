import {IRequestMessage, IHeaders} from './interfaces';
import {QueryStringSource} from 'aurelia-path';
import {Dictionary} from 'aurelia-tsutil';

import {Headers} from './headers';
import {RequestMessageProcessor} from './request-message-processor';
import {
timeoutTransformer,
credentialsTransformer,
progressTransformer,
responseTypeTransformer,
headerTransformer,
contentTransformer
} from './transformers';

export class HttpRequestMessage implements IRequestMessage {
    public method: string;
    public uri: string;
    public content: any;
    public headers: Headers;
    public responseType: string;
    constructor(method?: string, uri?: string, content?: any, headers?: Headers) {
        this.method = method;
        this.uri = uri;
        this.content = content;
        this.headers = headers || new Headers();
        this.responseType = 'json'; //text, arraybuffer, blob, document
    }
}

export function createHttpRequestMessageProcessor(): RequestMessageProcessor {
    return new RequestMessageProcessor(XMLHttpRequest, [
        timeoutTransformer,
        credentialsTransformer,
        progressTransformer,
        responseTypeTransformer,
        headerTransformer,
        contentTransformer
    ]);
}
