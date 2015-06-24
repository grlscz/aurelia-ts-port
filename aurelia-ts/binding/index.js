define(["require", "exports", 'aurelia-metadata', './value-converter', './event-manager', './observer-locator', './value-converter', './array-change-records', './binding-modes', './parser', './binding-expression', './listener-expression', './name-expression', './call-expression', './dirty-checking', './map-change-records', './computed-observation'], function (require, exports, aurelia_metadata_1, value_converter_1, event_manager_1, observer_locator_1, value_converter_2, array_change_records_1, binding_modes_1, parser_1, binding_expression_1, listener_expression_1, name_expression_1, call_expression_1, dirty_checking_1, map_change_records_1, computed_observation_1) {
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    exports.EventManager = event_manager_1.EventManager;
    exports.ObserverLocator = observer_locator_1.ObserverLocator;
    exports.ObjectObservationAdapter = observer_locator_1.ObjectObservationAdapter;
    exports.ValueConverterResource = value_converter_2.ValueConverterResource;
    exports.calcSplices = array_change_records_1.calcSplices;
    __export(binding_modes_1);
    exports.Parser = parser_1.Parser;
    exports.BindingExpression = binding_expression_1.BindingExpression;
    exports.ListenerExpression = listener_expression_1.ListenerExpression;
    exports.NameExpression = name_expression_1.NameExpression;
    exports.CallExpression = call_expression_1.CallExpression;
    exports.DirtyChecker = dirty_checking_1.DirtyChecker;
    exports.getChangeRecords = map_change_records_1.getChangeRecords;
    exports.ComputedPropertyObserver = computed_observation_1.ComputedPropertyObserver;
    exports.declarePropertyDependencies = computed_observation_1.declarePropertyDependencies;
    function valueConverter(nameOrTarget) {
        if (nameOrTarget === undefined || typeof nameOrTarget === 'string') {
            return function (target) {
                Reflect.defineMetadata(aurelia_metadata_1.Metadata.resource, new value_converter_1.ValueConverterResource(nameOrTarget), target);
            };
        }
        Reflect.defineMetadata(aurelia_metadata_1.Metadata.resource, new value_converter_1.ValueConverterResource(), nameOrTarget);
    }
    exports.valueConverter = valueConverter;
    aurelia_metadata_1.Decorators.configure.parameterizedDecorator('valueConverter', valueConverter);
    function computedFrom() {
        var rest = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rest[_i - 0] = arguments[_i];
        }
        return function (target, key, descriptor) {
            if (descriptor.set) {
                throw new Error("The computed property \"" + key + "\" cannot have a setter function.");
            }
            descriptor.get.dependencies = rest;
            return descriptor;
        };
    }
    exports.computedFrom = computedFrom;
});
