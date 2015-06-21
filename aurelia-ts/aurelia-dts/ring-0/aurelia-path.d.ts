declare module 'aurelia-path/interfaces' {
	import { Dictionary } from 'aurelia-tsutil';
	export type QueryStringScalarValueSource = string | (() => string);
	export type QueryStringSource = QueryStringScalarValueSource | IQueryStringDictionarySource | IQueryStringArraySource;
	export interface IQueryStringDictionarySource extends Dictionary<QueryStringSource> {
	}
	export interface IQueryStringArraySource extends Array<QueryStringSource> {
	}

}
declare module 'aurelia-path/index' {
	import { Dictionary } from 'aurelia-tsutil';
	import { QueryStringSource } from 'aurelia-path/interfaces';
	export { QueryStringScalarValueSource, QueryStringSource } from 'aurelia-path/interfaces';
	export function relativeToFile(name: string, file: string): string;
	export function join(path1: string, path2: string): string;
	export function buildQueryString(a: Dictionary<QueryStringSource>, traditional?: boolean): string;

}
declare module 'aurelia-path' {
	export * from 'aurelia-path/index';
}
