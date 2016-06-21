// In various parts of FeatureMatrix requirements we allow people to enter
// versions of browsers. This uses a small DSL that allows for things like
// "IE 6-8", "Chrome 50+", "Firefox <5". This file contains a recursive
// descent parser for this grammar.
//
// The same grammar is used when referring to plugins, like "Flash 9+".

// small wrapper for an indexed string that we can pull characters from
class ParserInput {
	constructor(str) {
		this.str = str;
		this.pos = 0;
	}

	// we really *should* have a lexing/token stream parsing but for
	// something as simple as this it's just easier to explicitly ignore
	// whitespace where needed
	ignoreWhitespace() {
		while (this.peek() == ' ') {
			this.take();
		}
	}

	peek(regex = /.*/) {
		if (this.pos >= this.str.length || !regex.test(this.str[this.pos])) {
			return null;
		} else {
			return this.str[this.pos];
		}
	}

	take() {
		return this.str[this.pos++];
	}
}

// parses as many characters that match the given regex as possible
function parseRepeated(input, regex) {
	let value = null;

	input.ignoreWhitespace();

	while (input.peek(regex) != null) {
		value = (value || '') + input.take();
	}

	input.ignoreWhitespace();

	return value;
}

function parseNumber(input) {
	let parsed = parseRepeated(input, /[0-9]/);

	if (parsed == null) {
		return null;
	} else {
		return parseFloat(parsed);
	}
}

function parseProductName(input) {
	return parseRepeated(input, /[a-zA-Z]/);
}

function parseVersionString(input) {
	let preOp = null;

	input.ignoreWhitespace();

	if (input.peek() == '<' || input.peek() == '>') {
		preOp = input.take();
	}

	let minVersion = parseNumber(input);
	if (minVersion == null) {
		return null;
	}

	// early exit if we've used a preOp, as >IE8-10 wouldn't make sense
	if (preOp == '>') {
		return { min: minVersion + 1, max: Number.MAX_VALUE };
	} else if (preOp == '<') {
		return { min: 0, max: minVersion - 1 };
	}

	let maxVersion = null;	
	if (input.peek() == '+') {
		// can either be a '+'' to indicate that it's that version and up,
		input.take();
		maxVersion = Number.MAX_VALUE;
	} else if (input.peek() == '-') {
		// a '-' to indicate that we've got another version coming,
		input.take();

		maxVersion = parseNumber(input);
		if (maxVersion == null) {
			return null;
		}
	} else {
		// or nothing to indicate that it's just that particular version
		maxVersion = minVersion;
	}

	return {
		min: minVersion,
		max: maxVersion
	};
}

export default function parseProductVersionString(str) {
	let input = new ParserInput(str);
	let product = parseProductName(input);

	if (!product) {
		return null;
	}

	let versions = parseVersionString(input);
	if (!versions) {
		versions = {
			min: 0, 
			max: Number.MAX_VALUE
		};
	}

	input.ignoreWhitespace();

	// we should be at end of string now, if we aren't then it's invalid syntax
	if (input.peek() != null) {
		return null;
	}

	return { product, versions };
}
