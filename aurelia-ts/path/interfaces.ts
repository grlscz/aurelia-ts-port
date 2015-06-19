import {Dictionary} from 'aurelia-tsutil';

export type QueryStringScalarValueSource = string | (() => string);
// traditional:
//   scalar
//   or array of scalars
// non traditional
//   scalar
//   or dictionary of non-traditional
//   or array of non-traditional
export type QueryStringValuesSource = QueryStringScalarValueSource | Dictionary<any> | Array<any>;
