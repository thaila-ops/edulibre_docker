"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = asyncHandler;
function asyncHandler(handler) {
    return (req, res, next) => {
        handler(req, res, next).catch(next);
    };
}
