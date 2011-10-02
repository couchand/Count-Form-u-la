/*
 * Count Form-u-la jQuery plugin
 *
 * developed by Andrew Couch
 *
 * Fall 2011
 *
 */

(function($){

	$.formula = function(){};
	$.formula.copy = function(i){ return arguments.callee.unary ? i : i[0]; };
	// Aggregate functions.
	$.formula.sum = function( input ){
			if ( arguments.callee.unary ){
				return ('undefined' === typeof input) ? 0 : input;
			}
			var sum = 0;
			$.each(input, function(k, v){
				sum = sum + v;
			});
			return sum;
		};
	$.formula.avg = function( input ){
			if ( arguments.callee.unary ){
				return input;
			}
			var sum = 0, count = 0;
			$.each(input, function(k, v){
				sum = sum + v;
				count = count + 1
			});
			return (sum/count);
		};
	$.formula.max = function( input ){
			if ( arguments.callee.unary ){
				return input;
			}
			var max = -4294967295;
			$.each(input, function(k, v){
				if ( v > max ){
					max = v;
				}
			});
			return max;
		};
	$.formula.min = function( input ){
			if ( $.formula.min.unary ){
				return input;
			}
			var min = 4294967295;
			$.each(input, function(k, v){
				if ( v < min ){
					min = v;
				}
			});
			return min;
	};
	$.formula.count = function( input ){
			if ( $.formula.count.unary ){
				return ('undefined' === typeof input) ? 0 : 1;
			}
			var count = 0;
			$.each(input, function(k, v){
				count = count + 1
			});
			return count;
		};

	var default_options = {	formula: $.formula.copy,
				bind: 'blur',
				taintable: false,
				precision: 'ignore' };
			//	format: 'number',
			//	beforeCalc: null,
			//	afterCalc: null };

	function resolve_input( input ){
		var i = {}, $i = $(''), s = [], j, q;
		if ( 'number' === typeof input ){
			i = input;
		}
		else if ( 'string' === typeof input ){
			var $v = $(input);
			i = $v;
			$i = $v;
			s.push(input);
		}
		else if ( $.isPlainObject( input ) ){
			$.each( input, function( k, v ){
				var r, $n, t;
				t = resolve_input(v);
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
		return [i, $i, s];
	};

	$.widget( 'uix.formula', {

		_evaluateInputs:
		  function( theInputs, wrap ){

			var t = {}, self = this;
			$.each(theInputs, function(key){
				var val = self._evaluateInput( wrap ? $(this) : this );
				if( 'undefined' !== typeof val ){
					t[key] = val;
				}
			});
			return t;

		},

		_evaluateInput:
		  function( theInput ){
			var strVal, t, self = this,
			    x, p, size;

			if ( !!theInput.jquery ){
				size = theInput.size();
				if ( 1 === size ){
					strVal = theInput.val();
					x = parseFloat(strVal);
				}
				else if ( 1 < size ){
					return self._evaluateInputs( theInput, true );
				}
			}
			else if ( 'string' === typeof theInput ){
				strVal = theInput;
				x = parseFloat(strVal);
			}
			else if ( 'number' === typeof theInput || ( theInput.constructor && Number === theInput.constructor ) ){
				x = theInput;
				strVal = '' + x;
			}
			else if ( $.isPlainObject( theInput ) ){
				return self._evaluateInputs( theInput, false );
			}
			else {
				return;
			}

			p = self._getPrecision( strVal );

			if ( 1 === size ){
				theInput.data( 'form-u-la.precision', p );
			}

			self._precision = self._precision_func( self._precision, p );

			if ( !$.isNaN(x) ){
				return x;
			}
			else if ( 'undefined' !== typeof self.options.defaultValue ){
				return self.options.defaultValue;
			}
		},

		_getPrecision:
		  function( stringInput ){

			var	s = stringInput.replace( /^-?(\d+\.?\d*)$/, '$1' ),
				arr, k, digits = 0, places = 0;

			if ( $.isNaN( parseFloat(s) ) ){
				return null;
			}

			arr = s.split('.');

			if ( arr[1] ){
				places = arr[1].split('').length;
			}
			else if ( ( -1 === s.indexOf('.') ) && ( 'assumeZeros' !== this.options.precisionMode ) ) {
				arr[0] = arr[0].replace( /0+$/, '' );
			}

			digits = arr[0].split('').length;

			return ( 'decimalPlaces' === this.options.precisionMode ) ? places : digits + places;

		},

		_setPrecision:
		  function( numberInput, precision ){
			var str = '' + numberInput, digits = 0, falsePrecision, decimalShift, places, numVal = numberInput;

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

		_resolve_input:
		  function( input ){
			return resolve_input( input );
		},

		_create: function(){

var	self		= this,
	$outputs	= this.element,
	inputs_in	= self.options.input,
	inputs, $inputs,
	selectors, handler,
	thisIndex, temp;

if ( 'undefined' === typeof inputs_in ){
	return;
}

self._precision_func = function(a, b){
	var pf =	($.isFunction(self.options.precision)) ?
				self.options.precision
			:('lowest' == self.options.precision) ?
				function(a, b){ return (a < b) ? a : b; }
			:('highest' == self.options.precision) ?
				function(a, b){ return (a > b) ? a : b; }
			:('ignore' == self.options.precision) ?
				function(a, b){ return Number.NaN; }
			:	function(a, b){ return Number.NaN; };

	return	('undefined' === typeof a || null === a) ? (
			('undefined' === typeof b || null === b) ?
				null
			:
				b
		) : (
			('undefined' === typeof b || null === b) ?
				a
			:
				pf(a,b)
		)

};

handler = function(){

	var	locals = {}, value, x, t,
		input_count, precision, p,
		$tryWrapping, allTainted = true;

	$outputs.each(function(){
		allTainted = allTainted && $(this).data('form-u-la.tainted');
	});

	if ( allTainted ){
		return;
	}

	self._precision = null;

	t = self._resolve_input(inputs_in);
	input = t[0]; $inputs = t[1]; selectors = t[2];

	locals = self._evaluateInput( input );
	if( 'undefined' === typeof locals ){
		return;
	}

	self.options.formula.unary = !( $.isPlainObject( locals ) );

	value = self.options.formula( locals );

	if ( 'ignore' !== self.options.precision ){
		value = self._setPrecision( value, self._precision );
	}

	$outputs.each(function(){
		var $out = $(this);
		if ( 'undefined' === typeof $out.data('form-u-la.tainted') ){
			$out.val( value );
			$out.data( 'form-u-la.precision', self._precision );
		}
	});

	$outputs.each(function(){
		$(this).trigger('calculate.form-u-la');
	});

	return;

};

temp = self._resolve_input(inputs_in);
inputs = temp[0]; $inputs = temp[1]; selectors = temp[2];

if ( 0 == $inputs.size() && 0 == selectors.length ){
	throw "No live inputs found.";
}

if ( self.options.taintable ){
	//@TODO: figure out if this should be live
	$outputs.bind('change', function(){ $(this).data('form-u-la.tainted',true); });
}
else {
	$outputs.attr('disabled', 'disabled');
}

// bind all resolved current inputs
$inputs.bind('calculate.form-u-la', handler);

// live all selectors in the input
$.each( selectors, function(k, v){
	$(v).live('calculate.form-u-la', handler);
});

// bind all resolved current inputs
$inputs.bind(self.options.bind+'.form-u-la', handler);

// live all selectors in the input
$.each( selectors, function(k, v){
	$(v).live(self.options.bind+'.form-u-la', handler);
});

		}
	});

	$.uix.formula.prototype.options = default_options;
})(jQuery);
