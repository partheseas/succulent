import { assertType } from "../_util";
import { is, or } from "../operators";
import { $boolean, $undefined } from "./constants";
import { $number } from "./number";
import { $object } from "./object";
import { $string } from "./string";
import { $tuple } from "./tuple";

test("$object", () => {
	// The type signature of Symbol.for isn't quite correct, so we have to
	// assign the symbol we use here as a constant even though the whole point
	// of Symbol.for is to return the same symbol when called with the same
	// string multiple times.
	const $k = Symbol();
	const k = "k";

	const example = $object({
		a: $boolean,
		b: $number,
		c: $string,
		d: $object({
			[$k]: $tuple($number, $number, $number, $number),
			[k]: $tuple($number, $number, $number, $number),
		}),
	});

	const x = {
		a: true,
		b: 1,
		c: "hi",
		d: {},
	};

	const $y = {
		...x,
		d: { [$k]: [0, 0, 0, 0] },
	};

	const y = {
		...x,
		d: { [k]: [0, 0, 0, 0] },
	};

	const z = {
		...x,
		d: {
			[$k]: [0, 0, 0, 0],
			[k]: [0, 0, 0, 0],
		},
	};

	expect(is(x, example)).toBe(false);
	expect(is($y, example)).toBe(false);
	expect(is(y, example)).toBe(false);
	expect(is(z, example)).toBe(true);

	type Example = { a: boolean; b: number; c: string; d: ExampleD };
	type ExampleD = { [$k]: Numbers; [k]: Numbers };
	type Numbers = [number, number, number, number];
	function _(x: unknown) {
		if (is(x, example)) assertType<Example, typeof x>(x);
	}
});

test("Using $object to match an existing type", () => {
	type Friend = { name: string };

	// Validates that the object has a key of name with type string
	is<Friend>({}, $object({ name: $string }));

	// @ts-expect-error
	// Doesn't have name!
	is<Friend>({}, $object({ count: $number }));

	// Extra properties are fine
	is<Friend>({}, $object({ name: $string, count: $number }));

	// @ts-expect-error
	// string | undefined is not assignable to type string
	is<Friend>({}, $object({ name: or($undefined, $string) }));

	// This one works fine, because we're using Partial<Friend> instead of Friend
	is<Partial<Friend>>({}, $object({ name: or($undefined, $string) }));
});
