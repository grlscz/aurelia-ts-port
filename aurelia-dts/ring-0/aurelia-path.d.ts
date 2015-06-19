declare module 'aurelia-path/interfaces' {
	import { Dictionary } from 'aurelia-tsutil';
	export type QueryStringScalarValueSource = string | (() => string);
	export type QueryStringValuesSource = QueryStringScalarValueSource | Dictionary<any> | Array<any>;

}
declare module 'aurelia-path/index' {
	import { Dictionary } from 'aurelia-tsutil';
	import { QueryStringValuesSource } from 'aurelia-path/interfaces';
	export function relativeToFile(name: string, file: string): string;
	export function join(path1: string, path2: string): string;
	export function buildQueryString(a: Dictionary<QueryStringValuesSource>, traditional?: boolean): string;

}
declare module 'aurelia-path' {
	export * from 'aurelia-path/index';
}
