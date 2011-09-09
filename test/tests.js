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
 *   - Fixtures
 *   -   Set up in index.html (should these be created dynamically? yes.) @TODO
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

test("Plugin hook created", 2, function(){
	var hook = $('<p></p>').live_formula;
	ok( hook, "The plugin hook exists" );
	ok( $.isFunction( hook ), "The hook is a function" );
});

module("Util", { setup: globalSetup });

test("Resolve inputs - number", 2, function(){
	var num = 5, i, $i;

	[i, $i] = util.resolve_input(num);

	equal( 0, $i.length, "no jQuery elements should be returned" );

	equal( num, i, "resoving a number should yield the number itself" );
});

test("Resolve inputs - single selector", 6, function(){
	var sel = ".out", i, $i;

	[i,$i] = util.resolve_input(sel);

	equal( 1, $i.length, "one jQuery element should be returned" );

	ok( 'undefined' !== typeof $i.jquery, 'resolving a selector should yield a jQuery element' );
	ok( $i.is('input[type="text"]'), 'the right element should be found' );
	ok( $i.hasClass('number'), 'the right element should be found' );

	equal( 'r', $i.attr('id'), 'the proper element should be found' );
	equal( 'r', i.attr('id'), 'the proper element should be found' );
});

test("Resolve inputs - multiple selector", 11, function(){
	var sel = ".in", i, $i;

	[i, $i] = util.resolve_input(sel);

	ok( 'undefined' !== typeof $i.jquery, 'resolving a selector should yield a jQuery element' );

	equal( 3, $i.size(), "three jQuery elements should be returned" );

	$i.each(function(){

		var $e = $(this);

		ok( $e.is('input[type="text"]'), 'the right element should be found' );
		ok( $e.hasClass('number'), 'the proper element should be found' );
		ok( $e.hasClass('i'), 'the proper element should be found' );

	});
});

test("Resolve inputs - object of numbers", 4, function(){

	var x_val = 7, y_val = 9, i, $i;

	[i, $i] = util.resolve_input({ x: x_val, y: y_val });

	ok( 'undefined' !== typeof $i.jquery, 'resolving a no selectors should yield an empty jQuery element' );

	equal( 0, $i.size(), "no jQuery elements should be returned" );

	equal( x_val, i.x, 'the input object values should be returned' );
	equal( y_val, i.y, 'the input object values should be returned' );

});

test("Resolve inputs - object of selectors", 10, function(){

	var test_val = 7, a_sel = '#a', r_sel = '#r', i, $i, k, $el;

	$(a_sel).val(test_val);
	$(r_sel).val(test_val);

	[i, $i] = util.resolve_input({ a: a_sel, r: r_sel });

	equal( 2, $i.size(), 'all selectors in the object should be added to the returned jquery wrapper' );

	for( k in i ){
		$el = i[k];

		equal( test_val, $el.val(), 'Each selector in the object should be resolved to a jQuery object' );

		ok( $el.is('input[type="text"]'), 'the right element should be found' );
		ok( $el.hasClass('number'), 'the right element should be found' );
	}

	ok( i.a.hasClass('in'), 'the right element should be found' );
	ok( i.r.hasClass('out'), 'the right element should be found' );
	ok( ($i.first().hasClass('in') && $i.last().hasClass('out')) || (i.first().hasClass('out') && $i.last().hasClass('in')),
		'the right elements should be found' );

});


module('getPrecision - default behavior', { setup: globalSetup });

test('empty string', 1, function(){
	equal( null, util.getPrecision(''), 'the error code is null' );
});
test('text input', 1, function(){
	equal( null, util.getPrecision('foobar'), 'the error code is null' );
});
test('integer', 1, function(){
	equal( 1, util.getPrecision('2'), 'the precision should be the number of significant figures' );
});
test('simple float', 1, function(){
	equal( 2, util.getPrecision('2.5'), 'the precision should be the number of significant figures' );
});
test('negative float', 1, function(){
	equal( 2, util.getPrecision('-2.5'), 'the precision should be the number of significant figures' );
});
test('trailing zeros after decimal point', 1, function(){
	equal( 4, util.getPrecision('800.0'), 'zeros after the decimal point should always count'); 
});
test('trailing zeros no decimal point', 1, function(){
	equal( 1, util.getPrecision('800'), 'zeros without a decimal point should not count' );
});
test('trailing zeros with decimal point', 1, function(){
	equal( 3, util.getPrecision('800.'), 'zeros before the decimal point should count'); 
});


module('getPrecision - assume zeros are significant', { setup: globalSetup });

test('trailing zeros after decimal point', 1, function(){
	equal( 4, util.getPrecision('800.0', 'assumeZeros'), 'zeros after the decimal point should always count'); 
});
test('trailing zeros no decimal point', 1, function(){
	equal( 3, util.getPrecision('800', 'assumeZeros'), 'zeros without a decimal point should count' );
});
test('trailing zeros with decimal point', 1, function(){
	equal( 3, util.getPrecision('800.'), 'zeros before the decimal point should count'); 
});

module('getPrecision - only count decimal places', { setup: globalSetup });

test('integer', 1, function(){
	equal( 0, util.getPrecision('2', 'decimalPlaces'), 'the precision should be the number of decimal places' );
});
test('simple float', 1, function(){
	equal( 1, util.getPrecision('2.5', 'decimalPlaces'), 'the precision should be the number of decimal places' );
});
test('negative float', 1, function(){
	equal( 1, util.getPrecision('-2.5', 'decimalPlaces'), 'the precision should be the number of decimal places' );
});
test('trailing zeros after decimal point', 1, function(){
	equal( 1, util.getPrecision('800.0', 'decimalPlaces'), 'zeros after the decimal point should always count'); 
});
test('trailing zeros no decimal point', 1, function(){
	equal( 0, util.getPrecision('800', 'decimalPlaces'), 'zeros without a decimal point should not count' );
});
test('trailing zeros with decimal point', 1, function(){
	equal( 0, util.getPrecision('800.', 'decimalPlaces'), 'zeros before the decimal point should not count'); 
});


module('setPrecision - default behavior', { setup: globalSetup });

test('integer not cut off', 1, function(){
	var ival = 8769, sval = '' + ival;
	equal( sval, util.setPrecision(ival, 4), 'the integer should pass through' );
});
test('integer rounded up', 1, function(){
	var ival = 8765, sval = '8770';
	equal( sval, util.setPrecision(ival, 3), 'the number should be rounded to three significant figures' );
});
test('integer rounded down', 1, function(){
	var ival = 8764, sval = '8760';
	equal( sval, util.setPrecision(ival, 3), 'the number should be rounded to three significant figures' );
});
test('float not cut off', 1, function(){
	var ival = 876.9, sval = '' + ival;
	equal( sval, util.setPrecision(ival, 4), 'the float should pass through' );
});
test('float rounded up', 1, function(){
	var ival = 876.50, sval = '877';
	equal( sval, util.setPrecision(ival, 3), 'the number should be rounded to three significant figures' );
});
test('float rounded down', 1, function(){
	var ival = 876.49, sval = '876';
	equal( sval, util.setPrecision(ival, 3), 'the number should be rounded to three significant figures' );
});


module("One selector input", { setup: globalSetup });

test("one in one out", 2, function(){

	var $a = $('#a'), $r = $('#r'), init_val = 3, test_val = 7;

	$r.val(init_val);
	$a.val(init_val);

	$r.live_formula('#a');

	$a.val(test_val).blur();

	equal( test_val, $r.val(), 'the test string should be transferred' );

	ok( $r.attr('disabled'), 'the output field should be disabled.' );

});

test("one in many out", 3, function(){

	var $i = $('.in'), $o = $('#r'), init_val = 3, test_val = 7;

	$i.val(init_val);
	$o.val(init_val);

	$i.live_formula('#r');

	$o.val(test_val).blur();

	$i.each(function(){
		equal( test_val, $(this).val(), 'the test string should be transferred' );
	});

});

module('Handle malformed inputs', { setup: globalSetup });

test('empty values', 2, function(){

	var	a_sel = '#a',
		$a = $(a_sel), $r = $('#r'),
		init_val = 4;

	$r.val(init_val);

	$r.live_formula('.in',util.sum);

	$a.val('').blur();

	ok( !$.isNaN( $r.val() ) && 'NaN' !== $r.val(), 'empty values should be gracefully handled.' );
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

	$r.live_formula(a_sel, test_func);

	$a.val(test_val).blur();

	equal( expected_val, $r.val(), 'the function should be applied' );

});

test('aggregate input function', 3, function(){

	var	input_sel = '.in',
		$a = $('#a'), $b = $('#b'), $c = $('#c'), $r = $('#r'),
		init_val = 3,
		test_val_a = 7, test_val_b = 9, test_val_c = 4,
		expected_value_1 = test_val_a + init_val   + init_val,
		expected_value_2 = test_val_a + test_val_b + init_val,
		expected_value_3 = test_val_a + test_val_b + test_val_c;

	$r.val(init_val);
	$(input_sel).val(init_val);

	$r.live_formula(input_sel, function(inputs){
		var sum = 0;
		$.each(inputs, function(k, v){
//console.log('s='+(sum+v)+', added '+v+' for '+k);
			sum = sum + v;
		});
		return sum;
	});

	$a.val(test_val_a).blur();
	equal(expected_value_1, $r.val(), 'the function should be continuously applied.');

	$b.val(test_val_b).blur();
	equal(expected_value_2, $r.val(), 'the function should be continuously applied.');

	$c.val(test_val_c).blur();
	equal(expected_value_3, $r.val(), 'the function should be continuously applied.');

});

module('One selector and constant inputs', { setup: globalSetup });

test('add constant value', 1, function(){

	var	a_sel = '#a', $a = $(a_sel), $r = $('#r'),
		init_val = 3, constant_val = 2, test_val = 7, expected_val = test_val + constant_val;

	$r.val(init_val);
	$a.val(init_val);

	$r.live_formula({ a: a_sel, b: constant_val }, function(ins){ return ins.a + ins.b; });

	$a.val(test_val).blur();

	equal( expected_val, $r.val(), 'the constant val should be pulled from the input' );

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
		expected_value_3 = (test_val_a + test_val_b + test_val_c)/3;

	$r.val(init_val);
	$(input_sel).val(init_val);

	$r.live_formula(input_sel,util.avg);

	$a.val(test_val_a).blur();
	equal(expected_value_1, $r.val(), 'the function should be continuously applied.');

	$b.val(test_val_b).blur();
	equal(expected_value_2, $r.val(), 'the function should be continuously applied.');

	$c.val(test_val_c).blur();
	equal(expected_value_3, $r.val(), 'the function should be continuously applied.');

});

test('sum', 3, function(){

	var	input_sel = '.in',
		$a = $('#a'), $b = $('#b'), $c = $('#c'), $r = $('#r'),
		init_val = 3,
		test_val_a = 7, test_val_b = 9, test_val_c = 4,
		expected_value_1 = test_val_a + init_val   + init_val,
		expected_value_2 = test_val_a + test_val_b + init_val,
		expected_value_3 = test_val_a + test_val_b + test_val_c;

	$r.val(init_val);
	$(input_sel).val(init_val);

	$r.live_formula(input_sel,util.sum);

	$a.val(test_val_a).blur();
	equal(expected_value_1, $r.val(), 'the function should be continuously applied.');

	$b.val(test_val_b).blur();
	equal(expected_value_2, $r.val(), 'the function should be continuously applied.');

	$c.val(test_val_c).blur();
	equal(expected_value_3, $r.val(), 'the function should be continuously applied.');

});

test('max', 3, function(){

	var	input_sel = '.in',
		$a = $('#a'), $b = $('#b'), $c = $('#c'), $r = $('#r'),
		init_val = 3,
		test_val_a = 7, test_val_b = 9, test_val_c = 4,
		expected_value_1 = Math.max(test_val_a, init_val,   init_val  ),
		expected_value_2 = Math.max(test_val_a, test_val_b, init_val  ),
		expected_value_3 = Math.max(test_val_a, test_val_b, test_val_c);

	$r.val(init_val);
	$(input_sel).val(init_val);

	$r.live_formula(input_sel,util.max);

	$a.val(test_val_a).blur();
	equal(expected_value_1, $r.val(), 'the function should be continuously applied.');

	$b.val(test_val_b).blur();
	equal(expected_value_2, $r.val(), 'the function should be continuously applied.');

	$c.val(test_val_c).blur();
	equal(expected_value_3, $r.val(), 'the function should be continuously applied.');

});

test('min', 3, function(){

	var	input_sel = '.in',
		$a = $('#a'), $b = $('#b'), $c = $('#c'), $r = $('#r'),
		init_val = 3,
		test_val_a = 7, test_val_b = 9, test_val_c = 4,
		expected_value_1 = Math.min(test_val_a, init_val,   init_val  ),
		expected_value_2 = Math.min(test_val_a, test_val_b, init_val  ),
		expected_value_3 = Math.min(test_val_a, test_val_b, test_val_c);

	$r.val(init_val);
	$(input_sel).val(init_val);

	$r.live_formula(input_sel,util.min);

	$a.val(test_val_a).blur();
	equal(expected_value_1, $r.val(), 'the function should be continuously applied.');

	$b.val(test_val_b).blur();
	equal(expected_value_2, $r.val(), 'the function should be continuously applied.');

	$c.val(test_val_c).blur();
	equal(expected_value_3, $r.val(), 'the function should be continuously applied.');

});

test('count', 3, function(){

	var	input_sel = '.in',
		$a = $('#a'), $b = $('#b'), $c = $('#c'), $r = $('#r'),
		init_val = 3,
		test_val_a = 7, test_val_b = 9, test_val_c = 4;

	$r.val(init_val);
	$(input_sel).val(init_val);

	$r.live_formula(input_sel,util.count);

	$a.val(test_val_a).blur();
	equal(3, $r.val(), 'the function should be continuously applied.');

	$b.val(test_val_b).blur();
	equal(3, $r.val(), 'the function should be continuously applied.');

	$c.val(test_val_c).blur();
	equal(3, $r.val(), 'the function should be continuously applied.');

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

	var in_sel = '.in', $inputs = $(in_sel), $r = $('#r');

	$r.live_formula(in_sel, util.sum, { precision: 'lowest' });
	$inputs.val( 2.5 ).first().blur();

	$inputs.each(function(){
		equal( 2, $(this).data( 'form-u-la.precision' ), 'the precision should be set in each input element data' );
	});
	equal( 2, $r.data( 'form-u-la.precision' ), 'the precision should be set in the output element data' );

});

test('set precision on object of inputs', 4, function(){

	var	a_sel = '#a', $a = $(a_sel),
		b_sel = '#b', $b = $(b_sel),
		c_sel = '#c', $c = $(c_sel),
		$inputs = $('.in'),
		$r = $('#r');

	$r.live_formula({ a: a_sel, b: b_sel, c: c_sel }, util.sum, { precision: 'lowest' });
	$inputs.val( 2.5 ).first().blur();

	$inputs.each(function(){
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

test('Two copy formulas', 2, function(){

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

