import {IBindableExpression, IBinding, I__HasExecutionContext} from './interfaces';

export class NameExpression {
    public property: string;
    public discrete: boolean;
    public mode: string;
    constructor(name: string, mode: string) {
        this.property = name;
        this.discrete = true;
        this.mode = mode.replace(/-([a-z])/g, (m: string, w: string) => w.toUpperCase());
    }

    createBinding(target: Object): any {
        return new NameBinder(this.property, target, this.mode);
    }
}

class NameBinder {
    public property: string;
    public target: Object;
    public source: Object;
    constructor(property: string, target: Object, mode: string) {
        this.property = property;

        if (mode === 'element') {
            this.target = target;
        } else {
            this.target = target[mode];

            if (this.target === undefined) {
                throw new Error(`Attempted to reference "${mode}", but it was not found on the target element.`)
            } else {
                this.target = (<I__HasExecutionContext>this.target).executionContext || this.target;
            }
        }
    }

    bind(source: IBindableExpression): void {
        if (this.source) {
            if (this.source === source) {
                return;
            }

            this.unbind();
        }

        this.source = source;
        source[this.property] = this.target;
    }

    unbind(): void {
        this.source[this.property] = null;
    }
}
