'use strict';

const { match, guard, UnmatchedPatternError } = require('./');
const assert = require('assert');

function test1(obj) {
	return match(obj, [
		({ foo }) => `foo ${foo}`,
		({ bar: { x } }) => `bar with x ${x}`,
		({ bar: { answer } }) => {
			guard(answer !== 42);
			return `bar without correct answer ${answer}`;
		},
		({ bar: { answer } }) => `bar with correct answer ${answer}`,
	]);
}

assert.strictEqual(test1({ foo: 10 }), 'foo 10');

assert.strictEqual(test1({ bar: { x: 20 } }), 'bar with x 20');

assert.strictEqual(
	test1({ bar: { answer: 30 } }),
	'bar without correct answer 30'
);

assert.strictEqual(
	test1({ bar: { answer: 40 } }),
	'bar without correct answer 40'
);

assert.throws(() => test1({ other: 50 }), UnmatchedPatternError);

function test2(obj) {
	return match(obj, [
		({ command }) => {
			// When you want to match simple values:
			guard(command === 'ignore');
			/* Do nothing */
		},
		({ command }) => {
			// Or, say, match result of regex:
			let [, name, arg] = guard(command.match(/^(\w+):(.*)$/));
			return {
				name,
				arg,
			};
		},
		({ command }) => {
			throw new Error(`Invalid command: ${command}`);
		},
		() => {
			throw new Error(`Invalid object`);
		},
	]);
}

assert.strictEqual(test2({ command: 'ignore' }), undefined);

assert.deepStrictEqual(test2({ command: 'abc:123' }), {
	name: 'abc',
	arg: '123',
});

assert.throws(
	() => test2({ command: 'whatever' }),
	Error,
	'Invalid command: whatever'
);

assert.throws(() => test2({}), Error, 'Invalid object');

assert.doesNotThrow(() => {
	let { x, y } = guard({ x: 10, y: 20 });
});

assert.throws(() => {
	let { x, y } = guard({ x: 10, z: 20 });
}, UnmatchedPatternError);

function test3(obj) {
	return match(obj, [
		([]) => 'empty',
		([x]) => `x=${x}`,
		([x, y]) => `x=${x},y=${y}`,
		([x, y, ...{ length }]) => `x=${x},y=${y},rest.length=${length}`,
	]);
}

assert.strictEqual(test3([]), 'empty');
assert.strictEqual(test3([10]), 'x=10');
assert.strictEqual(test3([10,20]), 'x=10,y=20');
assert.strictEqual(test3([10,20,30,40]), 'x=10,y=20,rest.length=2');
assert.throws(() => test3({}), UnmatchedPatternError);

assert.throws(() => match({ x: 1 }, [
	any => {
		match({ y: 2 }, []);
	},
	otherAny => {
		assert.fail('otherAny', 'any', 'Inner match failure should not cause invocation of the next branch', '!=');
	}
]), UnmatchedPatternError);
