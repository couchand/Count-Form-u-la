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
				var r, $n;
				[r, $n, q] = util.resolve_input(v);

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
			return input;
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
			return 1;
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
	}
};

(function($){
	$.fn.live_formula = function( inputs_in, formula_in, options_in ){

var $outputs = this,
    inputs, $inputs,
    selectors,
    handler,
    thisIndex,
    formula,
    options = {	bind: 'blur',
		taintable: false };
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
		formula = function(i){ return i; };
	}

handler = function(){

	var locals = {}, value, x, input_count;

	[inputs, $inputs, selectors] = util.resolve_input(inputs_in);

	input_count = util.count(inputs);

	if ( !!inputs.jquery && 1 == inputs.size() ){
		x = parseInt( inputs.val() );
		if ( !$.isNaN(x) ){
			locals = x;
		}
	}
	else {
		$.each(inputs, function(k, v){
			var i = 0;
			if ( !!v.jquery ){
				if ( 1 == v.size() ){
					x = parseInt( v.val() );
					if ( !$.isNaN(x) ){
						locals[k] = x;
					}
				}
				else if ( 0 != v.size() ){
					if ( 1 == input_count ){
						v.each(function(i){
							x = parseInt( $(this).val() );
							if ( !$.isNaN(x) ){
								locals[i] = x;
							}
						});
					}
					else {
						locals[k] = {};
						v.each(function(i){
							x = parseInt( $(this).val() );
							if ( !$.isNaN(x) ){
								locals[k][i] = x;
							}
						});
					}
				}
			}
			else {
				if ( $(v).size() > 0 ){
					locals[k] = parseInt( $(v).val() );
				}
				else {
					locals[k] = parseInt( v );
				}
			}
		});
	}

	value = formula( locals );
	$outputs.each(function(){
		if ( 'undefined' === typeof $(this).data('form-u-la.tainted') ){
			$(this).val( value );
		}
	});

	return;

};

[inputs, $inputs, selectors] = util.resolve_input(inputs_in);

if ( 0 == $inputs.size() && 0 == selectors.length ){
	throw "No live inputs found.";
}

// bind all resolved current inputs
$inputs.bind(options.bind+'.form-u-la',handler);

// live all selectors in the input
$.each( selectors, function(k, v){
	$(v).live(options.bind+'.form-u-la',handler);
});

if ( options.taintable ){
	//@TODO: figure out if this should be live
	$outputs.bind('change', function(){ $(this).data('form-u-la.tainted',true); });
}

	};
})(jQuery);
