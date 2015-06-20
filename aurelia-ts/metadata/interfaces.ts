import {Dictionary} from 'aurelia-tsutil';
import {Origin} from './origin';

export interface IHasDecoratorsApplicator {
    decorators: IDecoratorsApplicator | (() => IDecoratorsApplicator);
}

export interface IDecoratorsApplicator {
    _decorate(any): void;
}

export interface IOrigin {
    moduleId: string;
    moduleMember: string;
}

export type OriginSource = string | Origin;

export interface IHasOriginSource {
    origin: OriginSource | (() => OriginSource);
}

export interface IDecorator {
    (traget: any): void;
}

export interface IAddDecorator {
    (...args): IDecoratorsApplicator;
}

export interface IDecorators extends Dictionary<IAddDecorator> {
}
