define(["require", "exports"], function (require, exports) {
    var Utilities = (function () {
        function Utilities() {
        }
        Utilities.getValue = function (val) {
            if (val !== undefined && typeof (val) === 'function') {
                return val();
            }
            return val;
        };
        Utilities.isEmptyValue = function (val) {
            if (val === undefined) {
                return true;
            }
            if (val === null) {
                return true;
            }
            if (val === "") {
                return true;
            }
            if (typeof (val) === 'string') {
                if (String.prototype.trim) {
                    val = val.trim();
                }
                else {
                    val = val.replace(/^\s+|\s+$/g, '');
                }
            }
            if (val.length !== undefined) {
                return 0 === val.length;
            }
            return false;
        };
        return Utilities;
    })();
    exports.Utilities = Utilities;
    ;
});
