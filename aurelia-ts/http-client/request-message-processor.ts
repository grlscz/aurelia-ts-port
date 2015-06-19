import {IXHRType, IXHR, IRequestMessage, IRequestTransformer} from './interfaces';

import core from 'core-js';
import {HttpResponseMessage} from './http-response-message';
import {join, buildQueryString} from 'aurelia-path';
import {HttpClient} from './http-client';

function buildFullUri(message: IRequestMessage): void {
    var uri = join(message.baseUri, message.uri),
        qs;

    if (message.params) {
        qs = buildQueryString(message.params);
        uri = qs ? `${uri}?${qs}` : uri;
    }

    message.fullUri = uri;
}

export class RequestMessageProcessor {
    public XHRType: IXHRType;
    public transformers: IRequestTransformer[];
    public xhr: IXHR;
    constructor(xhrType: IXHRType, transformers: IRequestTransformer[]) {
        this.XHRType = xhrType;
        this.transformers = transformers;
    }

    abort(): void {
        //The logic here is if the xhr object is not set then there is nothing to abort so the intent was carried out
        if (this.xhr) {
            this.xhr.abort();
        }
    }

    process(client: HttpClient, message: IRequestMessage): Promise<HttpResponseMessage> {
        return new Promise((resolve, reject) => {
            var xhr = this.xhr = new this.XHRType(),
                transformers = this.transformers,
                i, ii;

            buildFullUri(message);
            xhr.open(message.method, message.fullUri, true);

            for (i = 0, ii = transformers.length; i < ii; ++i) {
                transformers[i](client, this, message, xhr);
            }

            xhr.onload = (e) => {
                var response = new HttpResponseMessage(message, xhr, message.responseType, message.reviver);
                if (response.isSuccess) {
                    resolve(response);
                } else {
                    reject(response);
                }
            };

            xhr.ontimeout = (e) => {
                reject(new HttpResponseMessage(message, {
                    response: e,
                    status: xhr.status,
                    statusText: xhr.statusText
                }, 'timeout'));
            };

            xhr.onerror = (e) => {
                reject(new HttpResponseMessage(message, {
                    response: e,
                    status: xhr.status,
                    statusText: xhr.statusText
                }, 'error'));
            };

            xhr.onabort = (e) => {
                reject(new HttpResponseMessage(message, {
                    response: e,
                    status: xhr.status,
                    statusText: xhr.statusText
                }, 'abort'));
            };

            xhr.send(message.content);
        });
    }
}
