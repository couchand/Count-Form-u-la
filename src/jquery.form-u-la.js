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
		var $i = $('');
		if ( 'number' === typeof input ){
			return [[input], $i];
		}
		else if ( 'string' === typeof input ){
			var v = $(input);
			return [[v], v];
		}
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

/*
else if ( $.isPlainObject( inputs_in ) ){
	$.each( inputs_in, function( k, v ){
		var r = util.resolve_input(v);

		inputs[k] = r;

		if ( !!r.jquery ){
			$inputs = $inputs.add(r);
		}

	});
}
*/
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
