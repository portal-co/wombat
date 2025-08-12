import { _WeakMap } from "@portal-solutions/semble-weak-map";

const { bind, apply: nativeApply } = Function.prototype;

export const { defineProperty } = Object;

/**
 * uncurryThis()
 * Equivalent of: fn => (thisArg, ...args) => apply(fn, thisArg, args)
 *
 * See those reference for a complete explanation:
 * http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
 * which only lives at
 * http://web.archive.org/web/20160805225710/http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
 * 
 * Comment from https://github.com/endojs/endo/blob/master/packages/ses/src/commons.js
 *
 * @type {<F extends (this: any, ...args: any[]) => any>(fn: F) => ((thisArg: ThisParameterType<F>, ...args: Parameters<F>) => ReturnType<F>)}
 */
export const uncurryThis = bind.bind(bind.call);


/**
 * 
 * @type {<F extends (this: any, ...args: any[]) => any>(fn: F, thisArg: ThisParameterType<F>, args: Parameters<F>) => ReturnType<F>}
 */
export const apply = uncurryThis(nativeApply);


export const weakmapGet = uncurryThis(_WeakMap.prototype.get);
export const weakmapSet = uncurryThis(_WeakMap.prototype.set);