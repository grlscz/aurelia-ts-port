import {IValueObserver, IValueInfo, IValueConverter, IValueConvertersLookup, IExpression, IBinding, IBindableExpression, IAssignableExpression, I__ExpressionTraversal, I__ExpressionVisitor} from './interfaces';
import {ObserverLocator} from './observer-locator';

import {PathObserver} from './path-observer';
import {CompositeObserver} from './composite-observer';
import {AccessKeyedObserver} from './access-keyed-observer';

export class Expression {
    public isChain: boolean;
    public isAssignable: boolean;
    constructor() {
        this.isChain = false;
        this.isAssignable = false;
    }

    evaluate(scope: Object, valueConverters: IValueConvertersLookup): any {
        throw new Error(`Cannot evaluate ${this}`);
    }

    assign(scope: Object, value: any, valueConverters: IValueConvertersLookup): any {
        throw new Error(`Cannot assign to ${this}`);
    }

    toString(): string {
        return Unparser.unparse(<any>this);
    }
}

export class Chain extends Expression implements IExpression, I__ExpressionTraversal {
    public expressions: IExpression[];
    constructor(expressions: IExpression[]) {
        super();

        this.expressions = expressions;
        this.isChain = true;
    }

    evaluate(scope: Object, valueConverters?: IValueConvertersLookup): any {
        var result: any,
            expressions = this.expressions,
            length = expressions.length,
            i: number, last: number;

        for (i = 0; i < length; ++i) {
            last = expressions[i].evaluate(scope, valueConverters);

            if (last !== null) {
                result = last;
            }
        }

        return result;
    }

    accept(visitor: I__ExpressionVisitor): void {
        visitor.visitChain(this);
    }
}

export class ValueConverter extends Expression implements IAssignableExpression, I__ExpressionTraversal {
    public expression: IExpression;
    public name: string;
    public args: IBindableExpression[];
    public allArgs: IBindableExpression[];
    constructor(expression: IExpression, name: string, args: IBindableExpression[], allArgs: IBindableExpression[]) {
        super();

        this.expression = expression;
        this.name = name;
        this.args = args;
        this.allArgs = allArgs;
    }

    evaluate(scope: Object, valueConverters: IValueConvertersLookup): any {
        var converter = valueConverters(this.name);
        if (!converter) {
            throw new Error(`No ValueConverter named "${this.name}" was found!`);
        }

        if ('toView' in converter) {
            return converter.toView.apply(converter, evalList(scope, this.allArgs, valueConverters));
        }

        return this.allArgs[0].evaluate(scope, valueConverters);
    }

    assign(scope: Object, value: any, valueConverters: IValueConvertersLookup): any {
        var converter = valueConverters(this.name);
        if (!converter) {
            throw new Error(`No ValueConverter named "${this.name}" was found!`);
        }

        if ('fromView' in converter) {
            value = converter.fromView.apply(converter, [value].concat(evalList(scope, this.args, valueConverters)));
        }

        return (<IAssignableExpression>this.allArgs[0]).assign(scope, value, valueConverters);
    }

    accept(visitor: I__ExpressionVisitor): void {
        visitor.visitValueConverter(this);
    }

    connect(binding: IBinding, scope: Object): IValueInfo {
        var observer: IValueObserver,
            childObservers: IValueObserver[] = [],
            i: number, ii: number, exp: IBindableExpression, expInfo: IValueInfo;

        for (i = 0, ii = this.allArgs.length; i < ii; ++i) {
            exp = this.allArgs[i]
            expInfo = exp.connect(binding, scope);

            if (expInfo.observer) {
                childObservers.push(expInfo.observer);
            }
        }

        if (childObservers.length) {
            observer = new CompositeObserver(childObservers, () => {
                return this.evaluate(scope, binding.valueConverterLookupFunction);
            });
        }

        return {
            value: this.evaluate(scope, binding.valueConverterLookupFunction),
            observer: observer
        };
    }
}

export class Assign extends Expression implements IBindableExpression, I__ExpressionTraversal {
    public target: IAssignableExpression;
    public value: any;
    constructor(target: IAssignableExpression, value: any) {
        super();

        this.target = target;
        this.value = value;
    }

    evaluate(scope: Object, valueConverters?: IValueConvertersLookup): any {
        return this.target.assign(scope, this.value.evaluate(scope, valueConverters));
    }

    accept(vistor: I__ExpressionVisitor): void {
        vistor.visitAssign(this);
    }

    connect(binding: IBinding, scope: Object): IValueInfo {
        return { value: this.evaluate(scope, binding.valueConverterLookupFunction) };
    }
}

export class Conditional extends Expression implements IBindableExpression, I__ExpressionTraversal {
    public condition: IBindableExpression;
    public yes: IBindableExpression;
    public no: IBindableExpression;
    constructor(condition: IBindableExpression, yes: IBindableExpression, no: IBindableExpression) {
        super();

        this.condition = condition;
        this.yes = yes;
        this.no = no;
    }

    evaluate(scope: Object, valueConverters?: IValueConvertersLookup): any {
        return (!!this.condition.evaluate(scope)) ? this.yes.evaluate(scope) : this.no.evaluate(scope);
    }

    accept(visitor: I__ExpressionVisitor): void {
        visitor.visitConditional(this);
    }

    connect(binding: IBinding, scope: Object): IValueInfo {
        var conditionInfo = this.condition.connect(binding, scope),
            yesInfo = this.yes.connect(binding, scope),
            noInfo = this.no.connect(binding, scope),
            childObservers: IValueObserver[] = [],
            observer: IValueObserver;

        if (conditionInfo.observer) {
            childObservers.push(conditionInfo.observer);
        }

        if (yesInfo.observer) {
            childObservers.push(yesInfo.observer);
        }

        if (noInfo.observer) {
            childObservers.push(noInfo.observer);
        }

        if (childObservers.length) {
            observer = new CompositeObserver(childObservers, () => {
                return this.evaluate(scope, binding.valueConverterLookupFunction);
            });
        }

        return {
            value: (!!conditionInfo.value) ? yesInfo.value : noInfo.value,
            observer: observer
        };
    }
}

export class AccessScope extends Expression implements IAssignableExpression, I__ExpressionTraversal {
    public name: string;
    public isAssignable: boolean;
    constructor(name: string) {
        super();

        this.name = name;
        this.isAssignable = true;
    }

    evaluate(scope: Object, valueConverters?: IValueConvertersLookup): any {
        return scope[this.name];
    }

    assign(scope: Object, value: any): any {
        return scope[this.name] = value;
    }

    accept(visitor: I__ExpressionVisitor): void {
        visitor.visitAccessScope(this);
    }

    connect(binding: IBinding, scope: Object): IValueInfo {
        var observer = binding.getObserver(scope, this.name);

        return {
            value: observer.getValue(),
            observer: observer
        }
    }
}

export class AccessMember extends Expression implements IAssignableExpression, I__ExpressionTraversal {
    public object: IAssignableExpression;
    public name: string;
    public isAssignable: boolean;
    constructor(object: IAssignableExpression, name: string) {
        super();

        this.object = object;
        this.name = name;
        this.isAssignable = true;
    }

    evaluate(scope: Object, valueConverters?: IValueConvertersLookup): any {
        var instance = this.object.evaluate(scope, valueConverters);
        return instance === null || instance === undefined
            ? instance
            : instance[this.name];
    }

    assign(scope: Object, value: any): any {
        var instance = this.object.evaluate(scope);

        if (instance === null || instance === undefined) {
            instance = {};
            this.object.assign(scope, instance);
        }

        return instance[this.name] = value;
    }

    accept(visitor: I__ExpressionVisitor): void {
        visitor.visitAccessMember(this);
    }

    connect(binding: IBinding, scope: Object): IValueInfo {
        var info = this.object.connect(binding, scope),
            objectInstance = info.value,
            objectObserver = info.observer,
            observer: IValueObserver;

        if (objectObserver) {
            observer = new PathObserver(
                objectObserver,
                value => {
                    if (value == null || value == undefined) {
                        return value;
                    }

                    return binding.getObserver(value, this.name)
                },
                objectInstance
                );
        } else {
            observer = binding.getObserver(objectInstance, this.name);
        }

        return {
            value: objectInstance == null ? null : objectInstance[this.name], //TODO: use prop abstraction
            observer: observer
        }
    }
}

export class AccessKeyed extends Expression implements IAssignableExpression, I__ExpressionTraversal {
    public object: IBindableExpression;
    public key: IBindableExpression;
    public isAssignable: boolean;
    constructor(object: IBindableExpression, key: IBindableExpression) {
        super();

        this.object = object;
        this.key = key;
        this.isAssignable = true;
    }

    evaluate(scope: Object, valueConverters?: IValueConvertersLookup): any {
        var instance = this.object.evaluate(scope, valueConverters);
        var lookup = this.key.evaluate(scope, valueConverters);
        return getKeyed(instance, lookup);
    }

    assign(scope: Object, value: any): any {
        var instance = this.object.evaluate(scope);
        var lookup = this.key.evaluate(scope);
        return setKeyed(instance, lookup, value);
    }

    accept(visitor: I__ExpressionVisitor): void {
        visitor.visitAccessKeyed(this);
    }

    connect(binding: IBinding, scope: Object): IValueInfo {
        var objectInfo = this.object.connect(binding, scope),
            keyInfo = this.key.connect(binding, scope),
            observer = new AccessKeyedObserver(objectInfo, keyInfo, binding.observerLocator,
                () => this.evaluate(scope, binding.valueConverterLookupFunction));

        return {
            value: this.evaluate(scope, binding.valueConverterLookupFunction),
            observer: observer
        };
    }
}

export class CallScope extends Expression implements IBindableExpression, I__ExpressionTraversal {
    public name: string;
    public args: IBindableExpression[];
    constructor(name: string, args: IBindableExpression[]) {
        super();

        this.name = name;
        this.args = args;
    }

    evaluate(scope: Object, valueConverters?: IValueConvertersLookup, args?: any[]): any {
        args = args || evalList(scope, this.args, valueConverters);
        return ensureFunctionFromMap(scope, this.name).apply(scope, args);
    }

    accept(visitor: I__ExpressionVisitor): void {
        visitor.visitCallScope(this);
    }

    connect(binding: IBinding, scope: Object): IValueInfo {
        var observer: IValueObserver,
            childObservers: IValueObserver[] = [],
            i: number, ii: number, exp: IBindableExpression, expInfo: IValueInfo;

        for (i = 0, ii = this.args.length; i < ii; ++i) {
            exp = this.args[i];
            expInfo = exp.connect(binding, scope);

            if (expInfo.observer) {
                childObservers.push(expInfo.observer);
            }
        }

        if (childObservers.length) {
            observer = new CompositeObserver(childObservers, () => {
                return this.evaluate(scope, binding.valueConverterLookupFunction);
            });
        }

        return {
            value: this.evaluate(scope, binding.valueConverterLookupFunction),
            observer: observer
        };
    }
}

export class CallMember extends Expression implements IBindableExpression, I__ExpressionTraversal {
    public object: IBindableExpression;
    public name: string;
    public args: IBindableExpression[];
    constructor(object: IBindableExpression, name: string, args: IBindableExpression[]) {
        super();

        this.object = object;
        this.name = name;
        this.args = args;
    }

    evaluate(scope: Object, valueConverters?: IValueConvertersLookup, args?: any[]) {
        var instance = this.object.evaluate(scope, valueConverters);
        args = args || evalList(scope, this.args, valueConverters);
        return ensureFunctionFromMap(instance, this.name).apply(instance, args);
    }

    accept(visitor: I__ExpressionVisitor): void {
        visitor.visitCallMember(this);
    }

    connect(binding: IBinding, scope: Object): IValueInfo {
        var observer: IValueObserver,
            objectInfo = this.object.connect(binding, scope),
            childObservers: IValueObserver[] = [],
            i: number, ii: number, exp: IBindableExpression, expInfo: IValueInfo;

        if (objectInfo.observer) {
            childObservers.push(objectInfo.observer);
        }

        for (i = 0, ii = this.args.length; i < ii; ++i) {
            exp = this.args[i];
            expInfo = exp.connect(binding, scope);

            if (expInfo.observer) {
                childObservers.push(expInfo.observer);
            }
        }

        if (childObservers.length) {
            observer = new CompositeObserver(childObservers, () => {
                return this.evaluate(scope, binding.valueConverterLookupFunction);
            });
        }

        return {
            value: this.evaluate(scope, binding.valueConverterLookupFunction),
            observer: observer
        };
    }
}

export class CallFunction extends Expression implements IBindableExpression, I__ExpressionTraversal {
    public func: IBindableExpression;
    public args: IBindableExpression[];
    constructor(func: IBindableExpression, args: IBindableExpression[]) {
        super();

        this.func = func;
        this.args = args;
    }

    evaluate(scope: Object, valueConverters?: IValueConvertersLookup, args?: any[]) {
        var func: Function = this.func.evaluate(scope, valueConverters);

        if (typeof func !== 'function') {
            throw new Error(`${this.func} is not a function`);
        } else {
            return func.apply(null, args || evalList(scope, this.args, valueConverters));
        }
    }

    accept(visitor: I__ExpressionVisitor): void {
        visitor.visitCallFunction(this);
    }

    connect(binding: IBinding, scope: Object): IValueInfo {
        var observer: IValueObserver,
            funcInfo = this.func.connect(binding, scope),
            childObservers: IValueObserver[] = [],
            i: number, ii: number, exp: IBindableExpression, expInfo: IValueInfo;

        if (funcInfo.observer) {
            childObservers.push(funcInfo.observer);
        }

        for (i = 0, ii = this.args.length; i < ii; ++i) {
            exp = this.args[i];
            expInfo = exp.connect(binding, scope);

            if (expInfo.observer) {
                childObservers.push(expInfo.observer);
            }
        }

        if (childObservers.length) {
            observer = new CompositeObserver(childObservers, () => {
                return this.evaluate(scope, binding.valueConverterLookupFunction);
            });
        }

        return {
            value: this.evaluate(scope, binding.valueConverterLookupFunction),
            observer: observer
        };
    }
}

export class Binary extends Expression implements IBindableExpression, I__ExpressionTraversal {
    public operation: string;
    public left: IBindableExpression;
    public right: IBindableExpression;
    constructor(operation: string, left: IBindableExpression, right: IBindableExpression) {
        super();

        this.operation = operation;
        this.left = left;
        this.right = right;
    }

    evaluate(scope: Object, valueConverters?: IValueConvertersLookup): any {
        var left = this.left.evaluate(scope);

        switch (this.operation) {
            case '&&': return !!left && !!this.right.evaluate(scope);
            case '||': return !!left || !!this.right.evaluate(scope);
        }

        var right = this.right.evaluate(scope);

        switch (this.operation) {
            case '==': return left == right;
            case '===': return left === right;
            case '!=': return left != right;
            case '!==': return left !== right;
        }

        // Null check for the operations.
        if (left === null || right === null) {
            switch (this.operation) {
                case '+':
                    if (left != null) return left;
                    if (right != null) return right;
                    return 0;
                case '-':
                    if (left != null) return left;
                    if (right != null) return 0 - right;
                    return 0;
            }

            return null;
        }

        switch (this.operation) {
            case '+': return autoConvertAdd(left, right);
            case '-': return left - right;
            case '*': return left * right;
            case '/': return left / right;
            case '%': return left % right;
            case '<': return left < right;
            case '>': return left > right;
            case '<=': return left <= right;
            case '>=': return left >= right;
            case '^': return left ^ right;
            case '&': return left & right;
        }

        throw new Error(`Internal error [${this.operation}] not handled`);
    }

    accept(visitor: I__ExpressionVisitor): void {
        visitor.visitBinary(this);
    }

    connect(binding: IBinding, scope: Object): IValueInfo {
        var leftInfo = this.left.connect(binding, scope),
            rightInfo = this.right.connect(binding, scope),
            childObservers: IValueObserver[] = [],
            observer: IValueObserver;

        if (leftInfo.observer) {
            childObservers.push(leftInfo.observer);
        }

        if (rightInfo.observer) {
            childObservers.push(rightInfo.observer);
        }

        if (childObservers.length) {
            observer = new CompositeObserver(childObservers, () => {
                return this.evaluate(scope, binding.valueConverterLookupFunction);
            });
        }

        return {
            value: this.evaluate(scope, binding.valueConverterLookupFunction),
            observer: observer
        };
    }
}

export class PrefixNot extends Expression implements IBindableExpression, I__ExpressionTraversal {
    public operation: string;
    public expression: IBindableExpression;
    constructor(operation: string, expression: IBindableExpression) {
        super();

        this.operation = operation;
        this.expression = expression;
    }

    evaluate(scope: Object, valueConverters?: IValueConvertersLookup): any {
        return !this.expression.evaluate(scope);
    }

    accept(visitor: I__ExpressionVisitor): void {
        visitor.visitPrefix(this);
    }

    connect(binding: IBinding, scope: Object): IValueInfo {
        var info = this.expression.connect(binding, scope),
            observer: IValueObserver;

        if (info.observer) {
            observer = new CompositeObserver([info.observer], () => {
                return this.evaluate(scope, binding.valueConverterLookupFunction);
            });
        }

        return {
            value: !info.value,
            observer: observer
        };
    }
}

export class LiteralPrimitive extends Expression implements IBindableExpression, I__ExpressionTraversal {
    public value: any;
    constructor(value: any) {
        super();

        this.value = value;
    }

    evaluate(scope: Object, valueConverters?: IValueConvertersLookup): any {
        return this.value;
    }

    accept(visitor: I__ExpressionVisitor): void {
        visitor.visitLiteralPrimitive(this);
    }

    connect(binding: IBinding, scope: Object): IValueInfo {
        return { value: this.value }
    }
}

export class LiteralString extends Expression implements IBindableExpression, I__ExpressionTraversal {
    public value: string;
    constructor(value: string) {
        super();

        this.value = value;
    }

    evaluate(scope: Object, valueConverters?: IValueConvertersLookup): any {
        return this.value;
    }

    accept(visitor: I__ExpressionVisitor): void {
        visitor.visitLiteralString(this);
    }

    connect(binding: IBinding, scope: Object): IValueInfo {
        return { value: this.value }
    }
}

export class LiteralArray extends Expression implements IBindableExpression, I__ExpressionTraversal {
    public elements: IBindableExpression[];
    constructor(elements: IBindableExpression[]) {
        super();

        this.elements = elements;
    }

    evaluate(scope: Object, valueConverters?: IValueConvertersLookup): any {
        var elements = this.elements,
            length = elements.length,
            result: any[] = [],
            i: number;

        for (i = 0; i < length; ++i) {
            result[i] = elements[i].evaluate(scope, valueConverters);
        }

        return result;
    }

    accept(visitor: I__ExpressionVisitor): void {
        visitor.visitLiteralArray(this);
    }

    connect(binding: IBinding, scope: Object): IValueInfo {
        var observer: IValueObserver,
            childObservers: IValueObserver[] = [],
            results: any[] = [],
            i: number, ii: number, exp: IBindableExpression, expInfo: IValueInfo;

        for (i = 0, ii = this.elements.length; i < ii; ++i) {
            exp = this.elements[i];
            expInfo = exp.connect(binding, scope);

            if (expInfo.observer) {
                childObservers.push(expInfo.observer);
            }

            results[i] = expInfo.value;
        }

        if (childObservers.length) {
            observer = new CompositeObserver(childObservers, () => {
                return this.evaluate(scope, binding.valueConverterLookupFunction);
            });
        }

        return {
            value: results,
            observer: observer
        };
    }
}

export class LiteralObject extends Expression implements IBindableExpression, I__ExpressionTraversal {
    public keys: any[];
    public values: IBindableExpression[];
    constructor(keys: any[], values: IBindableExpression[]) {
        super();

        this.keys = keys;
        this.values = values;
    }

    evaluate(scope: Object, valueConverters?: IValueConvertersLookup): any {
        var instance = {},
            keys = this.keys,
            values = this.values,
            length = keys.length,
            i: number;

        for (i = 0; i < length; ++i) {
            instance[keys[i]] = values[i].evaluate(scope, valueConverters);
        }

        return instance;
    }

    accept(visitor: I__ExpressionVisitor): void {
        visitor.visitLiteralObject(this);
    }

    connect(binding: IBinding, scope: Object): IValueInfo {
        var observer: IValueObserver,
            childObservers: IValueObserver[] = [],
            instance: Object = {},
            keys = this.keys,
            values = this.values,
            length = keys.length,
            i: number, valueInfo: IValueInfo;

        for (i = 0; i < length; ++i) {
            valueInfo = values[i].connect(binding, scope);

            if (valueInfo.observer) {
                childObservers.push(valueInfo.observer);
            }

            instance[keys[i]] = valueInfo.value;
        }

        if (childObservers.length) {
            observer = new CompositeObserver(childObservers, () => {
                return this.evaluate(scope, binding.valueConverterLookupFunction);
            });
        }

        return {
            value: instance,
            observer: observer
        };
    }
}

export class Unparser implements I__ExpressionVisitor {
    public buffer: string[];
    constructor(buffer: string[]) {
        this.buffer = buffer;
    }

    static unparse(expression: I__ExpressionTraversal): string {
        var buffer: string[] = [],
            visitor: I__ExpressionVisitor = new Unparser(buffer);

        expression.accept(visitor);

        return buffer.join('');
    }

    write(text: string): void {
        this.buffer.push(text);
    }

    writeArgs(args: I__ExpressionTraversal[]): void {
        var i, length;

        this.write('(');

        for (i = 0, length = args.length; i < length; ++i) {
            if (i !== 0) {
                this.write(',');
            }

            args[i].accept(this);
        }

        this.write(')');
    }

    visitChain(chain: Chain): void {
        var expressions = chain.expressions,
            length = expressions.length,
            i: number;

        for (i = 0; i < length; ++i) {
            if (i !== 0) {
                this.write(';');
            }

            (<I__ExpressionTraversal>expressions[i]).accept(this);
        }
    }

    visitValueConverter(converter: ValueConverter): void {
        var args = converter.args,
            length = args.length,
            i: number;

        this.write('(');
        (<I__ExpressionTraversal>converter.expression).accept(this);
        this.write(`|${converter.name}`);

        for (i = 0; i < length; ++i) {
            this.write(' :');
            (<I__ExpressionTraversal><IExpression>args[i]).accept(this);
        }

        this.write(')');
    }

    visitAssign(assign: Assign): void {
        (<I__ExpressionTraversal><IExpression>assign.target).accept(this);
        this.write('=');
        assign.value.accept(this);
    }

    visitConditional(conditional: Conditional): void {
        (<I__ExpressionTraversal><IExpression>conditional.condition).accept(this);
        this.write('?');
        (<I__ExpressionTraversal><IExpression>conditional.yes).accept(this);
        this.write(':');
        (<I__ExpressionTraversal><IExpression>conditional.no).accept(this);
    }

    visitAccessScope(access: AccessScope): void {
        this.write(access.name);
    }

    visitAccessMember(access: AccessMember): void {
        (<I__ExpressionTraversal><IExpression>access.object).accept(this);
        this.write(`.${access.name}`);
    }

    visitAccessKeyed(access: AccessKeyed): void {
        (<I__ExpressionTraversal><IExpression>access.object).accept(this);
        this.write('[');
        (<I__ExpressionTraversal><IExpression>access.key).accept(this);
        this.write(']');
    }

    visitCallScope(call: CallScope): void {
        this.write(call.name);
        this.writeArgs(<I__ExpressionTraversal[]><IExpression[]>call.args);
    }

    visitCallFunction(call: CallFunction): void {
        (<I__ExpressionTraversal><IExpression>call.func).accept(this);
        this.writeArgs(<I__ExpressionTraversal[]><IExpression[]>call.args);
    }

    visitCallMember(call: CallMember): void {
        (<I__ExpressionTraversal><IExpression>call.object).accept(this);
        this.write(`.${call.name}`);
        this.writeArgs(<I__ExpressionTraversal[]><IExpression[]>call.args);
    }

    visitPrefix(prefix: PrefixNot): void {
        this.write(`(${prefix.operation}`);
        (<I__ExpressionTraversal><IExpression>prefix.expression).accept(this);
        this.write(')');
    }

    visitBinary(binary: Binary): void {
        this.write('(');
        (<I__ExpressionTraversal><IExpression>binary.left).accept(this);
        this.write(binary.operation);
        (<I__ExpressionTraversal><IExpression>binary.right).accept(this);
        this.write(')');
    }

    visitLiteralPrimitive(literal: LiteralPrimitive): void {
        this.write(`${literal.value}`);
    }

    visitLiteralArray(literal: LiteralArray): void {
        var elements = literal.elements,
            length = elements.length,
            i: number;

        this.write('[');

        for (i = 0; i < length; ++i) {
            if (i !== 0) {
                this.write(',');
            }

            (<I__ExpressionTraversal><IExpression>elements[i]).accept(this);
        }

        this.write(']');
    }

    visitLiteralObject(literal: LiteralObject): void {
        var keys = literal.keys,
            values = literal.values,
            length = keys.length,
            i: number;

        this.write('{');

        for (i = 0; i < length; ++i) {
            if (i !== 0) {
                this.write(',');
            }

            this.write(`'${keys[i]}':`);
            (<I__ExpressionTraversal><IExpression>values[i]).accept(this);
        }

        this.write('}');
    }

    visitLiteralString(literal: LiteralString): void {
        var escaped = literal.value.replace(/'/g, "\'");
        this.write(`'${escaped}'`);
    }
}

var evalListCache = [[], [0], [0, 0], [0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0, 0]];

/// Evaluate the [list] in context of the [scope].
function evalList(scope: Object, list: IExpression[], valueConverters?: IValueConvertersLookup): any[] {
    var length = list.length,
        cacheLength: number, i: number;

    for (cacheLength = evalListCache.length; cacheLength <= length; ++cacheLength) {
        evalListCache.push([]);
    }

    var result = evalListCache[length];

    for (i = 0; i < length; ++i) {
        result[i] = list[i].evaluate(scope, valueConverters);
    }

    return result;
}

/// Add the two arguments with automatic type conversion.
function autoConvertAdd(a: any, b: any): any {
    if (a != null && b != null) {
        // TODO(deboer): Support others.
        if (typeof a == 'string' && typeof b != 'string') {
            return a + b.toString();
        }

        if (typeof a != 'string' && typeof b == 'string') {
            return a.toString() + b;
        }

        return a + b;
    }

    if (a != null) {
        return a;
    }

    if (b != null) {
        return b;
    }

    return 0;
}

function ensureFunctionFromMap(obj: Object, name: string): Function {
    var func = obj[name];

    if (typeof func === 'function') {
        return func;
    }

    if (func === null) {
        throw new Error(`Undefined function ${name}`);
    } else {
        throw new Error(`${name} is not a function`);
    }
}

function getKeyed(obj: Object, key: any): any {
    if (Array.isArray(obj)) {
        return obj[parseInt(key)];
    } else if (obj) {
        return obj[key];
    } else if (obj === null) {
        throw new Error('Accessing null object');
    } else {
        return obj[key];
    }
}

function setKeyed(obj: Object, key: any, value: any): any {
    if (Array.isArray(obj)) {
        var index = parseInt(key);

        if ((<any[]>obj).length <= index) {
            (<any[]>obj).length = index + 1;
        }

        obj[index] = value;
    } else {
        obj[key] = value;
    }

    return value;
}
