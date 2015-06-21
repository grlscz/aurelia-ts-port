import {IXHResponse, IRequestMessage, ResponseReviver, JSONResponseReviver, NonJSONResponseReviver, IHeaders} from './interfaces';

/* jshint -W093 */
import {Headers} from './headers';

export class HttpResponseMessage {
    public requestMessage: IRequestMessage;
    public statusCode: number;
    public response: any;
    public isSuccess: boolean;
    public statusText: string;
    public reviver: ResponseReviver;
    public mimeType: string;
    public responseType: string;
    public headers: IHeaders;
    private _content: any;

    constructor(requestMessage: IRequestMessage, xhr: IXHResponse, responseType: string, reviver?: ResponseReviver) {
        this.requestMessage = requestMessage;
        this.statusCode = xhr.status;
        this.response = xhr.response || xhr.responseText;
        this.isSuccess = xhr.status >= 200 && xhr.status < 400;
        this.statusText = xhr.statusText;
        this.reviver = reviver;
        this.mimeType = null;

        if (xhr.getAllResponseHeaders) {
            try {
                this.headers = Headers.parse(xhr.getAllResponseHeaders());
            } catch (err) {
                //if this fails it means the xhr was a mock object so the `requestHeaders` property should be used
                if ((<any>xhr).requestHeaders) this.headers = { headers: (<any>xhr).requestHeaders };
            }
        } else {
            this.headers = new Headers();
        }

        var contentType: string;
        if (this.headers && this.headers.headers) contentType = this.headers.headers["Content-Type"];
        if (contentType) {
            this.mimeType = responseType = contentType.split(";")[0].trim();
            if (mimeTypes.hasOwnProperty(this.mimeType)) responseType = mimeTypes[this.mimeType];
        }
        this.responseType = responseType;
    }

    get content(): any {
        try {
            if (this._content !== undefined) {
                return this._content;
            }

            if (this.response === undefined || this.response === null) {
                return this._content = this.response;
            }

            if (this.responseType === 'json') {
                return this._content = JSON.parse(this.response, <JSONResponseReviver>this.reviver);
            }

            if (this.reviver) {
                return this._content = (<NonJSONResponseReviver>this.reviver)(this.response);
            }

            return this._content = this.response;
        } catch (e) {
            if (this.isSuccess) {
                throw e;
            }

            return this._content = null;
        }
    }
}


/**
 * MimeTypes mapped to responseTypes
 *
 * @type {Object}
 */
export var mimeTypes = {
    "text/html": "html",
    "text/javascript": "js",
    "application/javascript": "js",
    "text/json": "json",
    "application/json": "json",
    "application/rss+xml": "rss",
    "application/atom+xml": "atom",
    "application/xhtml+xml": "xhtml",
    "text/markdown": "md",
    "text/xml": "xml",
    "text/mathml": "mml",
    "application/xml": "xml",
    "text/yml": "yml",
    "text/csv": "csv",
    "text/css": "css",
    "text/less": "less",
    "text/stylus": "styl",
    "text/scss": "scss",
    "text/sass": "sass",
    "text/plain": "txt"
};
