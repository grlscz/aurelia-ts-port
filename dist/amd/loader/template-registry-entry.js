define(["require", "exports", 'aurelia-path'], function (require, exports, aurelia_path_1) {
    var TemplateDependency = (function () {
        function TemplateDependency(src, name) {
            this.src = src;
            this.name = name;
        }
        return TemplateDependency;
    })();
    exports.TemplateDependency = TemplateDependency;
    var TemplateRegistryEntry = (function () {
        function TemplateRegistryEntry(id) {
            this.id = id;
            this.template = null;
            this.dependencies = null;
            this.resources = null;
            this.factory = null;
        }
        Object.defineProperty(TemplateRegistryEntry.prototype, "templateIsLoaded", {
            get: function () {
                return this.template !== null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateRegistryEntry.prototype, "isReady", {
            get: function () {
                return this.factory !== null;
            },
            enumerable: true,
            configurable: true
        });
        TemplateRegistryEntry.prototype.setTemplate = function (template) {
            var id = this.id, useResources, i, ii, current, src;
            this.template = template;
            useResources = template.content.querySelectorAll('require');
            this.dependencies = new Array(useResources.length);
            if (useResources.length === 0) {
                return;
            }
            for (i = 0, ii = useResources.length; i < ii; ++i) {
                current = useResources[i];
                src = current.getAttribute('from');
                if (!src) {
                    throw new Error("<require> element in " + this.id + " has no \"from\" attribute.");
                }
                this.dependencies[i] = new TemplateDependency(aurelia_path_1.relativeToFile(src, id), current.getAttribute('as'));
                if (current.parentNode) {
                    current.parentNode.removeChild(current);
                }
            }
        };
        TemplateRegistryEntry.prototype.setResources = function (resources) {
            this.resources = resources;
        };
        TemplateRegistryEntry.prototype.setFactory = function (factory) {
            this.factory = factory;
        };
        return TemplateRegistryEntry;
    })();
    exports.TemplateRegistryEntry = TemplateRegistryEntry;
});
