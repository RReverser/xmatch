'use strict';

class UnmatchedPatternError extends Error {
	constructor() {
		super('Unmatched pattern');
	}
}

const UNMATCHED = new UnmatchedPatternError();

function guard(condition) {
	if (!condition) {
		throw UNMATCHED;
	}
	// in case you want to further destructure
	return wrap(condition);
}

const TRAPS = {
	get(target, prop, receiver) {
		let result = Reflect.get(target, prop, receiver);
		guard(result !== undefined);
		if (prop === Symbol.iterator) {
			return function () {
				let iter = result.apply(this, arguments);
				let done = false;
				return {
					next() {
						let value;
						if (!done) {
							({ value, done } = iter.next());
						}
						return { value, done };
					},
					return(value) {
						if (!done) {
							done = iter.next().done;
							if (!done) {
								// tried to bail early even though we have elements
								throw UNMATCHED;
							}
						}
						return { value, done };
					}
				};
			};
		}
		return wrap(result);
	},
};

let wrapCache = new WeakMap();

function wrap(obj) {
	if (typeof obj !== 'object' || obj === null) {
		return obj;
	}
	let proxy = wrapCache.get(obj);
	if (proxy === undefined) {
		wrapCache.set(obj, (proxy = new Proxy(obj, TRAPS)));
	}
	return proxy;
}

function match(obj, matchers) {
	for (let matcher of matchers) {
		try {
			return matcher(wrap(obj));
		} catch (e) {
			if (e !== UNMATCHED) {
				throw e;
			}
		}
	}
	throw UNMATCHED;
}

module.exports = {
	match,
	guard,
	UnmatchedPatternError,
};
