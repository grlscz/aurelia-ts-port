import {IDecorator, IDecorators, IAddDecorator} from './interfaces';

import {DecoratorApplicator} from './decorator-applicator';

export var Decorators = {
    configure: {
        parameterizedDecorator(name: string, decorator: (...args) => IDecorator) {
            (<IDecorators><any>Decorators)[name] = <IAddDecorator>function () {
                var applicator = new DecoratorApplicator();
                return (<(...args) => DecoratorApplicator>applicator[name]).apply(applicator, arguments);
            };

            (<IDecorators><any>DecoratorApplicator.prototype)[name] = <IAddDecorator>function () {
                var result: IDecorator = decorator.apply(null, arguments);
                return (<DecoratorApplicator>this).decorator(result);
            };
        },
        simpleDecorator(name, decorator: IDecorator) {
            (<IDecorators><any>Decorators)[name] = <IAddDecorator>function () {
                return new DecoratorApplicator().decorator(decorator);
            };

            (<IDecorators><any>DecoratorApplicator.prototype)[name] = <IAddDecorator>function () {
                return (<DecoratorApplicator>this).decorator(decorator);
            }
        }
    }
}
