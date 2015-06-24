import {Dictionary} from 'tsutil';
import {IAddDecorator} from './interfaces';

import {DecoratorApplicator} from './decorator-applicator';

export var Decorators = {
    configure: {
        parameterizedDecorator(name: string, decorator: (...args) => ClassDecorator): void {
            (<Dictionary<IAddDecorator>><any>Decorators)[name] = <IAddDecorator>function () {
                var applicator = new DecoratorApplicator();
                return (<(...args) => DecoratorApplicator>applicator[name]).apply(applicator, arguments);
            };

            (<Dictionary<IAddDecorator>><any>DecoratorApplicator.prototype)[name] = <IAddDecorator>function () {
                var result: ClassDecorator = decorator.apply(null, arguments);
                return (<DecoratorApplicator>this).decorator(result);
            };
        },
        simpleDecorator(name, decorator: ClassDecorator): void {
            (<Dictionary<IAddDecorator>><any>Decorators)[name] = <IAddDecorator>function () {
                return new DecoratorApplicator().decorator(decorator);
            };

            (<Dictionary<IAddDecorator>><any>DecoratorApplicator.prototype)[name] = <IAddDecorator>function () {
                return (<DecoratorApplicator>this).decorator(decorator);
            }
        }
    }
}
