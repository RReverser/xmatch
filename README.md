# xmatch

Simple pattern matching for ES6 (no transpilation!)

## Simple usage

```javascript
const { match } = require('xmatch');

match(obj, [
	({ x }) => console.log('x', x),
	({ y }) => console.log('y', y),
	({ z }) => console.log('z', z),
	// Exhaustive match; will throw `xmatch.UnmatchedPatternError` unless uncommented:
	// other => console.error('Something else', other),
]);
```

## Custom guards

```javascript
const { match, guard } = require('xmatch');

match(obj, [
	({ command }) => {
		// When you want to match simple values:
		guard(command === 'ignore');
		/* Do nothing */
	},
	({ command }) => {
		// Or, say, match result of regex:
		let [, name, args] = guard(command.match(/^(\w+):(.*)$/));
		console.log({ name, args });
	},
	({ command }) => {
		throw new Error(`Invalid command: ${command}`);
	},
]);
```

## Shape assertions

```javascript
const { guard } = require('xmatch');

const { x, y } = guard({ x: 1, y: 2 }); // OK
const { x, y } = guard({ x: 1, z: 2 }); // throws `xmatch.UnmatchedPatternError`
```

## Known issues

*   You can't use literals directly in patterns (this is limitation of ES6 syntax, can be fixed as part of https://github.com/tc39/proposal-pattern-matching).
*   You can't use default values for parameters. This is limitation of the way matching is implemented, and you'll have to resolve defaults yourself if that's what you want.
*   Nested match will propagate to outer matches just like guards, causing "parent" branches to be unmatched. I consider this as a feature, but let me know if you think a different behaviour makes sense.
*   Trying to further destructure or access undefined propertie of an object will also trigger the match guard ([#1](https://github.com/RReverser/xmatch/issues/1)). This is tricky to workaround without changing the syntax, but I'll look into it (and happy to hear any suggestions).
*   This uses dynamic metaprogramming via [`Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) which might have undesirable performance effect on hot code paths. If your benchmarks suggest it's causing critical performance issues, consider using transpiler plugins instead.
*   `Proxy` is not implemented in pre-ES6 browsers and can't be polyfilled, so use this only if you're okay with the supported target set: https://caniuse.com/#feat=proxy
