declare module 'aurelia-history-browser/interfaces' {
	export interface IBrowserHistoryOptions {
	    root?: string;
	    hashChange?: boolean;
	    pushState?: boolean;
	    silent?: boolean;
	    routeHandler?: (fragment: string) => boolean;
	}

}
declare module 'aurelia-history-browser/index' {
	import { IBrowserHistoryOptions } from 'aurelia-history-browser/interfaces';
	export { IBrowserHistoryOptions } from 'aurelia-history-browser/interfaces';
	import { History, INavigateOptions } from 'aurelia-history';
	export class BrowserHistory extends History {
	    interval: number;
	    active: boolean;
	    previousFragment: string;
	    location: Location;
	    history: typeof window.history;
	    root: string;
	    options: IBrowserHistoryOptions;
	    fragment: string;
	    iframe: Window;
	    private _checkUrlCallback;
	    private _hasPushState;
	    private _wantsHashChange;
	    private _wantsPushState;
	    private _checkUrlInterval;
	    private _checkUrlTimer;
	    constructor();
	    getHash(window?: Window): string;
	    getFragment(fragment?: string, forcePushState?: boolean): string;
	    activate(options?: IBrowserHistoryOptions): boolean;
	    deactivate(): void;
	    checkUrl(): boolean;
	    loadUrl(fragmentOverride?: string): boolean;
	    navigate(fragment?: string, options?: boolean | INavigateOptions): boolean;
	    navigateBack(): void;
	}
	export function configure(aurelia: any): void;

}
declare module 'aurelia-history-browser' {
	export * from 'aurelia-history-browser/index';
}
