declare module 'aurelia-history/interfaces' {
	export interface INavigateOptions {
	    replace?: boolean;
	    trigger?: boolean;
	}
	export interface IHistory {
	    activate(options?: any): boolean;
	    deactivate(): void;
	    navigate(): boolean;
	    navigate(fragment: string, options?: boolean | INavigateOptions): boolean;
	    navigateBack(): void;
	}

}
declare module 'aurelia-history/index' {
	import { IHistory } from 'aurelia-history/interfaces';
	export { IHistory, INavigateOptions } from 'aurelia-history/interfaces';
	export class History implements IHistory {
	    activate(): boolean;
	    deactivate(): void;
	    navigate(): boolean;
	    navigateBack(): void;
	}

}
declare module 'aurelia-history' {
	export * from 'aurelia-history/index';
}
