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
		if ( 'number' === typeof input ){
			return input;
		}
		else if ( 'string' === typeof input ){
			return $(input);
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

var inputs = {};
var $inputs = $('');
var formula;// = function(inputs){ return inputs[0]; };
var options = { bind: 'blur' };//, format: 'number', beforeCalc: null, afterCalc: null };
$.extend(options, options_in);

if ( 'string' === typeof inputs_in ){
	var r = util.resolve_input(inputs_in);

	inputs[0] = r;

	if ( !!r.jquery ){
		$inputs = r;
	}
}
//	inputs[0] = util.resolve_input(inputs_in);
//	$inputs = $(inputs_in);
/*else if ( 'number' === typeof inputs_in ){
	inputs[0] = inputs_in;
}
else if ( inputs_in.jquery ){
	inputs = inputs_in;
	$inputs = inputs;
}
else if ( $.isArray( inputs_in ) ){
	$.each( inputs_in, function( i, v ){
		inputs[i] = v;
		$inputs.add(v);
	});
}*/
else if ( $.isPlainObject( inputs_in ) ){
	$.each( inputs_in, function( k, v ){
		var r = util.resolve_input(v);

		inputs[k] = r;

		if ( !!r.jquery ){
			$inputs = $inputs.add(r);
		}

	});
}

//console && console.log && console.log( "inputs: a" );
//console && console.log && console.log( inputs );

/*	if ( 'string' === typeof formula_in ){
		formula = function( new_inputs ){
			handler.value = eval( formula_replace( formula_in, new_inputs ) );
		};
	}*/
	/*else*/ if ( $.isFunction( formula_in ) ){
//console && console.log && console.log( "formula: " ) && console.log( formula );

		formula = formula_in;

	}
else {
	formula = function(inputs){ return inputs[0]; };
}
console && console.log && console.log( "formula = " ) && console.log( formula );

//console && console.log && console.log( "after f assignment" );

var handler = function(){

//console && console.log && console.log( "handling calc" );
/*
	if ( handler.value ) {
		util.set_all( $outputs, handler.value );

//console && console.log && console.log( "cached: "+handler.value );
		return;
	}
*/
	var locals = {};

//console && console.log && console.log( "inputs: x" );
//console && console.log && console.log( inputs );

	$.each(inputs, function(k, v){
//console && console.log && console.log( "k:" + k );
//console && console.log && console.log( "v:" );
		if ( !!v.jquery ){
//alert(v.val());
//console && console.log && console.log( v );
			locals[k] = parseInt( v.val() );
		}
		else {
//console && console.log && console.log( v );
			locals[k] = parseInt( v );
		}
	});

/*	if ( options.beforeCalc ){
		options.beforeCalc();
	}*/

console && console.log && console.log( "locals: z" );
console && console.log && console.log( locals );
console && console.log && console.log( "formula: " ) && console.log( formula );

	handler.value = formula( locals );

console && console.log && console.log( "value: " );
console && console.log && console.log( handler.value );


/*	if ( options.afterCalc ){
		options.afterCalc();
	}*/

	util.set_all( $outputs, handler.value );
	return;

};

//console && console.log && console.log( "after handler assignment" );

if ( 0 == $inputs.size()){
	throw "No live inputs found.";
}

//console && console.log && console.log( "binding to "+options.bind );

$inputs.live(options.bind+'.form-u-la',handler);

//console && console.log && console.log( "$inputs: z" );
//console && console.log && console.log( $inputs );


	};
})(jQuery);
