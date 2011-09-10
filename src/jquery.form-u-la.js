/*
 * Count Form-u-la jQuery plugin
 *
 * developed by Andrew Couch
 *
 * Fall 2011
 *
 */
var util = {
	resolve_input:
	  function( input ){
		var i = {}, $i = $(''), s = [], j, q;
		if ( 'number' === typeof input ){
			//return [[input], $i];
			i = input;
		}
		else if ( 'string' === typeof input ){
			var $v = $(input);
			//return [[$v], $v];
			i = $v;
			$i = $v;
			s.push(input);
		}
		else if ( $.isPlainObject( input ) ){
			$.each( input, function( k, v ){
				var r, $n, t;
				t = util.resolve_input(v);
				r = t[0]; $n = t[1]; q = t[2];

				i[k] = r;
				$i.add($n);

				for ( j = 0; j < q.length; j++ ){
					s.push(q[j]);
				}

				if ( !!r.jquery ){
					$i = $i.add(r);
				}

			});
		}
/*		else if ( 'undefined' !== input.jquery ){
			i[0] = input;
			$i = input;
		}*/
		return [i, $i, s];
	},

	getPrecision:
	  function( stringInput, mode ){

		var	s = stringInput.replace( /^-?(\d+\.?\d*)$/, '$1' ),
			arr, k, digits = 0, places = 0;

		if ( $.isNaN( parseFloat(s) ) ){
			return null;
		}

		arr = s.split('.');
//console.debug(arr);
		if ( arr[1] ){
			places = arr[1].split('').length;
		}
		else if ( ( -1 === s.indexOf('.') ) && ( 'assumeZeros' !== mode ) ) {
			arr[0] = arr[0].replace( /0+$/, '' );
		}

		digits = arr[0].split('').length;

		return ( 'decimalPlaces' === mode ) ? places : digits + places;

	},

	setPrecision:
	  function( numberInput, precision ){
		var str = '' + numberInput, digits = 0, falsePrecision, decimalShift, places, numVal = numberInput;
//		str = str.replace( new RegExp('^(-?\\d{' + precision + '})(\\d*)$'), '$1X__FORM-U-LA__X$2' );
//		new_str = str.split( 'X__FORM-U-LA__X' );

		digits = str.replace( /\.\d*$/, '' ).replace( /^-/, '' ).split('').length;
		falsePrecision = digits - precision;

		if ( 0 <= falsePrecision ){
			decimalShift = Math.pow( 10, falsePrecision );
			numVal = Math.round( numberInput / decimalShift ) * decimalShift;
		}
		else {
			places = -falsePrecision;
			numVal = numberInput.toFixed(places);
		}

		return '' + numVal;
	},

	// Aggregate functions.
	min:
	  function( input ){
		if ( Object !== input.constructor ){
			return input;
		}
		var min = 4294967295;
		$.each(input, function(k, v){
			if ( v < min ){
				min = v;
			}
		});
		return min;
	},
	max:
	  function( input ){
		if ( Object !== input.constructor ){
			return input;
		}
		var max = -4294967295;
		$.each(input, function(k, v){
			if ( v > max ){
				max = v;
			}
		});
		return max;
	},
	sum:
	  function( input ){
		if ( Object !== input.constructor ){
			return ('undefined' === typeof input) ? 0 : input;
		}
		var sum = 0;
		$.each(input, function(k, v){
			sum = sum + v;
		});
		return sum;
	},
	count:
	  function( input ){
		if ( Object !== input.constructor ){
			return ('undefined' === typeof input) ? 0 : 1;
		}
		var count = 0;
		$.each(input, function(k, v){
			count = count + 1
		});
		return count;
	},
	avg:
	  function( input ){
		if ( Object !== input.constructor ){
			return input;
		}
		var sum = 0, count = 0;
		$.each(input, function(k, v){
			sum = sum + v;
			count = count + 1
		});
		return (sum/count);
	},
	copy:
	  function(i){
		return i;
	}
};

(function($){
	$.fn.live_formula = function( inputs_in, formula_in, options_in ){

var $outputs = this,
    inputs, $inputs,
    selectors,
    handler,
    calculate = function(){ $(this).trigger('calculate.form-u-la'); },
    thisIndex,
    formula,
    temp,
    options = {	bind: 'blur',
		taintable: false,
		precision: 'ignore' };
	//	format: 'number',
	//	beforeCalc: null,
	//	afterCalc: null };

if ( options_in ){
	$.extend(options, options_in);
}

	if ( $.isFunction( formula_in ) ){
		formula = formula_in;
	}
/*	else if ( 'string' === typeof formula_in ){
		formula = function( new_inputs ){
			handler.value = eval( formula_replace( formula_in, new_inputs ) );
		};
	}*/
	else {
		formula = util.copy;
	}

handler = function(){

	var	locals = {}, value, x, t,
		input_count, precision, precision_func, p,
		$tryWrapping, allTainted = true;

	$outputs.each(function(){
		allTainted = allTainted && $(this).data('form-u-la.tainted');
	});

	if ( allTainted ){
		return;
	}

	precision_func = function(a, b){
		var pf =	('ignore' === options.precision) ?
					function(a, b){ return Number.NaN; }
				:('lowest' === options.precision) ?
					function(a, b){ return (a < b) ? a : b; }
				:('highest' === options.precision) ?
					function(a, b){ return (a > b) ? a : b; }
				:
					options.precision;

		return	('undefined' === typeof a) ? (
				('undefined' === typeof b) ?
					null
				:
					b
			) : (
				('undefined' === typeof b) ?
					a
				:
					pf(a,b)
			)

	};



	t = util.resolve_input(inputs_in);
	inputs = t[0]; $inputs = t[1]; selectors = t[2];

	input_count = util.count(inputs);

//console.log( '' + input_count + ' inputs:' );
//console.log( inputs );

	if ( !!inputs.jquery && 1 == inputs.size() ){
		x = parseFloat( inputs.val() );
//console.log(inputs.val());
		p = util.getPrecision( inputs.val() );
		inputs.data( 'form-u-la.precision', p );
		precision = precision_func( precision, p );
		if ( !$.isNaN(x) ){
			locals = x;
		}
	}
	else if ( 'number' === typeof inputs ){
		x = inputs;
		p = util.getPrecision( '' + x );
		precision = precision_func( precision, p );
		if ( !$.isNaN(x) ){
			locals = x;
		}
	}
	else {
		$.each(inputs, function(k, v){

			var i = 0;
			if ( 'number' === typeof v ){

				x = v;
				p = util.getPrecision( '' + x );
				precision = precision_func( precision, p );
				if ( !$.isNaN(x) ){
					locals[k] = x;
				}
			}
			else if ( !!v.jquery ){
				if ( 1 == v.size() ){
					x = parseFloat( v.val() );
					p = util.getPrecision( v.val() );
					v.data( 'form-u-la.precision', p );
					precision = precision_func( precision, p );
					if ( !$.isNaN(x) ){
						locals[k] = x;
					}
				}
				else if ( 1 < v.size() ){
					if ( 1 == input_count ){
						v.each(function(i){
							var $t = $(this), val = $t.val();
							x = parseFloat( val );
							p = util.getPrecision( val );
							$t.data( 'form-u-la.precision', p );
							precision = precision_func( precision, p );
							if ( !$.isNaN(x) ){
								locals[i] = x;
							}
						});
					}
					else {
						locals[k] = {};
						v.each(function(i){
							var $t = $(this), val = $t.val();
							x = parseFloat( val );
							p = util.getPrecision( val );
							$t.data( 'form-u-la.precision', p );
							precision = precision_func( precision, p );
							if ( !$.isNaN(x) ){
								locals[k][i] = x;
							}
						});
					}
				}
			}
			else {
				$tryWrapping = $(v);

				if ( $tryWrapping.size() > 0 ){
					x = parseFloat( $tryWrapping.val() );
					if ( !$.isNaN(x) ){
						locals[k] = x;
						p = util.getPrecision( $tryWrapping.val() );
						$tryWrapping.data( 'form-u-la.precision', p );
						precision = precision_func( precision, p );
					}
				}
				else {
					x = parseFloat( v );
					if ( !$.isNaN(x) ){
						locals[k] = x;
					}
				}
			}
		});
	}

	value = formula( locals );
//if ( 'number' !== typeof value ){
//console.log(value);
//}
//	value = value.toFixed(precision);
//console.log(value);

	if ( 'ignore' !== options.precision ){
		value = util.setPrecision( value, precision );
	}

	$outputs.each(function(){
		var $out = $(this);
		if ( 'undefined' === typeof $out.data('form-u-la.tainted') ){
			$out.val( value );
			$out.data( 'form-u-la.precision', precision );
		}
	});

	return;

};

temp = util.resolve_input(inputs_in);
inputs = temp[0]; $inputs = temp[1]; selectors = temp[2];

if ( 0 == $inputs.size() && 0 == selectors.length ){
	throw "No live inputs found.";
}

if ( options.taintable ){
	//@TODO: figure out if this should be live
	$outputs.bind('change', function(){ $(this).data('form-u-la.tainted',true); });
}
else {
	$outputs.attr('disabled','disabled');
}

// bind all resolved current inputs
$inputs.bind('calculate.form-u-la',handler);

// live all selectors in the input
$.each( selectors, function(k, v){
	$(v).live('calculate.form-u-la',handler);
});

// bind all resolved current inputs
$inputs.bind(options.bind+'.form-u-la', calculate);

// live all selectors in the input
$.each( selectors, function(k, v){
	$(v).live(options.bind+'.form-u-la', calculate);
});

	};
})(jQuery);
