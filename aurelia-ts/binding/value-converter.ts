import core from 'core-js'

function camelCase(name: string): string {
    return name.charAt(0).toLowerCase() + name.slice(1);
}

export interface _IValueConverter { _IValueConverter }
export interface _IContainer {
    get(target: _ITarget): _IValueConverter;
    _IContainer987654567
}
export interface _ITarget { _ITarget4562y3864257348 }
export interface _IRegistry {
    registerValueConverter(name: string, valueConverter: _IValueConverter): void;
    _IRegistry9276457263794
}

export class ValueConverterResource {
    public name: string;
    public instance: _IValueConverter;
    constructor(name?: string) {
        this.name = name;
    }

    static convention(name: string): ValueConverterResource {
        if (name.endsWith('ValueConverter')) {
            return new ValueConverterResource(camelCase(name.substring(0, name.length - 14)));
        }
    }

    analyze(container: _IContainer, target: _ITarget) {
        this.instance = container.get(target);
    }

    register(registry: _IRegistry, name: string) {
        registry.registerValueConverter(name || this.name, this.instance);
    }

    load(container: _IContainer, target: _ITarget): Promise<ValueConverterResource> {
        return Promise.resolve(this);
    }
}
