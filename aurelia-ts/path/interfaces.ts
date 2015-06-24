import {Dictionary} from 'tsutil';

export type TQueryStringScalarValueSource = string | (() => string);
// traditional:
//   scalar
//   or array of scalars
// non traditional
//   scalar
//   or dictionary of non-traditional
//   or array of non-traditional
export type TQueryStringSource = TQueryStringScalarValueSource | IQueryStringDictionarySource | IQueryStringArraySource;
export interface IQueryStringDictionarySource extends Dictionary<TQueryStringSource> { }
export interface IQueryStringArraySource extends Array<TQueryStringSource> { }