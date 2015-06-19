import {IRequestMessage, IXHR, IHeaders} from './interfaces';

import {Headers} from './headers';
import {RequestMessageProcessor} from './request-message-processor';
import {
timeoutTransformer,
callbackParameterNameTransformer
} from './transformers';

export class JSONPRequestMessage implements IRequestMessage {
    public method: string;
    public uri: string;
    public content: any;
    public headers: Headers;
    public responseType: string;
    public callbackParameterName: string;
    constructor(uri?: string, callbackParameterName?: string) {
        this.method = 'JSONP';
        this.uri = uri;
        this.content = undefined;
        this.headers = new Headers();
        this.responseType = 'jsonp';
        this.callbackParameterName = callbackParameterName;
    }
}

class JSONPXHR implements IXHR {
    public method: string;
    public uri: string;
    public callbackName: string;
    public callbackParameterName: string;
    public status: number;
    public statusText: string;
    public response: any;

    open(method: string, uri: string): void {
        this.method = method;
        this.uri = uri;
        this.callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    }

    send(): void {
        var uri = this.uri + (this.uri.indexOf('?') >= 0 ? '&' : '?') + this.callbackParameterName + '=' + this.callbackName;

        window[this.callbackName] = (data) => {
            delete window[this.callbackName];
            document.body.removeChild(script);

            if (this.status === undefined) {
                this.status = 200;
                this.statusText = 'OK';
                this.response = data;
                this.onload(this);
            }
        };

        var script = document.createElement('script');
        script.src = uri;
        document.body.appendChild(script);

        if (this.timeout !== undefined) {
            setTimeout(() => {
                if (this.status === undefined) {
                    this.status = 0;
                    this.ontimeout(new Error('timeout'));
                }
            }, this.timeout);
        }
    }

    abort() {
        if (this.status === undefined) {
            this.status = 0;
            this.onabort(new Error('abort'));
        }
    }

    setRequestHeader() { }


    timeout: number;

    onabort: (ev: any) => any;
    onerror: (ev: any) => any;
    onload: (ev: any) => any;
    ontimeout: (ev: any) => any;
}

export function createJSONPRequestMessageProcessor(): RequestMessageProcessor {
    return new RequestMessageProcessor(JSONPXHR, [
        timeoutTransformer,
        callbackParameterNameTransformer
    ]);
}
