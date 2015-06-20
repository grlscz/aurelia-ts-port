import {Dictionary} from 'aurelia-tsutil';

export type QueryStringScalarValueSource = string | (() => string);
// traditional:
//   scalar
//   or array of scalars
// non traditional
//   scalar
//   or dictionary of non-traditional
//   or array of non-traditional
export type QueryStringSource = QueryStringScalarValueSource | IQueryStringDictionarySource | IQueryStringArraySource;
export interface IQueryStringDictionarySource extends Dictionary<QueryStringSource> { }
export interface IQueryStringArraySource extends Array<QueryStringSource> { }