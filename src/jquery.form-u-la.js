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
		var i = {}, $i = $('');
		if ( 'number' === typeof input ){
			//return [[input], $i];
			i[0] = input;
		}
		else if ( 'string' === typeof input ){
			var $v = $(input);
			//return [[$v], $v];
			i[0] = $v;
			$i = $v;
		}
		else if ( $.isPlainObject( input ) ){
			$.each( input, function( k, v ){
				var r, $n;
				[r, $n] = util.resolve_input(v);

				i[k] = r[0];
				$i.add($n);

				if ( !!r[0].jquery ){
					$i = $i.add(r[0]);
				}

			});
		}
/*		else if ( 'undefined' !== input.jquery ){
			i[0] = input;
			$i = input;
		}*/
		return [i, $i];
	},

	min:
	  function( input ){
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
		var sum = 0;
		$.each(input, function(k, v){
			sum = sum + v;
		});
		return sum;
	},
	count:
	  function( input ){
		var count = 0;
		$.each(input, function(k, v){
			count = count + 1
		});
		return count;
	},
	avg:
	  function( input ){
		var sum = 0, count = 0;
		$.each(input, function(k, v){
			sum = sum + v;
			count = count + 1
		});
		return (sum/count);
	}
};

(function($){
	$.fn.live_formula = function( inputs_in, formula_in, options_in ){

var $outputs = this,
    inputs, $inputs,
    thisIndex,
    formula,
    options = { bind: 'blur' };//, format: 'number', beforeCalc: null, afterCalc: null };

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
		formula = function(i){ return i[0]; };
	}

var handler = function(){

	var locals = {};

	[inputs, $inputs] = util.resolve_input(inputs_in);

	$.each(inputs, function(k, v){
		var i = 0, input_count = util.count(inputs);
		if ( !!v.jquery ){
			if ( 1 == v.size() ){ 
				locals[k] = parseInt( v.val() );
			}
			else if ( 0 != v.size() ){
				if ( 1 == input_count ){
					v.each(function(i){
						locals[i] = parseInt( $(this).val() );
					});
				}
				else {
					locals[k] = {};
					v.each(function(i){
						locals[k][i] = parseInt( $(this).val() );
					});
				}
			}
		}
		else {
			locals[k] = parseInt( v );
		}
	});

	var value = formula( locals );
	$outputs.val( value );

	return;

};

[inputs, $inputs] = util.resolve_input(inputs_in);

if ( 0 == $inputs.size()){
	throw "No live inputs found.";
}

$inputs.bind(options.bind+'.form-u-la',handler);

/*if ( 'undefined' === typeof $.fn.live_formula.currentIndex ){
	thisIndex = 0;
	$.fn.live_formula.currentIndex = 1;
}
else {
	thisIndex = $.fn.live_formula.currentIndex++;
}
*/
// doesn't do anything. dumb.
//$inputs.addClass('form-u-la-input-'+thisIndex);
//$('.form-u-la-input-'+thisIndex).live(options.bind+'.form-u-la',handler);

	};
})(jQuery);
