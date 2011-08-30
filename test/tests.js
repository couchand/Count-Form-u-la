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

  $(function(){

//function unitTests(){

/*test("Update QUnit", function(){
	equal( 5, 6, "Expected: 5 Actual: 6" );
});*/

test("Plugin hook created", function(){
	var hook = $('<p></p>').live_formula;
	ok( hook, "The plugin hook exists" );
	ok( $.isFunction( hook ), "The hook is a function" );
});

module("Util");

test("Resolve inputs - number", function(){
	var num = 5, i, $i;

	[i, $i] = util.resolve_input(num);

//	equal( 1, i.length, "one element should be returned" );
	equal( 0, $i.length, "no jQuery elements should be returned" );

	equal( num, i[0], "resoving a number should yield the number itself" );
});

test("Resolve inputs - single selector", function(){
	var sel = ".out", i, $i;

	[i,$i] = util.resolve_input(sel);

//	equal( 1, i.length, "one element should be returned" );
	equal( 1, $i.length, "one jQuery element should be returned" );

	ok( 'undefined' !== typeof $i.jquery, 'resolving a selector should yield a jQuery element' );
	ok( $i.is('input[type="text"]'), 'the right element should be found' );
	ok( $i.hasClass('number'), 'the right element should be found' );

	equal( 'r', $i.attr('id'), 'the right element should be found' );
	equal( 'r', i[0].attr('id'), 'the right element should be found' );
});

test("Resolve inputs - multiple selector", function(){
	var sel = ".in", i, $i;

	[i, $i] = util.resolve_input(sel);

//	equal( 1, i.length, "one element should be returned" );

	ok( 'undefined' !== typeof $i.jquery, 'resolving a selector should yield a jQuery element' );

	equal( 3, $i.size(), "three jQuery elements should be returned" );

	$i.each(function(){

		var $e = $(this);

		ok( $e.is('input[type="text"]'), 'the right element should be found' );
		ok( $e.hasClass('number'), 'the right element should be found' );
		ok( $e.hasClass('i'), 'the right element should be found' );

	});
});

test("Resolve inputs - object of numbers", function(){

	var x_val = 7, y_val = 9, i, $i;

	[i, $i] = util.resolve_input({ x: x_val, y: y_val });

	ok( 'undefined' !== typeof $i.jquery, 'resolving a no selectors should yield an empty jQuery element' );

	equal( 0, $i.size(), "no jQuery elements should be returned" );

//	equal( 2, i.length, 'two constant inputs should be returned' );

	equal( x_val, i.x, 'the input object values should be returned' );
	equal( y_val, i.y, 'the input object values should be returned' );

});

test("Resolve inputs - object of selectors", function(){

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

test("Set all - input fields", function(){

	var str = "test output string", sel = ".in", $el = $(sel);

	util.set_all( $el, str );

	$(sel).each(function(){

		equal( str, $(this).val(), 'all input fields should be set' );

	});

});


module("One selector input");

test("one in one out", function(){

	var $a = $('#a'), $r = $('#r'), init_val = 3, test_val = 7;

	$r.val(init_val);
	$a.val(init_val);

	$r.live_formula('#a');

	$a.val(test_val).blur();

	equal( test_val, $r.val(), 'the test string should be transferred' );

});

test("one in many out", function(){

	var $i = $('.in'), $o = $('#r'), init_val = 3, test_val = 7;

	$i.val(init_val);
	$o.val(init_val);

	$i.live_formula('#r');

	$o.val(test_val).blur();

	$i.each(function(){
		equal( test_val, $(this).val(), 'the test string should be transferred' );
	});

});

module("One selector and function input");

test("basic input function", function(){

	var $a = $('#a'), $r = $('#r'), init_val = 3, test_val = 7, expected_val = 9;

	$r.val(init_val);
	$a.val(init_val);

	$r.live_formula('#a', function(inputs){ return (2 + inputs[0]); });

	$a.val(test_val).blur();

	equal( expected_val, $r.val(), 'the function should be applied' );

});

module("Named inputs - basic");

test("One selector one number",function(){

	var $a = $('#a'), $b = $('#b'), $r = $('#r'), init_val = 3, test_val = 7, test_constant = 2, expected_val = test_val + test_constant, add;

	$r.val(init_val);
	$a.val(init_val);
	$b.val(test_constant);

	$r.live_formula({ a: '#a', b: '#b' }, function(inputs){ return (inputs.a + inputs.b); });

	$a.val(test_val).blur();

	equal( expected_val, $r.val(), 'the function should be applied to the named arguments' );

});

module("Options");

test("Set bind event", function(){

	var $a = $('#a'), $r = $('#r'), init_val = 3, test_val = 7;

	$r.val(init_val);
	$a.val(init_val);

	$r.live_formula('#a', function(inputs){ return (inputs[0]); }, { bind: 'keyup' });

	$a.val(test_val).keyup();

	equal( test_val, $r.val(), 'the newly bound event should activate the calculation' );

});

 });

//};
