import {Container} from './container';

export type InstanceKey = Object;
export type InstanceSource = Object;

export interface IActivator<T extends InstanceSource> {
    invoke(fn: T, args: Object[]): Object;
}

export interface IHasInjectionInfo extends InstanceSource { // no static interfaces, unfortunately
    inject: InstanceKey[]| (() => InstanceKey[]);
}

export interface IRegistration {
    register(container: Container, key: InstanceKey, fn: InstanceSource): void;
}

// Container
export interface IConstructionInfo {
    activator: IActivator<any>;
    keys: InstanceKey[];
}

export interface IParameterInfoLocator {
    (fn: InstanceSource): InstanceKey[];
}

export interface IHandler {
    (container: Container): Object;
}

// internals
export interface IMetadataKeys {
    registration: string;
    instanceActivator: string;
}
