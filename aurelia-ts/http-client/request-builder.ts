import {IRequestMessageTransformer, TResponseReviver, IJSONContentReplacer, ICancellablePromise} from './interfaces';
import {HttpClient} from './http-client';
import {Dictionary} from 'tsutil';
import {HttpResponseMessage} from './http-response-message';

import {join, TQueryStringSource} from 'aurelia-path'
import {HttpRequestMessage} from './http-request-message';
import {JSONPRequestMessage} from './jsonp-request-message';

/**
* A builder class allowing fluent composition of HTTP requests.
*
* @class RequestBuilder
* @constructor
*/
export class RequestBuilder {
    public client: HttpClient;
    public transformers: IRequestMessageTransformer[];
    public useJsonp: boolean;
    constructor(client: HttpClient) {
        this.client = client;
        this.transformers = client.requestTransformers.slice(0);
        this.useJsonp = false;
    }

	/**
	* Adds a user-defined request transformer to the RequestBuilder.
	*
	* @method addHelper
	* @param {String} name The name of the helper to add.
	* @param {Function} fn The helper function.
	* @chainable
	*/
    static addHelper(name: string, fn: (...args) => IRequestMessageTransformer): void {
        RequestBuilder.prototype[name] = function () {
            (<RequestBuilder>this).transformers.push(fn.apply(this, arguments));
            return this;
        };
    }

	/**
	* Sends the request.
	*
	* @method send
	* @return {Promise} A cancellable promise object.
	*/
    send(): ICancellablePromise<HttpResponseMessage> {
        let message = this.useJsonp ? new JSONPRequestMessage() : new HttpRequestMessage();
        return this.client.send(message, this.transformers);
    }

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

RequestBuilder.addHelper('asDelete', function () {
    return function (client, processor, message) {
        message.method = 'DELETE';
    };
});

RequestBuilder.addHelper('asGet', function () {
    return function (client, processor, message) {
        message.method = 'GET';
    };
});

RequestBuilder.addHelper('asHead', function () {
    return function (client, processor, message) {
        message.method = 'HEAD';
    };
});

RequestBuilder.addHelper('asOptions', function () {
    return function (client, processor, message) {
        message.method = 'OPTIONS';
    };
});

RequestBuilder.addHelper('asPatch', function () {
    return function (client, processor, message) {
        message.method = 'PATCH';
    };
});

RequestBuilder.addHelper('asPost', function () {
    return function (client, processor, message) {
        message.method = 'POST';
    };
});

RequestBuilder.addHelper('asPut', function () {
    return function (client, processor, message) {
        message.method = 'PUT';
    };
});

RequestBuilder.addHelper('asJsonp', function (callbackParameterName: string) {
    this.useJsonp = true;
    return function (client, processor, message) {
        message.callbackParameterName = callbackParameterName;
    };
});

RequestBuilder.addHelper('withUri', function (uri: string) {
    return function (client, processor, message) {
        message.uri = uri;
    };
});

RequestBuilder.addHelper('withContent', function (content: any) {
    return function (client, processor, message) {
        message.content = content;
    };
});

RequestBuilder.addHelper('withBaseUri', function (baseUri: string) {
    return function (client, processor, message) {
        message.baseUri = baseUri;
    }
});

RequestBuilder.addHelper('withParams', function (params: Dictionary<TQueryStringSource>) {
    return function (client, processor, message) {
        message.params = params;
    }
});

RequestBuilder.addHelper('withResponseType', function (responseType: string) {
    return function (client, processor, message) {
        message.responseType = responseType;
    }
});

RequestBuilder.addHelper('withTimeout', function (timeout: number) {
    return function (client, processor, message) {
        message.timeout = timeout;
    }
});

RequestBuilder.addHelper('withHeader', function (key: string, value: string) {
    return function (client, processor, message) {
        message.headers.add(key, value);
    }
});

RequestBuilder.addHelper('withCredentials', function (value: boolean) {
    return function (client, processor, message) {
        message.withCredentials = value;
    }
});

RequestBuilder.addHelper('withReviver', function (reviver: TResponseReviver) {
    return function (client, processor, message) {
        message.reviver = reviver;
    }
});

RequestBuilder.addHelper('withReplacer', function (replacer: IJSONContentReplacer) {
    return function (client, processor, message) {
        message.replacer = replacer;
    }
});

RequestBuilder.addHelper('withProgressCallback', function (progressCallback: (ev: ProgressEvent) => any) {
    return function (client, processor, message) {
        message.progressCallback = progressCallback;
    }
});

RequestBuilder.addHelper('withCallbackParameterName', function (callbackParameterName: string) {
    return function (client, processor, message) {
        message.callbackParameterName = callbackParameterName;
    }
});
