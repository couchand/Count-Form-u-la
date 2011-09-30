/*
 * tests.js
 *
 *   Unit tests for Count Form-u-la jQuery plugin
 *
 *   Andrew Couch
 *   Fall 2011
 *
 *   Requires:
 *   - Q-Unit
 *   -   Modified by my patch to correct order of expected/actual in equality assertions
 *
 */

function globalSetup(){
	var f = $('<form></form>');

	f.append('<input type="text" class="i number in" id="a"/>');
	f.append('<input type="text" class="i number in" id="b"/>');
	f.append('<input type="text" class="i number in" id="c"/>');
	f.append('<input type="text" class="number out" id="r"/>');

	f.appendTo('#qunit-fixture');
}

  $(function(){

/*
module('Update QUnit');

test('order of expected/actual -- expected to fail!!', 1, function(){
	equal( 5, 6, 'Expected: 5 Actual: 6 is the expected message above.' );
});

test('require the number of expected assertions -- expected to fail!!', 1, function(){
	ok( false, 'there should be an uncaught exception just after this test' );
});
test('require the number of expected assertions -- not expected to even show up on the page!!', function(){
	ok( false, 'there should be an uncaught exception before this assertion' );
});
*/

test('Plugin hook created', 2, function(){
	var hook = $('<p></p>').formula;
	ok( hook,			'The plugin hook exists' );
	ok( $.isFunction( hook ),	'The hook is a function' );
});

module('Util', { setup: globalSetup });

test('copy unary', 1, function(){
	var	expected = 5, actual;

	// Start Test
	$.formula.copy.unary = true;
	actual = $.formula.copy( expected );
	// Stop Test

	equal( expected, actual, 'The value should be copied.' );

});

test('sum', 1, function(){
	var	i = { n1: 2, n2: 5, n3: -2 },
		expected = i.n1 + i.n2 + i.n3, actual;

	// Start Test
	actual = $.formula.sum( i );
	// Stop Test

	equal( expected, actual, 'the values should be summed' );
});

test('Resolve inputs - number', 2, function(){
	var	expected = 5, actual, $jQueryObject, temp,
		$field = $('#a'), widget;

	$field.formula();
	widget = $field.data('formula');

	// Start Test
	temp = widget._resolve_input( expected );

	actual = temp[0]; $jQueryObject = temp[1];
	// Stop Test

	equal( 0, $jQueryObject.length, 'no jQuery elements should be returned' );

	equal( expected, actual,	'resoving a num should yield the number itself' );
});

test('Resolve inputs - single selector', 6, function(){
	var	selector = '.out', actual, $jQueryObject, temp,
		$field = $('#a'), widget;

	$field.formula();
	widget = $field.data('formula');

	// Start Test
	temp = widget._resolve_input(selector);
	actual = temp[0]; $jQueryObject = temp[1];
	// Stop Test

	equal( 1, $jQueryObject.length, 'one jQuery element should be returned' );

	ok( 'undefined' !== typeof $jQueryObject.jquery,	'resolving a selector should yield a jQuery element'	);
	ok( $jQueryObject.is('input[type="text"]'),		'the right element should be found'			);
	ok( $jQueryObject.hasClass('number'),			'the right element should be found'			);

	equal( 'r', $jQueryObject.attr('id'),			'the proper element should be found'			);
	equal( 'r', actual.attr('id'),				'the proper element should be found'			);
});

test('Resolve inputs - multiple selector', 11, function(){
	var	selector = '.in', actual, $jQueryObject, temp,
		$field = $('#r'), widget;

	$field.formula();
	widget = $field.data('formula');

	// Start Test
	temp = widget._resolve_input(selector);
	actual = temp[0]; $jQueryObject = temp[1];
	// Stop Test

	ok( 'undefined' !== typeof $jQueryObject.jquery, 'resolving a selector should yield a jQuery element' );

	equal( 3, $jQueryObject.size(), 'three jQuery elements should be returned' );

	$jQueryObject.each(function(){

		var $e = $(this);

		ok( $e.is('input[type="text"]'),	'the right element should be found'	);
		ok( $e.hasClass('number'),		'the proper element should be found'	);
		ok( $e.hasClass('i'),			'the proper element should be found'	);

	});
});

test('Resolve inputs - object of numbers', 4, function(){

	var	expected_x = 7, expected_y = 9, actual, $jQueryObject, temp,
		$field = $('#r'), widget;

	$field.formula();
	widget = $field.data('formula');

	// Start Test
	temp = widget._resolve_input({ x: expected_x, y: expected_y });
	actual = temp[0]; $jQueryObject = temp[1];
	// Stop Test

	ok( 'undefined' !== typeof $jQueryObject.jquery,	'resolving a no selectors should yield an empty jQuery element'	);

	equal( 0, $jQueryObject.size(),				'no jQuery elements should be returned'				);

	equal( expected_x, actual.x,				'the input object values should be returned'			);
	equal( expected_y, actual.y,				'the input object values should be returned'			);

});

test("Resolve inputs - object of selectors", 10, function(){

	var expected = 7, selector_a = '#a', selector_r = '#r', actual, $jQueryObject, key, $input, temp,
		$field = $('#b'), widget;

	$field.formula();
	widget = $field.data('formula');

	$( selector_a ).val(expected);
	$( selector_r ).val(expected);

	// Start Test
	temp = widget._resolve_input({ a: selector_a, r: selector_r });
	actual = temp[0]; $jQueryObject = temp[1];
	// Stop Test

	equal( 2, $jQueryObject.size(), 'all selectors in the object should be added to the returned jquery wrapper' );

	for( key in actual ){
		$input = actual[key];

		equal( expected, $input.val(), 'Each selector in the object should be resolved to a jQuery object' );

		ok( $input.is('input[type="text"]'), 'the right element should be found' );
		ok( $input.hasClass('number'), 'the right element should be found' );
	}

	ok( actual.a.hasClass('in'), 'the right element should be found' );
	ok( actual.r.hasClass('out'), 'the right element should be found' );
	ok(
		(	$jQueryObject.first().hasClass('in') && $jQueryObject.last().hasClass('out')	)
			||
		(	$jQueryObject.first().hasClass('out') && $jQueryObject.last().hasClass('in')		),
		'the right elements should be found'
	  );

});

module('getPrecision - default behavior', { setup: globalSetup });

test('empty string', 1, function(){
	var	actual, widget = $('#r').formula().data('formula');

	// Start Test
	actual = widget._getPrecision('');
	// Stop Test

	equal( null, actual, 'the error code is null' );
});
test('text input', 1, function(){
	var	actual, test_string = 'foobar',
		widget = $('#r').formula().data('formula');

	// Start Test
	actual = widget._getPrecision( test_string );
	// Stop Test

	equal( null, actual, 'the error code is null' );
});
test('integer', 1, function(){
	var	actual, test_string = '2',
		widget = $('#r').formula().data('formula');

	// Start Test
	actual = widget._getPrecision( test_string );
	// Stop Test

	equal( 1, actual, 'the precision should be the number of significant figures' );
});
test('simple float', 1, function(){
	var	actual, test_string = '2.5',
		widget = $('#r').formula().data('formula');

	// Start Test
	actual = widget._getPrecision( test_string );
	// Stop Test

	equal( 2, actual, 'the precision should be the number of significant figures' );
});
test('negative float', 1, function(){
	var	actual, test_string = '-2.5',
		widget = $('#r').formula().data('formula');

	// Start Test
	actual = widget._getPrecision( test_string );
	// Stop Test

	equal( 2, actual, 'the precision should be the number of significant figures' );
});
test('trailing zeros after decimal point', 1, function(){
	var	actual, test_string = '800.0',
		widget = $('#r').formula().data('formula');

	// Start Test
	actual = widget._getPrecision( test_string );
	// Stop Test

	equal( 4, actual, 'zeros after the decimal point should always count'); 
});
test('trailing zeros no decimal point', 1, function(){
	var	actual, test_string = '800',
		widget = $('#r').formula().data('formula');

	// Start Test
	actual = widget._getPrecision( test_string );
	// Stop Test

	equal( 1, actual, 'zeros without a decimal point should not count' );
});
test('trailing zeros with decimal point', 1, function(){
	var	actual, test_string = '800.',
		widget = $('#r').formula().data('formula');

	// Start Test
	actual = widget._getPrecision( test_string );
	// Stop Test

	equal( 3, actual, 'zeros before the decimal point should count'); 
});


module('getPrecision - assume zeros are significant', { setup: globalSetup });

test('trailing zeros after decimal point', 1, function(){
	var	actual, test_string = '800.0',
		widget = $('#r').formula({ precisionMode: 'assumeZeros' }).data('formula');

	// Start Test
	actual = widget._getPrecision( test_string );
	// Stop Test

	equal( 4, actual, 'zeros after the decimal point should always count'); 
});
test('trailing zeros no decimal point', 1, function(){
	var	actual, test_string = '800',
		widget = $('#r').formula({ precisionMode: 'assumeZeros' }).data('formula');

	// Start Test
	actual = widget._getPrecision( test_string );
	// Stop Test

	equal( 3, actual, 'zeros without a decimal point should count when set' );
});
test('trailing zeros with decimal point', 1, function(){
	var	actual, test_string = '800.',
		widget = $('#r').formula({ precisionMode: 'assumeZeros' }).data('formula');

	// Start Test
	actual = widget._getPrecision( test_string );
	// Stop Test

	equal( 3, actual, 'zeros before the decimal point should count'); 
});

module('getPrecision - only count decimal places', { setup: globalSetup });

test('integer', 1, function(){
	var	actual, test_string = '2',
		widget = $('#r').formula({ precisionMode: 'decimalPlaces' }).data('formula');

	// Start Test
	actual = widget._getPrecision( test_string );
	// Stop Test

	equal( 0, actual, 'the precision should be the number of decimal places' );
});
test('simple float', 1, function(){
	var	actual, test_string = '2.5',
		widget = $('#r').formula({ precisionMode: 'decimalPlaces' }).data('formula');

	// Start Test
	actual = widget._getPrecision( test_string );
	// Stop Test

	equal( 1, actual, 'the precision should be the number of decimal places' );
});
test('negative float', 1, function(){
	var	actual, test_string = '-2.5',
		widget = $('#r').formula({ precisionMode: 'decimalPlaces' }).data('formula');

	// Start Test
	actual = widget._getPrecision( test_string );
	// Stop Test

	equal( 1, actual, 'the precision should be the number of decimal places' );
});
test('trailing zeros after decimal point', 1, function(){
	var	actual, test_string = '800.0',
		widget = $('#r').formula({ precisionMode: 'decimalPlaces' }).data('formula');

	// Start Test
	actual = widget._getPrecision( test_string );
	// Stop Test

	equal( 1, actual, 'zeros after the decimal point should always count'); 
});
test('trailing zeros no decimal point', 1, function(){
	var	actual, test_string = '800',
		widget = $('#r').formula({ precisionMode: 'decimalPlaces' }).data('formula');

	// Start Test
	actual = widget._getPrecision( test_string );
	// Stop Test

	equal( 0, actual, 'zeros without a decimal point should not count' );
});
test('trailing zeros with decimal point', 1, function(){
	var	actual, test_string = '800.',
		widget = $('#r').formula({ precisionMode: 'decimalPlaces' }).data('formula');

	// Start Test
	actual = widget._getPrecision( test_string );
	// Stop Test

	equal( 0, actual, 'zeros before the decimal point should not count'); 
});


module('setPrecision - default behavior', { setup: globalSetup });

test('integer not cut off', 1, function(){
	var	test_val = 8769, expected = '' + test_val, precision = 4, actual,
		widget = $('#r').formula().data('formula');

	// Start Test
	actual = widget._setPrecision( test_val, precision );
	// Stop Test

	equal( expected, actual, 'the integer should pass through' );
});
test('integer rounded up', 1, function(){
	var	test_val = 8765, expected = '8770', precision = 3, actual,
		widget = $('#r').formula().data('formula');

	// Start Test
	actual = widget._setPrecision( test_val, precision );
	// Stop Test

	equal( expected, actual, 'the number should be rounded to three significant figures' );
});
test('integer rounded down', 1, function(){
	var	test_val = 8764, expected = '8760', precision = 3, actual,
		widget = $('#r').formula().data('formula');

	// Start Test
	actual = widget._setPrecision( test_val, precision );
	// Stop Test

	equal( expected, actual, 'the number should be rounded to three significant figures' );
});
test('float not cut off', 1, function(){
	var	test_val = 876.9, expected = '' + test_val, precision = 4, actual,
		widget = $('#r').formula().data('formula');

	// Start Test
	actual = widget._setPrecision( test_val, precision );
	// Stop Test

	equal( expected, actual, 'the float should pass through' );
});
test('float rounded up', 1, function(){
	var	test_val = 876.50, expected = '877', precision = 3, actual,
		widget = $('#r').formula().data('formula');

	// Start Test
	actual = widget._setPrecision( test_val, precision );
	// Stop Test

	equal( expected, actual, 'the number should be rounded to three significant figures' );
});
test('float rounded down', 1, function(){
	var	test_val = 876.49, expected = '876', precision = 3, actual,
		widget = $('#r').formula().data('formula');

	// Start Test
	actual = widget._setPrecision( test_val, precision );
	// Stop Test

	equal( expected, actual, 'the number should be rounded to three significant figures' );
});


module("One selector input", { setup: globalSetup });

test("one in one out", 2, function(){

	var $a = $('#a'), $r = $('#r'), init_val = 3, test_val = 7;

	$r.val(init_val);
	$a.val(init_val);

	// Start Test
	$r.formula({ input: '#a'});

	$a.val(test_val).blur();
	// Stop Test

	equal( test_val, $r.val(), 'the test string should be transferred' );

	ok( $r.attr('disabled'), 'the output field should be disabled.' );

});

test("one in many out", 3, function(){

	var $jQueryObject = $('.in'), $o = $('#r'), init_val = 3, test_val = 7;

	$jQueryObject.val(init_val);
	$o.val(init_val);

	// Start Test
	$jQueryObject.formula({ input: '#r'});

	$o.val(test_val).blur();
	// Stop Test

	$jQueryObject.each(function(){
		equal( test_val, $(this).val(), 'the test string should be transferred' );
	});

});

module('Handle malformed inputs', { setup: globalSetup });

test('empty values', 3, function(){

	var	a_sel = '#a',
		$a = $(a_sel), $r = $('#r'),
		init_val = 4;

	$('.in').val(init_val);
	$r.val(init_val);

	// Start Test
	$r.formula({ input: '.in', formula: util.sum });

	$a.val('').blur();
	// Stop Test

	ok( $.isNaN( $r.val() ), 'The output should not get NaN.' );
	notEqual( 'NaN' !== $r.val(), 'empty values should be gracefully handled.' );
	notEqual( init_val, $r.val(), 'event should still update the output' );

});

module("One selector and function input", { setup: globalSetup });

test("basic input function", 1, function(){

	var	a_sel = '#a',
		$a = $(a_sel), $r = $('#r'),
		init_val = 3, test_val = 7,
		expected_val = 2 + test_val,
		test_func = function(input){ return (2 + input); };

	$r.val(init_val);
	$a.val(init_val);

	// Start Test
	$r.formula({ input: a_sel, formula: test_func });

	$a.val(test_val).blur();
	// Stop Test

	equal( expected_val, $r.val(), 'the function should be applied' );

});

test('aggregate input function', 3, function(){

	var	input_sel = '.in',
		$a = $('#a'), $b = $('#b'), $c = $('#c'), $r = $('#r'),
		init_val = 3,
		test_val_a = 7, test_val_b = 9, test_val_c = 4,
		expected_value_1 = test_val_a + init_val   + init_val,
		expected_value_2 = test_val_a + test_val_b + init_val,
		expected_value_3 = test_val_a + test_val_b + test_val_c,
		actual_value_1, actual_value_2, actual_value_3;

	$r.val(init_val);
	$(input_sel).val(init_val);

	// Start Test
	$r.formula({
		input: input_sel,
		formula: function(inputs){
			var sum = 0;
			$.each(inputs, function(k, v){
				sum = sum + v;
			});

			console.log(sum);

			return sum;
		}
	});

	$a.val(test_val_a).blur();
	actual_value_1 = $r.val();

	$b.val(test_val_b).blur();
	actual_value_2 = $r.val();

	$c.val(test_val_c).blur();
	actual_value_3 = $r.val();
	// Stop Test

	equal(expected_value_1, actual_value_1, 'the function should be continuously applied.');
	equal(expected_value_2, actual_value_2, 'the function should be continuously applied.');
	equal(expected_value_3, actual_value_3, 'the function should be continuously applied.');

});

module('One selector and constant inputs', { setup: globalSetup });

test('add constant value', 1, function(){

	var	a_sel = '#a', $a = $(a_sel), $r = $('#r'),
		init_val = 3, constant_val = 2, test_val = 7, expected_val = test_val + constant_val, actual_val;

	$r.val(init_val);
	$a.val(init_val);

	// Start Test
	$r.formula({
		input: { a: a_sel, b: constant_val },
		formula: function(ins){ return ins.a + ins.b; }
	});

	$a.val(test_val).blur();

	actual_val = $r.val();
	// Stop Test

	equal( expected_val, actual_val, 'the constant val should be pulled from the input' );

});


module('Multiple selector inputs and function', { setup: globalSetup });



/*
test('complex input function', function(){

	var	input_sel = '.in',
		$a = $('#a'), $b = $('#b'), $c = $('#c'), $r = $('#r'),
		init_val = 3,
		test_val_a = 7, test_val_b = 9, test_val_c = 4,
		expected_value_1 = test_val_a + test_val_a + init_val   - init_val,
		expected_value_2 = test_val_a + test_val_a + test_val_b - init_val,
		expected_value_3 = test_val_a + test_val_a + test_val_b - test_val_c,
		test_inputs = {
			a: '#a',
			c: '#c',
			inputs: input_sel
		},
		test_func = function(i){
			return i.a + sum(i.inputs) - 2*i.c;
		};

	$r.val(init_val);
	$(input_sel).val(init_val);

	$r.live_formula(test_inputs, test_func);

	$a.val(test_val_a).blur();
	equal(expected_value_1, $r.val(), 'the function should be continuously applied.');

	$b.val(test_val_b).blur();
	equal(expected_value_2, $r.val(), 'the function should be continuously applied.');

	$c.val(test_val_c).blur();
	equal(expected_value_3, $r.val(), 'the function should be continuously applied.');

});
*/
module('aggregate input helpers', { setup: globalSetup });

test('avg', 3, function(){

	var	input_sel = '.in',
		$a = $('#a'), $b = $('#b'), $c = $('#c'), $r = $('#r'),
		init_val = 3,
		test_val_a = 7, test_val_b = 9, test_val_c = 4,
		expected_value_1 = (test_val_a + init_val   + init_val  )/3,
		expected_value_2 = (test_val_a + test_val_b + init_val  )/3,
		expected_value_3 = (test_val_a + test_val_b + test_val_c)/3,
		actual_value_1, actual_value_2, actual_value_3;

	$r.val(init_val);
	$(input_sel).val(init_val);

	// Start Test
	$r.formula({
		input:		input_sel,
		formula:	$.formula.avg
	});

	$a.val(test_val_a).blur();
	actual_value_1 = $r.val();

	$b.val(test_val_b).blur();
	actual_value_2 = $r.val();

	$c.val(test_val_c).blur();
	actual_value_3 = $r.val();
	// Stop Test

	equal(expected_value_1, actual_value_1, 'the function should be continuously applied.');
	equal(expected_value_2, actual_value_2, 'the function should be continuously applied.');
	equal(expected_value_3, actual_value_3, 'the function should be continuously applied.');

});

test('sum', 3, function(){

	var	input_sel = '.in',
		$a = $('#a'), $b = $('#b'), $c = $('#c'), $r = $('#r'),
		init_val = 3,
		test_val_a = 7, test_val_b = 9, test_val_c = 4,
		expected_value_1 = test_val_a + init_val   + init_val,
		expected_value_2 = test_val_a + test_val_b + init_val,
		expected_value_3 = test_val_a + test_val_b + test_val_c,
		actual_value_1, actual_value_2, actual_value_3;

	$r.val(init_val);
	$(input_sel).val(init_val);

	// Start Test
	$r.formula({
		input: input_sel,
		formula: $.formula.sum
	});

	$a.val(test_val_a).blur();
	actual_value_1 = $r.val();

	$b.val(test_val_b).blur();
	actual_value_2 = $r.val();

	$c.val(test_val_c).blur();
	actual_value_3 = $r.val();
	//Stop Test

	equal(expected_value_1, actual_value_1, 'the function should be continuously applied.');
	equal(expected_value_2, actual_value_2, 'the function should be continuously applied.');
	equal(expected_value_3, actual_value_3, 'the function should be continuously applied.');

});

test('max', 3, function(){

	var	input_sel = '.in',
		$a = $('#a'), $b = $('#b'), $c = $('#c'), $r = $('#r'),
		init_val = 3,
		test_val_a = 7, test_val_b = 9, test_val_c = 4,
		expected_value_1 = Math.max(test_val_a, init_val,   init_val  ),
		expected_value_2 = Math.max(test_val_a, test_val_b, init_val  ),
		expected_value_3 = Math.max(test_val_a, test_val_b, test_val_c),
		actual_value_1, actual_value_2, actual_value_3;

	$r.val(init_val);
	$(input_sel).val(init_val);

	// Start Test
	$r.formula({
		input: input_sel,
		formula: $.formula.max
	});

	$a.val(test_val_a).blur();
	actual_value_1 = $r.val();

	$b.val(test_val_b).blur();
	actual_value_2 = $r.val();

	$c.val(test_val_c).blur();
	actual_value_3 = $r.val();
	// Stop Test

	equal(expected_value_1, actual_value_1, 'the function should be continuously applied.');
	equal(expected_value_2, actual_value_2, 'the function should be continuously applied.');
	equal(expected_value_3, actual_value_3, 'the function should be continuously applied.');

});

test('min', 3, function(){

	var	input_sel = '.in',
		$a = $('#a'), $b = $('#b'), $c = $('#c'), $r = $('#r'),
		init_val = 3,
		test_val_a = 7, test_val_b = 9, test_val_c = 4,
		expected_value_1 = Math.min(test_val_a, init_val,   init_val  ),
		expected_value_2 = Math.min(test_val_a, test_val_b, init_val  ),
		expected_value_3 = Math.min(test_val_a, test_val_b, test_val_c),
		actual_val_1, actual_val_2, actual_val_3;

	$r.val(init_val);
	$(input_sel).val(init_val);

	// Start Test
	$r.formula({
		input: input_sel,
		formula: $.formula.min
	});

	$a.val(test_val_a).blur();
	actual_val_1 = $r.val();

	$b.val(test_val_b).blur();
	actual_val_2 = $r.val();

	$c.val(test_val_c).blur();
	actual_val_3 = $r.val();
	// Stop Test

	equal(expected_value_1, actual_val_1, 'the function should be continuously applied.');
	equal(expected_value_2, actual_val_2, 'the function should be continuously applied.');
	equal(expected_value_3, actual_val_3, 'the function should be continuously applied.');

});

test('count', 3, function(){

	var	input_sel = '.in',
		$a = $('#a'), $b = $('#b'), $c = $('#c'), $r = $('#r'),
		init_val = 3,
		test_val_a = 7, test_val_b = 9, test_val_c = 4,
		actual_val_1, actual_val_2, actual_val_3;

	$r.val(init_val);
	$(input_sel).val(init_val);

	// Start Test
	$r.formula({
		input: input_sel,
		formula: $.formula.count
	});

	$a.val(test_val_a).blur();
	actual_val_1 = $r.val();

	$b.val(test_val_b).blur();
	actual_val_2 = $r.val();

	$c.val(test_val_c).blur();
	actual_val_3 = $r.val();
	//Stop Test

	equal(3, actual_val_1, 'the function should be continuously applied.');
	equal(3, actual_val_2, 'the function should be continuously applied.');
	equal(3, actual_val_3, 'the function should be continuously applied.');

});

module('Precision', { setup: globalSetup });

test('set precision on single selector', 2, function(){

	var a_sel = '#a', $a = $(a_sel), $r = $('#r');

	$r.live_formula(a_sel, util.copy, { precision: 'lowest' });
	$a.val( 2.5 ).blur();

	equal( 2, $a.data( 'form-u-la.precision' ), 'the precision should be set in the input element data' );
	equal( 2, $r.data( 'form-u-la.precision' ), 'the precision should be set in the output element data' );

});

test('set precision on multiple selector', 4, function(){

	var in_sel = '.in', $jQueryObjectnputs = $(in_sel), $r = $('#r');

	$r.live_formula(in_sel, util.sum, { precision: 'lowest' });
	$jQueryObjectnputs.val( 2.5 ).first().blur();

	$jQueryObjectnputs.each(function(){
		equal( 2, $(this).data( 'form-u-la.precision' ), 'the precision should be set in each input element data' );
	});
	equal( 2, $r.data( 'form-u-la.precision' ), 'the precision should be set in the output element data' );

});

test('set precision on object of inputs', 4, function(){

	var	a_sel = '#a', $a = $(a_sel),
		b_sel = '#b', $b = $(b_sel),
		c_sel = '#c', $c = $(c_sel),
		$jQueryObjectnputs = $('.in'),
		$r = $('#r');

	$r.live_formula({ a: a_sel, b: b_sel, c: c_sel }, util.sum, { precision: 'lowest' });
	$jQueryObjectnputs.val( 2.5 ).first().blur();

	$jQueryObjectnputs.each(function(){
		equal( 2, $(this).data( 'form-u-la.precision' ), 'the precision should be set in each input element data' );
	});
	equal( 2, $r.data( 'form-u-la.precision' ), 'the precision should be set in the output element data' );

});

test('truncate output to precision', 1, function(){

	var	a_sel = '#a', $a = $(a_sel),
		b_sel = '#b', $b = $(b_sel),
		$r = $('#r');

	$r.live_formula({ a: a_sel, b: b_sel }, function(i){
		return (i.a + i.b)/2;
	}, { precision: 'lowest' });
	$a.val( "2.5" );
	$b.val( "3.0" ).blur();

	equal( "2.8", $r.val(), 'the output should be truncated to the precision' );

});

module("Named inputs", { setup: globalSetup });

test("One selector one number", 1, function(){

	var $a = $('#a'), $b = $('#b'), $r = $('#r'), init_val = 3, test_val = 7, test_constant = 2, expected_val = test_val + test_constant, add;

	$r.val(init_val);
	$a.val(init_val);
	$b.val(test_constant);

	$r.live_formula({ a: '#a', b: '#b' }, function(inputs){ return (inputs.a + inputs.b); });

	$a.val(test_val).blur();

	equal( expected_val, $r.val(), 'the function should be applied to the named arguments' );

});

module('Multiple formulas', { setup: globalSetup });

test('Two parallel copy formulas', 2, function(){

	var $a = $('#a'), $b = $('#b'), $c = $('#c'), $r = $('#r'), init_val = 3, test_val_a = 7, test_val_b = 9;

	$a.val(init_val);
	$b.val(init_val);
	$c.val(init_val);
	$r.val(init_val);

	$c.live_formula('#a');
	$r.live_formula('#b');

	$a.val(test_val_a).blur();
	$b.val(test_val_b).blur();

	equal( test_val_a, $c.val(), 'the formulas should not interfere.' );
	equal( test_val_b, $r.val(), 'the formulas should not interfere.' );

});

test('Two serial copy formulas', 2, function(){

	var $a = $('#a'), $b = $('#b'), $c = $('#c'), $r = $('#r'), init_val = 3, test_val = 7;

	$a.val(init_val);
	$b.val(init_val);
	$c.val(init_val);
	$r.val(init_val);

	$c.live_formula('#a');
	$r.live_formula('#c');

	$a.val(test_val).blur();

	equal( test_val, $c.val(), 'the formulas should not interfere.' );
	equal( test_val, $r.val(), 'the formulas should follow-on.' );

});

module('Liveness', { setup: globalSetup });

test('add class after formula', 4, function(){

	var	test_cls = 'my-test-class',
		test_sel = '.' + test_cls,
		$a = $('#a'),
		$b = $('#b'),
		$c = $('#c'),
		$r = $('#r'),
		init_val = 3,
		test_val_a = 7, test_val_b = 9, test_val_c = 4,
		expected_value_1 = test_val_a,
		expected_value_2 = test_val_a + test_val_b,
		expected_value_3 = test_val_a + test_val_b + test_val_c,
		expected_value_4 = test_val_b + test_val_c;

	$('input').val(init_val);

	$a.addClass(test_cls);
	$r.live_formula(test_sel,util.sum);

	$a.val(test_val_a).blur();
	equal( expected_value_1, $r.val(), 'the formula should be applied to elements on the page' );

	$b.addClass(test_cls).val(test_val_b).blur();
	equal( expected_value_2, $r.val(), 'the formula should be applied to new elements' );

	$c.addClass(test_cls).val(test_val_c).blur();
	equal( expected_value_3, $r.val(), 'the formula should be applied to new elements' );

	$a.removeClass(test_cls);
	$b.blur();
	equal( expected_value_4, $r.val(), 'the formula should not be applied to removed elements' );

});

test('add elements after formula', 4, function(){

	var	test_cls = 'my-test-class',
		test_sel = '.' + test_cls,
		new_el_id = 'new-el',
		new_el_sel = '#' + new_el_id,
		$a = $('#a'),
		$b = $('<input type="text" class="' + test_cls + '">'),
		c = '<input type="text" class="' + test_cls + '" id="' + new_el_id + '">',
		$r = $('#r'),
		init_val = 3,
		test_val_a = 7, test_val_b = 9, test_val_c = 4,
		expected_value_1 = test_val_a,
		expected_value_2 = test_val_a + test_val_b,
		expected_value_3 = test_val_a + test_val_b + test_val_c,
		expected_value_4 = test_val_b + test_val_c;

	$('input').val(init_val);

	$a.addClass(test_cls);
	$r.live_formula(test_sel,util.sum);

	$a.val(test_val_a).blur();
	equal( expected_value_1, $r.val(), 'the formula should be applied to elements on the page' );

	$b.appendTo('form').val(test_val_b).blur();
	equal( expected_value_2, $r.val(), 'the formula should be applied to new elements' );

	$('form').append(c);
	$(new_el_sel).val(test_val_c).blur();
	equal( expected_value_3, $r.val(), 'the formula should be applied to new elements' );

	$a.removeClass(test_cls);
	$b.blur();
	equal( expected_value_4, $r.val(), 'the formula should not be applied to removed elements' );

});

module("Options", { setup: globalSetup });

test("Set bind event", 1, function(){

	var $a = $('#a'), $r = $('#r'), init_val = 3, test_val = 7;

	$r.val(init_val);
	$a.val(init_val);

	$r.live_formula('#a', function(input){ return (input); }, { bind: 'keyup' });

	$a.val(test_val).keyup();

	equal( test_val, $r.val(), 'the newly bound event should activate the calculation' );

});

test('taintable', 2, function(){

	var $a = $('#a'), $r = $('#r'), init_val = 3, taint_val = 7, test_val = 9;

	$a.val(init_val);
	$r.val(init_val);

	$r.live_formula('#a', function(i){ return i[0]; }, { taintable: true });

	$r.val(taint_val).change();
	$a.val(test_val).blur();

	equal( taint_val, $r.val(), 'tainted values should not be updated.' );

	ok( !$r.attr('disabled'), 'the output field should not be disabled.' );

});


 });

