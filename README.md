# xmatch

Simple pattern matching for ES6 (no transpilation!)

## Simple usage

```javascript
const { match } = require('xmatch');

match(obj, [
	({ x }) => console.log('x', x),
	({ y }) => console.log('y', y),
	({ z }) => console.log('z', z),
	// Exhaustive match; will throw UnmatchedPatternError unless uncommented:
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
