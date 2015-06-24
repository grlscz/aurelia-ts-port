declare module 'aurelia-path/interfaces' {
	import { Dictionary } from 'tsutil';
	export type TQueryStringScalarValueSource = string | (() => string);
	export type TQueryStringSource = TQueryStringScalarValueSource | IQueryStringDictionarySource | IQueryStringArraySource;
	export interface IQueryStringDictionarySource extends Dictionary<TQueryStringSource> {
	}
	export interface IQueryStringArraySource extends Array<TQueryStringSource> {
	}

}
declare module 'aurelia-path/index' {
	import { Dictionary } from 'tsutil';
	import { TQueryStringSource } from 'aurelia-path/interfaces';
	export { TQueryStringScalarValueSource, TQueryStringSource } from 'aurelia-path/interfaces';
	export function relativeToFile(name: string, file: string): string;
	export function join(path1: string, path2: string): string;
	export function buildQueryString(a: Dictionary<TQueryStringSource>, traditional?: boolean): string;

}
declare module 'aurelia-path' {
	export * from 'aurelia-path/index';
}
