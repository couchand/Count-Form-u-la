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

				if ( !!r[0].jquery ){
					$i = $i.add(r[0]);
				}

			});
		}
		return [i, $i];
	},
	set_all:
	  function( collection, value ){
		collection.each(function(){
			$(this).val(value);
		});
	}
};

(function($){
	$.fn.live_formula = function( inputs_in, formula_in, options_in ){

var $outputs = this;

var inputs, $inputs = $('');
var formula;
var options = { bind: 'blur' };//, format: 'number', beforeCalc: null, afterCalc: null };
$.extend(options, options_in);


[inputs, $inputs] = util.resolve_input(inputs_in);

	if ( $.isFunction( formula_in ) ){
		formula = formula_in;
	}
/*	else if ( 'string' === typeof formula_in ){
		formula = function( new_inputs ){
			handler.value = eval( formula_replace( formula_in, new_inputs ) );
		};
	}*/
	else {
		formula = function(inputs){ return inputs[0]; };
	}

var handler = function(){

	var locals = {};

	$.each(inputs, function(k, v){
		if ( !!v.jquery ){
			locals[k] = parseInt( v.val() );
		}
		else {
			locals[k] = parseInt( v );
		}
	});

	var value = formula( locals );

	util.set_all( $outputs, value );
	return;

};

if ( 0 == $inputs.size()){
	throw "No live inputs found.";
}


$inputs.live(options.bind+'.form-u-la',handler);


	};
})(jQuery);
