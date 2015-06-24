declare module 'aurelia-binding-interfaces/index' {
	import { Dictionary } from 'aurelia-tsutil';
	export interface IPropertyObserver {
	    subscribe(callback: (newValue, oldValue) => void): () => void;
	}
	export interface __IHasObserversLookup {
	    __observers__: Dictionary<IPropertyObserver>;
	}

}
declare module 'aurelia-binding-interfaces' {
	export * from 'aurelia-binding-interfaces/index';
}
