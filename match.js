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
	// in case you want to destructure or something
	return condition;
}

const TRAPS = {
	get(...args) {
		let result = Reflect.get(...args);
		guard(result !== undefined);
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
