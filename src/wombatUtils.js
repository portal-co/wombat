// import { _WeakMap } from "@portal-solutions/semble-weak-map";

import { freeze } from './wombatSnapshots.js';

export * from './wombatSnapshots.js';

/**
 * Ensures the supplied argument is a number or if it is not (can not be coerced to a number)
 * this function returns null.
 * @param {*} maybeNumber
 * @return {?number}
 */
export function ensureNumber(maybeNumber) {
  try {
    switch (typeof maybeNumber) {
      case 'number':
      case 'bigint':
        return maybeNumber;
    }
    var converted = Number(maybeNumber);
    return !isNaN(converted) ? converted : null;
  } catch (e) {}
  return null;
}

/**
 * Sets the supplied object's toStringTag IFF
 * self.Symbol && self.Symbol.toStringTag are defined
 * @param {Object} clazz
 * @param {string} tag
 */
export function addToStringTagToClass(clazz, tag) {
  if (
    typeof self.Symbol !== 'undefined' &&
    typeof self.Symbol.toStringTag !== 'undefined'
  ) {
    Object.defineProperty(clazz.prototype, self.Symbol.toStringTag, {
      value: tag,
      enumerable: false
    });
  }
}

/**
 * Binds every function this, except the constructor, of the supplied object
 * to the instance of the supplied object
 * @param {Object} clazz
 */
export function autobind(clazz) {
  var proto = clazz.__proto__ || clazz.constructor.prototype || clazz.prototype;
  var clazzProps = Object.getOwnPropertyNames(proto);
  var len = clazzProps.length;
  var prop;
  var propValue;
  for (var i = 0; i < len; i++) {
    prop = clazzProps[i];
    propValue = clazz[prop];
    if (prop !== 'constructor' && typeof propValue === 'function') {
      clazz[prop] = propValue.bind(clazz);
    }
  }
}

/**
 * Because we overriding specific interfaces (e.g. Storage) that do not expose
 * an constructor only an interface object with our own we must have a way
 * to indicate to our overrides when it is proper to throw exceptions
 * @type {{yes: boolean}}
 */
export var ThrowExceptions = { yes: false };

/**
 *
 * Create a private key
 *
 * @type {(a: string) => WeakMap}
 */
export const wombatKey = a => {
  if ('WeakMap' in self) return (wombatKey[a] = wombatKey[a] ?? new WeakMap());
  const wb_key = '__WB_key_' + a;
  return (wombatKey[a] = wombatKey[a] ?? freeze({
    get(object) {
      return object[wb_key];
    },
    set(object, value) {
      object[wb_key] = value;
    },
    has(object) {
      return wb_key in object;
    }
  }));
};

export const wombatOrigApply = wombatKey('orig_apply');
export const proxyFn =
  'Proxy' in self
    ? (f, a) => {
        const { apply, construct } = Reflect;
        return new Proxy(a, {
          apply(target, self, args) {
            return f((...args) => apply(target, self, args))(...args);
          },
          construct(target, args, self) {
            return f((...args) => construct(target, args, self))(...args);
          }
        });
      }
    : (f, a) => f(a);
export const proxyThisFn =
  'Proxy' in self
    ? (f, a) => {
        const { apply, construct } = Reflect;
        return new Proxy(a, {
          apply(target, self, args) {
            return apply(
              f(function(...args) {
                return apply(target, this, args);
              }),
              self,
              args
            );
          },
          construct(target, args, self) {
            return apply(
              f(function(...args) {
                return construct(target, args, this);
              }),
              self,
              args
            );
          }
        });
      }
    : (f, a) => f(a);
