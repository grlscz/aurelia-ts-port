import {IPropertyObserver, IExpression, IValueConvertersLookup, I__Has$Event} from './interfaces';
import {ObserverLocator} from './observer-locator';

export class CallExpression {
    public observerLocator: ObserverLocator;
    public targetProperty: string;
    public sourceExpression: IExpression;
    public valueConverterLookupFunction: IValueConvertersLookup;
    constructor(observerLocator: ObserverLocator, targetProperty: string, sourceExpression: IExpression, valueConverterLookupFunction: IValueConvertersLookup) {
        this.observerLocator = observerLocator;
        this.targetProperty = targetProperty;
        this.sourceExpression = sourceExpression;
        this.valueConverterLookupFunction = valueConverterLookupFunction;
    }

    createBinding(target: Object): any {
        return new Call(
            this.observerLocator,
            this.sourceExpression,
            target,
            this.targetProperty,
            this.valueConverterLookupFunction
            );
    }
}

class Call {
    public sourceExpression: IExpression;
    public target: Object;
    public targetProperty: IPropertyObserver;
    public valueConverterLookupFunction: IValueConvertersLookup;
    public source: Object;
    constructor(observerLocator: ObserverLocator, sourceExpression: IExpression, target: Object, targetProperty: string, valueConverterLookupFunction: IValueConvertersLookup) {
        this.sourceExpression = sourceExpression
        this.target = target;
        this.targetProperty = observerLocator.getObserver(target, targetProperty);
        this.valueConverterLookupFunction = valueConverterLookupFunction;
    }

    bind(source: Object): void {
        if (this.source === source) {
            return;
        }

        if (this.source) {
            this.unbind();
        }

        this.source = source;
        this.targetProperty.setValue(($event: Event) => {
            var result: any, temp = (<I__Has$Event>source).$event;
            (<I__Has$Event>source).$event = $event;
            result = this.sourceExpression.evaluate(source, this.valueConverterLookupFunction);
            (<I__Has$Event>source).$event = temp;
            return result;
        });
    }

    unbind(): void {
        this.targetProperty.setValue(null);
    }
}
