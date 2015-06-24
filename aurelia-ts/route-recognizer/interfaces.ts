import {Dictionary} from 'tsutil';

// segments
export interface ISegment {
    name?: string;
    eachChar(callback: (charSpec: ICharacterSpecification) => void): void;
    regex(): string;
    generate(params: Dictionary<string>, consumed: Dictionary<boolean>): string;
}

export interface ICharacterSpecification {
    validChars?: string;
    invalidChars?: string;
    repeat?: boolean;
}


// state
export interface IState {
    get(charSpec: ICharacterSpecification): IState;
    put(charSpec: ICharacterSpecification): IState;
    match(ch: string): IState[];
}

export interface IAcceptingState extends IState {
    get(charSpec: ICharacterSpecification): IAcceptingState;
    put(charSpec: ICharacterSpecification): IAcceptingState;
    match(ch: string): IAcceptingState[];
    regex: RegExp;
    handlers: IHandlerWithParameterNames[];
    types: ISegmentTypesInfo;
}

export interface IHandler { // should it be something more?
    name: string;
}

export interface IHandlerWithParameterNames {
    handler: IHandler;
    names: string[];
}

export interface ISegmentTypesInfo {
    statics: number;
    dynamics: number;
    stars: number;
};


// route
export interface IRoure {
    path: string;
    handler: IHandler;
}

export interface IRoutesArray extends Array<TRoutesCollection> {
}

export type TRoutesCollection = IRoure | IRoutesArray; // if deep structure is unintended - make it "IRoure | Array<IRoute>"


// results
export interface IRoureMatch {
    handler: IHandler;
    params: Dictionary<string>;
    isDynamic: boolean;
}

export interface IQueryParams extends Dictionary<boolean|string|string[]> { } // was boolean intended?


// internals
export interface IPreparedRoute {
    segments: ISegment[];
    handlers: IHandlerWithParameterNames[];
}
