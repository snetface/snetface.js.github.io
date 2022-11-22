function init_gtm_assistant( config )
{
function getInitializer()
{
var config = {};
	function _deleteCookie( name ){
		_setCookie( name, "", -1 );
	}
	
	function _addScript( url, attributes, callback )
    {
      var s = document.createElement( "script" );
      s.async = true;
      s.src = url;
    
      for( var key in attributes || {})
      {
        s.setAttribute( key, attributes[ key ]);
      }
    
      if( callback ) callback( s );
    
      s.onerror = function()
      { 
        _log( "Script with url", url, "failed to load" );
      }
    
      document.head.appendChild( s );
    }


	/**
	 * Returns a value of a cookie given by name
	 * @param {string} c_name
	 * @return {null|string} 
	 */
	 function _getCookie( c_name ) 
	 {
		var c_value = " " + document.cookie;
		var c_start = c_value.indexOf(" " + c_name + "=");
	
		if (c_start == -1) 
	  {
				c_value = null;
		}
	
		else 
	  {
				c_start = c_value.indexOf("=", c_start) + 1;
				var c_end = c_value.indexOf(";", c_start);
	
				if (c_end == -1) 
	      {
						c_end = c_value.length;
				}
	
				c_value = decodeURIComponent(c_value.substring(c_start,c_end));
		}
	  
		return c_value;
	}


	/**
	 * Sets a cookie
	 * @param {string} name
	 * @param {string} value
	 * @param {number} days
	 */
	
	function _setCookie( name, value, days) 
	{
		var expires = "";
	  
		if (days) 
	  {
				var date = new Date();
				date.setTime(date.getTime() + (days*24*60*60*1000));
				expires = "; expires=" + date.toUTCString();
		}
	  
		document.cookie = name + "=" + ( encodeURIComponent(value) || "")  + expires + "; path=/";
	}


	var Enum = self = {};
	
	self.get = function()
	{
	  var Symbol = window.Symbol || function( arg ){ return arg; };
	
	  var container = Object.create( null );
	
	  var _private_data =
	  {
	    reverse: {}
	  };
	
	  Object.defineProperty( container, "hasValue", 
	  {
	    get(){ return function( arg ){ return new Boolean( _private_data.reverse[ arg ]); }},
	    set(){}
	  });
	  
	  for( var i in arguments )
	  {
	    var sym = Symbol( arguments[i] );
	
	    addStatic( container, arguments[ i ], sym );
	    _private_data.reverse[ sym ] = arguments[ i ];
	  }
	
	  return container;
	};
	
	function addStatic( obj, prop, value )
	{
	  Object.defineProperty( obj, prop, { value: value, writable: false, configurable: false, enumerable: false });
	}


	function _contains( array, needle )
	{
	  return array.indexOf( needle ) > -1;
	}


	/**
	 * Thrors AssistantError with given arguments
	 * @throws {AssistantError}
	 * @param {string} msg 
	 * @param {*} meta 
	 */
	/** @suppress {globalThis|checkTypes} */
	
	function _error(){
	
	  var msg = [].slice.call( arguments, 0 ).join( "" );
	
		var err = new Error( msg );
		err.type = "assistant_error";
		// Error.captureStackTrace( err, getStackTrace );
	
		throw err;
	}


	function _getDataLayerVariable( variable_path )
	{
	  return window.google_tag_manager[ config.baseContainerId ].dataLayer.get( variable_path );
	}


	function _getReportingIds()
	{
	  return config && config.debugMode ? [] : [ "G-D2ZJ2NRE85", "UA-181867551-3" ];
	}


	var SAFE_RUNNER_STATES =
	{
	  "NOT_STARTED_YET": 1,
	  "RECEIVED_ERROR": 2,
	  "SUCCESSFULLY_RUN": 3
	};
	
	function SafeRunner( config_obj )
	{
	  this.current_state = "NOT_STARTED_YET";
	  this.error_msg_received = null;
	  this.config_obj = config_obj;
	}
	
	SafeRunner.prototype.setState = function( state )
	{
	  if( !SAFE_RUNNER_STATES[ state ])
	  {
	    this.current_state = "Invalid state received: '" + state + "'";
	    return;
	  }
	
	  else this.current_state = state;
	}
	
	SafeRunner.prototype.execute = function()
	{
	  if( this.config_obj.async )
	  {
	    var bound = this.doExecute.bind( this, arguments );
	    setTimeout( bound, 0 );
	  }
	
	  else
	  {
	    this.doExecute( arguments );
	  }
	}
	
	SafeRunner.prototype.doExecute = function( args )
	{
	  try { 
	    var result = this.config_obj.func.apply( this.config_obj.context, args );
	    this.setState( "SUCCESSFULLY_RUN" );
	    addMessageResult( this, args[0], this.current_state );
	    return result;
	  }
	
	  catch( error )
	  {
	    this.setState( "RECEIVED_ERROR" );
	    this.error_msg_received = error;
	    addMessageResult( this, args[0], this.current_state );
	    
	    _trackAssistantError( "Error caught while executing func from getRunner. Msg: '" + this.config_obj.error_msg + "'", error );
	
	    return "error_received";
	  }
	}
	
	function _getRunner( config_obj )
	{
	  if( !_isFn( config_obj.func ) || !_isStr( config_obj.error_msg ))
	  {
	    _error( "Insufficient config object in _getRunner." );
	  }
	
	  return new SafeRunner( config_obj );
	}
	
	function isMessage( arg )
	{
	  return arg.constructor.name === "Message";
	}
	
	function addMessageResult( listener, msg, res )
	{
	  if( !isMessage( msg )) return;
	
	  msg.addListenerExecutionResult( listener, res );
	}


	/**
	 * Determines type of the given parameter "value"
	 * Boolean|Number|String|Function|Array|Date|RegExp|Arguments
	 * @param {*} value
	 * @return {string}
	 */
	 function _getType( value )
	 {
		var TYPE_RE_ = /\[object (Boolean|Number|String|Function|Array|Date|RegExp|Arguments)\]/;
	
		if (value == null) return String( value );
	
		var match = TYPE_RE_.exec( Object.prototype.toString.call( Object( value )));  
		return match ? match[1].toLowerCase() : 'object';
	}
	
	function _isArguments( value )
	{
	  return value && _getType( value ) === "arguments";
	}
	
	function _isStr( value )
	{
	  return value && _getType( value ) === "string";
	}
	
	function _isNum( value )
	{
	  return value && _getType( value ) === "number";
	}
	
	function _isArray( value )
	{
	  return value && _getType( value ) === "array";
	}
	
	function _isObj( value )
	{
	  return value && _getType( value ) === "object";
	}
	
	function _isFn( value )
	{
	  return value && _getType( value ) === "function";
	}
	
	function _exists( value )
	{
	  return value !== undefined && value !== null;
	}


	function _log( arg )
	{
	  console.log( arg );
	  return arg;
	}


	function objectCreate(proto) 
	{
	  var ctor = function() { };
	  ctor.prototype = proto;
	  return new ctor;
	}


	/**
	* Pulic entry point for calling runCommand
	* @param {*} command
	*/
	
	function _run( command, arg1, arg2 ){
	
	  "use strict";
	
	  try {
	
	    var func = getFunc( command, arg1, arg2 );
	    var context = command && command.context;
	
	    if( !func ) _error( "Command '" + command + "' not found in '_run'." );
	
	    if( func.apply ) return func.apply( context, [].slice.call(arguments, 1) );
	    else return func( arg1, arg2 );
	  }
	
	  catch ( error ){
	
	    var local_msg = command.error_msg || "Error of type '" + getErrorType( error ) + "' caught in '_run' while trying to execute command '" + getCommandDesc( command ) + "'";
	    
	    _trackAssistantError( local_msg, error );
	  }
	
	  function getErrorType( error )
	  {
	    return error.type || "generic error";
	  }
	
	  function getCommandDesc( command )
	  {
	    var type = _getType( command );
	    return (
	      type == "string" ? command :
	      type == "function" && command.name ? command.name :
	      type == "function" ? "<anonym function>: '" + command :
	      type == "object" && command.func && command.func.name ? command.func.name :
	      command );
	  }
	
	  function getFunc( arg )
	  {
	    switch ( _getType( arg )){
	      case "string": return _get( "_commands." + command );
	      case "function": return arg;
	      case "object": return arg.func;
	      default: _error( "Type of '"+ _getType( arg ) +"' commands are not allowed" ) 
	    }
	  }
	
	}


	function _trackAssistantError( msg, error_obj )
	{
	  function gtag(){ window.dataLayer.push( arguments ); }
	
	  function getStack( error ){ return error.stack ? error.stack : (( error.fileName || "" ) + ( error.lineNumber || "" )); }
	
	  var details = ({
	    "send_page_view": false,
	    "event_category": "GTM Asisstant Error",
	    "event_action": msg,
	    "event_label": error_obj && error_obj.toString(),
	    "callstack": error_obj && getStack( error_obj ),
	    "send_to": _getReportingIds()
	  });
	
	  gtag( "event", "gtm_assistant_error", details );
	
	  if( config.debugMode )
	  {
	    console.error( "Msg: " + msg + "\n\n" + " Original: ", error_obj );
	  }
	
	}


	function _copy( obj )
	{
		return JSON.parse( JSON.stringify(obj) );
	}


	function _copyArray( array_in )
	{
	  return [].concat( array_in );
	}


	function extend( base, sub ) {
	  // Avoid instantiating the base class just to setup inheritance
	  // Also, do a recursive merge of two prototypes, so we don't overwrite 
	  // the existing prototype, but still maintain the inheritance chain
	  // Thanks to @ccnokes
	  var origProto = sub.prototype;
	  sub.prototype = Object.create(base.prototype);
	  for (var key in origProto)  {
	     sub.prototype[key] = origProto[key];
	  }
	  // The constructor property was set wrong, let's fix it
	  Object.defineProperty(sub.prototype, 'constructor', { 
	    enumerable: false, 
	    value: sub 
	  });
	}


	/**
	 * Return a copy of the value at the given path inside the object if it exists 
	 * or undefined otherwise
	 * @param {string} key
	 * @param {Object} object
	 * @return {*} 
	 */
	 function _getValue( key, object ){
	
		if( !key || _getType(key) != "string" ) _error("Only getting string keys of valid length are supported. Received: '"  + key + "'");
		if( !object ) _error("Object must be provided");
	
		var levels = key.split(".");
		var item = object;
		for( var i = 0; i < levels.length; i++ ){
			item = item[ levels[i] ];
			if( item === undefined ) return undefined;
		}
		return item;
	}


	function _isEmpty( obj )
	{
	  for( var key in obj )
	  {
	    return false;
	  }
	
	  return true;
	}


	var MERGING_OPTIONS = 
	{
	  "OVERWRITE": "overwrite",
	  "EXTEND": "extend"
	}
	
	function _merge( one_or_more_objects, merging_method )
	{
	  var objects_array = [].concat( one_or_more_objects );
	  merging_method = merging_method || MERGING_OPTIONS.EXTEND;
	
	  return objects_array.reduce( function( all, curr )
	  {
	    if( !_isObj( curr )) _error( "_merge arguments should be objects" );
	
	    for( var attr in curr )
	    {
	      if( typeof curr[ attr ] === 'undefined' ) continue;
	      else if( !all[ attr ] ) all[ attr ] = curr[ attr ];
	      else if( all[ attr ] && merging_method == MERGING_OPTIONS.OVERWRITE ) all[ attr ] = curr[ attr ];
	      else if( all[ attr ] && merging_method == MERGING_OPTIONS.EXTEND ) all[ attr ] = addTo( all[ attr ], curr[ attr ]);
	      else _error( "Unrecognized merging option" );
	    }
	
	    return all;
	
	  }, {});
	
	  function addTo( base_obj, extension )
	  {
	    if( _isArray( base_obj[ attr ])) return base_obj.concat( extension );
	    // else if( _isObj( base_obj[ attr ])) return base_obj[ attr ].concat( extension[ attr ]);
	  }
	}


	/**
	 * Sets a value at the given path in the object
	 * @param {string} key
	 * @param {*} value
	 * @param {Object} object
	 */
	function _setValue( key, value, object, merge ){ 
	
		if( !key || _getType( key ) != "string" ) throw new Error("only setting string keys of valid length are supported");
	
		var levels = key.split(".");
		var item = levels.pop();
		var target = object;
	
		for( var i = 0; i < levels.length; i++ ){
			if( target[levels[i]] === undefined ) target[levels[i]] = {};
			target = target[levels[i]];
		}
		
		if( !merge || _getType(target[item]) != array ) target[item] = value;
		else target[item].concat( value );
	
	  return value;
	}


	function _getElementClasses( element )
	{
	  return element && element.className && _isFn( element.className.split ) && element.className.split( " " ) || [];
	}


	function _getElementText( element, max_length ){
	
	  if( !element ) return null;
	
	  var text;
	
	  if( element.tagName === "IMG" )
	  {
	    text = element.alt ? "Alt: '" + element.alt + "'" : "";
	    text += element.title ? " | Title: '" + element.title + "'" : "";
	  }
	
	  else if( element.nodeName == "INPUT" )
	  {
	    text = element.value;
	  }
	
	  else 
	  {
	    text = element.innerText || element.textContent || "";
	  }
	
	  return text.replace( /[ \s\t\n]+/gi, " " )
	    .trim()
	    .slice( 0, max_length || 150 );
	}


	function _getNodesArray( one_or_more_css_selectors, context_node_object )
	{
	  if( !one_or_more_css_selectors ) return [];
	
	  var context_node = context_node_object || document.body;
	  var css_selectors_array = [].concat( one_or_more_css_selectors );
	  
	  var node_list = context_node.querySelectorAll(css_selectors_array.join(", "));
	  return [].reduce.call( node_list, function( all,current ){ return all.concat(current); }, [] );
	}


	var _getNumber = (function()
	{
	  var cached_decimal;
	
	   return  function _getNumber( numeric_string )
	  {
	    var local_decimal_markup = getNumericMarkup( numeric_string );    
	    var english_format = local_decimal_markup.replace(",", ".");
	
	    return parseFloat( english_format );
	  }
	
	  function getNumericMarkup( numeric_string )
	  {
	    var num_str = String( numeric_string );
	
	    if( !cached_decimal )
	    {
	      getDecimalSeparator( num_str.replace( /([^\d\.,])/gi, "" ));
	    }
	    
	    return getLocalDecimalMarkup( num_str );
	  }
	
	  function getLocalDecimalMarkup( num_str )
	  {
	    switch( cached_decimal )
	    {
	      case ".": return num_str.replace( /([^\d\.])/gi, "" );
	      case ",": return num_str.replace( /([^\d,])/gi, "" );
	      case undefined:  return num_str.replace( /([^\d])/gi, "" );
	    }
	  }
	
	  function getDecimalSeparator( numeric_value )
	  {
	    var dot_index = numeric_value.indexOf( "." );
	    var comma_index = numeric_value.indexOf( "," );
	
	    var separator = "";
	
	    if( dot_index > -1 && comma_index > -1 )
	    {
	      separator = dot_index > comma_index ? "." : ",";
	    }
	    
	    // dot is a decimal separator placed 2 decimals from the end: 124.22
	    if( dot_index > -1 && dot_index === numeric_value.length - 3 )
	    {
	      separator = ".";
	    }
	
	    // comma is a decimal separator placed 2 decimals from the end: 124,22
	    if( comma_index > -1 && comma_index === numeric_value.length - 3 )
	    {
	      separator = ",";
	    }
	
	    // dot is a thousands separator placed 3 digits from the end: 124.222
	    // thus comma is the decimal separator
	    if( dot_index > -1 && dot_index === numeric_value.length - 4 )
	    {
	      separator = ",";
	    }
	
	    // comma is a thousands separator placed 3 digits from the end: 124,222
	    // thus dot is the decimal separator
	    if( comma_index > -1 && comma_index === numeric_value.length - 4 )
	    {
	      separator = ".";
	    }
	
	    if( separator )
	    {
	      cached_decimal = separator;
	    }
	
	    return separator;
	  }
	
	})();


	function _getSingleNode( selector_str, context_node )
	{
	  return selector_str && ( context_node || document ).querySelector( selector_str );
	}


	function _hasClass( element, className )
	{
	  return _getElementClasses( element ).indexOf( className ) > -1; 
	}


	function _isHtmlElement( element )
	{
	  return element instanceof Element;
	}


	function _parseHref( href, parse_query )
	{
	  return parseHref( href, parse_query );
	
	  function getBaseURI(){
			return document.baseURI;
		};
	
		function getCurrentProtocol(){
			return getBaseURI().split("://")[0];
		};
	
		function getCurrentHostAndProtocol(){
			return getBaseURI().split("/").slice(0,3).join("/");
		};
	
		function getFullUrl( href ){
	
			if( href.indexOf("://") > -1 ) return href;
			if( href.indexOf("//") === 0 ) return getCurrentProtocol() + "://" + href.replace("//", "");
			if( href.indexOf("/") === 0 ) return getCurrentHostAndProtocol() + href;
	
			var split = getBaseURI().split("/");
	
			if( href.indexOf("../") === 0 ){    
				if( split.length >= 5 ){
					split.splice( -2, 2 );
					return split.concat(href.replace("../", "")).join("/");
				}
			}
	
			// realative path, beginning with file name. ex: href="file.htm"
			if( split.length >= 4 ) split.pop();
			split.push( href );
			return split.join("/");
		}
	
		function parseQueryReducer( acc, str ){
	
			var split = ( str || "" ).split("=");
			var key = decodeURIComponent(split[0]);
			var value = decodeURIComponent(split[1]) || "";
	
			acc[ key ] = value;
			return acc;
		}
	
		function parseHref( href, parse_query ){
	
			if( !href ) return {};
	
			if(href.indexOf("tel:") === 0) return {"url": href};
			if(href.indexOf("mailto:") === 0) return {"url": href};
			if(href.indexOf("javascript:") === 0) return {"url": href};
	
			var url = getFullUrl( href );
			var base_split = url.split("/");
	
			var file_query_hash = base_split.length >= 4 ? base_split.pop() : "";
			var query_split = file_query_hash.split("?");
			var file = query_split[0];
			var file_split = file.split(".");
			var host_split = ( base_split[2] || "" ).split(":");
	
			var out = {
				url: url,
				file: file,
				file_extension: file_split.length > 1 ? file_split.pop() : "",
				query: ( query_split[1] || "" ).split("#")[0],
				hash: file_query_hash.split("#")[1] || "",
				protocol: base_split[0].replace( ":", "" ),
				host: host_split[0],
				port: host_split[1] || "",
				path: "/" + (base_split.splice(3) || []).join("/"),
				queries: {}
			};
	
			if( parse_query && out.query ){
				out.queries = out.query.split("&").reduce(parseQueryReducer, {});
			}
			
			return out;
		}
	}


	function _textToHTMLDocument( html_markup )
	{
	  var parser = new DOMParser();
		var htmlDocument = parser.parseFromString( html_markup, "text/html" );
		return htmlDocument.documentElement;
	}


	function _createConditionSet( condition_array )
	{
	  if( !_isArray( condition_array )) _error( "Argument to create a condition set should be an array" );
	
	  return new PixelConditionSet( condition_array );
	}
	
	function PixelConditionSet( condition_array )
	{
	  this.page_load_conditions = condition_array.filter( function isPageLoadCondition( entry ){ return entry.cond_left_data_type == "page_load_variable"; });
	  this.event_conditions = condition_array.filter( function notPageLoadCondition( entry ){ return entry.cond_left_data_type != "page_load_variable"; });
	}
	
	PixelConditionSet.prototype.pageLoadConditionsTrue = function()
	{
	  return conditionsTrue( this.page_load_conditions );
	}
	
	PixelConditionSet.prototype.eventConditionsTrue = function( event_attributes )
	{
	  return conditionsTrue( this.event_conditions, event_attributes );
	}
	
	function conditionsTrue( condition_table, event_attributes )
	{
	  for( var i in condition_table || [] )
	  {
	    var row = condition_table[ i ];
	    var left_side = getLeftValue( row, event_attributes );
	
	    if( !isConditionTrue( left_side, row.cond, row.cond_right ))
	    {
	      return false;
	    }
	  }
	
	  return true;
	}
	
	function isConditionTrue( cond_left, operator, cond_right )
	{
	  if( operator == "equals" ) return cond_left === cond_right;
	  if( operator == "does_not_equal" ) return cond_left !== cond_right;
	  if( operator == "contains" ) return ( cond_left || "" ).indexOf( cond_right ) > -1;
	  if( operator == "begins_with" ) return _isStr( cond_left ) && cond_left.indexOf( cond_right ) === 0;
	  if( operator == "ends_with" ) return _isStr( cond_left ) && _isStr( cond_right ) && cond_left.endsWith( cond_right );
	  if( operator == "matches" ) return _isStr( cond_left ) && _isStr( cond_right ) && cond_left.match( new RegExp( cond_right ));
	  return false;
	}
	
	function getLeftValue( row, event_attributes )
	{
	  switch( row.cond_left_data_type )
	  {
	    case "event_param":
	      if( !_isStr( row.cond_left )) _error( "Condition left should be a string" );
	      return event_attributes[ row.cond_left ];
	
	    case "func": 
	      if( !_isFn( row.cond_left )) _error( "Condition left should be a function" );
	      return row.cond_left();
	
	    case "page_load_variable":
	      return row.cond_left;
	
	    default: _error( "Unsupported condition left value" );
	  }
	}


	function _usagePermissionGranted( asset_name, asset_settings )
	{
	  var settings = asset_settings || {};
	
	  var is_denied = settings.blacklist ? _contains( settings.blacklist, asset_name ) : false;
	  var has_permission = settings.whitelist ? _contains( settings.whitelist, asset_name ) : true;
	
	  return !is_denied && has_permission ? true : false;
	}


	var Logger = 
	{
	  errors: {},
	
	  dataLayerName: "dataLayer",
	
	  gtag: function()
	  {
	    var dataLayerController = ModuleHandler.get( "data_layer_controller" );
	    if( dataLayerController ) dataLayerController.submitPrimaryMessage( arguments );
	    else window[ this.dataLayerName ].push( arguments );
	  },
	  
	  /** @suppress {checkTypes} */
	  trackError: function( action, label, template, messages, stackstrings ){
	
	    this.gtag( "event", "gtm_tag_error", {
	      "send_page_view": false,
	      "event_category": "GTM Tag Error", 
	      "event_action": action,
	      "event_label": label,
	      "template": template,
	      "messages": messages,
	      "callstack": stackstrings,
	      "send_to": _getReportingIds()
	    });
	  },
	
	  /** @suppress {checkTypes} */
	  getEventKey: function( debug_params ){
	    return [ debug_params.event_id, debug_params.triggering_event_name ].join( "_" );
	  },
	
	  getFormattedStack: function( stack_array ){
	    return stack_array.reduceRight(function(a,c){return a.indexOf(c.line) === -1 ? a.concat(c.line) : a;}, []).join(" > ");
	  },
	
	  getReport: function( error ){
	    var stack_array = _getValue( "error.g", error );
	    var lineFormatOk = stack_array && stack_array[0] && stack_array[0].line;
	    var last_line = lineFormatOk && stack_array.slice(0,1)[0].line;
	    var stackline = lineFormatOk && "lines: " + this.getFormattedStack( stack_array );
	    var errorMsg = _getValue( "error.s.message", error ) || "none";
	    var formatted_msg = "Error on line '" + last_line + "': " + errorMsg;
	    return { "msg": formatted_msg, "stack": stackline };
	  },
	
	  /** @suppress {checkTypes} */
	  logTemplateError: function( debug_params, error ){
	
	    var report = this.getReport( error );
	    var eventKey = this.getEventKey( debug_params );
	
	    if( !this.errors[ eventKey ] )
	    {
	      this.errors[ eventKey ] = {
	        tags: [], 
	        template: debug_params.template,        
	        messages: [report.msg], 
	        stackstrings: [report.stack] 
	      };
	    }
	    else 
	    {
	      this.errors[eventKey].messages.push( report.msg ); 
	      this.errors[eventKey].stackstrings.push( report.stack );
	    }
	  },
	  
	  /**
	   * Public interface for event callbacks to enrich template errors captured 
	   * by logError with additional tag data
	   * @param {Object} tag_data 
	   * @param {string} eventName
	   * @param {number} eventId 
	   */
	  logTagError: function( tag_data, debug_params ){
	
	    var eventKey = this.getEventKey( debug_params );
	    var tagInfo = "Tag " + tag_data.id + " | " + tag_data.name;
	    var errorObj = this.errors[ eventKey ];
	
	    if( errorObj && errorObj.tags ) errorObj.tags.push( tagInfo );
	
	    else this.trackError( 
	      tagInfo, 
	      debug_params.triggering_event_name, 
	      null, 
	      null, 
	      null 
	    );
	  },
	
	  /**
	   * Public interface for event callbacks to flush gathered logs
	   * @param {string} eventName 
	   * @param {number} eventId 
	   */
	  flushErrors: function( debug_params ){
	
	    var eventKey = this.getEventKey( debug_params );
	
	    if( !this.errors[ eventKey ] )
	    {
	      _store( "_data.error_archive." + eventKey, "no errors" );
	      return;
	    }
	
	    this.trackError( 
	      ( this.errors[ eventKey ].tags || [] ).join(" / "), 
	      debug_params && debug_params.triggering_event_name, 
	      this.errors[ eventKey ].template, 
	      ( this.errors[ eventKey ].messages || [] ).join(" / "), 
	      ( this.errors[ eventKey ].stackstrings || [] ).join(" / ")
	    );
	
	    _store( "_data.error_archive." + eventKey, this.errors[ eventKey ]);
	    
	    delete this.errors[ eventKey ];
	  }
	
	};


	var _get, _store;
	
	(function()
	{
	  var storage = {};
	
	  _store = function( key, value, merge )
	  {
	    if( !_isStr( key )) _error( "Only string keys are supported. Received: " + _getType(key) );
	    if( key.indexOf("config.") === 0 ) _error( "Setting config variables is not allowed" );
	    if( key.indexOf("_command.") === 0 && !_isFn( value )) _error( "Only commands of type function are allowded. Received: " + _getType(value) );
	
	    return _setValue( key, value, storage, merge );
	  };
	
	  _get = function( key )
	  {
	    if( config.debugMode && !key ) return storage;
	    return _getValue( key, storage );
	  }
	
	})();


	var master_collection = [ "index_0_unavailable" ];
	var assets_by_type = _store( "_registered_assets", {});
	var deleted_assets = [];
	var classes = {};
	
	var Registry =
	{
	  get: function( asset_desc )
	  {
	    if( !asset_desc ) 
	    {
	      _error( "Asset description missing in Registry query" );
	    }
	
	    if( _isNum( asset_desc ))
	    {
	      return master_collection[ asset_desc ];
	    }
	  },
	
	  addItem: function( item )
	  {
	    if( !item )
	    {
	      _error( "Insufficient details for item registration in Registry" );
	    }
	
	    return addItemByType( item.constructor.name, item ) && addItemToMasterCollection( item );
	  },
	
	  registerClass: function( constructor )
	  {
	    classes[ constructor.name ] = constructor;
	  },
	
	  getClassDefinition: function( constructor_name )
	  {
	    return classes[ constructor_name ];
	  },
	
	  deleteItem: function( item_id )
	  {
	    if( !_isNum( item_id )) _error( "Invalid item id in Registry" );
	
	    var item = master_collection.splice( item_id, 1, null )[0];
	    var item_type = item.constructor.name;
	
	    assets_by_type[ item_type ].splice( assets_by_type[ item_type ].indexOf( item ), 1, null );
	    deleted_assets.push( item );
	  }
	};
	
	function addItemToMasterCollection( item )
	{ 
	  var id = master_collection.push( item ) - 1;
	  return id;
	}
	
	function addItemByType( type, item )
	{
	  return assets_by_type[ type ] = ( assets_by_type[ type ] || [] ).concat( item );
	}


	var LifeCycleHandler = (function LifeCycleHandler()
	{
	  function LifeCycleHandler()
	  {
	    this.lifecycle_model = {};
	    this.lifecycle_events = [];
	    this.observer;
	  }
	
	  LifeCycleHandler.prototype.addObserver = function( observer )
	  {
	    if( !observer || !_isFn( observer.handleEvent ))
	    {
	      _error( "LifeCycle Observer should have a handleEvent function" );
	    }
	
	    this.observer = observer;
	  }
	
	  LifeCycleHandler.prototype.pushEvent = function( event_data )
	  {
	    _setValue( event_data.event, event_data, this.lifecycle_model );
	
	    var formatted = getFormattedEvent( event_data );
	
	    this.lifecycle_events.push( formatted );
	
	    if( this.observer )
	    {
	      this.observer.handleEvent( formatted );
	    }
	  }
	
	  function getFormattedEvent( event_data )
	  {
	    var split_event = event_data.event.split( "." );
	
	    if( split_event.length !== 2 )
	    {
	      _error( "Malformed lifecycle event" );
	    }
	
	    var split_name = { "emitting_module": split_event[ 0 ], "event": split_event[ 1 ]};
	
	    return Object.assign( {}, event_data, split_name );
	  }
	
	  return new LifeCycleHandler();
	
	})();


	var ModuleHandler = (function()
	{
	  var modules = {};
	  var last_module_in;
	  var to_be_initialized = {};
	
	  function ModuleHandler()
	  {
	    modules.registry = Registry;
	    modules.logger = Logger;
	    modules.life_cycle_handler = LifeCycleHandler;
	  }
	
	  ModuleHandler.prototype.initModules = function()
	  {
	    for( var module_name in to_be_initialized )
	    {      
	      to_be_initialized[ module_name ].forEach( function( module_element )
	      {
	        module_element.initialize();
	      });
	    }
	
	    if( config.debugMode )
	    {
	      _store( "__modules", modules );
	    }
	  }
	
	  ModuleHandler.prototype.addInitializer = function( element_interface )
	  {
	    to_be_initialized[ last_module_in ] = to_be_initialized[ last_module_in ] || [];
	    to_be_initialized[ last_module_in ].push( element_interface );
	  }
	
	  ModuleHandler.prototype.createModule = function( module_name, public_interface )
	  {
	    if( modules[ module_name ])
	    {
	      _error( "Module ", module_name, " has already been registerd." );
	    }
	
	    modules[ module_name ] = 
	    { 
	      "public": public_interface,
	      "elements": {}
	    };
	
	    last_module_in = module_name;
	    
	
	    if( public_interface.initialize )
	    {
	      this.addInitializer( public_interface );
	    }
	
	    // LifeCycleHandler.pushEvent({ "event": "ModuleHandler." + module_name + "_ready" });
	
	    return modules[ module_name ];
	  }
	
	  ModuleHandler.prototype.addElement = function( element_name, element_interface )
	  {
	    modules[ last_module_in ].elements[ element_name ] = element_interface;
	
	    if( "initialize" in element_interface )
	    {
	      this.addInitializer( element_interface );
	    }
	
	    // LifeCycleHandler.pushEvent({ "event": "ModuleHandler." + element_name + "_ready" });
	  }
	
	  ModuleHandler.prototype.get = function( module_name )
	  {
	    if( !modules[ module_name ])
	    {
	      _error( "Module does not exist" );
	    }
	
	    return modules[ module_name ].public;
	  }
	  
	  return new ModuleHandler();
	
	})();


	var callback_queue = [];
	var timer;
	
	function _log( msg )
	{
	  SYSTEM.Logger.log( msg );
	}
	
	var SYSTEM = 
	{
	  queue: function( callback )
	  {
	    if( !_isFn( callback ))
	    {
	      _error( "Only callbacks can be ququed" );
	    }
	
	    callback_queue.push( callback );
	
	    if( !timer )
	    {
	      timer = setTimeout( processCallbakcks );
	    }
	  }
	};
	
	SYSTEM.Logger =
	{
	  log: function( msg )
	  {
	    if( config && config.debugMore )
	    {
	      console.error( msg );
	    }
	  }
	}
	
	function processCallbakcks()
	{
	  timer = null;
	  
	  callback_queue.splice( 0, callback_queue.length ).forEach( function( callback )
	  { 
	    callback(); 
	  });
	}



(function InitializationModule()
{
	var raw_config;
	
	var InitializerModule = 
	{
	  addDeps: function( callback )
	  {
	    PolyfillHandler.run( callback )
	  },
	
	  createConfig: function( raw_config_in )
	  {
	    raw_config = raw_config_in;
	    var processed_config = ConfigCompiler.execute();
	    config = _store( "config", processed_config );
	
	    VeluxCustoms.getSettings();
	  },
	
	  initModules: function()
	  {
	    ModuleHandler.initModules();
	  },
	
	  sendReadyEvent: function()
	  {
	    var ready_event = document.createEvent('Event');
	    ready_event.initEvent( 'gtm_assistant_ready', true, true );
	    document.dispatchEvent( ready_event );
	  }
	};
	
	ModuleHandler.createModule( "initializer_module", InitializerModule );


	var CONDITION_TYPE = Enum.get(
	  "PAGE",
	  "EVENT",
	  "CALLBACK"
	);
	
	var COMPARISON_TYPE = Enum.get(
	  "EQUALS",
	  "DOES_NOT_EQUAL",
	  "CONTAINS",
	  "BEGINS_WITH",
	  "ENDS_WITH",
	  "MATCHES"
	);
	
	function Condition( cond_type, comp_type, left_value, right_value )
	{
	  this.left_value = left_value;
	  this.right_value = right_value;
	  this.comparison_type = COMPARISON_TYPE[ comp_type ] ? comp_type : _error( "Unsupported Condition type" );
	  this.condition_type = CONDITION_TYPE[ cond_type ] ? cond_type : _error( "Unsupported Condition comparison type" );
	  
	  if( this.condition_type === "EVENT" && !_isStr( this.left_value )) _error( "Condition left should be a string" );
	  else if( this.condition_type === "CALLBACK" && !_isFn( this.left_value ))  _error( "Condition left should be a function" );
	}
	
	Condition.prototype.isTrue = function( event )
	{
	  var cond_left = getLeftValue.call( this, event ) || "";
	
	  switch( this.comparison_type )
	  {
	    case "EQUALS": return cond_left === this.right_value;
	    case "DOES_NOT_EQUAL": return cond_left !== this.right_value;
	    case "CONTAINS": return cond_left.indexOf( this.right_value ) > -1;
	    case "BEGINS_WITH": return cond_left.indexOf( this.right_value ) === 0;
	    case "ENDS_WITH": return cond_left.endsWith( cond_right );
	    case "MATCHES": return cond_left.match( new RegExp( cond_right ));
	  }
	}
	
	function getLeftValue( event )
	{
	  switch( this.condition_type )
	  {
	    case "EVENT": return event && event.getAttribute( this.left_value );
	    case "CALLBACK": return this.left_value();
	    case "PAGE": return this.left_value;
	  }
	}

	Registry.registerClass( Condition );


	var table_mapping =
	{
	  "page_load_variable": CONDITION_TYPE.PAGE,
	  "event_param": CONDITION_TYPE.EVENT,
	  "func": CONDITION_TYPE.CALLBACK
	}
	
	function PixelContainer( platform, config_data )
	{
	  this.pixel_data;
	  this.settings = {};
	  this.page_conditions = [];
	  this.event_conditions = [];
	
	  this.platform = platform;
	  this.raw_config = config_data || {};
	
	  if( _isObj( config_data ))
	  {
	    this.pixel_data = this.raw_config.pixel_details;
	  }
	
	  if( _isStr( config_data ))
	  {
	    this.pixel_data = config_data;
	  }
	
	  if( !_exists( this.pixel_data ))
	  {
	    return;
	  }
	
	  if( this.raw_config.conditions ) 
	  {
	    addConditions( this, this.raw_config.conditions );
	  }
	
	  if( this.page_conditions.find( function( condition ){ return !condition.isTrue(); }))
	  {
	    return;
	  }
	
	  processCustomizer.call( this );
	}
	
	function processCustomizer()
	{
	  if( this.platform === "zendesk" ) addZendeskOptions( this, this.raw_config );
	  if( this.raw_config.snapengage_options ) addSnapengageOptions( this, this.raw_config.snapengage_options );
	}
	
	function addConditions( pixel_container, condition_array )
	{
	  condition_array.forEach( function( table_row )
	  {
	    var target = table_row.cond_left_data_type === "page_load_variable" ? pixel_container.page_conditions : pixel_container.event_conditions;
	    target.push( new Condition( table_mapping[ table_row.cond_left_data_type ], String( table_row.cond ).toUpperCase(), table_row.cond_left, table_row.cond_right ));
	  });
	}
	
	function addSnapengageOptions( pixel_container, options_table )
	{
	  options_table.forEach( function( table_row )
	  {
	    pixel_container.settings[ table_row.key ] = table_row.value;
	  });
	}
	
	function addZendeskOptions( pixel_container, raw_config )
	{
	  if( raw_config.zendesk_department ) pixel_container.settings.zendesk_department = raw_config.zendesk_department;
	  if( raw_config.zendesk_locale ) pixel_container.settings.zendesk_locale = raw_config.zendesk_locale;
	}

	Registry.registerClass( PixelContainer );

var ConfigHelper = (function ConfigHelper()
{ 
 
	return element_interface = 
	{
	  isFrontendPlatformOnly: function( platform )
	  {
	    return _contains( DefaultSettings.pixels.frontend_only_platforms, platform );
	  },
	
	  mapTable: function( table )
	  {
	    return getTableArray( table ).reduce( function( all, current )
	    {
	      return current.key && current.value && ( all[ current.key ] = current.value ) && all || all;
	    }, {} );
	  }
	};
	
	function getTableArray( table )
	{
	  if( _isStr( table ) && raw_config[ table ] && _isArray( raw_config[ table ]))
	  {
	    return raw_config[ table ];
	  }
	
	  if( _isArray( table ))
	  {
	    return table;
	  }
	
	  return [];
	} 

 })(); 

ModuleHandler.addElement( "ConfigHelper", ConfigHelper ); // File end

var ConfigUtils = (function ConfigUtils()
{ 
 
	return element_interface =
	{
	  getCookiebotConsentState: function()
	  {
	    var categories = [ "statistics", "marketing" ];
	
	    function getInitialConsentState()
	    {
	      var cookie = ( _getCookie( 'CookieConsent' ) || "" ).toLowerCase();
	      return cookie == "-1" ? categories : getAcceptedCookieCategories( cookie );
	    }
	
	    function getAcceptedCookieCategories( cookie )
	    {
	      return categories.filter( function isPresent( category )
	      {
	        return cookie.indexOf( category + ":true" ) > -1;
	      });
	    }
	    
	    return getInitialConsentState();
	  },
	
	  getCrossSiteDomains: function()
	  {
	    var cross_site_domians_raw = raw_config.crosssite_domains_text || raw_config.crosssite_domains_variable || "";
	    var cross_site_domains_list = cross_site_domians_raw.split( "," ).map( function( host ){ return host.trim(); }).filter( function( elem ){ return !!elem; });
	    return cross_site_domains_list.length ? { cross_site_domains: cross_site_domains_list } : {};
	  },
	
	  getMeasurementSide: function( platform, side_of_preferance )
	  {
	    if( side_of_preferance == "client_only" ) return "client";
	    else if( side_of_preferance == "server_only" ) return "server";
	    else return side_of_preferance == "server" && raw_config.serverSideEndpoint && !ConfigHelper.isFrontendPlatformOnly( platform ) ? "server" : "client";
	  }
	}; 

 })(); 

ModuleHandler.addElement( "ConfigUtils", ConfigUtils ); // File end

var ConversionsConfig = (function ConversionsConfig()
{ 
 
	var config_markup = // Config Tag v2
	{ 
	  "pixel_attributes_key": "pixelData",
	  "platform_key": "pixelName",
	  "event_name_key": "eventName",
	  "target_side_key": "measurementSide"
	};
	
	var config_template_tables =
	[
	  "conversionPixelsPredefinedEvents", 
	  "conversionPixelsCustomEvents"
	];
	
	return element_interface = 
	{
	  getStructuredFormat: function(){ return getStructuredConversionPixels(); }
	}
	
	function getStructuredConversionPixels()
	{
	  return concatConfigTables().reduce( function( all_conversions, native_conv_obj )
	  {
	    var pixel_details = native_conv_obj[ config_markup.pixel_attributes_key ];
	    var target_event = native_conv_obj[ config_markup.event_name_key ];
	    var std_data;
	
	    if( _isStr( pixel_details ))
	    {
	      var target_side = native_conv_obj[ config_markup.target_side_key ];
	      var target_platform = native_conv_obj[ config_markup.platform_key ];
	
	      std_data = ConversionsGeneric.getStructuredConversionDataObject( pixel_details, target_side, target_platform, target_event );
	    }
	
	    else if( _isObj( pixel_details )) // it is data from Pixel Customizer template
	    {
	      std_data = ConversionsCustomizer.processData( pixel_details, target_event );
	    }
	
	    if( std_data ) ConversionsGeneric.addToDestination( all_conversions, target_event, std_data );
	
	    return all_conversions;
	
	  }, {});
	};
	
	function concatConfigTables()
	{
	  return config_template_tables.reduce( function( all_config, table_name )
	  { 
	    return raw_config[ table_name ] ? all_config.concat( raw_config[ table_name ]) : all_config;
	  }, []);
	} 

 })(); 

ModuleHandler.addElement( "ConversionsConfig", ConversionsConfig ); // File end

var ConversionsCustomizer = (function ConversionsCustomizer()
{ 
 
	var customizer_markup = // Config Tag v2
	{ 
	  "pixel_attributes_key": "pixel_details",
	  "platform_key": "platform",
	  "target_side_key": "target_side"
	};
	
	return element_interface =
	{
	  processData: function( pixel_customizer_data, event_name_in )
	  {
	    var pixel_details = pixel_customizer_data[ customizer_markup.pixel_attributes_key ];
	    var target_platform = pixel_customizer_data[ customizer_markup.platform_key ];
	    var target_side = pixel_customizer_data[ customizer_markup.target_side_key ];
	    var target_event = event_name_in;
	
	    var std_data = ConversionsGeneric.getStructuredConversionDataObject( pixel_details, target_side, target_platform, target_event );
	    var condition_set = std_data && pixel_customizer_data.conditions && _createConditionSet( pixel_customizer_data.conditions );
	
	    if( condition_set && !condition_set.pageLoadConditionsTrue() || !std_data ) return false;
	    if( condition_set ) std_data.conditions = condition_set;
	    return std_data;
	  }
	} 

 })(); 

ModuleHandler.addElement( "ConversionsCustomizer", ConversionsCustomizer ); // File end

var ConversionsGeneric = (function ConversionsGeneric()
{ 
 
	return element_interface =
	{
	  getStructuredConversionDataObject: function( tracking_pixel_attributes, target_side, target_platform, target_event )
	  {
	    if( !_exists( tracking_pixel_attributes ) || !_exists( target_side ) || !_exists( target_platform )) return false;
	
	    return {
	      "platform": target_platform,
	      "pixel_data": tracking_pixel_attributes,      
	      "measurement_side": ConfigUtils.getMeasurementSide( target_platform, target_side ),
	      "event_name": target_event || "any"
	    };
	  },
	
	  addToDestination: function( destination, target_event, std_data )
	  {
	    destination[ target_event ] = destination[ target_event ] || [];
	    destination[ target_event ].push( std_data );
	  }
	}; 

 })(); 

ModuleHandler.addElement( "ConversionsGeneric", ConversionsGeneric ); // File end

var ConversionsHitTemplate = (function ConversionsHitTemplate()
{ 
 
	var hit_markup = // Hit Tag v2
	{ 
	  "pixel_attributes_key": "pixel_value",
	  "platform_key": "platform",
	  "event_name_key": "eventName",
	  "target_side_key": "target_side"
	};
	
	return element_interface = 
	{
	  initialize: function()
	  {
	    ConfigUtils.getHitTemplateConversions = this.process;
	  },
	
	  process: function( tracking_options, event_name_in, all_hit_params )
	  {
	    return ( tracking_options.template_conversions || [] ).reduce( function( event_conversions, native_conv_obj )
	    {
	      var pixel_details = native_conv_obj[ hit_markup.pixel_attributes_key ];
	      var target_event = event_name_in != "conversions" ? event_name_in : "any";
	      var std_data;
	
	      if( _isStr( pixel_details ))
	      {
	        var target_platform = native_conv_obj[ hit_markup.platform_key ];
	        var target_side = native_conv_obj[ hit_markup.target_side_key ];
	  
	        std_data = ConversionsGeneric.getStructuredConversionDataObject( pixel_details, target_side, target_platform, target_event );
	      }
	  
	      else if( _isObj( pixel_details )) // it is data from Pixel Customizer template
	      {
	        std_data = ConversionsCustomizer.processData( pixel_details, target_event );
	      }
	
	      if( std_data && std_data.conditions )
	      {
	        if( std_data.conditions.eventConditionsTrue( all_hit_params )) event_conversions.push( std_data );
	        else { config.conversions = config.conversions || {}; ConversionsGeneric.addToDestination( config.conversions, target_event, std_data ); }
	      }
	
	      else if( std_data && !std_data.conditions ) event_conversions.push( std_data );
	
	      return event_conversions;
	      
	    }, []);
	  }
	} 

 })(); 

ModuleHandler.addElement( "ConversionsHitTemplate", ConversionsHitTemplate ); // File end

var CustomAttributes = (function CustomAttributes()
{ 
 
	return element_interface =
	{
	  get: function()
	  {
	    return { user_defined_attributes: raw_config.user_defined_attributes || [] };
	  }
	} 

 })(); 

ModuleHandler.addElement( "CustomAttributes", CustomAttributes ); // File end

var CustomSettings = (function CustomSettings()
{ 
 
	var self = 
	{
	  get: function()
	  {
	    return ConfigHelper.mapTable( raw_config.customSettings );
	  }
	} 

	return self; 

 })(); 

ModuleHandler.addElement( "CustomSettings", CustomSettings ); // File end

var DefaultSettings = (function DefaultSettings()
{ 
 
	return element_interface =
	{
	  pixels: 
	  { 
	    consent_mode_platforms: [ "ga4", "gac", "gar", "flt", "flsc", "fluc", "flpsc" ],
	    frontend_only_platforms: [ "linkedin", "bing", "twt", "ptrst" ]
	  },
	
	  gtag_settings: 
	  {
	    url_queries_to_exclude: [ "fbclid", "ref-original", "sfmc_id", "consent", "msclkid" ],
	    redact_emails_in_url: true
	  },
	
	  limited_platforms:
	  {
	    "twt": { 
	      whitelist: [ "page_view", "add_to_cart", "add_to_wishlist", "complete_registration", "download", "begin_checkout", "purchase", "sign_up", "view_item", "view_item_list" ]
	    }
	  }
	}; 

 })(); 

ModuleHandler.addElement( "DefaultSettings", DefaultSettings ); // File end

var EventPermissions = (function EventPermissions()
{ 
 
	return element_interface =
	{
	  get: function()
	  {
	    return {
	      attribute_permissions: getPermissionSettings( "attribute" ),
	      event_permissions: getPermissionSettings( "event" )
	    }
	  }
	}
	
	function getPermissionSettings( subject_type )
	{
	  var rule = raw_config[ subject_type + "_rule" ];
	  var list = getListItemsAsArray( subject_type + "_list" );
	
	  switch( rule )
	  {
	    case "blacklist_all": return { whitelist: [] };
	    case "whitelist": return { whitelist: list };
	    case "blacklist": return { blacklist: list };
	  }
	}
	
	function getListItemsAsArray( list_name )
	{
	  return ( raw_config[ list_name ] || [] ).reduce( function( all, current )
	  {
	    return current.name ? all.concat( current.name ) : all;
	
	  }, []);
	} 

 })(); 

ModuleHandler.addElement( "EventPermissions", EventPermissions ); // File end

var MiscCompiler = (function MiscCompiler()
{ 
 
	return element_interface =
	{
	  getEcomSettings: function()
	  {
	    return raw_config.eec_module_config && !_isEmpty( raw_config.eec_module_config ) ? { ecomModuleIsEnabled: true } : {};
	  },
	
	  getSinglePixels: function()
	  {
	    var single_pixels_raw = ConfigHelper.mapTable( raw_config.uxTools ? "uxTools" : "singlePixels" ) || {};
	
	    var settings =
	    {
	      single_pixels: {},
	      single_pixel_details: {}
	    };
	
	    for( var platform in single_pixels_raw )
	    {
	      var container = new PixelContainer( platform, single_pixels_raw[ platform ]);
	
	      if( !container ) continue;
	
	      settings.single_pixels[ platform ] = container.pixel_data;
	      settings.single_pixel_details[ platform ] = container;
	    }
	
	    if( settings.single_pixels.googleOptimize )
	    {
	      settings.is_UI_customization_present = true;
	    }
	
	    return settings;
	  },
	
	  getCopiedSettings: function()
	  {
	    return [
	      "consentModeIsEnabled", "GDPRConsentProvider", "GDPRConsentProviderKey",
	      "eec_module_config", "basket_cookie_lifetime_days", "currency",
	      "debugMode", "baseContainerId", 
	    ]
	    .reduce( function( all, attr )
	    {
	      all[ attr ] = raw_config[ attr ];
	      return all;
	    }, 
	    
	    {});
	  }
	}; 

 })(); 

ModuleHandler.addElement( "MiscCompiler", MiscCompiler ); // File end

var TaggingCompiler = (function TaggingCompiler()
{ 
 
	var all_default_selectors = { "link": "a", "button": "button, [role=\"button\"]", "image": "img" };
	
	return element_interface =
	{
	  getSettings: function()
	  {
	    var tagging_settings = {};
	    
	    if( raw_config.auto_tagging || raw_config.custom_tagging ) 
	    {
	      tagging_settings.generic_tagging = getSelectors();
	    }
	
	    if( raw_config.tagging_opt_out ) 
	    {
	      tagging_settings.exclusion_selectors = getOptOutSelectors();
	    }
	
	    return Object.assign( tagging_settings, getAttributeNames());
	  }
	};
	
	function getAttributeNames()
	{
	  return { 
	    internal_traqed_asset_id_attribute: raw_config.internal_traqed_asset_id_attribute || "data-traqed-props-id",
	    client_defined_id_attribute: raw_config.client_defined_id_attribute || "data-traqed-desc-id",
	    element_visibility_attribute: "data-traqed-item-visibility" 
	  };
	}
	
	function sortCustomConfig()
	{
	  var custom_tagging_prior = { link: 1, image: 2, button: 3 };
	
	  raw_config.custom_tagging.sort( function( a, b )
	  {
	    return custom_tagging_prior[ a.name ] > custom_tagging_prior[ b.name ] ? -1 : 1;
	  });
	}
	
	function getSettingTables()
	{  
	  if( raw_config.custom_tagging ) sortCustomConfig();
	
	  return [ "custom_tagging", "auto_tagging" ].reduce( function( all, table_name )
	  {
	    return raw_config[ table_name ] ? all.concat( raw_config[ table_name ]) : all;
	  }, []);
	}
	
	function getSelectors()
	{
	  return getSettingTables().reduce( function( all, table_row )
	  {
	    // only custom selector table has selector field
	    var selector = table_row.selector || all_default_selectors[ table_row.name ];
	
	    var tagging_spec_obj = { "name": table_row.name, "selector": selector };
	    return all.concat( tagging_spec_obj );
	  }, []);
	};
	
	function getOptOutSelectors()
	{
	  return ( raw_config.tagging_opt_out || [] ).reduce( function( all, table_row )
	  {
	    return table_row.element_selector && all.concat([ table_row.element_selector, ", ", table_row.element_selector, " *" ].join( "" ));
	  }, 
	
	  []).join( ", " );
	} 

 })(); 

ModuleHandler.addElement( "TaggingCompiler", TaggingCompiler ); // File end

var TrackingCompiler = (function TrackingCompiler()
{ 
 
	var gua_settings = {};
	
	return element_interface =
	{
	  getPixels: function()
	  {
	    var tracking_pixel_config ;
	
	    if( raw_config.manually_add_server_side_pixels )
	    {
	      var server_pixels = getTrackingPixels( raw_config.server_side_pixels, "server" );
	      var client_pixels = getTrackingPixels( raw_config.tracking, "client" );
	
	      tracking_pixel_config = mergePixelSettigns( client_pixels, server_pixels );
	    }
	
	    else tracking_pixel_config = getTrackingPixels( raw_config.tracking, "server" );
	
	    return {
	      tracking_pixels: tracking_pixel_config,
	      tracking_meta: getCollections( tracking_pixel_config )
	    };
	  }
	};
	
	function getCollections( pixels )
	{
	  var pixel_meta = {};
	  pixel_meta.gua_all = [].concat( pixels.gua && pixels.gua.client || [], pixels.gua && pixels.gua.server || [] );
	  pixel_meta.ga4_all = [].concat( pixels.ga4 && pixels.ga4.client || [], pixels.ga4 && pixels.ga4.server || [] );
	  pixel_meta.ga_server = [].concat( pixels.gua && pixels.gua.server || [], pixels.ga4 && pixels.ga4.server || [] );
	  pixel_meta.ga_client = [].concat( pixels.gua && pixels.gua.client || [], pixels.ga4 && pixels.ga4.client || [] );
	
	  pixel_meta.ga_all = [].concat( pixel_meta.gua_all, pixel_meta.ga4_all );
	  pixel_meta.all_platforms = Object.keys( pixels );
	
	  if( !_isEmpty( gua_settings ))
	  {
	    pixel_meta.gua_settings = gua_settings;
	  }
	
	  return pixel_meta;
	}
	
	function getTrackingPixels( table, side_of_preference )
	{
	  return ( table || [] ).reduce(( acc, curr ) => 
	  {
	    var tracking_id;
	    var platform = curr.key;
	    var pixel_data = curr.value;    
	
	    // conditional pixels or pixels present on certain paths only
	    // that may not exist
	
	    if( !pixel_data )
	    {
	      return acc;
	    }
	    
	    else if( platform === "gua" && _isObj( pixel_data ))
	    {
	      tracking_id = pixel_data.pixel_details;
	      gua_settings[ tracking_id ] = { "customMap": getCustomMap( pixel_data )};
	    }
	
	    else tracking_id = pixel_data;
	    
	    return addPixel( side_of_preference, platform, tracking_id, acc );    
	  }, {});
	};
	
	function getCustomMap( gua_settings )
	{
	  var custom_map = {};
	
	  var dimensions = ConfigHelper.mapTable( gua_settings.dimensions ) || {};
	  var metrics = ConfigHelper.mapTable( gua_settings.metrics ) || {};
	
	  for( var attr in metrics )
	  {
	    custom_map[ "metric" + attr ] = metrics[ attr ];
	  }
	
	  for( var attr in dimensions )
	  {
	    custom_map[ "dimension" + attr ] = dimensions[ attr ];
	  }
	
	  return custom_map;
	}
	
	function addPixel( side_of_preferance, platform, pixel_data, target_obj )
	{
	  target_obj[ platform ] = target_obj[ platform ] || {};
	
	  var measurement_side = ConfigUtils.getMeasurementSide( platform, side_of_preferance );
	  var current_pixels = target_obj[ platform ][ measurement_side ] || [];
	
	  target_obj[ platform ][ measurement_side ] = current_pixels.concat( pixel_data );
	
	  return target_obj;
	}
	
	function mergePixelSettigns( from, to ) 
	  {
	    for ( var property in from )
	    {
	      var fromProperty = from[ property ];
	
	      if ( _isArray( fromProperty )) 
	      {
	        to[ property ] = ( to[ property ] || [] ).concat( fromProperty );
	      } 
	      
	      else if ( _isObj( fromProperty )) 
	      {
	        if ( !_isObj( to[ property ])) 
	        {
	          to[ property ] = {};
	        }
	
	        merge( fromProperty, to[ property ]);
	      } 
	      
	      else 
	      {
	        to[ property ] = fromProperty;
	      }
	    }
	
	    return to;
	  } 

 })(); 

ModuleHandler.addElement( "TrackingCompiler", TrackingCompiler ); // File end

var VeluxCustoms = (function VeluxCustoms()
{ 
 
	return element_interface =
	{
	  getSettings: function()
	  {
	    if( config.customs && config.customs.country == "germany" )
	    {
	      addPvConversion( "874699793" );
	    }
	
	    if( config.customs && config.customs.country == "poland" )
	    {
	      addPvConversion( "777035908" );
	    }
	  }
	};
	
	// @todo: re-implement
	
	function addPvConversion( pixel )
	{
	  config.conversions = config.conversions || {};
	
	  var conv = ConversionsGeneric.getStructuredConversionDataObject( pixel, "client", "gar", "page_view" );
	
	  ConversionsGeneric.addToDestination( config.conversions, "page_view", conv );
	} 

 })(); 

ModuleHandler.addElement( "VeluxCustoms", VeluxCustoms ); // File end

var ConfigCompiler = (function ConfigCompiler()
{ 
 
	return element_interface =
	{
	  execute: function()
	  {
	    var config_ready = Object.assign(
	
	      DefaultSettings,
	      
	      { utils: ConfigUtils },
	      { conversions: ConversionsConfig.getStructuredFormat() },
	      { cross_site_domains: ConfigUtils.getCrossSiteDomains() },
	      { customs: CustomSettings.get() },
	
	      TrackingCompiler.getPixels(),
	      TaggingCompiler.getSettings(),
	
	      EventPermissions.get(),
	      CustomAttributes.get(),
	
	      MiscCompiler.getEcomSettings(), 
	      MiscCompiler.getSinglePixels(), 
	      MiscCompiler.getCopiedSettings(),
	
	      { get: function( key ){ return _getValue( key, config ); }}
	    );
	
	    return config_ready;
	  }
	}; 

 })(); 

ModuleHandler.addElement( "ConfigCompiler", ConfigCompiler ); // File end

var PolyfillHandler = (function PolyfillHandler()
{ 
 
	var self = {};
	
	var _private_data = self._private =
	{
	  scripts_added: 0,
	  scripts_loaded: 0
	}
	
	self.run = function( ready_callback )
	{
	  self.ready_callback = ready_callback;
	
	  checkStringEndsWith();
	  checkEventListener();
	  checkObjectAssign();
	  checkArrayFind();
	
	  if( _private_data.scripts_added === 0 ) 
	  {
	    ready_callback();
	  }
	}
	
	function addScript( url, attributes, callback )
	{
	  var s = document.createElement( "script" );
	  s.async = true;
	  s.src = url;
	
	  for( var key in attributes || {})
	  {
	    s.setAttribute( key, attributes[ key ]);
	  }
	
	  if( callback ) callback( s );
	
	  document.head.appendChild( s );
	}
	
	function registerLoad( script )
	{
	  _private_data.scripts_added++;
	
	  script.onload = function()
	  { 
	    _private_data.scripts_loaded++;
	
	    if( _private_data.scripts_added === _private_data.scripts_loaded && _private_data.ready_callback )
	    {
	      _private_data.ready_callback();
	    }
	  };
	}
	
	function checkEventListener()
	{
	  if( !Element.prototype.addEventListener )
	  {
	    addScript( "https://cdn.jsdelivr.net/npm/add-event-listener@1.0.0/index.min.js", null, registerLoad );
	  }
	}
	
	function checkObjectAssign()
	{
	  if( !Object.assign )
	  {
	    addScript( "https://cdn.jsdelivr.net/npm/object-assign-polyfill@0.1.0/index.min.js", null, registerLoad );
	  }
	}
	
	function checkArrayFind()
	{
	  Array.prototype.find = Array.prototype.find || function( cb ){
	    for( var i in this ){
	      if(cb(this[i], null, null)) return this[i];
	    }
	  };
	}
	
	function checkStringEndsWith()
	{
	  if (!String.prototype.endsWith) 
	  {
	    String.prototype.endsWith = function( search, this_len ) 
	    {
	      if ( this_len === undefined || this_len > this.length ) 
	      {
	        this_len = this.length;
	      }
	      return this.substring( this_len - search.length, this_len ) === search;
	    };
	  }
	} 

	return self; 

 })(); 

ModuleHandler.addElement( "PolyfillHandler", PolyfillHandler ); // File end

})(); // Module end


(function ObserversModule()
{
	var ObserverModule =
	{
	  addPushListener( fn, name, settings )
      {
        return DataLayerPushObserver.addListener( fn, Object.assign( settings || {}, { "name": name }));
      },
	
	  addPushCallback( fn, event_name )
	  {
	    return DataLayerPushObserver.addCallback( fn, { "activation_event": event_name, "execute_once": true, "past_events": true });
	  },
	
	  setPushMessageHandler: function( controller )
	  {
	    return DataLayerPushObserver.setMessageHandler( controller ) && DataLayerPushObserver;
	  },
	
	  addAjaxListener( fn, name )
	  {
	    return AjaxObserver.addListener( fn, { "name": name });
	  },
	
	  addClickListener( fn, name )
	  {
	    return ClickObserver.addListener( fn, { "name": name });
	  },
	
	  addLifeCycleEventListener( life_cycle_event, fn, name, listen_to_past )
	  {
	    return LifeCycleEventObserver.addListener( fn, { "activation_event": life_cycle_event, "name": name, "past_events": _exists( listen_to_past )});
	  },
	
	  addStateUpdateListener( fn, settings )
	  {
	    return StateUpdateObserver.addListener( fn, settings );
	  }
	};
	
	var module = ModuleHandler.createModule( "observer_module", ObserverModule );

var AjaxObserver = (function AjaxObserver()
{ 
 
	function AjaxObserver()
	{
	  Observer.call( this, "ajax" );
	  this.send_original = XMLHttpRequest.prototype.send;
	}
	
	AjaxObserver.prototype = ( Object.create || objectCreate )( Observer.prototype );
	AjaxObserver.prototype.constructor = AjaxObserver;
	
	AjaxObserver.prototype.doStartListening = function()
	{
	  var request_observer = this;
	
	  XMLHttpRequest.prototype.send = function()
	  {
	    var onload_original = this.onload;
	
	    this.onload = function( event )
	    {
	      return request_observer.handleMessage( event, onload_original, this );
	    };
	
	    return request_observer.send_original.apply( this, [].slice.call( arguments, 0 ));
	  };
	}
	
	AjaxObserver.prototype.handleMessage = function( event, onload_original, xml_req_instance )
	{
	  if( _isFn( onload_original ))
	  {
	    onload_original.call( xml_req_instance, event );
	  }
	
	  this.executeListeners( event );
	}
	
	return element_interface = new AjaxObserver(); 

 })(); 

ModuleHandler.addElement( "AjaxObserver", AjaxObserver ); // File end



	var LISTENER_STATUS =
	{
	  "ACTIVE": "active",
	  "REMOVED": "removed"
	};
	
	function Listener( fn, settings, observer )
	{
	  this.id;
	  this.name;
	  this.listen_to_past;
	  this.current_status;
	  this.executable = fn;
	  this.observer = observer;
	  this.type = observer.type;
	  this.registering_key;
	
	  this.id = Registry.addItem( this );
	
	  this.name = settings.name || fn.name || "";
	  this.listen_to_past = settings.past_events;
	  this.activation_event = settings.activation_event;
	  this.execute_once = settings.execute_once;
	}
	
	Listener.prototype.setRegKey = function( key )
	{
	  this.registering_key = key;
	  return key;
	}
	
	Listener.prototype.isRemoved = function()
	{
	  return this.current_status == "REMOVED";
	}
	
	Listener.prototype.setActive = function()
	{
	  this.current_status = "ACTIVE";
	}
	
	Listener.prototype.execute = function()
	{
	  try
	  {
	    var ret = this.executable.apply( null, arguments );
	
	    if( this.execute_once )
	    {
	      this.remove();
	    }
	
	    return ret;
	  }
	
	  catch( err )
	  { 
	    _error( "Listener error ", err.message );
	  }
	}
	
	Listener.prototype.remove = function()
	{
	  if( this.current_status == "REMOVED" )
	  {
	    _error( "Listener has already been removed" );
	  }
	
	  this.observer.removeListener( this.registering_key );
	  this.current_status = "REMOVED";
	}

	Registry.registerClass( Listener );


	function Observer( observer_type )
	{
	  this.registered_listeners = {};
	  this.listener_count = 0;
	  this.is_listening;
	
	  this.type = observer_type;
	  this.past_events = [];
	}
	
	Observer.prototype.startListening = function()
	{
	  this.is_listening = true;
	  this.doStartListening();
	}
	
	Observer.prototype.addListener = function( fn, settings_received )
	{
	  if( !_isFn( fn ))
	  {
	    _error( "Type '" + _getType( fn ) + "' is not a valid listener function." );
	  }
	  
	  var listener = new Listener( fn, settings_received, this );
	  var listener_key = listener.setRegKey( this.getListenerKey( listener.name ));
	
	  this.registered_listeners[ listener_key ] = listener;
	  this.listener_count++;
	
	  if( !this.is_listening )
	  {
	    this.startListening();
	  }
	
	  if( listener.listen_to_past )
	  {
	    this.processPastEvents( listener, this.past_events.length );
	  }
	
	  return listener;
	}
	
	Observer.prototype.addPastEvent = function( event )
	{
	  this.past_events.push( event );
	}
	
	Observer.prototype.processPastEvents = function( listener, past_events_length )
	{
	  for( var i = 0; i < past_events_length; i++ )
	  {
	    if( listener.isRemoved()) return;
	
	    var event_to_process = this.past_events[ i ];
	
	    if( listener.activation_event && ( !event_to_process || event_to_process.event !== listener.activation_event ))
	    {
	      continue;
	    }
	
	    listener.execute( event_to_process );
	  }
	}
	
	Observer.prototype.getListenerKey = function( listener_name )
	{
	  if( !listener_name || this.registered_listeners[ listener_name ])
	  {
	    return [ this.type, this.listener_count, ( listener_name || "anonym" )].join( "|" ); 
	  }
	
	  return listener_name;
	}
	
	Observer.prototype.removeListener = function( reg_key )
	{
	  if( !this.registered_listeners[ reg_key ]) _error( "Listener to delete does not exist" );
	  delete this.registered_listeners[ reg_key ];
	}
	
	Observer.prototype.executeListeners = function( args )
	{
	  for( var listener_key in this.registered_listeners )
	  {
	    var listener = this.registered_listeners[ listener_key ];
	
	    if( listener.activation_event && ( !args || args.event !== listener.activation_event ))
	    {
	      continue;
	    }
	
	    listener.execute( args );
	  }
	
	  this.addPastEvent( args );
	}

	Registry.registerClass( Observer );

var ClickObserver = (function ClickObserver()
{ 
 
	function ClickObserver()
	{
	  Observer.call( this, "click" );
	
	  this.startListening();
	}
	
	ClickObserver.prototype = ( Object.create || objectCreate )( Observer.prototype );
	ClickObserver.prototype.constructor = ClickObserver;
	
	ClickObserver.prototype.doStartListening = function()
	{
	  document.addEventListener( "click", this.handleClickEvent.bind( this ));
	}
	
	ClickObserver.prototype.handleClickEvent = function( event )
	{
	  this.executeListeners( event );
	}
	
	return element_interface = new ClickObserver(); 

 })(); 

ModuleHandler.addElement( "ClickObserver", ClickObserver ); // File end

var DataLayerPushObserver = (function DataLayerPushObserver()
{ 
 
	var reassigned_pushes = [];
	var message_handler;
	
	var callbacks = {};
	
	function DataLayerPushObserver()
	{
	  Observer.call( this, "data_layer_push" );
	
	  this.is_listening = true;
	  var dl_observer = this;
	
	  window.dataLayer.push( function()
	  {
	    for( var attr in window.google_tag_manager )
	    {
	      if( window.google_tag_manager[ attr ].dataLayer && window.google_tag_manager[ attr ].dataLayer.get === this.get && attr.indexOf( "-" ) > 1 )
	      {
	        replacePush( attr, dl_observer );
	      }
	    }
	  });
	}
	
	function replacePush( container_id, dl_observer )
	{
	  var push_data = addReassignedPush( container_id );
	
	  function isTopmostPush(){ return push_data.offset + 1 == reassigned_pushes.length; }
	  
	  push_data.updated_fn = window.dataLayer.push = function()
	  {
	    if( isTopmostPush())
	    {
	      dl_observer.handleMessage( arguments, push_data.original_fn );
	    }
	
	    else return dl_observer.forward( push_data.original_fn, arguments );
	  }
	}
	
	function addReassignedPush( container_id )
	{
	  var push_data = { "target_id": container_id, "original_fn": window.dataLayer.push, "offset": reassigned_pushes.length };
	  reassigned_pushes.push( push_data );
	  return push_data;
	}
	
	DataLayerPushObserver.prototype = ( Object.create || objectCreate )( Observer.prototype );
	DataLayerPushObserver.prototype.constructor = DataLayerPushObserver;
	
	// @todo: refactor!!!
	DataLayerPushObserver.prototype.addCallback = function( fn, settings )
	{
      var event_exists = window.dataLayer.find( function( msg )
      { 
        return ( msg && msg.event == settings.activation_event ) || ( msg && msg[0] && msg[0].event == settings.activation_event ); 
      });
      
	  if( event_exists ) return fn();
	  
	  var key = settings.activation_event.replace( /\./gi, "_" );
	
	  callbacks[ key ] = callbacks[ key ] || [];
	  callbacks[ key ].push( fn );
	}
	
	DataLayerPushObserver.prototype.forward = function( ancestor, args )
	{
	  SYSTEM.queue( function(){ ancestor.apply( window.dataLayer, args ); });
	}
	
	DataLayerPushObserver.prototype.submitPrimaryMessage = function( args )
	{
	  return ( reassigned_pushes.length ? reassigned_pushes.slice( -1 )[0].original_fn : window.dataLayer.push )( args );
	}
	
	DataLayerPushObserver.prototype.handleMessage = function( args, forward_fn )
	{
	  if( !message_handler )
	  {
	    return this.forward( forward_fn, args );
	  }
	
	  var event_name = args && args.event || args && args[ 0 ] && args[ 0 ].event || "";
	  var key = event_name.replace( /\./gi, "_" );
	
	  if( callbacks[ key ]) callbacks[ key ].forEach( function( fn ){ fn(); });
	  delete callbacks[ key ];
	
	  return message_handler.handleMessage( args, forward_fn );
	}
	
	DataLayerPushObserver.prototype.processPastEvents = function( listener )
    {
      for( var i = 0; i < window.dataLayer.length; i++ )
      {
        if( listener.isRemoved()) return;
    
        var event_to_process = window.dataLayer[ i ];
    
        if( listener.activation_event && ( !event_to_process || event_to_process.event !== listener.activation_event ))
        {
          continue;
        }
    
        listener.execute( event_to_process );
      }
    }
	
	DataLayerPushObserver.prototype.setMessageHandler = function( message_handler_in )
	{
	  return message_handler = message_handler_in;
	}
	
	return element_interface = new DataLayerPushObserver(); 

 })(); 

ModuleHandler.addElement( "DataLayerPushObserver", DataLayerPushObserver ); // File end

var LifeCycleEventObserver = (function LifeCycleEventObserver()
{ 
 
	function LifeCycleEventObserver()
	{
	  Observer.call( this, "life_cycle_event" );
	  this.startListening();
	}
	
	LifeCycleEventObserver.prototype = ( Object.create || objectCreate )( Observer.prototype );
	LifeCycleEventObserver.prototype.constructor = LifeCycleEventObserver;
	
	LifeCycleEventObserver.prototype.doStartListening = function()
	{
	  LifeCycleHandler.addObserver( this );
	}
	
	LifeCycleEventObserver.prototype.handleEvent = function( event_data )
	{
	  this.executeListeners( event_data );
	}
	
	return element_interface = new LifeCycleEventObserver(); 

 })(); 

ModuleHandler.addElement( "LifeCycleEventObserver", LifeCycleEventObserver ); // File end


var StateUpdateObserver = (function StateUpdateObserver()
{ 
 
	function StateUpdateObserver()
	{
	  this._store_original;
	
	  Observer.call( this, "state_update" );
	}
	
	StateUpdateObserver.prototype = ( Object.create || objectCreate )( Observer.prototype );
	StateUpdateObserver.prototype.constructor = StateUpdateObserver;
	
	StateUpdateObserver.prototype.doStartListening = function()
	{
	  this._store_original = _store;
	  
	  _store = this.handleMessage.bind( this );
	}
	
	StateUpdateObserver.prototype.handleMessage = function( key, val )
	{
	  var result = this._store_original( key, val );
	
	  this.executeListeners({ "event": key + "_update", "result": result });
	  
	  return result;
	}
	
	return element_interface = new StateUpdateObserver(); 

 })(); 

ModuleHandler.addElement( "StateUpdateObserver", StateUpdateObserver ); // File end

})(); // Module end


(function DataLayerModule()
{
	var observer_module;
	
	var DataLayerController = 
	{  
	  initialize: function()
	  {
	    observer_module = ModuleHandler.get( "observer_module" );
	  },
	
	  submitPrimaryMessage: function()
	  {
	    MessageRouter.submitPrimaryMessage( arguments );
	  },
	
	  submitHitEvent: function( event_name, event_attributes, pixels_raw )
	  {
	    PixelCompiler.process( event_name, event_attributes, pixels_raw );
	  }
	};
	
	var module = ModuleHandler.createModule( "data_layer_controller", DataLayerController );


	var MESSAGE_STATES =
	{
	  "PROCESSING_NOT_STARTED_YET": 1,
	  "FINISHED_PROCESSING": 2,
	  "PROCESSING_IN_PROGRESS": 3,
	  "LISTENER_FAILED": 4,
	  "MESSAGE_CANCELLED": 5
	};
	
	function DataLayerMessage( args )
	{ 
	  this.end_result;  
	  this.content;
	  this.event;
	  this.raw;
	  this.id; 
	  
	  this.id = Registry.addItem( this );
	  this.content = getContent( args );
	  this.event = getEvent( args );
	  this.raw = args;
	}
	
	DataLayerMessage.prototype.cancel = function()
	{
	  this.end_result = "MESSAGE_CANCELLED";
	}
	
	DataLayerMessage.prototype.isCancelled = function()
	{
	  return this.end_result == "MESSAGE_CANCELLED";
	}
	
	DataLayerMessage.prototype.getContent = function()
	{
	  return this.content;
	}
	
	DataLayerMessage.prototype.getEvent = function()
	{
	  return this.event;
	}
	
	
	function getContent( arguments_obj )
	{
	  if( arguments_obj.length == 1 )
	  {
	    return arguments_obj[ 0 ];
	  }
	
	  if( arguments_obj.length > 1 )
	  {
	    return arguments_obj;
	  }
	  
	  return "";
	}
	
	function getEvent( arguments_obj )
	{
	  var getGtagEvent = function( arguments_obj )
	  {
	    if( arguments_obj.length == 3 || arguments_obj[ 0 ] === "event" )
	    {
	      return arguments_obj[ 1 ];
	    }
	  }
	
	  if( arguments_obj.length == 1 )
	  {
	    if( _isArguments( arguments_obj[ 0 ] ))
	    {
	      return getGtagEvent( arguments_obj[ 0 ]);
	    }
	
	    return arguments_obj[ 0 ].event;
	  }
	
	  return getGtagEvent( arguments_obj );
	}

	Registry.registerClass( DataLayerMessage );

var ConsentManager = (function ConsentManager()
{ 
 
	var supported_consent_categories = [ "statistics", "marketing" ];
	var current_consent;
	var consent_handler;
	
	return element_interface = 
	{
	  supported_consent_categories: supported_consent_categories,
	
	  initialize: function()
	  {
	    if( !config.GDPRConsentProvider || config.GDPRConsentProvider == "none" )
	    {
	      this.setInitialConsentState( supported_consent_categories );
	    }
	  },
	  
	  setInitialConsentState: function( accepted_categories_array )
	  {
	    current_consent = _store( "consent", getFormattedConsent( accepted_categories_array ));
	  },
	
	  submitConsent: function( accepted_categories_array )
	  {
	    var old_consent = current_consent;
	    var new_consent = getFormattedConsent( accepted_categories_array );
	
	    if( current_consent === new_consent ) return;
	
	    current_consent = _store( "consent", new_consent );
	
	    var has_consent = hasConsent( new_consent );
	    var had_consent = hasConsent( old_consent );
	
	    if( has_consent && !had_consent )
	    {
	      if( config.consentModeIsEnabled )
	      {
	        ConsentModeManager.pushConsentGranted();
	      }
	      
	      HitReleaseHandler.consentAccepted();
	    }
	
	    if( !has_consent && had_consent && config.consentModeIsEnabled )
	    {
	      ConsentModeManager.pushConsentDenied();
	    }
	  }
	};
	
	function hasConsent( formatted_consent )
	{
	  return formatted_consent && formatted_consent.indexOf( "statistics" ) > -1;
	}
	
	function getFormattedConsent( accepted_categories_array )
	{
	  if( !_isArray( accepted_categories_array ))
	  {
	    _error( "Accepted consent categories should be submitted in array format" );
	  }
	
	  if( accepted_categories_array.find( function( category ){ return !_contains( supported_consent_categories, category ); }))
	  {
	    _error( "Unsupported consent category submitted" );
	  }
	
	  return accepted_categories_array.join( "|" );
	} 

 })(); 

ModuleHandler.addElement( "ConsentManager", ConsentManager ); // File end

var ConsentModeManager = (function ConsentModeManager()
{
	return element_interface = 
	{
	  pushConsentDenied: function()
	  {
	    pushMsg( "consent", "update", {
	      'ad_storage': 'denied',
	      'analytics_storage': 'denied'
	    });
	  },
	
	  pushConsentGranted: function()
	  {
	    pushMsg( "consent", "update", {
	      'ad_storage': 'granted',
	      'analytics_storage': 'granted'
	    });
	  }
	};
	
	function pushMsg()
	{
	  MessageRouter.submitPrimaryMessage( arguments );
	} 

 })(); 

ModuleHandler.addElement( "ConsentModeManager", ConsentModeManager ); // File end

var CookiebotHelper = (function CookiebotHelper()
{ 
 
	var is_consent_screen;
	
	return element_interface =
	{
	  initialize: function()
	  {
	    if( config.GDPRConsentProvider == "cookiebot" )
	    {
	      observer_module.addPushListener( cookiebotPreprocessor );
	
	      window.CookiebotCallback_OnDialogDisplay = function()
	      {
	        is_consent_screen = _store( "is_consent_screen", true );
	      };
	  
	      ConsentManager.setInitialConsentState( config.utils.getCookiebotConsentState());
	    }
	  }
	};
	
	function getConsentFromWindowObject()
	{
	  return Object.keys( Cookiebot.consent ).filter( function( elem )
	  { 
	    return Cookiebot.consent[ elem ] === true && _contains( ConsentManager.supported_consent_categories, elem );
	  });
	}
	
	function cookiebotPreprocessor( message )
	{
	  if(( message.getEvent() || "" ).indexOf( "cookie_consent_" ) !== 0 ) return;
	
	  message.cancel();
	
	  var accepted_consent_categories = getConsentFromWindowObject();
	
	  if( !accepted_consent_categories.length ) accepted_consent_categories = config.utils.getCookiebotConsentState();
	
	  if( is_consent_screen && config.is_UI_customization_present && _contains( accepted_consent_categories, "statistics" ))
	  {
	    return RedirectionHandler.redirect();
	  }
	  
	  ConsentManager.submitConsent( accepted_consent_categories );
	} 

 })(); 

ModuleHandler.addElement( "CookiebotHelper", CookiebotHelper ); // File end

var OptanonHelper = (function OptanonHelper()
{ 
 
	return element_interface =
	{
	  "initialize": function()
	  {
	    if( config.GDPRConsentProvider == "oneTrust" )
	    {
	      console.error( "Onetrust not implemented!" );
	    }
	  }
	};
	
	function getInitialConsentState()
	{
	  // if dataLayer is not available, check the OptanonConsent cookie for consent groups
	  var consentCookie = getCookieValues('OptanonConsent', true)[0];
	  if (typeof consentCookie === 'string' && consentCookie.indexOf('groups=') > -1) {
	    var groupsPart = consentCookie.split("&").filter(function(keyval) {
	      // This is the part that stores the consent groups
	      return keyval.indexOf("groups=") === 0;
	    });
	    
	    if (groupsPart.length > 0) {
	      var groupValue = groupsPart[0].split("=")[1];
	      var consentGroupsArr = groupValue ? groupValue.split(",") : null;
	
	      if (consentGroupsArr) {
	        var consentGroups = consentGroupsArr.filter(function(group) {
	          return group.split(':')[1] === '1';
	        });
	        if (consentGroups.length > 0) {
	          // return changeType(consentGroups);
	        }
	      }
	    }
	  }
	}
	
	function oneTrustPreProcessor( message )
	{
	  var msg =  message.content;
	  var consent_categories_raw = msg.OnetrustActiveGroups || msg.OptanonActiveGroups;
	
	  if( !consent_categories_raw ) return;
	
	  message.cancel();
	
	  module.submitConsent( consent_categories_raw );
	} 

 })(); 

ModuleHandler.addElement( "OptanonHelper", OptanonHelper ); // File end

var RedirectionHandler = (function RedirectionHandler()
{ 
 
	return element_interface =
	{
	  redirect: function()
	  {
	    var loc = "";
	    var url = document.location.href;
	    var referrer = encodeURIComponent( document.referrer );
	    var query = "?" + "ref-original=" + referrer;
	    
	    if( url.includes("?") ) loc = url.replace( "?", query + "&" );
	    else if ( url.includes("#") ) loc = url.replace( "#", query + "#" );
	    else loc = url + query;
	  
	    document.location.replace( loc );
	  },
	
	  isRedirectedLandingPage: function()
	  {
	    return document.location && document.location.href && String( document.location.href ).indexOf( "ref-original=" ) > -1;
	  }
	}; 

 })(); 

ModuleHandler.addElement( "RedirectionHandler", RedirectionHandler ); // File end

var HitReleaseHandler = (function HitReleaseHandler()
{ 
 
	var inner_queue = [{'event': '__lets_start__'}];
	var processing_inner_queue;
	var page_view_received;
	inner_queue.pointer = 0;
	
	return element_interface = 
	{
	  inner_queue: inner_queue,
	
	  submitConversionEvent()
	  {
	    pushToDataLayer( arguments );
	  },
	
	  submitHitEvent: function()
	  {
	    if( arguments[ 1 ] === "page_view" && !page_view_received )
	    {
	      page_view_received = true;
	      inner_queue.splice( 1, 0, arguments );
	    }
	
	    else inner_queue.push( arguments );
	    
	    processQueue();
	  },
	
	  consentAccepted: function()
	  {
	    processQueue();
	  }
	};
	
	function processQueue(){
	
	  if( !_get( "consent" ) || !page_view_received || processing_inner_queue )
	  {
	    return;
	  }
	
	  processing_inner_queue = true;
	
	  if( inner_queue.pointer === 0 )
	  {
	    inner_queue[ 0 ].consent_categories = _get( "consent" ).split( "|" );
	    ModuleHandler.get( "scripts_module" ).loadScript( "zendesk" );
	  }
	
	  while( inner_queue.pointer < inner_queue.length )
	  {
	    var args_obj = inner_queue[ inner_queue.pointer++ ];
	    pushToDataLayer( args_obj );
	  }
	
	  processing_inner_queue = false;
	}
	
	function pushToDataLayer( args_obj )
	{
	  MessageRouter.submitPrimaryMessage( args_obj );
	} 

 })(); 

ModuleHandler.addElement( "HitReleaseHandler", HitReleaseHandler ); // File end

var SpamFilter = (function SpamFilter()
{ 
 
	return element_interface = 
	{
	  initialize: function()
	  {
	    observer_module.addPushListener( spamFilter );
	  }
	};
	
	function spamFilter( message )
	{
	  var msg = message.getContent();
	  var event = message.getEvent();
	
	  var is_spam = false;
	
	  if( !msg ) is_spam = true;
	
	  else if( _isArguments( msg ))
	  {
	    if( !msg.length || _contains([ "consent", "set" ], msg[ 0 ]))
	    {
	      is_spam = true;
	    }
	  }
	
	  else if( msg[ "developer_id.dMWZhNz" ])
	  {
	    is_spam = true;
	  }
	
	  if( is_spam )
	  {
	    message.cancel();
	  }
	} 

 })(); 

ModuleHandler.addElement( "SpamFilter", SpamFilter ); // File end

var MessageRouter = (function MessageRouter()
{ 
 
	var cancelled_messages = [];
	var push_observer;
	var primary_msg_submit_bound;
	
	return element_interface = 
	{
	  cancelled_messages: cancelled_messages,
	
	  initialize: function()
	  {
	    push_observer = observer_module.setPushMessageHandler( this );
	    primary_msg_submit_bound = push_observer.submitPrimaryMessage.bind( push_observer );
	  },
	
	  handleMessage: function( args, forward_fn )
	  {
	    var message = new DataLayerMessage( args );
	    push_observer.executeListeners( message );
	
	    if( !message.isCancelled())
	    {
	      push_observer.forward( forward_fn, args );
	    }
	
	    else cancelled_messages.push( message );
	  },
	
	  submitPrimaryMessage: function( args )
	  {
	    setTimeout( primary_msg_submit_bound, 0, args );
	  }
	}; 

 })(); 

ModuleHandler.addElement( "MessageRouter", MessageRouter ); // File end

var PixelCompiler = (function PixelCompiler()
{ 
 
	return element_interface =
	{
	  process: function( event_name, event_attributes, pixels_raw )
	  {
	    if( !config.consentModeIsEnabled )
	    {
	      return sendHitEvent( event_name, event_attributes, PixelHelper.formatTracking( pixels_raw ));
	    }
	
	    else if( !_get( "consent" ))
	    {
	      return splitConsentModePlatforms( event_name, event_attributes, pixels_raw );
	    }
	
	    else if( _get( "consent" ) && RedirectionHandler.isRedirectedLandingPage() && event_name == "page_view" )
	    {
	      return sendRedirectedPageView( event_name, event_attributes, pixels_raw );
	    }
	
	    else
	    {
	      return sendHitEvent( event_name, event_attributes, PixelHelper.formatTracking( pixels_raw ));
	    }
	  } 
	}
	
	function sendHitEvent( event_name, event_attributes, formatted_pixel_setup, consent_mode_conversion_event )
	{
	  if( !Object.keys( formatted_pixel_setup.client_pixels ).length && !Object.keys( formatted_pixel_setup.server_pixels ).length )
	  {
	    return;
	  }
	
	  if( !event_attributes.event_metadata )
	  {
	    _error( "Event metadata missing in Pixel Compiler" );
	  }
	
	  var event_attributes = Object.assign({}, event_attributes );
	  event_attributes.event_metadata = Object.assign({}, event_attributes.event_metadata, formatted_pixel_setup );
	  event_attributes.send_to = getAllGaPixels( formatted_pixel_setup );
	
	  if( consent_mode_conversion_event )
	  {
	    return HitReleaseHandler.submitConversionEvent( "event", event_name, event_attributes );
	  }
	
	  else return HitReleaseHandler.submitHitEvent( "event", event_name, event_attributes );
	}
	
	// page view event in ga4 & gua should only be submitted after consent to enable Optimize or other UX tools.
	
	function getPlatformsToRearrange( is_page_view )
	{
	  if( is_page_view )
	  {
	    return config.pixels.consent_mode_platforms.filter( function( platform ){ return platform !== "ga4"; });
	  }
	
	  else return [].concat( config.pixels.consent_mode_platforms );
	}
	
	function splitConsentModePlatforms( event_name, event_attributes, pixels_raw )
	{
	  var is_page_view = event_name == "page_view";
	  var consent_mode_platforms = getPlatformsToRearrange( is_page_view );
	
	  var consent_mode_pixel_setup = PixelHelper.formatTracking( pixels_raw, { "whitelist": consent_mode_platforms });
	  var consent_mode_event_name = is_page_view ? "page_view_conversons" : event_name;
	  sendHitEvent( consent_mode_event_name, event_attributes, consent_mode_pixel_setup, true );
	
	  var non_consent_mode_pixel_setup = PixelHelper.formatTracking( pixels_raw, { "blacklist": consent_mode_platforms });
	  sendHitEvent( event_name, event_attributes, non_consent_mode_pixel_setup );
	}
	
	function sendRedirectedPageView( event_name, event_attributes, pixels_raw )
	{
	  var consent_mode_platforms = getPlatformsToRearrange( true );
	  var non_consent_mode_pixel_setup = PixelHelper.formatTracking( pixels_raw, { "blacklist": consent_mode_platforms });
	  sendHitEvent( event_name, event_attributes, non_consent_mode_pixel_setup );
	}
	
	function getAllGaPixels( formatted_pixels )
	{
	  var gua_client = formatted_pixels.client_pixels.gua || [];
	  var gua_server = formatted_pixels.server_pixels.gua || [];
	
	  var ga4_client = formatted_pixels.client_pixels.ga4 || [];
	  var ga4_server = formatted_pixels.server_pixels.ga4 || [];
	
	  return [].concat( gua_client, gua_server, ga4_client, ga4_server );
	} 

 })(); 

ModuleHandler.addElement( "PixelCompiler", PixelCompiler ); // File end

var PixelHelper = (function PixelHelper()
{ 
 
	return element_interface =
	{
	  formatTracking: function( raw_pixels_obj, tracking_options )
	  {
	    var formatted_tracking = { "client_pixels": {}, "server_pixels": {}};
	
	    for( var platform in raw_pixels_obj )
	    {
	      if( _usagePermissionGranted( platform, tracking_options ))
	      {
	        getFormattedSetup( formatted_tracking, platform, raw_pixels_obj )
	      }
	    }
	
	    return formatted_tracking;
	  }
	};
	
	function getFormattedSetup( formatted_tracking, platform, pixels_obj )
	{
	  [ "client", "server" ].forEach( function( side )
	  {
	    if( pixels_obj[ platform ][ side ])
	    {
	      var pixel_data = pixels_obj[ platform ][ side ];
	      var target_root = formatted_tracking[ side + "_pixels" ];
	      
	      target_root[ platform ] = getFormattedPixels( pixel_data, platform );
	    }
	  });
	
	  return formatted_tracking;
	}
	
	function getFormattedPixels( pixel_data, platform )
	{
	  return platform === "fb" ? pixel_data.join( "," ) : pixel_data;
	} 

 })(); 

ModuleHandler.addElement( "PixelHelper", PixelHelper ); // File end

})(); // Module end


(function ScriptsModule()
{
	var registered_scripts = {};
	var events_module;
	
	var ScriptsModule = 
	{
	  initialize: function()
	  {
	    events_module = ModuleHandler.get( "events" );
	  },
	
	  registerScript: function( script_name, init_fn )
	  {
	    if( registered_scripts[ script_name ])
	    {
	      _error( "Script with the given name already exists" );
	    }
	
	    if( !_isFn( init_fn ))
	    {
	      _error( "Script initializer should be a function" );
	    }
	
	    registered_scripts[ script_name ] = init_fn;
	  },
	
	  loadScript: function( script_name, pixel_id, options )
	  {
	    if( !registered_scripts[ script_name ])
	    {
	      return _log( script_name + " script not found in loader." );
	    }
	
	    registered_scripts[ script_name ]( pixel_id, options );
	  }
	};
	
	_store( "_commands.load.script", ScriptsModule.loadScript.bind( ScriptsModule ));
	
	var module = ModuleHandler.createModule( "scripts_module", ScriptsModule );

var MsClarity = (function MsClarity()
{ 
 
	return element_interface = 
	{
	  initialize: function()
	  {
	    ScriptsModule.registerScript( "MSClarity", initFn );
	  }
	};
	
	function initFn( pixel_id )
	{
	  var clarity = function (c,l,a,r,i,t,y){
	    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
	    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
	    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
	  };
	  clarity.call( null, window, document, "clarity", "script", pixel_id );
	} 

 })(); 

ModuleHandler.addElement( "MsClarity", MsClarity ); // File end

var OneTrust = (function OneTrust()
{ 
 
	var hosting =
	{
	  "def": "https://cdn.cookielaw.org/scripttemplates/otSDKStub.js",
	  "ukwest": "https://cdn-ukwest.onetrust.com/scripttemplates/otSDKStub.js"
	};
	
	return element_interface = 
	{
	  initialize: function()
	  {
	    ScriptsModule.registerScript( "oneTrust", initFn );
	  }
	};
	
	function initFn( options )
	{
	  var s = document.createElement("script");
	  s.async = true;
	  s.type = "text/javascript";
	  s.src = getSrc( options.pixel_id );
	  s.charset = "UTF-8";
	  s.setAttribute( "data-language", "hu" );
	  s.setAttribute( "data-domain-script", getPlainId( options.pixel_id ));
	  document.head.appendChild(s);
	  window.OptanonWrapper = function() { };
	}
	
	function getSrc( raw_id )
	{
	  var split = raw_id && raw_id.split( "," );
	  return split.length > 1 ? hosting[ split[0] ] : hosting.def;
	}
	
	function getPlainId( raw_id )
	{
	  return raw_id.split( "," ).pop();
	} 

 })(); 

ModuleHandler.addElement( "OneTrust", OneTrust ); // File end

var Salesforce = (function Salesforce()
{ 
 
	return element_interface = 
	{
	  initialize: function()
	  {
	    ScriptsModule.registerScript( "Salesforce", initFn );
	  }
	};
	
	function initFn( pixel_id )
	{
	  var s = document.createElement( "script" );
	  s.type = "text/javascript";
	  s.async = true;
	  s.src = "//" + pixel_id + ".collect.igodigital.com/collect.js";
	
	  var s2 = document.createElement( "script" );
	  
	  s2.innerHTML = [
	    '_etmc.push(["setOrgId", ' + pixel_id + ']);',
	    '_etmc.push(["trackPageView", { "item" : document.location.href }]);'
	  ].join("\n");
	
	  s.onload = function()
	  {
	    document.head.appendChild(s2);
	  }
	
	  document.head.appendChild(s);
	} 

 })(); 

ModuleHandler.addElement( "Salesforce", Salesforce ); // File end



var OptinMonster = (function OptinMonster()
{ 
 
	return element_interface = 
    {
      initialize: function()
      {
        ScriptsModule.registerScript( "OptinMonster", initFn );
      }
    };
    
    function initFn()
    {
      var pixel_data = config && config.single_pixels && ( config.single_pixels.optinmonster || "" ).split( "," );
    
      _addScript( "https://a.omappapi.com/app/js/api.min.js", {
        "data-account": pixel_data[ 1 ], 
        "data-user": pixel_data[ 0 ] 
      });
    } 

 })(); 

ModuleHandler.addElement( "OptinMonster", OptinMonster ); // File end



var Snapengage = (function Snapengage()
{ 
 
	return element_interface = 
	{
	  initialize: function()
	  {
	    ScriptsModule.registerScript( "snapengage", init );
	  }
	};
	
	function init( pixel_id, options )
	{
	  var options = options || config.get( "single_pixel_details.snapengage.settings" ) || {};
	
	  if( options.delay_secs )
	  {
	    var delay_ms = parseInt( options.delay_secs ) * 1000;
	    setTimeout( initFn, delay_ms, pixel_id, options );
	  }
	
	  else initFn( pixel_id, options );
	}
	
	function initFn( pixel_id, options )
	{
	  var script_src = options.script_src || '//storage.googleapis.com/snapengage-eu/js/';
	  var snapID = pixel_id;
	
	  if( script_src[ script_src.length - 1 ] !== "/" )
	  {
	    script_src = script_src + "/";
	  }
	
	  var se = document.createElement( 'script' ); 
	  se.type = 'text/javascript'; 
	  se.async = true;
	  se.src =  script_src + snapID + '.js';
	
	  var done = false;
	
	  se.onload = se.onreadystatechange = function() 
	  {
	    if( !done && ( !this.readyState || this.readyState === 'loaded' || this.readyState === 'complete' ))
	    {
	      done = true;
	
	      // trackEvents();
	    }
	  }
	
	  var s = document.getElementsByTagName( 'script' )[ 0 ];
	  s.parentNode.insertBefore( se, s );
	}
	
	function trackEvents()
	{
	  var SnapEngage = window.SnapEngage;
	
	  var snp_widget_state;
	  var snp_started_by;
	  var snp_agent_alias;
	
	  // snp_snapengage_event: original event name
	  // snp_started_by: agent|user
	  // snp_widget_state: online|offline
	  // snp_action: form_open|user_message|agent_message|user_callme|user_clicks_button|user_closes_window|chat_ended|rating_click
	  // snp_details: "rating:"|"message:"|"button:"|"window_type:"|"ended_by:"
	  // snp_agent_alias:
	  // snp_user_mail_hash:
	
	  /**
	   * @param {string} status widget status
	   *    one of: ('online'|'offline')
	   */
	  SnapEngage.setCallback( 'Open', function ( status )
	  {
	    snp_widget_state = status;
	
	    var event = events_module.create( "snapengage_event" );
	
	    event.addAttribute( "event_category", "CONSTANT", "snapengage event" );
	    event.addAttribute( "event_action", "CONSTANT", "form opened" );
	    event.addAttribute( "event_label", "CONSTANT", "chat status: " + snp_widget_state );
	
	    event.addAttribute( "snp_snapengage_event", "CONSTANT", "Open" );
	    event.addAttribute( "snp_widget_state", "CONSTANT", snp_widget_state );
	    event.addAttribute( "snp_action", "CONSTANT", "form_open" );
	
	    event.addAttribute( "non_interaction", "CONSTANT", true );
	    event.addTrigger({ "type": "CALLBACK" }).fire();
	  });
	
	
	  // agent opens chat by sending a message to the user
	  SnapEngage.setCallback( 'OpenProactive', function( agent_alias, msg )
	  {
	    snp_started_by = "agent";
	    snp_agent_alias = agent_alias;
	    snp_widget_state = "online";
	
	    var event = events_module.create( "snapengage_event" );
	
	    event.addAttribute( "event_category", "CONSTANT", "snapengage event" );
	    event.addAttribute( "event_action", "CONSTANT", "chat started by agent" );
	    event.addAttribute( "event_label", "CONSTANT", "agent_alias: " + agent_alias + ", message_sent: " + msg );
	
	    event.addAttribute( "snp_snapengage_event", "CONSTANT", "OpenProactive" );
	    event.addAttribute( "snp_widget_state", "CONSTANT", snp_widget_state );
	    event.addAttribute( "snp_agent_alias", "CONSTANT", snp_agent_alias );
	    event.addAttribute( "snp_started_by", "CONSTANT", snp_started_by );
	    event.addAttribute( "snp_action", "CONSTANT", "agent_message" );
	    event.addAttribute( "snp_details", "CONSTANT", "message: " + msg );
	
	    event.addAttribute( "non_interaction", "CONSTANT", true );
	    event.addTrigger({ "type": "CALLBACK" }).fire();
	  });
	
	  /**
	   * @param {string} email Email address of the user starting the chat
	   * @param {string} msg Message that was just sent
	   * @param {string} type How the chat was started
	   *    one of: ('proactive'|'manual') 
	   *    proactive if chat was initiated by the agent
	   */
	  SnapEngage.setCallback( 'StartChat', function( email, msg, type )
	  {
	    if( type == "proactive" ){ snp_started_by = "agent"; }
	    if( type == "manual" ){ snp_started_by = "user"; }
	
	    var event = events_module.create( "snapengage_event" );
	
	    event.addAttribute( "event_category", "CONSTANT", "snapengage event" );
	    event.addAttribute( "event_action", "CONSTANT", "user sends message" );
	    event.addAttribute( "event_label", "CONSTANT", "chat initiated by: " + first_message_by + ", current_message: " + msg );
	
	    // @todo: add hashed email address
	    // event.addAttribute( "snp_user_mail_hash", "CONSTANT", mail_hash );
	
	    event.addAttribute( "snp_snapengage_event", "CONSTANT", "StartChat" );
	    event.addAttribute( "snp_widget_state", "CONSTANT", snp_widget_state );
	    event.addAttribute( "snp_agent_alias", "CONSTANT", snp_agent_alias );
	    event.addAttribute( "snp_started_by", "CONSTANT", snp_started_by );
	    event.addAttribute( "snp_action", "CONSTANT", "user_message" );
	    event.addAttribute( "snp_details", "CONSTANT", "message: " + msg );
	
	    event.addTrigger({ "type": "CALLBACK" }).fire();
	  });
	
	
	  /**
	   * User sends a message when agent is offline.
	   * 
	   *  @param {string} email Email address of the user starting the chat
	   */
	  SnapEngage.setCallback( 'MessageSubmit', function ( email, msg )
	  {
	    snp_widget_state = "offline";
	    snp_started_by = "user";
	
	    var event = events_module.create( "snapengage_event" );
	
	    event.addAttribute( "event_category", "CONSTANT", "snapengage event" );
	    event.addAttribute( "event_action", "CONSTANT", "user sends message - agent offline" );
	    event.addAttribute( "event_label", "CONSTANT", "message: " + msg );
	
	    // @todo: add hashed email address
	    // event.addAttribute( "snp_user_mail_hash", "CONSTANT", mail_hash );
	
	    event.addAttribute( "snp_snapengage_event", "CONSTANT", "MessageSubmit" );
	    event.addAttribute( "snp_widget_state", "CONSTANT", snp_widget_state );
	    event.addAttribute( "snp_started_by", "CONSTANT", snp_started_by );
	    event.addAttribute( "snp_action", "CONSTANT", "user_message" );
	    event.addAttribute( "snp_details", "CONSTANT", "message: " + msg );
	
	    event.addTrigger({ "type": "CALLBACK" }).fire();
	  });
	
	  // user sends a chat message
	  SnapEngage.setCallback( 'ChatMessageSent', function ( msg )
	  {
	    var event = events_module.create( "snapengage_event" );
	
	    event.addAttribute( "event_category", "CONSTANT", "snapengage event" );
	    event.addAttribute( "event_action", "CONSTANT", "user sends message" );
	    event.addAttribute( "event_label", "CONSTANT", "message: " + msg );
	
	    event.addAttribute( "snp_snapengage_event", "CONSTANT", "ChatMessageSent" );
	    event.addAttribute( "snp_widget_state", "CONSTANT", snp_widget_state );
	    event.addAttribute( "snp_started_by", "CONSTANT", snp_started_by );
	    event.addAttribute( "snp_agent_alias", "CONSTANT", snp_agent_alias );
	    event.addAttribute( "snp_action", "CONSTANT", "user_message" );
	    event.addAttribute( "snp_details", "CONSTANT", "message: " + msg );
	
	    event.addTrigger({ "type": "CALLBACK" }).fire();
	  });
	
	  /**
	   * user starts a callme
	   * @param {string} phone The user's phone number
	   */
	  SnapEngage.setCallback( 'StartCallme', function ()
	  {
	    var event = events_module.create( "snapengage_event" );
	
	    event.addAttribute( "event_category", "CONSTANT", "snapengage event" );
	    event.addAttribute( "event_action", "CONSTANT", "user starts callme" );
	    event.addAttribute( "event_label", "CONSTANT", "none" );
	
	    event.addAttribute( "snp_snapengage_event", "CONSTANT", "StartCallme" );
	    event.addAttribute( "snp_widget_state", "CONSTANT", snp_widget_state );
	    event.addAttribute( "snp_agent_alias", "CONSTANT", snp_agent_alias );
	    event.addAttribute( "snp_started_by", "CONSTANT", snp_started_by );
	    event.addAttribute( "snp_action", "CONSTANT", "user_callme" );
	
	    event.addTrigger({ "type": "CALLBACK" }).fire();
	  });
	
	  // chat message is received by the user
	  SnapEngage.setCallback( 'ChatMessageReceived', function ( agent_alias, msg )
	  {
	    snp_agent_alias = agent_alias;
	    snp_widget_state = "online";
	
	    var event = events_module.create( "snapengage_event" );
	
	    event.addAttribute( "event_category", "CONSTANT", "snapengage event" );
	    event.addAttribute( "event_action", "CONSTANT", "agent sends message" );
	    event.addAttribute( "event_label", "CONSTANT", "message: " + msg );
	
	    event.addAttribute( "snp_snapengage_event", "CONSTANT", "ChatMessageReceived" );
	    event.addAttribute( "snp_agent_alias", "CONSTANT", snp_agent_alias );
	    event.addAttribute( "snp_started_by", "CONSTANT", snp_started_by );
	    event.addAttribute( "snp_action", "CONSTANT", "agent_message" );
	    event.addAttribute( "snp_details", "CONSTANT", "message: " + msg );
	
	    event.addTrigger({ "type": "CALLBACK" }).fire();
	  });
	
	  /**
	   * The user clicks on messages that are buttons
	   * 
	   * @param {object} options Has peredegined keys:
	   *    options.botName: alias of the bot that sent the button
	   *    options.buttonLabel: the button's label
	   *    options.buttonValue: the button's value
	   */
	  SnapEngage.setCallback( 'InlineButtonClicked', function( options ) 
	  {
	    var details = "sent_by_bot: " + options.botName + ", button_label: " + options.buttonLabel + ", button_value: " + options.buttonValue;
	
	    var event = events_module.create( "snapengage_event" );
	
	    event.addAttribute( "event_category", "CONSTANT", "snapengage event" );
	    event.addAttribute( "event_action", "CONSTANT", "user clicks inline button" );
	    event.addAttribute( "event_label", "CONSTANT", details );
	
	    event.addAttribute( "snp_snapengage_event", "CONSTANT", "InlineButtonClicked" );
	    event.addAttribute( "snp_started_by", "CONSTANT", snp_started_by );
	    event.addAttribute( "snp_widget_state", "CONSTANT", snp_widget_state );
	    event.addAttribute( "snp_action", "CONSTANT", "user_clicks_button" );
	    event.addAttribute( "snp_details", "CONSTANT", "button: " + details );
	
	    event.addTrigger({ "type": "CALLBACK" }).fire();
	  });
	
	
	  /**
	   * The user closes clicks on a window close button.
	   * 
	   * @param {string} window_type The type of window that was closed.
	   *    one of: ('form'|'chat'|'proactive')
	   * @param {string} status The status of the widget at the time it was closed
	   *    one of: ('online'|'offline')
	   */
	  SnapEngage.setCallback( 'Close', function( window_type, status )
	  {
	    snp_widget_state = status;
	
	    var event = events_module.create( "snapengage_event" );
	
	    event.addAttribute( "event_category", "CONSTANT", "snapengage event" );
	    event.addAttribute( "event_action", "CONSTANT", "User closes window" );
	    event.addAttribute( "event_label", "CONSTANT", "window type: " + window_type );
	
	    event.addAttribute( "snp_snapengage_event", "CONSTANT", "Close" ); 
	    event.addAttribute( "snp_started_by", "CONSTANT", snp_started_by );
	    event.addAttribute( "snp_widget_state", "CONSTANT", status );
	    event.addAttribute( "snp_action", "CONSTANT", "user_closes_window" );
	    event.addAttribute( "snp_details", "CONSTANT", "window_type: " + window_type );
	
	    event.addTrigger({ "type": "CALLBACK" }).fire();
	  });
	
	  
	  /**
	   * This event fires when the chat ends. If your widget has chat survey enabled or any other post chat feature, 
	   * this event is fired at the same time the post chat flow starts.
	   * 
	   * @param {object} options Has 1 boolean key:
	   *    options.endedByUser: was the chat ended by the user
	   */
	  SnapEngage.setCallback( SnapEngage.callbacks.CHAT_ENDED, function( options )
	  {
	    var ended_by = options.endedByUser ? "user" : "agent";
	
	    var event = events_module.create( "snapengage_event" );
	
	    event.addAttribute( "event_category", "CONSTANT", "snapengage event" );
	    event.addAttribute( "event_action", "CONSTANT", action );
	    event.addAttribute( "event_label", "CONSTANT", "none" );
	
	    event.addAttribute( "snp_snapengage_event", "CONSTANT", "ChatEnded" ); 
	    event.addAttribute( "snp_started_by", "CONSTANT", snp_started_by );
	    event.addAttribute( "snp_widget_state", "CONSTANT", snp_widget_state );
	    event.addAttribute( "snp_action", "CONSTANT", "chat_ended" );
	    event.addAttribute( "snp_details", "CONSTANT", "ended_by: " + ended_by );
	
	    event.addTrigger({ "type": "CALLBACK" }).fire();
	  });
	
	
	  // user rates agent
	  SnapEngage.setCallback( 'RatingPromptClicked', function userRatesAgent( botAlias, scaleType, selectedOption )
	  {
	    var message = [ 'botAlias: ', botAlias, ', scaleType: ', scaleType, ', selectedOption: ', selectedOption ].join( "" );
	
	    var event = events_module.create( "snapengage_event" );
	
	    event.addAttribute( "event_category", "CONSTANT", "snapengage event" );
	    event.addAttribute( "event_action", "CONSTANT", "user sends rating" );
	    event.addAttribute( "event_label", "CONSTANT", "rating details: " + message );
	
	    event.addAttribute( "snp_snapengage_event", "CONSTANT", "RatingPromptClicked" );    
	    event.addAttribute( "snp_started_by", "CONSTANT", snp_started_by );
	    event.addAttribute( "snp_widget_state", "CONSTANT", snp_widget_state );
	    event.addAttribute( "snp_action", "CONSTANT", "rating_click" );
	    event.addAttribute( "snp_details", "CONSTANT", "rating_details: " + message );
	
	    event.addTrigger({ "type": "CALLBACK" }).fire();
	  });
	} 

 })(); 

ModuleHandler.addElement( "Snapengage", Snapengage ); // File end

var Usabilla = (function Usabilla()
{ 
 
	return element_interface = 
	{
	  initialize: function()
	  {
	    ScriptsModule.registerScript( "Usabilla", initFn );
	  }
	};
	
	function initFn( id )
	{
	  /*{literal}<![CDATA[*/window.lightningjs||function(c){function g(b,d){d&&(d+=(/\?/.test(d)?"&":"?")+"lv=1");c[b]||function(){var i=window,h=document,j=b,g=h.location.protocol,l="load",k=0;(function(){function b(){a.P(l);a.w=1;c[j]("_load")}c[j]=function(){function m(){m.id=e;return c[j].apply(m,arguments)}var b,e=++k;b=this&&this!=i?this.id||0:0;(a.s=a.s||[]).push([e,b,arguments]);m.then=function(b,c,h){var d=a.fh[e]=a.fh[e]||[],j=a.eh[e]=a.eh[e]||[],f=a.ph[e]=a.ph[e]||[];b&&d.push(b);c&&j.push(c);h&&f.push(h);return m};return m};var a=c[j]._={};a.fh={};a.eh={};a.ph={};a.l=d?d.replace(/^\/\//,(g=="https:"?g:"http:")+"//"):d;a.p={0:+new Date};a.P=function(b){a.p[b]=new Date-a.p[0]};a.w&&b();i.addEventListener?i.addEventListener(l,b,!1):i.attachEvent("on"+l,b);var q=function(){function b(){return["<head></head><",c,' onload="var d=',n,";d.getElementsByTagName('head')[0].",d,"(d.",g,"('script')).",i,"='",a.l,"'\"></",c,">"].join("")}var c="body",e=h[c];if(!e)return setTimeout(q,100);a.P(1);var d="appendChild",g="createElement",i="src",k=h[g]("div"),l=k[d](h[g]("div")),f=h[g]("iframe"),n="document",p;k.style.display="none";e.insertBefore(k,e.firstChild).id=o+"-"+j;f.frameBorder="0";f.id=o+"-frame-"+j;/MSIE[ ]+6/.test(navigator.userAgent)&&(f[i]="javascript:false");f.allowTransparency="true";l[d](f);try{f.contentWindow[n].open()}catch(s){a.domain=h.domain,p="javascript:var d="+n+".open();d.domain='"+h.domain+"';",f[i]=p+"void(0);"}try{var r=f.contentWindow[n];r.write(b());r.close()}catch(t){f[i]=p+'d.write("'+b().replace(/"/g,String.fromCharCode(92)+'"')+'");d.close();'}a.P(2)};a.l&&setTimeout(q,0)})()}();c[b].lv="1";return c[b]}var o="lightningjs",k=window[o]=g(o);k.require=g;k.modules=c}({}); window.usabilla_live = lightningjs.require("usabilla_live", "//w.usabilla.com/" + id + ".js"); /*]]>{/literal}*/
	} 

 })(); 

ModuleHandler.addElement( "Usabilla", Usabilla ); // File end


var Zendesk = (function Zendesk()
  {
	var _public =
	{
	  initialize: function()
	  {
	    ScriptsModule.registerScript( "zendesk", loadZendesk );
	  }
	};

	function loadZendesk()
	{
	  var zendesk_id = config.get( "single_pixels.zendesk" );
	  var locale = config.get( "single_pixel_details.zendesk.settings.zendesk_locale" );
	  var department = config.get( "single_pixel_details.zendesk.settings.zendesk_department" );

	  if( zendesk_id && locale && department )
	  {
	    addZendesk( zendesk_id, locale, department );
	  }
	}

	function addZendesk( zendesk_id, locale, department )
	{
	  var e = window.document;
	  var t = "script";
	  var s = zendesk_id;

	  var n = window.zE = window.zEmbed = function()
	  {
	    n._.push(arguments)
	  },

	  a=n.s=e.createElement(t),
	  r=e.getElementsByTagName(t)[0];

	  n.set=function(e)
	  {
	    n.set._.push(e)
	  },

	  n._=[],
	  n.set._=[],

	  a.async=true,
	  a.setAttribute("charset","utf-8"),
	  a.src="https://static.zdassets.com/ekr/asset_composer.js?key="+s,

	  n.t=+new Date,
	  a.type="text/javascript",

	  r.parentNode.insertBefore(a,r)

	  zE(function() {

	    zE.setLocale( locale );

	    $zopim(function()
	    {
	      $zopim.livechat.setOnConnected(function()
	      {
	        var department_status = $zopim.livechat.departments.getDepartment( department );
	        if (department_status.status == 'offline') {
	          $zopim.livechat.setStatus('offline');
	        } else {
	          $zopim.livechat.departments.filter('');
	          $zopim.livechat.departments.setVisitorDepartment( department );
	        }
	      });
	    });
	  });
	}
	
	return _public;

	})();

ModuleHandler.addElement( "Zendesk", Zendesk ); // File end

})(); // Module end


(function EventsModule()
{
	var data_layer_controller;
	var tagging_controller;
	var observer_module;
	
	var EventsModule = 
	{
	  initialize: function()
	  {
	    data_layer_controller = ModuleHandler.get( "data_layer_controller" );
	    tagging_controller = ModuleHandler.get( "tagging_controller" );
	    observer_module = ModuleHandler.get( "observer_module" );
	  },
	
	  getEventByName: function( event_name )
	  {
	    return MainEventHandler.getEventByName( event_name );
	  },
	
	  create: function( event_name, tracking_options_obj )
	  {
	    if( !_isStr( event_name ))
	    {
	      _error( "Event name should be a string when grabbing it from controller" );
	    }
	
	    if( tracking_options_obj && !_isObj( tracking_options_obj ))
	    {
	      _error( "tracking opotions should be an object")
	    }
	
	    return MainEventHandler.createEvent( event_name, tracking_options_obj );
	  },
	
	  dispatch: function( event )
	  {
	    if(!( event instanceof Event ))
	    {
	      _error( "Object passed for event dispatch is not an event instance" );
	    }
	
	    GenericDispatchManager.execute( event );
	  },
	
	  register: function( event )
	  {
	    if(!( event instanceof Event ))
	    {
	      _error( "Object passed for event registration is not an event instance" );
	    }
	
	    return MainEventHandler.registerEvent( event );
	  }
	};
	
	var module = ModuleHandler.createModule( "events", EventsModule );


	var ATTRIBUTE_TYPES = {
	  "CONSTANT": "attr_const",
	  "CSS_SELECTOR": "css_selector",
	  "JS_FUNCTION": "js_function",
	  "DATALAYER_VARIABLE": "dataLayer_var"
	};
	
	function Attribute( attribute_name, attribute_type, raw_value, owner )
	{
	  this.attribute_name;
	  this.attribute_type;
	  this.owner_entity;
	  this.cached_value;
	  this.is_cachable;
	  this.raw_value;
	
	  if( !_isStr( attribute_name )) _error( "Attribute name should be a string" );
	  if( !_isStr( attribute_type ) || !ATTRIBUTE_TYPES[ attribute_type ]) _error( "Invalid Attribute type" );
	
	  this.attribute_name = attribute_name;
	  this.attribute_type = attribute_type;
	  this.raw_value = raw_value;
	  this.owner_entity = owner;
	  this.is_cachable = true;
	}
	
	Attribute.prototype.getValue = function()
	{
	  if( !this.is_cachable ) 
	  {
	    return doGetValue( this );
	  }
	
	  if( !this.cached_value )
	  {
	    this.cached_value = getCachedValue( doGetValue( this ));
	  }
	
	  return this.cached_value.value;
	}
	
	Attribute.prototype.doNotCache = function()
	{
	  return ( this.is_cachable = false ) || this;
	}
	
	function getCachedValue( value_to_cache )
	{
	  return _exists( value_to_cache ) ? { value: value_to_cache } : {};
	}
	
	function doGetValue( attribute_instance )
	{
	  switch( attribute_instance.attribute_type )
	  {
	    case "CONSTANT": return attribute_instance.raw_value;
	    case "JS_FUNCTION": return _run( attribute_instance.raw_value, attribute_instance.owner_entity && attribute_instance.owner_entity.id );
	    case "DATALAYER_VARIABLE": return _getDataLayerVariable( attribute_instance.raw_value );
	    case "CSS_SELECTOR": return _run( getElementText, attribute_instance );      
	  }
	}
	
	function getElementText( attribute_instance )
	{
	  var context_node = getContextNode( attribute_instance );
	  var attribute_name = attribute_instance.attribute_name;
	  var selector = attribute_instance.raw_value;
	
	  if( !( context_node instanceof Element ))
	  {
	    _error( "Attribute context node should be an Element" );
	  }
	
	  var element = _getSingleNode( selector, context_node );
	  return element && getFormattedValue( attribute_name, element );
	}
	
	function getContextNode( attribute_instance )
	{
	  return attribute_instance.owner_entity && attribute_instance.owner_entity.wrapper;
	}
	
	function getFormattedValue( key, element )
	{
	  var text = _getElementText( element );
	
	  if( _contains([ "item_quantity", "quantity", "index" ], key ))
	  {
	    return parseInt( text );
	  }
	
	  else if( _contains([ "discount", "price", "value" ], key ))
	  {
	    return _getNumber( text );
	  }
	
	  return text;
	}

	Registry.registerClass( Attribute );


	function AttributeHandler()
	{
	  this.attributes = {};
	}
	
	AttributeHandler.prototype.addAttributeObject = function( obj )
	{
	  if( !( obj instanceof Attribute ))
	  {
	    _error( "Attribute object is not an attribte instance" );
	  }
	
	  if( obj.attribute_name in this.attributes )
	  {
	    _error( "Attribute with the given name has already been added" );
	  }
	  
	  return ( this.attributes[ obj.attribute_name ] = obj ) && obj;
	}
	
	AttributeHandler.prototype.addAttribute = function( name, type, value )
	{
	  if( name in this.attributes )
	  {
	    _error( "Attribute with the given name has already been added" );
	  }
	  
	  this.attributes[ name ] = new Attribute( name, type, value, this );
	  
	  return this.attributes[ name ];
	}
	
	AttributeHandler.prototype.addOrUpdateAttribute = function( name, type, value )
	{
	  this.attributes[ name ] = new Attribute( name, type, value, this );
	  
	  return this.attributes[ name ];
	}
	
	AttributeHandler.prototype.getAttribute = function( attribute_key )
	{
	  if( attribute_key in this.attributes ) return this.attributes[ attribute_key ].getValue();
	}
	
	AttributeHandler.prototype.getAttributes = function()
	{
	  return Object.keys( this.attributes ).reduce( function( all, current )
	  {
	    var current_value = this.attributes[ current ].getValue();  
	    return _exists( current_value ) && ( all[ current ] = current_value ) && all || all;
	    
	  }.bind( this ), {});
	}
	
	AttributeHandler.prototype.merge = function( attributes_obj )
	{
	  for( var attr_name in attributes_obj )
	  {
	    if( !( attr_name in this.attributes ))
	    {
	      this.addAttribute( attr_name, "CONSTANT", attributes_obj[ attr_name ]);
	    }
	  }
	
	  return this;
	}

	Registry.registerClass( AttributeHandler );


	function Event( name )
	{
	  this.id;
	  this.name;
	  this.trigger;
	  this.event_type;
	  this.dispatch_controller;
	  this.tracking_pixels = {};
	  this.tracking_options = {};
	  this.conversion_pixels = {};
	  this.standardization_handlers = {};
	
	  this.name = name;
	  this.id = Registry.addItem( this );
	  this.dispatch_controller = new EventController( this );
	
	  AttributeHandler.call( this );
	}
	
	Event.prototype = ( Object.create || objectCreate )( AttributeHandler.prototype );
	Event.prototype.constructor = Event;
	
	Event.prototype.get = function( path )
	{
	  return _getValue( path, this );
	}
	
	Event.prototype.setEventType = function( type_str )
	{
	  this.event_type = type_str;
	}
	
	Event.prototype.getEventType = function()
	{
	  return this.event_type;
	}
	
	Event.prototype.getHitTemplateConversions = function()
	{
	  return this.tracking_options.template_conversions;
	}
	
	Event.prototype.addTrigger = function( trigger_config )
	{
	  var settings = trigger_config || {};
	  settings.event = this;
	  return ( this.trigger = new Trigger( settings )) && this.trigger;
	}
	
	Event.prototype.addStandardizationHandler = function( type, handler )
	{
	  if( type in this.standardization_handlers )
	  {
	    _error( "Standardization hanlder type has already been added" );
	  }
	
	  this.standardization_handlers[ type ] = handler;
	}
	
	Event.prototype.addTrackingPixels = function( pixels_obj )
	{
	  Object.assign( this.tracking_pixels, pixels_obj );
	}
	
	Event.prototype.addConversionPixels = function( pixels_obj )
	{
	  Object.assign( this.conversion_pixels, pixels_obj );
	}
	
	Event.prototype.addTrackingOption = function( key, value )
	{
	  if(!_contains([ "whitelist", "blacklist", "template_conversions", "send_gua_separately" ], key )) _error( "Tracking option not supported" );
	  this.tracking_options[ key ] = value;
	}
	
	Event.prototype.getDispatchController = function()
	{
	  return this.dispatch_controller;
	}
	
	Event.prototype.dispatch = function()
	{
	  this.dispatch_controller.process();
	}

	Registry.registerClass( Event );


	function EventController( event )
	{
	  this.target_event;
	  this.process_pointer = 0;
	  this.event_processors = [];
	  
	  this.target_event = event;
	}
	
	function addProcessors( action, one_or_more_handlers, processors_array )
	{
	  [].concat( one_or_more_handlers ).forEach( function( handler )
	  {
	    if( !handler || !_isFn( handler.execute ))
	    {
	      _error( "Dispatch process step handler must have an execute method" );
	    }
	
	    processors_array[ action ]( handler );
	  });
	}
	
	EventController.prototype.addProcessStep = function( step_handler )
	{
	  addProcessors( "push", step_handler, this.event_processors );
	}
	
	EventController.prototype.addToFront = function( one_or_more_handlers )
	{
	  addProcessors( "push", one_or_more_handlers, this.event_processors );
	}
	
	EventController.prototype.process = function()
	{
	  if( this.hasMoreSteps()) this.executeNext();
	}
	
	EventController.prototype.hasMoreSteps = function()
	{
	  return this.process_pointer < this.event_processors.length;
	}
	
	EventController.prototype.executeNext = function()
	{
	  var next_handler = this.getNextHandler();
	  next_handler.execute( this.target_event );
	}
	
	EventController.prototype.getNextHandler = function()
	{
	  return this.event_processors[ this.process_pointer++ ] || _error( "No more dispatch steps" );
	}

	Registry.registerClass( EventController );


	var trigger_types =
	{
	  "PAGE_VIEW": 1,
	  "CALLBACK": 2,
	  "DATALAYER_EVENT": 3,
	  "VISIBILITY": 4,
	  "CLICK": 5
	};
	
	var trigger_states =
	{
	  "CREATED": 1,
	  "ACTIVATED": 2,
	  "INACTIVE": 3,
	  "FIRED": 4
	};
	
	function Trigger( settings )
	{
	  this.id;
	  this.type;
	  this.wrapper;
	
	  this.trigger_event;
	  this.target_event;
	  this.current_state;
	  this.disabled_class;
	  
	  this.is_unlimited;
	
	  this.elements = [];
	
	  if( !trigger_types[ settings.type ])
	  {
	    _error( "Trying to create unknown trigger type" );
	  }
	
	  if( settings.type == "DATALAYER_EVENT" )
	  {
	    this.trigger_event = settings.value;
	  }
	
	  if( settings.type == "VISIBILITY" )
	  {
	    this.addElements( settings.value );
	  }
	  
	  if( settings.unlimited )
	  {
	    this.is_unlimited = true;
	  }
	
	  this.type = settings.type;
	
	  this.target_event = settings.event;
	  this.current_state = "STALE";
	  this.id = Registry.addItem( this );
	
	  if( settings.status !== "STALE" ) 
	  {
	    this.activate();
	  }
	}
	
	Trigger.prototype.addEvent = function( event )
	{
	  this.target_event = event;
	}
	
	Trigger.prototype.setTriggerEvent = function( event_name )
	{
	  if( !_isStr( event_name ))
	  {
	    _error( "Invalid triggering event name ")
	  }
	
	  this.trigger_event = event_name;
	
	  return this;
	}
	
	Trigger.prototype.addElements = function( one_or_more_elements )
	{
	  var elements_array = [].concat( one_or_more_elements );
	
	  elements_array.forEach( function( elem )
	  {
	    if( !_isHtmlElement( elem )) _error( "Trigger element should be an Element" );
	  });
	
	  this.elements.push.apply( this.elements, elements_array );
	}
	
	Trigger.prototype.addDisabledClass = function( className )
	{
	  this.disabled_class = className;
	}
	
	Trigger.prototype.setState = function( state )
	{
	  if( !trigger_states[ state ])
	  { 
	    _error( "Invalid trigger state" );
	  }
	
	  if( !_contains([ "FIRED", "INACTIVE" ], this.getState()))
	  {
	    this.current_state = state;
	  }
	
	  return this.current_state;
	}
	
	Trigger.prototype.getState = function()
	{
	  if( this.type == "CLICK" && this.current_state !== "FIRED" )
	  { 
	    if( _hasClass( this.wrapper, this.disabled_class ))
	    {
	      this.current_state = "INACTIVE";
	    }
	
	    else this.current_state = "ACTIVATED";
	  }
	
	  return this.current_state;
	}
	
	Trigger.prototype.fire = function()
	{
	  if( this.getState() == "ACTIVATED" )
	  {
	    if( !this.is_unlimited ) this.setState( "FIRED" );
	    this.target_event.dispatch();
	  }
	}
	
	Trigger.prototype.activate = function()
	{
	  this.current_state = "ACTIVATED"
	
	  if( this.type == "PAGE_VIEW" )
	  {
	    return this.fire();
	  }
	
	  if( this.type == "CLICK" )
	  {
	    tagging_controller.setupTrigger( this );
	  }
	
	  if( this.type == "VISIBILITY" )
	  {
	    tagging_controller.setupTrigger( this );
	  }
	
	  if( this.type == "DATALAYER_EVENT" )
	  {
	    observer_module.addPushCallback( getCallback( this ), this.trigger_event );
	  }
	
	  return this;
	}
	
	function getCallback( trigger )
	{
	  return function(){ trigger.fire(); };
	}

	Registry.registerClass( Trigger );

var GenericDispatchManager = (function GenericDispatchManager()
{ 
 
	var dispatch_processors = {};
	
	return element_interface = 
	{
	  registerProcessor( name, processor, index )
	  {
	    if( index in dispatch_processors )
	    {
	      _error( "Dispatch processor with the given index has already been registered" );
	    }
	
	    processor.name = name;
	    dispatch_processors[ index ] = processor;
	  },
	
	  addProcessSteps: function( event )
	  {
	    var dispatch_controller = event.getDispatchController();
	
	    for( var index in dispatch_processors )
	    {
	      dispatch_controller.addProcessStep( dispatch_processors[ index ]);
	    };
	  }
	}; 

 })(); 

ModuleHandler.addElement( "GenericDispatchManager", GenericDispatchManager ); // File end

var CommonAttributeManager = (function CommonAttributeManager()
{ 
 
	var registered_attributes = {};
	
	return element_interface =
	{
	  initialize: function()
	  {
	    GenericDispatchManager.registerProcessor( "CommonAttributes", this, 0 );
	  },
	
	  execute: function( event )
	  {
	    for( var attr_name in registered_attributes )
	    {
	      event.addAttributeObject( registered_attributes[ attr_name ]);
	    }
	
	    event.getDispatchController().executeNext();
	  },
	
	  register: function( manager )
	  {
	    if( !_usagePermissionGranted( manager.attr_name, config.attribute_permissions ))
	    {
	      return false;
	    }
	
	    return addAttribute( manager.getAttribute());
	  }
	}
	
	function addAttribute( attribute )
	{
	  if( attribute.attribute_name in registered_attributes )
	  {
	    _error( "Attribute definition with the given name already exists" );
	  }
	
	  registered_attributes[ attribute.attribute_name ] = attribute;
	} 

 })(); 

ModuleHandler.addElement( "CommonAttributeManager", CommonAttributeManager ); // File end

var Experiment = (function Experiment()
{ 
 
	var experiment_data_cached;
	
	return element_interface = 
	{
	  "attr_name": "experiment",
	
	  initialize: function()
	  {
	    CommonAttributeManager.register( this );
	  },
	
	  getAttribute: function()
	  {
	    addCallback();
	    
	    return new Attribute( this.attr_name, "JS_FUNCTION", getOptimizeExperiment );
	  }
	};
	
	function addCallback()
	{
	  data_layer_controller.submitPrimaryMessage( 'event', 'optimize.callback', { callback: getExperiments });
	}
	
	function getExperiments( value, name )
	{
	  experiment_data_cached = [ name, value ].join( "." );
	}
	
	function getOptimizeExperiment()
	{
	  return experiment_data_cached;
	} 

 })(); 

ModuleHandler.addElement( "Experiment", Experiment ); // File end

var LocalWeather = (function LocalWeather()
{ 
 
	return element_interface = 
	{
	  "attr_name": "shared_session_id",
	
	  initialize: function()
	  {
	    // CommonAttributeManager.register( this );
	  },
	
	  getAttribute: function()
	  {
	    // return new Attribute( this.attr_name, "JS_FUNCTION", getGa4SessionIdFromCookie );
	  }
	};
	
	function getWind( text )
	{
		if( text.indexOf( "-" ) > -1 )
		{
			var split = text.split( "-" );
			return ( parseInt( split[ 0 ]) + parseInt( split[ 1 ])) / 2;
		}
	
		return parseInt( text );
	}
	
	function download()
	{
	  var xhr = new XMLHttpRequest();
	
	  xhr.onload = function( e )
	  {
	    if ( xhr.status >= 200 && xhr.status < 300 )
	    {
	      parseResponse( xhr.responseText );
	    }
	  };
	
	  xhr.onerror = function( e )
	  {
	    console.log( "xhr error", e );
	  };
	
	  xhr.open( 'GET', "https://wttr.in/", true );
	
	  try {
	    xhr.send();
	  } 
	  catch ( err ){ }
	}
	
	function getSpanContent( spans_array, offset )
	{
	  return spans_array[ offset ] && _getElementText( spans_array[ offset ]) || "";
	}
	
	function getNextSiblingContent( spans_array, offset )
	{
	  return spans_array[ offset ] && spans_array[ offset ].nextSibling &&  _getElementText( spans_array[ offset ].nextSibling ) || "";
	}
	
	function parseResponse( responseText )
	{
		var spans = _getNodesArray( "span", _textToHTMLDocument( responseText ));
		
		var weather_data = {};
		weather_data.summary = getNextSiblingContent( spans, 0 );
		weather_data.temperature = parseInt( getSpanContent( spans, 2 ));
		weather_data.wind_speed = getWind( getSpanContent( spans, 6 ));
		weather_data.precipitation = Number.parseFloat( getNextSiblingContent( spans, 8 ).split( " mm" )[ 0 ]).toFixed( 1 );
	
	  CommonAttributeManager.addAttribute( "wtr_local_weather_summary", "CONSTANT", weather_data.summary );
	  CommonAttributeManager.addAttribute( "wtr_local_temperature", "CONSTANT", weather_data.temperature );
	  CommonAttributeManager.addAttribute( "wtr_wind_speed", "CONSTANT", weather_data.wind_speed );
	  CommonAttributeManager.addAttribute( "wtr_precipitation", "CONSTANT", weather_data.precipitation );
	} 

 })(); 

ModuleHandler.addElement( "LocalWeather", LocalWeather ); // File end

var ProportionalDepth = (function ProportionalDepth()
{ 
 
	return element_interface = 
	{
	  "attr_name": "proportional_depth",
	
	  initialize: function()
	  {
	    CommonAttributeManager.register( this );
	  },
	
	  getAttribute: function()
	  {
	    return new Attribute( this.attr_name, "JS_FUNCTION", getProportionalDepth ).doNotCache();
	  }
	};
	
	function getProportionalDepth()
	{
	  return ( window.pageYOffset / document.documentElement.clientHeight ).toFixed( 1 );
	} 

 })(); 

ModuleHandler.addElement( "ProportionalDepth", ProportionalDepth ); // File end

var SharedClientId = (function SharedClientId()
{ 
 
	return element_interface = 
	{
	  "attr_name": "shared_client_id",
	
	  initialize: function()
	  {
	    CommonAttributeManager.register( this );
	  },
	
	  getAttribute: function()
	  {
	    return new Attribute( this.attr_name, "JS_FUNCTION", getGaClientIdFromCookie );
	  }
	};
	
	function getGaClientIdFromCookie()
	{
	  var _ga_cookie_value = _getCookie( "_ga" );
	
	  if( _ga_cookie_value )
	  {
	    return _ga_cookie_value.split( "." ).slice( -2 ).join( "." );
	  }    
	} 

 })(); 

ModuleHandler.addElement( "SharedClientId", SharedClientId ); // File end

var SharedSessionId = (function SharedSessionId()
{ 
 
	return element_interface = 
	{
	  "attr_name": "shared_session_id",
	
	  initialize: function()
	  {
	    CommonAttributeManager.register( this );
	  },
	
	  getAttribute: function()
	  {
	    return new Attribute( this.attr_name, "JS_FUNCTION", getGa4SessionIdFromCookie );
	  }
	};
	
	function getGa4SessionIdFromCookie()
	{
	  var ga4_ids = config.tracking_meta.ga4_all.concat( "G-000000000" );
	
	  for( var i in ga4_ids )
	  {
	    var session_cookie_name = "_ga_" + ( ga4_ids[ i ] || "" ).replace( "G-", "" );
	    var session_cookie = _getCookie( session_cookie_name );
	
	    if( session_cookie )
	    {
	      return session_cookie.split( "." )[ 2 ];
	    }    
	  }
	} 

 })(); 

ModuleHandler.addElement( "SharedSessionId", SharedSessionId ); // File end

var TrackingPixelHandler = (function TrackingPixelHandler()
{ 
 
	return element_interface =
	{
	  initialize: function()
	  {
	    GenericDispatchManager.registerProcessor( "TrackingPixelHandler", this, 2 );
	  },
	
	  execute: function( event )
	  {
	    event.addTrackingPixels( getEventPixels( event.name, event.tracking_options ));
	    event.getDispatchController().executeNext();
	  }
	};
	
	function platformCanProcessEvent( event_name, platform )
	{
	  return !config.limited_platforms[ platform ] || _usagePermissionGranted( event_name, config.limited_platforms[ platform ]);
	}
	
	function getEventPixels( event_name, tracking_options )
	{
	  return Object.keys( config.tracking_pixels ).reduce( function( pixels_to_use, platform )
	  {
	    if( _usagePermissionGranted( platform, tracking_options ) && platformCanProcessEvent( event_name, platform ))  
	    {
	      addPixelData( config.tracking_pixels[ platform ], getDestinationObject( pixels_to_use, platform ));
	    }
	
	    return pixels_to_use;
	
	  }, {});
	}
	
	function getDestinationObject( pixels_to_use, platform )
	{
	  return ( pixels_to_use[ platform ] = {} ) && pixels_to_use[ platform ];
	}
	
	function addPixelData( source_obj, destination_obj )
	{
	  for( var measurement_side in source_obj )
	  {
	    destination_obj[ measurement_side ] = [].concat( source_obj[ measurement_side ]);
	  }
	
	  return destination_obj;
	} 

 })(); 

ModuleHandler.addElement( "TrackingPixelHandler", TrackingPixelHandler ); // File end

var ConversionPixelHandler = (function ConversionPixelHandler()
{ 
 
	return element_interface =
	{
	  initialize: function()
	  {
	    GenericDispatchManager.registerProcessor( "ConversionPixelHandler", this, 3 );
	  },
	
	  execute: function( event )
	  {
	    var event_conversions = getAllConversions( event );
	
	    if( event_conversions )
	    {
	      event.addConversionPixels( event_conversions );
	    }
	    
	    event.getDispatchController().executeNext();
	  }
	};
	
	function getAllConversions( event )
	{
	  // conversion pixel arriving from the hit template, attached to the event
	  // are already validated in external events module
	
	  var template_conversions = event.getHitTemplateConversions() || [];
	  var config_conversions = getConfigConversions( event.name, event.getAttributes());
	
	  return getCompiledConversionPixelData( config_conversions, template_conversions );
	}
	
	function getCompiledConversionPixelData( config_conversions, template_conversions )
	{
	  return config_conversions.concat( template_conversions ).reduce( function( all_conversions, conversion_data )
	  {
	    var platform = conversion_data.platform;
	    var side = conversion_data.measurement_side;
	    var pixel_data = conversion_data.pixel_data;
	
	    all_conversions[ platform ] = all_conversions[ platform ] || {};
	    all_conversions[ platform ][ side ] = all_conversions[ platform ][ side ] || [];
	    all_conversions[ platform ][ side ].push( pixel_data );
	
	    return all_conversions;
	
	  }, {});
	}
	
	function getConfigConversions( event_name, event_attributes )
	{
	  var specific_conversions = config.get( "conversions." + event_name ) || [];
	  var wildcard_conversions = config.get( "conversions.any" ) || [];
	
	  var all_config_conversions = [].concat( specific_conversions, wildcard_conversions );
	
	  return all_config_conversions.filter( function isValidConversion( conversion_data )
	  {
	    return !conversion_data.conditions || conversion_data.conditions.eventConditionsTrue( event_attributes );
	  });
	} 

 })(); 

ModuleHandler.addElement( "ConversionPixelHandler", ConversionPixelHandler ); // File end

var Standardizer = (function Standardizer()
{ 
 
	var generic_standardizers = {};
	
	return element_interface = 
	{
	  initialize: function()
	  {
	    GenericDispatchManager.registerProcessor( "Standardizer", this, 4 );
	  },
	
	  addGenericStandardizer: function( platform, instance )
	  {
	    if( generic_standardizers[ platform ])
	    {
	      _error( "Ecom standardizer for platform already exists" );
	    }
	
	    generic_standardizers[ platform ] = instance;
	  },
	
	  execute: function( event )
	  {
	    if( event.constructor.name === "EcomEvent" )
	    {
	      processStandardizers( event.standardization_handlers.ecom.getAvailableStandardizers(), event );
	    }
	
	    else
	    {
	      processStandardizers( generic_standardizers, event );
	    }
	
	    event.getDispatchController().executeNext();
	  }
	}
	
	function processStandardizers( available_standardizers, event )
	{
	  var event_attributes = event.getAttributes();
	
	  for( var platform in available_standardizers )
	  {
	    if( platform in event.tracking_pixels )
	    {
	      processPlatform( available_standardizers, platform, event_attributes, event );
	    }
	  }  
	}
	
	function processPlatform( available_standardizers, platform, event_attributes, event )
	{
	  var standardizer = available_standardizers[ platform ];
	
	  var std_event_name = standardizer.getEventName( event );
	  var std_attributes = standardizer.getAttributes( event_attributes, event );
	
	  var storage_root_base = "standard_event_values." + event.id + "." + platform;
	
	  if( std_event_name )
	  {
	    _store( storage_root_base + ".event_name", std_event_name );
	  }
	
	  if( std_attributes )
	  {
	    _store( storage_root_base + ".attributes", std_attributes );
	  }
	} 

 })(); 

ModuleHandler.addElement( "Standardizer", Standardizer ); // File end


var GenericFbStandardizer = (function GenericFbStandardizer()
{ 
 
	/**
	   * remaining std fb events: 
	   * CompleteRegistration: Signup, 
	   * CustomizeProduct: CustomizeProduct, Donate, FindLocation,
	   * Schedule, StartTrial, SubmitApplication
	   */
	
	// https://developers.facebook.com/docs/marketing-api/conversions-api/payload-helper
	// https://developers.facebook.com/docs/facebook-pixel/reference/
	
	var event_name_map = 
	{
	  "contact": "Contact",
	  "generate_lead": "Lead",
	  "login": "Login",
	  "search": "Search",
	  "share": "Share",
	  "sign_up": "Signup",
	  "page_view": "PageView",
	};
	
	var event_attribute_map =
	{
	  "event_value": "value",
	  "value": "value",
	  "search_term": "search_query",
	};
	
	return element_interface = 
	{
	  initialize: function()
	  {
	    Standardizer.addGenericStandardizer( "fb", this );
	  },
	
	  getAttributes: function( attributes_in, event )
	  {
	    var std_attributes = {};
	
	    addRemainingStandards( std_attributes, attributes_in );
	
	    if( !_isEmpty( std_attributes ))
	    {
	      return std_attributes;
	    }
	  },
	
	  getEventName: function( event )
	  {
	    return event_name_map[ event.name ];
	  }
	};
	
	function addRemainingStandards( std_attributes, attributes_in )
	{
	  for( var key in event_attribute_map )
	  {
	    if( key in attributes_in )
	    {
	      var new_key = event_attribute_map[ key ];
	      std_attributes[ new_key ] = attributes_in[ key ];
	    }
	  }
	} 

 })(); 

ModuleHandler.addElement( "GenericFbStandardizer", GenericFbStandardizer ); // File end

var EventReleaseHandler = (function EventReleaseHandler()
{ 
 
	return element_interface = 
	{
	  initialize: function()
	  {
	    GenericDispatchManager.registerProcessor( "EventReleaseHandler", this, 5 );
	  },
	
	  execute: function ( event )
	  {
	    var event_attributes = event.getAttributes();
	    var all_pixels = Object.assign({}, event.tracking_pixels, event.conversion_pixels );
	  
	    for( var iteration_index = 0; iteration_index < 5; iteration_index++ )
	    {
	      var send_gua = !!guaShouldBeSent( event, iteration_index );
	      var pixels = PixelProcessor.getTrackingRound( all_pixels, send_gua );
	
	      composeEvent( event, event_attributes, pixels, iteration_index );
	  
	      if( noPixelsLeft( all_pixels )) break;
	    }
	  }
	};
	
	function composeEvent( event, event_attributes, pixels, iteration_index )
	{
	  var meta_data = { "ast_id": event.id, "iteration_index": iteration_index };
	  var std_gua = getStdGua( pixels, event.id ) || {};
	
	  var current_standards = getCurrentStandards( pixels, event.id ) || {};
	  var gua_attributes = std_gua.attributes || {};
	  var event_name = getEventName( event, std_gua );
	
	  var merged_attributes = Object.assign( {},
	    event_attributes,
	    gua_attributes,
	    { event_metadata: meta_data },
	    current_standards
	  );
	
	  data_layer_controller.submitHitEvent( event_name, merged_attributes, pixels );
	}
	
	function getCurrentStandards( pixels, event_id )
	{
	  return config.debugMode && StandardHelper.getFilteredStandards( pixels, event_id );
	}
	
	function guaShouldBeSent( event, tracking_round_index )
	{
	  return !( isEcomEvent( event ) && tracking_round_index == 0 ) ? true : false;
	}
	
	function isEcomEvent( event )
	{
	  return event.constructor.name == "EcomEvent";
	}
	
	function getStdGua( release_round_pixels, event_id )
	{
	  return ( "gua" in release_round_pixels ) && StandardHelper.getStandards( "gua", event_id );
	}
	
	function noPixelsLeft( pixels_obj )
	{
	  return !Object.keys( pixels_obj ).length;
	}
	
	function getEventName( event, std_gua )
	{
	  var gua_event_name = std_gua.event;
	  
	  return ( isEcomEvent( event ) && gua_event_name ) ? gua_event_name :  event.name;
	} 

 })(); 

ModuleHandler.addElement( "EventReleaseHandler", EventReleaseHandler ); // File end

var PixelProcessor = (function PixelProcessor()
{ 
 
	function PixelProcessor(){}
	
	PixelProcessor.prototype.getTrackingRound = function( all_pixels, send_gua )
	{
	  return Object.keys( all_pixels ).reduce( function( current_round_pixels, platform )
	  {
	    if( platform == "gua" && !send_gua )
	    {
	      return current_round_pixels;
	    }
	
	    if( _contains([ "gua", "ga4" ], platform ))
	    {
	      return addAllPixels( current_round_pixels, all_pixels, platform );
	    }
	
	    if( platform == "fb" )
	    {
	      return addAllPixels( current_round_pixels, all_pixels, platform );
	    }
	
	    return addOnePixel( current_round_pixels, all_pixels, platform );
	  }, {});
	};
	
	function addAllPixels( current_round_pixels, all_pixels, platform )
	{  
	  current_round_pixels[ platform ] = all_pixels[ platform ];
	  delete all_pixels[ platform ];
	  return current_round_pixels;
	}
	
	function addOnePixel( current_round_pixels, all_pixels, platform )
	{ 
	  current_round_pixels[ platform ] = current_round_pixels[ platform ] || {};
	
	  [ "client", "server" ].forEach( function( side )
	  {
	    if( all_pixels[ platform ][ side ])
	    {
	      current_round_pixels[ platform ][ side ] = all_pixels[ platform ][ side ].shift();
	      if( !all_pixels[ platform ][ side ].length ) delete all_pixels[ platform ][ side ];
	    }
	  });
	
	  removeIfEmpty( all_pixels, platform );
	  return current_round_pixels;
	}
	
	function removeIfEmpty( root_obj, key )
	{
	  if( _isEmpty( root_obj[ key ])) delete root_obj[ key ];
	}
	
	return element_interface = new PixelProcessor(); 

 })(); 

ModuleHandler.addElement( "PixelProcessor", PixelProcessor ); // File end

var StandardHelper = (function StandardHelper()
{ 
 
	return element_interface =
	{
	  getStandards: function( platform, event_id )
	  {
	    return _get( "standard_event_values." + event_id + "." + platform ) || {};
	  },
	
	  getFilteredStandards: function( release_round_pixels, event_id )
	  {
	    var std_attributes = _get( "standard_event_values." + event_id ) || {};
	
	    return Object.keys( std_attributes ).reduce( function( all, platfrom )
	    {
	      if(( platfrom in release_round_pixels ) && platfrom != "gua" )
	      {
	        all[ platfrom ] = std_attributes[ platfrom ];
	      }
	
	      return all;
	    }, {});
	  }
	}; 

 })(); 

ModuleHandler.addElement( "StandardHelper", StandardHelper ); // File end

var GtagConfigHandler = (function GtagConfigHandler()
{ 
 
	var gtag_config_objects = {};
	var page_params = {};
	
	return element_interface = 
	{ 
	  initialize: function()
	  {
	    var queries_to_exclude = config.get( "gtag_settings.url_queries_to_exclude" );
	    var redact_emails = config.get( "gtag_settings.redact_emails_in_url" );
	
	    page_params.page_location = getUpdatedLocation( queries_to_exclude, redact_emails );
	    page_params.page_referrer = getUpdatedGoogleReferrer();
	    
	    configPixels();
	
	    observer_module.addStateUpdateListener( configPixels, { "activation_event": "consent_update", "name": "gtagConifgHandler" });
	  }
	};
	
	function configPixels()
	{
	  config.tracking_meta.ga_all.forEach( function( pixel_id )
	  {
	    data_layer_controller.submitPrimaryMessage( "config", pixel_id, getConfigObjCopy( pixel_id ));
	  });
	}
	
	function getConfigObjCopy( analytics_id )
	{
	  if( !_isStr( analytics_id )) _error( "Google Analytics id in Gtag Config should be a string" );
	
	  if( !gtag_config_objects[ analytics_id ])
	  {
	    gtag_config_objects[ analytics_id ] = generateConfigBase( analytics_id );
	  }
	
	  var settings = _copy( gtag_config_objects[ analytics_id ]);
	  
	  if(( _get( "consent" ) || "" ).indexOf( 'marketing' ) < 0 )
	  {
	    settings.allow_ad_personalization_signals = false;
	    settings.allow_google_signals = false;
	  }
	
	  return settings;
	}
	
	function generateConfigBase( analytics_id )
	{
	  var settings = { "send_page_view": false };
	
	  if( isUAPixel( analytics_id ))
	  {
	    var custom_map = getCustomMap( analytics_id );
	    if( custom_map ) settings.custom_map = custom_map;
	  }
	
	  if( isServerSidePixel( analytics_id ))
	  {
	    settings.transport_url = _get( "config.serverSideEndpoint" );
	    settings.first_party_collection = true;
	  }
	
	  Object.keys( page_params ).forEach( function( param_key )
	  {
	    if( page_params[ param_key ]) settings[ param_key ] = page_params[ param_key ];
	  });
	
	  return settings;
	}
	
	function isServerSidePixel( analytics_id )
	{
	  return config.tracking_meta.ga_server.indexOf( analytics_id ) > -1;
	}
	
	function isUAPixel( analytics_id )
	{
	  return config.tracking_meta.gua_all.indexOf( analytics_id ) > -1;
	}
	
	function getCustomMap( analytics_id )
	{ 
	  return _get( "config.tracking_meta.gua_settings." + analytics_id + ".customMap" );
	}
	
	function getUpdatedGoogleReferrer(){
	
	  var query_string = ( document.location.href.split("?")[1] || "" ).split( "#" )[0];
	  var ref_original = ( query_string.split("&").filter(function(e){ return e.indexOf("ref-original=") === 0; })[0] || "" ).replace( "ref-original=", "" );
	
	  if( ref_original ) return decodeURIComponent( ref_original );
	
	  if( !document.referrer ) return undefined;
	  
	  var referrer_host = document.referrer.split("/")[2];
	  var host = document.location.href.split( "/" )[2];
	  return referrer_host == host ? undefined : document.referrer;
	}
	
	function encodeKeyValue( key, value )
	{
	  return [ encodeURIComponent( key ), encodeURIComponent( value )].join( "=" );
	}
	
	function addQueryPart( key, value, new_url_end )
	{
	  var leading_char = !new_url_end.length ? "?" : "&";
	  return [ new_url_end, leading_char, encodeKeyValue( key, value )].join( "" );
	}
	
	function getUpdatedLocation( url_queries_to_exclude, redact_emails, original_location )
	{
	  var new_url_end = "";
	  var location = original_location || document.location.href;
	
	  var parsed = _parseHref( location, true );
	  var updated_url_base = location.split( "?" )[ 0 ];
	  var queries_original = parsed.queries || {};
	
	  for( var key in queries_original )
	  {
	    if( _contains( url_queries_to_exclude, key )) continue;
	
	    if( queries_original[ key ].indexOf( "@" ) > -1 && redact_emails )
	    {
	      new_url_end = addQueryPart( key, "emailContentRemovedInGTM", new_url_end );
	    }
	
	    else new_url_end = addQueryPart( key, queries_original[ key ], new_url_end );
	  }
	
	  if( location.indexOf( "#" ) > -1 )
	  {
	    new_url_end += "#" + location.split( "#" )[ 1 ];
	  }
	
	  return updated_url_base + new_url_end;
	} 

 })(); 

ModuleHandler.addElement( "GtagConfigHandler", GtagConfigHandler ); // File end

var MainEventHandler = (function MainEventHandler()
{ 
 
	var events_by_name = {};
	var events_by_id = {};
	
	return element_interface =
	{
	  createEvent: function( event_name, tracking_options_obj )
	  {
	    var event = new Event( event_name );
	
	    if( tracking_options_obj )
	    {
	      addTrackingOptions( event, tracking_options_obj );
	    }
	
	    return this.registerEvent( event );
	  },
	
	  registerEvent( event )
	  {
	    events_by_name[ event.name ] = ( events_by_name[ event.name ] || [] ).concat( event );
	    events_by_id[ event.id ] = event;
	
	    GenericDispatchManager.addProcessSteps( event );
	    
	    return event;
	  },
	
	  getEventByName: function( event_name )
	  {
	    if( !events_by_name[ event_name ] || events_by_name[ event_name ].length !== 1 )
	    {
	      _error( "Dispatching event by the specified name is not possibe" );
	    }
	
	    return events_by_name[ event_name ][0];
	  }
	};
	
	function addTrackingOptions( event, tracking_options_obj )
	{
	  for( var key in tracking_options_obj )
	  {
	    event.addTrackingOption( key, tracking_options_obj[ key ]);
	  }
	} 

 })(); 

ModuleHandler.addElement( "MainEventHandler", MainEventHandler ); // File end

})(); // Module end


(function TaggingModule()
{
	var events_module = ModuleHandler.get( "events" );
	var observer_module = ModuleHandler.get( "observer_module" );
	
	var TaggingModule =
	{
	  scheduleTagging: function()
	  {
	    TaggingController.scheduleTagging();
	  },
	
	  addTaggingRequest( tagging_type, handler )
	  {
	    TaggingController.addTaggingRequest( tagging_type, handler );
	  },
	
	  setupTrigger: function( trigger )
	  {
	    return TriggerMappingHandler.setupTrigger( trigger );
	  },
	
	  getLastIncludedElementIndex: function( element )
	  {
	    if( !_isHtmlElement( element ))
	    {
	      _error( "Last included element index can only be provided for Elements" );
	    }
	    
	    return TriggerMappingHandler.getLastIncludedElementIndex( element );
	  },
	
	  getKnownElements: function()
	  {
	    return AssetHandler.known_elements;
	  },
	
	  getTriggerMapping: function()
	  {
	    return AssetHandler.triggers;
	  }
	};
	
	var module = ModuleHandler.createModule( "tagging_controller", TaggingModule );

var AssetHandler = (function AssetHandler()
{ 
 
	return element_interface =
	{
	  known_elements: [],
	
	  triggers: 
	  {
	    "all": {},
	    "click": {},
	    "visibility": {}
	  },
	
	  getElementIndex: function( element )
	  {
	    var index = this.known_elements.indexOf( element );
	    return index > -1 ? index : _log( "Element not found in known elements" );
	  }
	}; 

 })(); 

ModuleHandler.addElement( "AssetHandler", AssetHandler ); // File end

var ElementHandler = (function ElementHandler()
{ 
 
	return element_interface = 
	{
	  createKnownElementsReference: function()
	  {
	    AssetHandler.known_elements.push.apply( AssetHandler.known_elements, _getNodesArray( "*", document.body ));
	  },
	
	  getVisibilityTrigger: function( trigger_id )
	  {
	    return AssetHandler.triggers.visibility[ trigger_id ] || _error( "Trigger not found for provided id" );
	  },
	
	  getClickTrigger: function( element )
	  {
	    if( !_isHtmlElement( element ))
	    {
	      _error( "getClickTrigger only accepts HTML elements as argument" );
	    }
	
	    return AssetHandler.triggers.click[ AssetHandler.getElementIndex( element )];
	  }
	}; 

 })(); 

ModuleHandler.addElement( "ElementHandler", ElementHandler ); // File end

var TaggedClickListener = (function TaggedClickListener()
{ 
 
	return element_interface = function TaggedClickListener( event )
	{
	  var trigger = event.target && ElementHandler.getClickTrigger( event.target );
	
	  if( trigger )
	  {
	    trigger.fire();
	  }
	}; 

 })(); 

ModuleHandler.addElement( "TaggedClickListener", TaggedClickListener ); // File end

var TaggedVisibilityListener = (function TaggedVisibilityListener()
{ 
 
	return element_interface = function TaggedVisibilityListener( message )
	{
	  if( message.getEvent() !== "gtm.elementVisibility" ) return;
	  
	  var element = message.content[ "gtm.element" ];
	  var trigger_id = element && _isFn( element.getAttribute ) && element.getAttribute( config && config.element_visibility_attribute );
	
	  if( trigger_id )
	  {
	    message.cancel();
	    ElementHandler.getVisibilityTrigger( trigger_id ).fire();
	  }
	}; 

 })(); 

ModuleHandler.addElement( "TaggedVisibilityListener", TaggedVisibilityListener ); // File end

var TaggingController = (function TaggingController()
{ 
 
	var dom_ready, assistant_ready;
	
	var registered_tagging_handlers = {};
	var accepted_handler_types = [ "ecom", "click" ];
	
	return element_interface =
	{
	  scheduleTagging: function()
	  {
	    if( window.gtm_assistant ) assistant_ready = true;
	    
	    else document.addEventListener( "gtm_assistant_ready", function registerAssistantReady()
	    { 
	      assistant_ready = true;
	      checkConditions(); 
	    });
	
	    observer_module.addPushCallback( registerDomReady, "gtm.dom" );
	  },
	
	  addTaggingRequest( type, handler )
	  {
	    if( !_contains( accepted_handler_types, type ))
	    {
	      _error( "Tagging handler type ", type, " is not supported." );
	    }
	
	    if( !handler ) 
	    {
	      _error( "Handler missing from tagging request" );
	    }
	
	    if( !_isFn( handler.execute ))
	    {
	      _error( "Tagging handler should have an execute method." );
	    }
	
	    registered_tagging_handlers[ type ] = handler;
	  }
	}
	
	function checkConditions()
	{
	  if( dom_ready && assistant_ready ) setTimeout( execute );
	}
	
	function registerDomReady()
	{ 
	  dom_ready = true; 
	  checkConditions();
	}
	
	function execute()
	{
	  ElementHandler.createKnownElementsReference();
	  LifeCycleHandler.pushEvent({ "event": "tagging_module.before_tagging" });
	
	  accepted_handler_types.forEach( function initiateTagging( tagging_type )
	  {
	    if( registered_tagging_handlers[ tagging_type ] )
	    {
	      registered_tagging_handlers[ tagging_type ].execute();
	    }
	  });
	
	  // trigger assistant re-indexing not notice freshly added attributes
	  document.body.append( document.createElement( "span" ));
	} 

 })(); 

ModuleHandler.addElement( "TaggingController", TaggingController ); // File end

var TriggerMappingHandler = (function TriggerMappingHandler()
{ 
 
	var listeners_added =
	{
	  "VISIBILITY": false,
	  "CLICK": false
	}
	
	return element_interface = 
	{
	  "setupTrigger": function( trigger )
	  {
	    if( !trigger || !trigger.elements.length )
	    {
	      return _log( "Insufficient trigger provided for tagging" );
	    }
	
	    switch( trigger.type )
	    {
	      case "VISIBILITY": 
	        addTriggerToElements( trigger );
	        break;      
	      case "CLICK": 
	        addClickTracking( trigger );
	        break;
	      default:
	        _error( "Invalid Trigger type to map" );
	    }
	
	    if( !listeners_added[ trigger.type ])
	    {
	      addListener( trigger.type );
	      listeners_added[ trigger.type ] = true;
	    }
	  },
	
	  "getLastIncludedElementIndex": getLastIncludedElementIndex
	};
	
	function addListener( type )
	{
	  if( type == "VISIBILITY" ) observer_module.addPushListener( TaggedVisibilityListener );
	  if( type == "CLICK" ) observer_module.addClickListener( TaggedClickListener );
	}
	
	function addTriggerToIndex( trigger, element, index )
	{
	  var type = trigger.type.toLowerCase();
	
	  AssetHandler.triggers[ type ][ index ] = trigger;
	  AssetHandler.triggers.all[ index ] = trigger;
	
	  if( type === "visibility" )
	  {
	    element.setAttribute( config.element_visibility_attribute, index );
	  }
	}
	
	function addTriggerToElements( trigger )
	{
	  trigger.elements.forEach( function( elem )
	  {
	    addTriggerToIndex( trigger, elem, AssetHandler.getElementIndex( elem ));
	  });
	}
	
	function addClickTracking( trigger )
	{
	  if( !trigger.wrapper )
	  {
	    addTriggerToElements( trigger );
	  }
	
	  else addClickTrackingWithWrapper( trigger );
	}
	
	function addClickTrackingWithWrapper( trigger )
	{
	  var trigger_opening_index = AssetHandler.getElementIndex( trigger.wrapper );
	  var trigger_closing_index = getLastIncludedElementIndex( trigger.wrapper );
	
	  for( var i = trigger_opening_index; i < trigger_closing_index + 1; i++ )
	  {
	    addTriggerToToIndex( trigger, null, index );
	  }
	}
	
	function getLastIncludedElementIndex( elem )
	{
	  if( elem.nextElementSibling ) return AssetHandler.getElementIndex( elem.nextElementSibling ) - 1;
	  return getLastIncludedElementIndex( elem.parentElement );
	} 

 })(); 

ModuleHandler.addElement( "TriggerMappingHandler", TriggerMappingHandler ); // File end

})(); // Module end


(function BasicEventsModule()
{
	var data_layer_controller = ModuleHandler.get( "data_layer_controller" );
	var observer_module = ModuleHandler.get( "observer_module" );
	var events_module = ModuleHandler.get( "events" );
	
	var BasicEventsModule = {};
	
	var module = ModuleHandler.createModule( "basic_events", BasicEventsModule );

var PageLoadTime = (function PageLoadTime()
{ 
 
	var load_time;
	
	return element_interface = 
	{
	  "event_name": "page_performance",
	
	  initialize: function()
	  {
	    InitializationHanlder.register( this );
	  },
	
	  init_event: function initPageLoad()
	  {
	    PerformanceManager.addComponent( "page_performance" );
	    listenToLoad();
	  }
	};
	
	function listenToLoad()
	{
	  observer_module.addPushCallback( function()
	  {
	    if( !load_time )
	    {
	      load_time = getPageLoadTime();
	
	      PerformanceManager.addAttributes
	      ({
	        "page_load_time": load_time,
	        "value": load_time
	      });
	    }
	  }, "gtm.load" );
	}
	
	function getPageLoadTime()
	{
	  var timing = window.performance && window.performance.timing;
	  var ms = timing.loadEventStart - timing.navigationStart;
	  var loadTime = (((ms % 60000) / 1000).toFixed(2));
	  var cached = loadTime >= 0 ? loadTime : undefined;
	  return parseFloat( cached );
	}; 

 })(); 

ModuleHandler.addElement( "PageLoadTime", PageLoadTime ); // File end

var PerformanceManager = (function PerformanceManager()
{ 
 
	var enabled_components = [];
	var attributes_ready = {};
	var first_event_sent;
	var page_load_time_in;
	var load_time_enabled;
	var submit_timer;
	var event_count = 0;
	
	return element_interface = 
	{
	  addComponent: function( name )
	  {
	    enabled_components.push( name );
	
	    if( name === "page_performance" )
	    {
	      load_time_enabled = true;
	    }
	  },
	
	  addAttributes: function( attributes_in )
	  {
	    if( attributes_in.page_load_time )
	    {
	      page_load_time_in = true;
	    }
	
	    event_count++;
	
	    Object.assign( attributes_ready, attributes_in );
	
	    checkConditions();
	  }
	};
	
	function checkConditions()
	{
	  if(( load_time_enabled && !first_event_sent && !page_load_time_in ) || submit_timer ) return;
	
	  if( event_count >= 4 ) 
	  {
	    submitEvent();
	  }
	
	  // allow some extra time for gouping ( usually cwv )
	  else submit_timer = setTimeout( submitEvent, 1500 );
	}
	
	function getTrackingOptions()
	{
	  if( !first_event_sent ) return { "whitelist": [ "gua", "ga4" ]};
	  return { "whitelist": [ "ga4" ]};
	}
	
	function submitEvent()
	{
	  var event = events_module.create( "page_performance", getTrackingOptions());
	
	  event.addAttribute( "transport_type", "CONSTANT", "beacon" );
	  event.addAttribute( "non_interaction", "CONSTANT", true );
	
	  if( !first_event_sent ) 
	  {
	    event.addAttribute( "event_category", "CONSTANT", "Page Load Time" );
	    event.addAttribute( "event_action", "CONSTANT", "none" );
	    event.addAttribute( "event_label", "CONSTANT", "none" );
	
	    first_event_sent = true;
	  }
	
	  event.merge( attributes_ready );
	
	  attributes_ready = {};
	  submit_timer = null;
	  event_count = 0;
	
	  event.addTrigger({ "type": "CALLBACK" });
	
	  InitializationHanlder.schedule( event );
	} 

 })(); 

ModuleHandler.addElement( "PerformanceManager", PerformanceManager ); // File end

var WebVitals = (function WebVitals()
{ 
 
	var self = 
	{
	  "event_name": "web_vitals",
	
	  initialize: function()
	  {
	    InitializationHanlder.register( this );
	  },
	
	  init_event: function initWebVitals()
	  {
	    PerformanceManager.addComponent( "web_vitals" );
	    registerWebVitalListeners();
	  }
	};
	
	function registerWebVitalListeners()
	{
	  webVitals.getCLS( createEvent );
	  webVitals.getFCP( createEvent );
	  webVitals.getFID( createEvent );
	  webVitals.getLCP( createEvent );
	  webVitals.getTTFB( createEvent );
	}
	
	function createEvent( obj )
	{
	  var attributes = {};
	  var name = obj.name.toLowerCase();
	  
	  attributes[ "web_vitals_" + name + "_sample_id" ] = obj.id;
	  attributes[ "web_vitals_" + name + "_sample_value" ] = obj.value;
	  attributes[ "web_vitals_" + name + "_sample_delta" ] = obj.delta;
	
	  PerformanceManager.addAttributes( attributes );
	}
	
	var webVitals=function(q){var n,r,C,w,m=function(b,a){return{name:b,value:void 0===a?-1:a,delta:0,entries:[],id:"v2-".concat(Date.now(),"-").concat(Math.floor(8999999999999*Math.random())+1E12)}},x=function(b,a){try{if(PerformanceObserver.supportedEntryTypes.includes(b)&&("first-input"!==b||"PerformanceEventTiming"in self)){var g=new PerformanceObserver(function(c){return c.getEntries().map(a)});return g.observe({type:b,buffered:!0}),g}}catch(c){}},y=function(b,a){var g=function f(d){"pagehide"!==
	d.type&&"hidden"!==document.visibilityState||(b(d),a&&(document.removeEventListener("visibilitychange",f,!0),document.removeEventListener("pagehide",f,!0)))};document.addEventListener("visibilitychange",g,!0);document.addEventListener("pagehide",g,!0)},t=function(b){document.addEventListener("pageshow",function(a){a.persisted&&b(a)},!0)},p=function(b,a,g){var c;return function(d){0<=a.value&&(d||g)&&(a.delta=a.value-(c||0),(a.delta||void 0===c)&&(c=a.value,b(a)))}},u=-1,D=function(){y(function(b){u=
	b.timeStamp},!0)},z=function(){return 0>u&&(u="hidden"===document.visibilityState?0:1/0,D(),t(function(){setTimeout(function(){u="hidden"===document.visibilityState?0:1/0;D()},0)})),{get firstHiddenTime(){return u}}},E=function(b,a){var g,c=z(),d=m("FCP"),f=function(h){"first-contentful-paint"===h.name&&(k&&k.disconnect(),h.startTime<c.firstHiddenTime&&(d.value=h.startTime,d.entries.push(h),g(!0)))},e=window.performance&&performance.getEntriesByName&&performance.getEntriesByName("first-contentful-paint")[0],
	k=e?null:x("paint",f);(e||k)&&(g=p(b,d,a),e&&f(e),t(function(h){d=m("FCP");g=p(b,d,a);requestAnimationFrame(function(){requestAnimationFrame(function(){d.value=performance.now()-h.timeStamp;g(!0)})})}))},F=!1,A=-1,v={passive:!0,capture:!0},J=new Date,I=function(b,a){n||(n=a,r=b,C=new Date,G(document.removeEventListener),H())},H=function(){if(0<=r&&r<C-J){var b={entryType:"first-input",name:n.type,target:n.target,cancelable:n.cancelable,startTime:n.timeStamp,processingStart:n.timeStamp+r};w.forEach(function(a){a(b)});
	w=[]}},K=function(b){if(b.cancelable){var a=(1E12<b.timeStamp?new Date:performance.now())-b.timeStamp;"pointerdown"==b.type?function(g,c){var d=function(){I(g,c);e()},f=function(){e()},e=function(){document.removeEventListener("pointerup",d,v);document.removeEventListener("pointercancel",f,v)};document.addEventListener("pointerup",d,v);document.addEventListener("pointercancel",f,v)}(a,b):I(a,b)}},G=function(b){["mousedown","keydown","touchstart","pointerdown"].forEach(function(a){return b(a,K,v)})},
	B={};return q.getCLS=function(b,a){F||(E(function(l){A=l.value}),F=!0);var g,c=function(l){-1<A&&b(l)},d=m("CLS",0),f=0,e=[],k=function(l){if(!l.hadRecentInput){var L=e[0],M=e[e.length-1];f&&1E3>l.startTime-M.startTime&&5E3>l.startTime-L.startTime?(f+=l.value,e.push(l)):(f=l.value,e=[l]);f>d.value&&(d.value=f,d.entries=e,g())}},h=x("layout-shift",k);h&&(g=p(c,d,a),y(function(){h.takeRecords().map(k);g(!0)}),t(function(){f=0;A=-1;d=m("CLS",0);g=p(c,d,a)}))},q.getFCP=E,q.getFID=function(b,a){var g=
	z(),c=m("FID"),d=function(k){k.startTime<g.firstHiddenTime&&(c.value=k.processingStart-k.startTime,c.entries.push(k),e(!0))},f=x("first-input",d);var e=p(b,c,a);f&&y(function(){f.takeRecords().map(d);f.disconnect()},!0);f&&t(function(){c=m("FID");e=p(b,c,a);w=[];r=-1;n=null;G(document.addEventListener);w.push(d);H()})},q.getLCP=function(b,a){var g=z(),c=m("LCP"),d=function(h){var l=h.startTime;l<g.firstHiddenTime&&(c.value=l,c.entries.push(h),e())},f=x("largest-contentful-paint",d);if(f){var e=p(b,
	c,a);var k=function(){B[c.id]||(f.takeRecords().map(d),f.disconnect(),B[c.id]=!0,e(!0))};["keydown","click"].forEach(function(h){document.addEventListener(h,k,{once:!0,capture:!0})});y(k,!0);t(function(h){c=m("LCP");e=p(b,c,a);requestAnimationFrame(function(){requestAnimationFrame(function(){c.value=performance.now()-h.timeStamp;B[c.id]=!0;e(!0)})})})}},q.getTTFB=function(b){var a=m("TTFB");var g=function(){try{var c;if(!(c=performance.getEntriesByType("navigation")[0])){var d=performance.timing,
	f={entryType:"navigation",startTime:0},e;for(e in d)"navigationStart"!==e&&"toJSON"!==e&&(f[e]=Math.max(d[e]-d.navigationStart,0));c=f}(a.value=a.delta=c.responseStart,0>a.value||a.value>performance.now())||(a.entries=[c],b(a))}catch(k){}};"complete"===document.readyState?setTimeout(g,0):document.addEventListener("load",function(){return setTimeout(g,0)})},Object.defineProperty(q,"__esModule",{value:!0}),q}({}); 

	return self; 

 })(); 

ModuleHandler.addElement( "WebVitals", WebVitals ); // File end

var Error404 = (function Error404()
{ 
 
	return element_interface = 
	{
	  "event_name": "404_error",
	
	  initialize: function()
	  {
	    InitializationHanlder.register( this );
	  },
	
	  init_event: check404
	};
	
	function check404()
	{
	  // 404 page: https://www.veluxshop.hu/termekek/filter=lightdimming
	
	  var xhr = new XMLHttpRequest();
	
	  xhr.onload = function( e )
	  {
	    if ( xhr.status == 404 ) sendError();
	  };
	
	  xhr.onerror = function( e )
	  {
	    sendError();
	  };
	  
	  xhr.open( 'HEAD', document.location.href, true );
	
	  try {
	    xhr.send();
	  } 
	  
	  catch ( err ){ }
	}
	
	function sendError()
	{
	  var event = events_module.create( "404_error" );
	
	  event.addAttribute( "event_category", "CONSTANT", "Page not found" );
	  event.addAttribute( "event_action", "CONSTANT", "none" );
	  event.addAttribute( "event_label", "CONSTANT", "none" );
	  
	  event.addAttribute( "non_interaction", "CONSTANT", true );
	
	  event.addTrigger({ "type": "CALLBACK" });
	
	  InitializationHanlder.schedule( event );
	} 

 })(); 

ModuleHandler.addElement( "Error404", Error404 ); // File end

var PageView = (function PageView()
{ 
 
	return element_interface = 
	{
	  "event_name": "page_view",
	
	  initialize: function()
	  {
	    InitializationHanlder.register( this );
	  },
	
	  init_event: function()
      {
          observer_module.addPushListener( function(){ setTimeout( sendPageView ); }, "pageviewinit", { 
            "activation_event": "new_spa_page", 
            "execute_once": false, 
            "past_events": false 
          });

    
        sendPageView();
      }
    };
    
    function sendPageView()
    {
      var event = events_module.create( "page_view" );
      event.addTrigger({ "type": "PAGE_VIEW" });
    }

 })(); 

ModuleHandler.addElement( "PageView", PageView ); // File end

var TimeOnPage = (function TimeOnPage()
{ 
 
	var time_initialized;
	
	return element_interface = 
	{
	  "event_name": "time_on_page_30s",
	
	  initialize: function()
	  {
	    time_initialized = new Date().getTime();
	
	    InitializationHanlder.register( this );
	  },
	
	  init_event: function initTOS()
	  {
	    setTimeout( initEvent, getRemainingTime());
	  }
	};
	
	function getRemainingTime()
	{
	  var now = new Date().getTime();
	  var current = now - time_initialized;  
	  var remaining = 30000 - current;
	
	  return remaining >= 0 ? remaining : 0;
	}
	
	function initEvent()
	{
	  var event = events_module.create( "time_on_page_30s" );
	
	  event.addAttribute( "event_category", "CONSTANT", "Time On Page" );
	  event.addAttribute( "event_action", "CONSTANT", "30 sec" );
	  event.addAttribute( "event_label", "CONSTANT", "none" );
	
	  event.addAttribute( "non_interaction", "CONSTANT", true );
	
	  event.addTrigger({ "type": "CALLBACK" });
	
	  InitializationHanlder.schedule( event );
	} 

 })(); 

ModuleHandler.addElement( "TimeOnPage", TimeOnPage ); // File end

var UserData = (function UserData()
{ 
 
	var user_data_cookies = 
	{
	  "user_data_fb_id": 
	  { 
	    "platform": "fb", 
	    "cookie": "_fbp" 
	  },
	
	  "user_data_hubspot_id_1":
	  {
	    "pixel": "hubspot", 
	    "cookie": "__hstc"
	  },
	
	  "user_data_hubspot_id_2":
	  {
	    "pixel": "hubspot", 
	    "cookie": "hubspotutk"
	  },
	
	  "user_data_microsoft_id":
	  {
	    "platform": "bing", 
	    "cookie": "MUID"
	  },
	
	  "user_data_bing_id": 
	  {
	    "platform": "bing", 
	    "cookie": "_uetvid"
	  }
	};
	
	return element_interface = 
	{
	  "event_name": "user_data",
	
	  initialize: function()
	  {
	    user_data_cookies.user_data_hotjar_user_id =
	    {
	      "pixel": "hotjar",
	      "cookie": "_hjSessionUser_" + config.get( "single_pixels.hotjar" )
	    };
	
	    InitializationHanlder.register( this );
	  },
	
	  init_event: initUserDataEvent
	};
	
	function initUserDataEvent()
	{
      var tracking_options = { "whitelist": [ "ga4", "gua" ]};
    
      var event = events_module.create( "user_data", tracking_options );
    
      event.addAttribute( "event_category", "CONSTANT", "user_data" );
      event.addAttribute( "event_action", "CONSTANT", "none" );
      event.addAttribute( "event_label", "CONSTANT", "none" );
      event.addAttribute( "non_interaction", "CONSTANT", true );
    
      var _gid_cookie = _getCookie( "_gid" );
      if( _gid_cookie ) 
      {
        event.addAttribute( "user_google_gid", "CONSTANT", _gid_cookie.split( "." ).slice( -2 ).join( "." ));
      }
	
	  for( var attribute_name in user_data_cookies )
	  {
	    var data_obj = user_data_cookies[ attribute_name ];
	
	    if( cookiePresent( data_obj ))
	    {
	      event.addAttribute( attribute_name, "JS_FUNCTION", _getCookie.bind( null, data_obj.cookie ));
	    }
	  }
	
	  event.addTrigger({ "type": "CALLBACK" });
	
	  InitializationHanlder.schedule( event );
	}
	
	function cookiePresent( cookie_data )
	{
	  if( "platform" in cookie_data )
	  {
	    return isPlatformPresent( cookie_data.platform );
	  }
	
	  if ( "pixel" in cookie_data )
	  {
	    return isPixelPresent( cookie_data.pixel );
	  }
	}
	
	function isPlatformPresent( platform_key )
	{
	  return platform_key in config.tracking_pixels;
	}
	
	function isPixelPresent( pixel_key )
	{
	  return config.single_pixels && pixel_key in config.single_pixels;
	} 

 })(); 

ModuleHandler.addElement( "UserData", UserData ); // File end

var InitializationHanlder = (function InitializationHanlder()
{ 
 
	var initializers = [];
	
	return element_interface = 
	{
	  initialize: function()
	  {
	    initializers.forEach( function( initFn ){ SYSTEM.queue( initFn ); });
	  },
	
	  schedule( event )
	  {
	    SYSTEM.queue( function(){ event.trigger.fire(); });
	  },
	
	  register: function( event_handler )
	  {
	    if( !_isStr( event_handler.event_name ) || !_isFn( event_handler.init_event ))
	    {
	      _error( "Insufficient event handler" );
	    }
	
	    if( !_usagePermissionGranted( event_handler.event_name, config.event_permissions ))
	    {
	      return false;
	    }
	
	    if( event_handler.event_name === "page_view" )
	    {
	      event_handler.init_event();
	    }
	
	    else initializers.push( event_handler.init_event );
	
	    return true;
	  }
	}; 

 })(); 

ModuleHandler.addElement( "InitializationHanlder", InitializationHanlder ); // File end

})(); // Module end




(function EcomEventsModule()
{
	var tagging_controller;
	var events_module;
	
	var EcomEventsModule = 
	{
	  initialize: function()
	  {
	    if( !config.ecomModuleIsEnabled ) return;
	
	    tagging_controller = ModuleHandler.get( "tagging_controller" );
	    events_module = ModuleHandler.get( "events" );
	
	    tagging_controller.addTaggingRequest( "ecom", EECMTaggingHandler );
	  },
	  
	  getBasketItem: function( item_desc )
	  {
	    if( !_isObj( item_desc )) _error( "Invalid item description in ecom module" );
	
	    var item_found = BasketHandler.find( item_desc );
	
	    if( item_found )
	    {
	      var item = EcomItemHandler.create( "product" );
	      item_desc.quantity = item_found.quantity;
	
	      item.merge( item_desc );
	
	      return item;
	    }
	  }
	};
	
	var module = ModuleHandler.createModule( "ecom_events", EcomEventsModule );


	function Collection( name, items_array, options_obj )
	{
	  this.id;
	  this.name;
	  this.items = [];
	  this.max_length;
	  this.options_obj = options_obj;
	
	  this.name = name;
	  this.addMultiple( items_array );
	
	  if( options_obj && options_obj.max_length ) 
	  {
	    this.max_length = options_obj.max_length;
	  }
	
	  this.id = Registry.addItem( this );
	}
	
	Collection.prototype.clear = function()
	{
	  return this.items.splice( 0, this.items.length ) && this;
	}
	
	Collection.prototype.add = function( item )
	{
	  this.items.push( item );
	}
	
	Collection.prototype.addToFront = function( item )
	{
	  this.items.unshift( item );
	
	  if( this.max_length && this.max_length < this.items.length )
	  {
	    this.items.length = this.max_length;
	  }
	  
	  return item;
	};
	
	Collection.prototype.addMultiple = function( items_array )
	{
	  if( !_isArray( items_array )) _error( "addMultiple accepts array arguments only" );
	  
	  for( var i in items_array )
	  {
	    this.add( items_array[ i ]);
	  }
	};
	
	Collection.prototype.getItems = function()
	{
	  return [].concat( this.items );
	}

	Registry.registerClass( Collection );


	function ConfigGroup( config_obj, wrapper, name )
	{
	  this.id;
	  this.items = [];
	  this.name = name;
	  this.wrapper = wrapper;
	  this.config = config_obj;
	  this.basket_items_plain;
	
	  this.id = Registry.addItem( this );
	}
	
	ConfigGroup.prototype.addItem = function( item )
	{
	  if( !item || !item.constructor || item.constructor.name !== "EcomItem" ) _error( "Ecom Group addItem accepts Ecom Items only." );
	  this.items.push( item );
	}
	
	ConfigGroup.prototype.setItems = function( items_array )
	{
	  this.items.length = 0;
	  
	  for( var i in items_array )
	  {
	    this.addItem( items_array[i] );
	  }
	}
	
	ConfigGroup.prototype.setBasketContents = function( items_array )
	{
	  if( !_isArray( items_array )) _error( "Basket contents should be in array format" );
	  this.basket_items_plain = items_array;
	}
	
	ConfigGroup.prototype.isAssetGroup = function()
	{
	  return _contains([ "list", "promotion" ], this.name );
	}
	
	ConfigGroup.prototype.isEventGroup = function()
	{
	  return _contains([ "view_item", "view_cart", "begin_checkout", "add_payment_info", "add_shipping_info", "purchase" ], this.name );
	}

	Registry.registerClass( ConfigGroup );


	var Event = Registry.getClassDefinition( "Event" );
	
	function EcomEvent( event_name )
	{
	  this.css_attribute_selector_context;
	  this.disabled_item_class;
	  this.items = [];
	  this.wrapper;
	
	  Event.call( this, event_name );
	  this.addTrackingOption( "send_gua_separately", true );
	
	  this.setEventType( "ecom" );
	}
	
	EcomEvent.prototype = ( Object.create || objectCreate )( Event.prototype );
	EcomEvent.prototype.constructor = EcomEvent;
	
	EcomEvent.prototype.setAttributeSelectorContext = function( wrapper_element )
	{
	  if( !( wrapper_element instanceof Element ))
	  {
	    _error( "Ecom Event wrapper should be an Element" );
	  }
	
	  return ( this.wrapper = this.css_attribute_selector_context = wrapper_element ) && this;
	}
	
	EcomEvent.prototype.getItems = function()
	{
	  return this.items;
	}
	
	EcomEvent.prototype.addItems = function( items_array )
	{
	  if( !_isArray( items_array )) _error( "Items array passed to EcomEvent should be of type array" );
	  
	  for( var i in items_array )
	  {
	    this.addItem( items_array[i] );
	  }
	}
	
	EcomEvent.prototype.addItem = function( ecom_item )
	{
	  if( ecom_item.constructor.name !== "EcomItem" ) _error( "Ecom Event's items array can only be filled with EcomItem instances" );
	  this.items.push( ecom_item );
	}
	
	EcomEvent.prototype.getAttributes = function()
	{
	  var attributes = Event.prototype.getAttributes.call( this );
	
	  if( !attributes.items ) 
	  {
	    attributes.items = this.items.reduce( function( all, curr )
	    {
	      return curr.isValid() ? all.concat( curr.getAttributes()) : all;
	    }, []);
	  }
	  
	  return attributes;
	}

	Registry.registerClass( EcomEvent );


	var AttributeHandler = Registry.getClassDefinition( "AttributeHandler" );
	
	function EcomItem( type, config, wrapper ){
	  
	  this.id;
	  this.type;
	  this.config;
	  this.wrapper;
	  this.is_valid;
	  this.events = [];
	  this.attributes = {};
	
	  if( !_contains([ "product", "promotion" ], type )) _error( "Invalid Ecom Item type" );
	
	  if( config && !_isObj( config )) _error( "Ecom Item config must be an object" );
	  if( wrapper && !( wrapper instanceof Element )) _error( "Ecom Item wrapper must be of type Element" );
	
	  this.type = type;
	  this.config = config;
	  this.wrapper = wrapper;
	
	  this.id = Registry.addItem( this );
	}
	
	EcomItem.prototype = ( Object.create || objectCreate )( AttributeHandler.prototype );
	EcomItem.prototype.constructor = EcomItem;
	
	EcomItem.prototype.isValid = function()
	{
	  return !!( this.getAttribute( "item_name" ) || this.getAttribute( "item_id" ));
	}
	
	EcomItem.prototype.addEvent = function( event )
	{
	  this.events.push( event );
	}
	
	EcomItem.prototype.addToCart = function( quantity )
	{
	  CartActionHelper.initiate( "add_to_cart", this, quantity );
	}
	
	EcomItem.prototype.removeFromCart = function( quantity )
	{
	  CartActionHelper.initiate( "remove_from_cart", this, quantity );
	}

	Registry.registerClass( EcomItem );


	function ItemCollection( name, items_array, options_obj )
	{
	  Collection.call( this, name, items_array, options_obj );
	}
	
	ItemCollection.prototype = ( Object.create || objectCreate )( Collection.prototype );
	ItemCollection.prototype.constructor = ItemCollection;
	
	ItemCollection.prototype.find = function( attributes_object )
	{
	  return this.items.find( function( collection_item )
	  {
	    return isSameItem( collection_item, attributes_object );
	  });
	}
	
	ItemCollection.prototype.findIndex = function( attributes_object )
	{
	  for( var index in this.items )
	  {
	    if( isSameItem( this.items[ index ], attributes_object )) return index;
	  }
	}
	
	ItemCollection.prototype.remove = function( item_desc )
	{
	  var item_index = this.findIndex( item_desc );
	  if( _exists( item_index )) return this.items.splice( item_index, 1 )[ 0 ];
	};
	
	function isSameItem( collection_item, item_to_find )
	{
	  var comparison_attributes = [ "item_name", "item_id", "item_variant" ];
	  var matching_attribute_count = 0;
	
	  var description = item_to_find instanceof EcomItem ? item_to_find.getAttributes() : item_to_find;
	
	  if( !collection_item || !description )
	  {
	    return false;
	  }
	
	  for( var i in comparison_attributes )
	  {
	    var attr = comparison_attributes[ i ];
	
	    if( description[ attr ] && !_isStr( description[ attr ] ) && !_isNum( description[ attr ] )) _error( "Invalid ecom item description" );
	
	    var collection_attr = collection_item[ attr ];
	    var description_attr = description[ attr ];
	    
	    if( collection_attr && description_attr )
	    {
	      if( collection_attr !== description_attr ) return false;
	      else matching_attribute_count++;
	    }
	  }
	
	  return !!matching_attribute_count;
	}

	Registry.registerClass( ItemCollection );


	function PersistedCollection( collection, cookie_name )
	{
	  this.had_previous_state = false;
	  this.cookie_name = cookie_name;
	  this.managed_collection = collection;
	  
	  this.id = Registry.addItem( this );
	
	  var previous_data = getFromCookie( cookie_name );
	
	  if( previous_data && previous_data.length )
	  {
	    this.had_previous_state = true;
	    this.managed_collection.addMultiple( previous_data );
	  }
	
	  observeChanges( this.managed_collection );
	
	  this.update = function()
	  {
	    updateRecord( collection );
	  }
	
	  function observeChanges( collection )
	  {
	    var methods = { "addToFront": "", "add": "", "removeByDesc": "", "clear": "" };
	
	    for( var name in methods )
	    {
	      var original_fn = collection[ name ];
	      collection[ name ] = getFunctionOverride( original_fn );
	    }
	  }
	
	  function getFunctionOverride( original_fn )
	  {
	    return function( arg ){
	      try{ 
	        var ret = original_fn.call( collection, arg );
	        updateRecord( collection );
	        return ret;
	      }
	      catch( err )
	      { 
	        _error( "persisted_collection error" );
	      }
	    };
	  }
	
	  function updateRecord( collection )
	  {
	    var to_save = collection.getItems();
	    var cookie_days = config.basket_cookie_lifetime_days;
	
	    if( to_save.length )
	    {
	      _setCookie( cookie_name, JSON.stringify( to_save ), cookie_days );
	    }
	
	    else
	    {
	      _deleteCookie( cookie_name );
	    }
	  }
	
	  function getFromCookie( cookie_name )
	  {
	    var cookie_value = _getCookie( cookie_name );
	    return cookie_value && JSON.parse( cookie_value );
	  }
	}

	Registry.registerClass( PersistedCollection );

var EcomDispatchManager = (function EcomDispatchManager()
{ 
 
	return element_interface =
	{
	  addProcessSteps: function( ecom_event )
	  {
	    ecom_event.addStandardizationHandler( "ecom", StandardizationHandler );
	
	    var dispatch_controller = ecom_event.getDispatchController();
	
	    if( _contains([ "view_item_list", "view_promotion" ], ecom_event.name ))
	    {
	      dispatch_controller.addProcessStep( EventGroupingHandler );
	    }
	
	    if( _contains([ "select_item", "view_item" ], ecom_event.name ))
	    {
	      dispatch_controller.addProcessStep( ItemAttributeHandler );
	    }
	
	    if( _contains([ "add_to_cart", "remove_from_cart" ], ecom_event.name ))
	    {
	      dispatch_controller.addProcessStep( BasketHandler );
	    }
	
	    if( ecom_event.name == "purchase" )
	    {
	      dispatch_controller.addProcessStep( PurchaseHandler );
	    }
	  }
	}; 

 })(); 

ModuleHandler.addElement( "EcomDispatchManager", EcomDispatchManager ); // File end

var EventGroupingHandler = (function EventGroupingHandler()
{ 
 
	var grouped_items = _store( "_data.eecm_groups", {} );
	
	return element_interface =
	{
	  execute: function( event_obj )
	  {      
	    var event_name = event_obj.name;
	
	    if( !grouped_items[ event_name ])
	    {
	      grouped_items[ event_name ] = { "event_obj": event_obj };
	    }
	
	    else
	    {
	      clearTimeout( grouped_items[ event_name ].timeout_handler );
	      grouped_items[ event_name ].event_obj.items.push( event_obj.items[0] );
	    }
	
	    if( grouped_items[ event_name ].event_obj.items.length < 10 )
	    {
	      grouped_items[ event_name ].timeout_handler = setTimeout( dispatchEvent, 1000, event_name );
	    }
	
	    else dispatchEvent( event_name );
	  }
	};
	
	function dispatchEvent( event_name )
	{
	  var ecom_event = grouped_items[ event_name ].event_obj;
	  
	  delete grouped_items[ event_name ];
	
	  ecom_event.getDispatchController().executeNext();
	} 

 })(); 

ModuleHandler.addElement( "EventGroupingHandler", EventGroupingHandler ); // File end

var BasketHandler = (function BasketHandler()
{ 
 
	var cookie_name = "_traqed_basket";
	var persistance_handler;
	
	function BasketHandler()
	{
	  ItemCollection.call( this, "basket_items", [] );
	  persistance_handler = new PersistedCollection( this, cookie_name );
	
	  var basket_items = [].concat( this.items );
	
	  LifeCycleHandler.pushEvent({
	    "event": "ecom_module.basket_ready",
	    "items": basket_items,
	    "remove": this.remove.bind( this )
	  });
	}
	
	BasketHandler.prototype = ( Object.create || objectCreate )( ItemCollection.prototype );
	BasketHandler.prototype.constructor = BasketHandler;
	
	BasketHandler.prototype.execute = function( ecom_event )
	{
	  var target_item = getTargetItem( ecom_event );
	  var operation_quantity = ecom_event.getAttribute( "item_quantity" );
	
	  if( !_isNum( operation_quantity ))
	  {
	    _error( "Insufficient operation quantity in basket operation" );
	  }
	
	  var action_fn = ecom_event.name === "add_to_cart" ? addToCart : removeFromCart;
	
	  action_fn.call( this, target_item, operation_quantity );
	
	  target_item.addOrUpdateAttribute( "quantity", "CONSTANT", operation_quantity );
	
	  ecom_event.getDispatchController().executeNext();
	}
	
	BasketHandler.prototype.syncItems = function( scraped_items )
	{
	  var valid_items = scraped_items.reduce( function( all, ecom_item )
	  {
	    var prev_state = this.remove( ecom_item.getAttributes());
	    if( prev_state ) ecom_item.merge( prev_state );
	    return ecom_item.isValid() ? all.concat( ecom_item ) : all;
	  }, []);
	
	  this.clear();
	
	  valid_items.forEach( function( ecom_item )
	  {
	    this.add( ecom_item.getAttributes());
	  }.bind( this ));
	
	  return valid_items;
	}
	
	function getTargetItem( ecom_event )
	{
	  var items_array = ecom_event.getItems();
	
	  return items_array[ 0 ] || _error( "Invalid event submitted for basket operation" );
	}
	
	function addAndUpdate( ecom_item, quantity_to_add )
	{
	  var current_quantity = ecom_item.getAttribute( "quantity" ) || 0;
	
	  var in_basket_quantity = current_quantity + quantity_to_add;
	
	  if( in_basket_quantity > 0 )
	  {
	    var updated_attributes = Object.assign( ecom_item.getAttributes(), { "quantity": in_basket_quantity });
	    this.add( updated_attributes );
	  }
	}
	
	function addToCart( ecom_item, operation_quantity )
	{
	  var item_attributes = ecom_item.getAttributes();
	  var prev_state = this.remove( item_attributes ) || ItemAttributeHandler.remove( item_attributes );
	  if( prev_state ) ecom_item.merge( prev_state );
	
	  if( ecom_item.isValid())
	  {
	    addAndUpdate.call( this, ecom_item, operation_quantity );
	  }  
	}
	
	function removeFromCart( ecom_item, operation_quantity )
	{
	  var prev_state = this.remove( ecom_item.getAttributes());
	  if( prev_state ) ecom_item.merge( prev_state );
	
	  addAndUpdate.call( this, ecom_item, ( operation_quantity * -1 ));
	}
	
	return element_interface = new BasketHandler(); 

 })(); 

ModuleHandler.addElement( "BasketHandler", BasketHandler ); // File end

var ItemAttributeHandler = (function ItemAttributeHandler()
{ 
 
	var cookie_name = "_traqed_seen_items";
	var persistance_handler;
	
	function ItemAttributeHandler()
	{
	  ItemCollection.call( this, "seen_items", [], { "max_length": 15 });
	  persistance_handler = new PersistedCollection( this, cookie_name );
	}
	
	ItemAttributeHandler.prototype = ( Object.create || objectCreate )( ItemCollection.prototype );
	ItemAttributeHandler.prototype.constructor = ItemAttributeHandler;
	
	ItemAttributeHandler.prototype.execute = function( ecom_event )
	{
	  var ecom_item = getItem( ecom_event );
	  
	  if( ecom_event.name === "select_item" )
	  {
	    addSelectedItem( ecom_item, this );
	  }
	
	  else if( ecom_event.name === "view_item" ) 
	  {
	    addViewedItem( ecom_item, this );
	  }
	
	  ecom_event.getDispatchController().executeNext();
	}
	
	function getItem( ecom_event )
	{
	  var ecom_item = ecom_event.items[ 0 ];
	
	  if( !( ecom_item instanceof EcomItem ))
	  {
	    _error( "Attribute tracker only accepts EcomItems as selected item" );
	  }
	
	  return ecom_item;
	}
	
	function addSelectedItem( ecom_item, collection )
	{
	  collection.addToFront( ecom_item.getAttributes());
	}
	
	function addViewedItem( ecom_item, collection )
	{
	  var item_attributes = ecom_item.getAttributes();
	  var previous_state = collection.remove( item_attributes );
	
	  if( !previous_state )
	  {
	    return collection.addToFront( item_attributes );
	  }
	
	  ecom_item.merge( previous_state );
	  collection.addToFront( ecom_item.getAttributes());
	  return ecom_item;
	}
	
	return element_interface = new ItemAttributeHandler(); 

 })(); 

ModuleHandler.addElement( "ItemAttributeHandler", ItemAttributeHandler ); // File end

var PurchaseHandler = (function PurchaseHandler()
{ 
 
	return element_interface = 
	{
	  execute: function( ecom_event )
	  {
	    if( !ecom_event.getAttribute( "transaction_id" ))
	    {
	      _log( "Transaction id missing" );
	    }
	
	    BasketHandler.clear();
	    ItemAttributeHandler.clear();
	
	    ecom_event.getDispatchController().executeNext();
	  }
	}; 

 })(); 

ModuleHandler.addElement( "PurchaseHandler", PurchaseHandler ); // File end

var EcomEventHandler = (function EcomEventHandler()
{ 
 
	return element_interface =
	{
	  create: function( event_name, one_or_more_items, event_area_wrapper )
	  {
	    var event = new EcomEvent( event_name );
	
	    EcomDispatchManager.addProcessSteps( event );
	
	    events_module.register( event );
	    
	    if( event_area_wrapper )
	    {
	      event.setAttributeSelectorContext( event_area_wrapper );
	    }
	
	    event.addAttribute( "currency", "CONSTANT", config.currency );
	
	    event.addAttribute( "event_category", "CONSTANT", "Ecommerce" );
	    event.addAttribute( "event_action", "CONSTANT", event.name );
	    event.addAttribute( "event_label", "CONSTANT", "none" );
	    
	    event.addAttribute( "non_interaction", "CONSTANT", getNonInteractionBool( event_name ));
	
	    one_or_more_items && [].concat( one_or_more_items ).forEach( function( ecom_item )
	    {
	      event.addItem( ecom_item );
	      ecom_item.addEvent( event );
	    });
	
	    return event;
	  }
	};
	
	function getNonInteractionBool( event_name )
	{
	  return  _contains([ "view_promotion", "view_item_list", "view_item", "view_cart" ], event_name );
	} 

 })(); 

ModuleHandler.addElement( "EcomEventHandler", EcomEventHandler ); // File end

var EcomItemHandler = (function EcomItemHandler()
{ 
 
	return element_interface = 
	{
	  create: function( type, config, wrapper, index )
	  {
	    var item = new EcomItem( type, config, wrapper );
	
	    if( _isNum( index )) 
	    {
	      item.addAttribute( "index", "CONSTANT", index );
	    }
	
	    return item;
	  }
	}; 

 })(); 

ModuleHandler.addElement( "EcomItemHandler", EcomItemHandler ); // File end

var AttributeHelper = (function AttributeHelper()
{ 
 
	return element_interface =
	{
	  execute: function( asset, attribute_config )
	  {
	    if( !_isObj( attribute_config )) return;
	
	    for( var attr in attribute_config )
	    {
	      var current = attribute_config[ attr ];
	  
	      if( current )
	      {
	        asset.addAttribute( attr, current.type, current.value );
	      }
	    }
	  }
	}; 

 })(); 

ModuleHandler.addElement( "AttributeHelper", AttributeHelper ); // File end

var CartActionHelper = (function CartActionHelper()
{ 
 
	return element_interface =
	{
	  initiate: function( cart_action, ecom_item, quantity )
	  {
	    var quantity_parsed = parseInt( quantity );
	
	    if( !_isNum( quantity_parsed )) return; 
	
	    var event = EcomEventHandler.create( cart_action, ecom_item, ecom_item.wrapper );
	    
	    event.addAttribute( "item_quantity", "CONSTANT", quantity_parsed );
	
	    event.addTrigger({ "type": "CALLBACK" }).fire();
	  }
	}; 

 })(); 

ModuleHandler.addElement( "CartActionHelper", CartActionHelper ); // File end

var EventHelper = (function EventHelper()
{ 
 
	return element_interface =
	{
	  getEventName: function( ecom_action, group_name )
	  {
	    switch( ecom_action ){
	
	      case "view":
	        return getViewEvent( group_name );
	
	      case "select": 
	        return getSelectionEvent( group_name );
	
	      case "add_to_cart_single":
	      case "add_to_cart_multiple":
	      case "add_to_cart_special_external":
	        return "add_to_cart";
	
	      case "remove_from_cart_single":        
	      case "remove_from_cart_multiple":
	      case "remove_from_cart_special_external":
	        return "remove_from_cart";
	
	      case "wishlist":
	        return "add_to_wishlist";
	      
	      default: _error( "unrecognized event action: '" + ecom_action + "'" );
	    }
	  }
	};
	
	function getSelectionEvent( group_name )
	{
	  switch ( group_name ) {
	    case "promotion": return "select_promotion";
	    case "product": return "select_item";
	    case "list": return "select_item";
	    default: _error( "Group: '" + group_name + "' does not support select event" );
	  }
	}
	
	function getViewEvent( group_name )
	{
	  switch ( group_name ) {
	    case "promotion": return "view_promotion";
	    case "list": return "view_item_list";
	    default: return group_name;
	  }
	} 

 })(); 

ModuleHandler.addElement( "EventHelper", EventHelper ); // File end


var StdEECConverter = (function StdEECConverter()
{
	

		var item_attribute_map =
		{
		  "id": "item_id",
		  "name": "promotion_name",
		  "creative": "creative_name",
		  "position": "index",
		  "brand": "item_brand",
		  "category": "item_category",
		  "coupon": "coupon",
		  "list": "item_list_name",
		  "price": "price",
		  "quantity": "quantity",
		  "variant": "item_variant"
		};
	
		var _public =
		{
		  initialize: function()
		  {
		    if( config.ecommerce_tracking == "through_backend_simple" )
		    {
		      var observer_module = ModuleHandler.get( "observer_module" );
		      observer_module.addPushListener( convertEnhancedEcommerce );
		    }
		  }
		};
	
		function getItemsLocation( std_event_name )
		{
		  if( std_event_name === "view_item_list" ) return "impressions";
		  if( std_event_name.indexOf( "promotion" ) > -1 ) return "promotions";
		  return products;
		}
	
		function convertEnhancedEcommerce( msg )
		{
		  if( !msg || !msg.content || !msg.content.ecommerce )
		  {
		    return;
		  }
	
		  msg.cancel();
	
		  var std_event_name = getStandardEventName( msg.content.ecommerce );
		  var items_location = getItemsLocation( std_event_name );
		  var items_array_old = getItems( items_location, msg.content.ecommerce ) || [];
	
		  var item_attributes_array = StandardizationHandler.mapItems( items_array_old, item_attribute_map );
	
		  var ecom_event = EcomEventHandler.create( std_event_name, item_attributes_array );
	
		  ecom_event.addTrigger({ "type": "CALLBACK" }).fire();
		}
	
		function getItems( items_location, ecomObject )
		{
		  if( items_location == "promotions" )
		  {
		    return ecomObject.promoView && ecomObject.promoView.promotions || ecomObject.promoClick && ecomObject.promoClick.promotions;
		  }
		  if( items_location == "impressions" ) return ecomObject.impressions;
		  if( ecomObject.click ) return ecomObject.click.products;
		  if( ecomObject.detail ) return ecomObject.detail.products;
		  if( ecomObject.add ) return ecomObject.add.products;
		  if( ecomObject.remove ) return ecomObject.remove.products;
		  if( ecomObject.checkout ) return ecomObject.checkout.products;
		  if( ecomObject.purchase ) return ecomObject.purchase.products;
		}
	
		function getCheckoutOption( msg )
		{
		  return _getValue( "ecommerce.checkout_option.actionField.option", msg.content )|| _getValue( "ecommerce.checkout.actionField.option", msg.content );
		}
	
		function getStandardEventName( ecomObject )
		{
		  if( ecomObject.promoView && ecomObject.promoView.promotions && ecomObject.promoView.promotions.length ) return "view_promotion";
		  if( ecomObject.promoClick && ecomObject.promoClick.promotions && ecomObject.promoClick.promotions.length ) return "select_promotion";
		  if( ecomObject.impressions && ecomObject.impressions.length ) return "view_item_list";
		  if( ecomObject.click ) return "select_item";
		  if( ecomObject.detail ) return "view_item";
		  if( ecomObject.add ) return "add_to_cart";
		  if( ecomObject.remove ) return "remove_from_cart";
		  if( ecomObject.checkout ) return "begin_checkout";
		  if( ecomObject.purchase ) return "purchase";
		}
	return _public;

	})();
	
ModuleHandler.addElement( "StdEECConverter", StdEECConverter ); // File end
	var StdTransactionConverter = (function StdTransactionConverter()
{
		var item_attribute_map =
        {
          "sku": "item_id",
          "name": "item_name",
          "category": "item_category",
          "price": "price",
          "quantity": "quantity"
        };
	
		var _public =
		{
		  initialize: function()
		  {
		    if( config.ecommerce_tracking == "through_backend_simple" )
		    {
		      var observer_module = ModuleHandler.get( "observer_module" );
		      observer_module.addPushListener( convertStdEcommerce );
		    }
		  }
		};
	
		function convertStdEcommerce( message )
		{
		  var content = message.getContent();
	
		  if( content && content.transactionId )
		  {
		    message.cancel();
		    mapToGtag( content );
		  }
		}
	
		function mapToGtag( msg )
		{
		  var original_products_array = msg.transactionProducts || [];
	
		  var item_attributes_array = StandardizationHandler.mapItems( original_products_array, item_attribute_map );
	
		  var event_obj = EcomEventHandler.create( "purchase", item_attributes_array );
	
		  event_obj.addAttribute( "transaction_id", "CONSTANT", msg.transactionId );
	
		  if( msg.voucherCode ) event_obj.addAttribute( "coupon", "CONSTANT", msg.voucherCode );
		  if( msg.transactionTax ) event_obj.addAttribute( "tax", "CONSTANT", msg.transactionTax );
		  if( msg.currencyCode ) event_obj.addAttribute( "currency", "CONSTANT", msg.currencyCode );
		  if( msg.transactionTotal ) event_obj.addAttribute( "value", "CONSTANT", msg.transactionTotal );
		  if( msg.transactionShipping ) event_obj.addAttribute( "shipping", "CONSTANT", transactionShipping );
		  if( msg.transactionAffiliation ) event_obj.addAttribute( "affiliation", "CONSTANT", msg.transactionAffiliation );
	
		  event_obj.addTrigger({ "type": "CALLBACK" }).fire();
		}
	return _public;

	})();
	
ModuleHandler.addElement( "StdTransactionConverter", StdTransactionConverter ); // File end


var StandardizationHandler = (function StandardizationHandler()
{ 
 
	var available_standardizers = {};
	
	return element_interface =  
	{
	  addEcomStandardizer: function( platform, instance )
	  {
	    if( available_standardizers[ platform ])
	    {
	      _error( "Ecom standardizer for platform already exists" );
	    }
	
	    available_standardizers[ platform ] = instance;
	  },
	
	  countItems: function( items_array )
	  { 
	    return items_array.reduce( function( all, curr )
	    { 
	      return all + ( curr.quantity ? parseInt( curr.quantity ) : 1 );
	    }, 0 ); 
	  },
	
	  mapObject: function( object_in, lookup_table )
	  {
	    return Object.keys( object_in ).reduce( function( out, attr )
	    {
	      var new_key = lookup_table[ attr ] || attr;
	      out[ new_key ] = object_in[ attr ];
	      return out;
	    }, {});
	  },
	
	  mapItems: function( items_array, lookup_table )
	  {
	    var getMappedObject = this.mapObject;
	
	    return ( items_array || [] ).map( function( item_in )
	    {
	      return getMappedObject( item_in, lookup_table );
	    });
	  },
	
	  getItemIds: function( ga4_items_array, id_callback )
	  {
	    return ( ga4_items_array || [] ).reduce( function( all, curr )
	    {
	      var raw_id = curr && curr.item_id;
	      var formatted_id = raw_id && ( id_callback ? id_callback( raw_id ) : raw_id );
	      return formatted_id ? all.concat( formatted_id ) : all;
	    }, []);
	  },
	
	  getAvailableStandardizers: function()
	  {
	    return available_standardizers;
	  }
	}; 

 })(); 

ModuleHandler.addElement( "StandardizationHandler", StandardizationHandler ); // File end

var BingStandardizer = (function BingStandardizer()
{ 
 
	// https://community.tealiumiq.com/t5/Client-Side-Tags/Microsoft-Advertising-Universal-Event-Tracking-UET-Tag-Setup/ta-p/12092#toc-hId-441721386
	// @todo: finalize mapping
	
	var bing_page_type = 
	{
	  "view_item_list": "Category",
	  "view_item": "Product",
	  "purchase": "Purchase",
	  "search": "Search Results",
	  "view_cart": "Cart"
	};
	
	var event_attribute_map =
	{
	  "transaction_id": "order_id",
	  "tax": "order_tax",
	  "currency": "order_currency",
	  "coupon": "order_coupon_code"
	};
	
	var event_name_map = 
	{
	  "add_payment_info": "add_payment_info",
	  "add_shipping_info": "set_checkout_option",
	  "add_to_cart": "add_to_cart",
	  "add_to_wishlist": "add_to_wishlist",
	  "begin_checkout": "begin_checkout",
	  "checkout_progress": "checkout_progress",
	  "purchase": "purchase",
	  "refund": "refund",
	  "remove_from_cart": "remove_from_cart",
	  "select_content": "select_content",
	  "select_item": "select_content",
	  "select_promotion": "select_content",
	  "view_item": "view_item",
	  "view_item_list": "view_item_list",
	  "view_promotion": "view_promotion"  
	};
	
	return element_interface = 
	{
	  initialize: function()
	  {
	    StandardizationHandler.addEcomStandardizer( "bing", this );
	  },
	
	  getAttributes: function( attributes_in, event )
	  {
	    var std_attributes = {};
	
	    var page_type = bing_page_type[ event.name ];
	    var bing_prodids = StandardizationHandler.getItemIds( attributes_in.items, getBingProdId );
	
	    if( page_type ) std_attributes.page_type = page_type;
	    if( bing_prodids.length ) std_attributes.bing_prodids = bing_prodids;
	
	    if( this.getEventName( event ))
	    {
	      std_attributes.is_std_ecom = true;
	    }
	
	    return std_attributes;
	  },
	
	  getEventName: function( event )
	  {
	    return event_name_map[ event.name ];
	  }
	};
	
	// bing product ids cannot be longer than 50 chars
	function getBingProdId( items_id )
	{
	  return String( items_id ).slice( 0, 50 );
	} 

 })(); 

ModuleHandler.addElement( "BingStandardizer", BingStandardizer ); // File end

var FbEcomStandardizer = (function FbEcomStandardizer()
{ 
 
	/**
	   * remaining std fb events: 
	   * CompleteRegistration: Signup, 
	   * CustomizeProduct: CustomizeProduct, Donate, FindLocation,
	   * Schedule, StartTrial, SubmitApplication
	   */
	
	// https://developers.facebook.com/docs/marketing-api/conversions-api/payload-helper
	// https://developers.facebook.com/docs/facebook-pixel/reference/
	
	var event_name_map = 
	{
	  "add_payment_info": "AddPaymentInfo",
	  "add_shipping_info": "AddShippingInfo",
	  "add_to_cart": "AddToCart",
	  "add_to_wishlist": "AddToWishlist",
	  "begin_checkout": "InitiateCheckout",
	  "purchase": "Purchase",
	  "refund": "Refund",
	  "remove_from_cart": "RemoveFromCart",
	  "select_content": "SelectContent",
	  "select_item": "SelectItem",
	  "select_promotion": "SelectPromotion",
	  "view_cart": "ViewCart",
	  "view_item": "ViewContent",
	  "view_item_list": "ViewContent",
	  "view_promotion": "ViewPromotion",
	  "checkout_progress": "CheckoutProgress"
	};
	
	var item_attribute_map =
	{
	  "item_id": "id"
	};
	
	var event_attribute_map =
	{
	  "event_value": "value",
	  "value": "value"
	};
	
	return element_interface = 
	{
	  initialize: function()
	  {
	    StandardizationHandler.addEcomStandardizer( "fb", this );
	  },
	
	  getAttributes: function( attributes_in, event )
	  {
	    var items_array = attributes_in.items || [];
	    var first_item = items_array[ 0 ] || {};
	
	    var computed_std_attributes = 
	    {
	      "content_type": getContentType( event.name ),
	      "content_ids": StandardizationHandler.getItemIds( items_array ),
	      "content_name": getContentName( event.name, first_item ),
	      "content_category": first_item.item_category,
	      "num_items": StandardizationHandler.countItems( items_array ) || undefined,
	      "sum_of_prices": getTotalValue( items_array ) || undefined,
	      "contents": getContentsArray( items_array )
	    };
	
	    var mapped_std_attributes = StandardizationHandler.mapObject( attributes_in, event_attribute_map );
	
	    return Object.assign({}, mapped_std_attributes, computed_std_attributes );
	  },
	
	  getEventName: function( event )
	  {
	    return event_name_map[ event.name ];
	  }
	};
	
	function getTotalValue( items_array )
	{ 
	  return items_array.reduce( function( all, curr )
	  { 
	    return curr.price ? all + ( curr.price * ( parseInt( curr.quantity ) || 1 )) : 0;
	  }, 0 ); 
	}
	
	function getContentsArray( items_array )
	{
	  var formatted = StandardizationHandler.mapItems( items_array, item_attribute_map ).reduce( function( all, item )
	  {
	    if( !item.quantity ) item.quantity = 1;
	    return all.concat( item );
	  }, []);
	
	  if( formatted.length ) return formatted;
	}
	
	function getContentType( event_name )
	{
	  if( _contains([ "view_item_list" ], event_name )) return "product_group";
	  if( _contains([ "view_item", "select_item", "add_to_cart", "add_to_wishlist" ], event_name )) return "product";
	}
	
	function getContentName( event_name, first_item )
	{
	  if( event_name == "view_item_list" ) 
	  {
	    return first_item.item_list_name;
	  }
	
	  if( _contains([ "view_promotion", "select_promotion" ], event_name )) 
	  {
	    return first_item.promotion_name;
	  }
	
	  if( _contains([ "view_item", "select_item" ], event_name )) 
	  {
	    return first_item.item_name;
	  }
	
	  if( event_name == "view_cart") return "basket";
	} 

 })(); 

ModuleHandler.addElement( "FbEcomStandardizer", FbEcomStandardizer ); // File end

var GarStandardizer = (function GarStandardizer()
{ 
 
	var item_attribute_map =
	{
	  "id": "item_id"
	};
	
	return element_interface = 
	{
	  initialize: function()
	  {
	    StandardizationHandler.addEcomStandardizer( "gar", this );
	  },
	
	  getAttributes: function( attributes_in )
	  {
	    var items = attributes_in.items || [];
	    var std_attributes = {};
	
	    var mapped_items = StandardizationHandler.mapItems( items, item_attribute_map );
	    mapped_items.forEach( function( item ){ item.google_business_vertical = "retail"; });
	
	    std_attributes.items = items;
	
	    return std_attributes;
	  }
	} 

 })(); 

ModuleHandler.addElement( "GarStandardizer", GarStandardizer ); // File end

var GuaStandardizer = (function GuaStandardizer()
{ 
 
	var event_name_map =
	{
	  "select_item": "select_content",
	  "select_promotion": "select_content"
	};
	
	var item_attribute_map =
	{
	  "item_id": "id",
	  "item_name": "name",
	  "promotion_name": "name",
	  "creative_name": "creative",
	  "creative_slot": "position",
	  "item_brand": "brand",
	  "item_category": "category",
	  "coupon": "coupon",
	  "item_list_name": "list",
	  "index": "position",
	  "price": "price",
	  "quantity": "quantity",
	  "item_variant": "variant"
	};
	
	return element_interface = 
	{
	  initialize: function()
	  {
	    StandardizationHandler.addEcomStandardizer( "gua", this );
	  },
	
	  getAttributes: function( attributes_in, event )
	  {
	    var items_attr = getItemAttributeName( event.name );
	    var attributes = {};
	    
	    attributes[ items_attr ] = StandardizationHandler.mapItems( attributes_in.items, item_attribute_map );
	
	    return attributes;
	  },
	
	  getEventName: function( event )
	  {
	    return event_name_map[ event.name ];
	  }
	};
	
	function getItemAttributeName( ga4_event_name )
	{
	  return ga4_event_name.indexOf( "_promotion" ) ? "promotions" : "items";
	} 

 })(); 

ModuleHandler.addElement( "GuaStandardizer", GuaStandardizer ); // File end

var PinterestStandardizer = (function PinterestStandardizer()
{ 
 
	var event_name_map =
	{
	  "page_view": "PageVisit",
	  "view_item_list": "ViewCategory",
	  "search": "Search",
	  "add_to_cart": "AddToCart",
	  "purchase": "Checkout",
	  "video": "WatchVideo",
	  "sign_up": "Signup",
	  "generate_lead": "Lead"
	};
	
	var item_attribute_map =
	{
	  "item_id": "product_id",
	  "item_name": "product_name",
	  "item_category": "product_category",
	  "item_variant": "product_variant_id",
	  "price": "product_price",
	  "quantity": "product_quantity",
	  "item_brand": "product_brand"
	};
	
	var event_attribute_map =
	{
	  "event_value": "value",
	  "value": "value",
	  "currency": "currency",
	  "order_quantity": "num_items",
	  "transaction_id": "order_id",
	  "coupon": "promo_code",
	  "search_term": "search_query"
	};
	
	return element_interface = 
	{
	  initialize: function()
	  {
	    StandardizationHandler.addEcomStandardizer( "ptrst", this );
	  },
	
	  getAttributes: function( attributes_in, event )
	  {
	    var items = attributes_in.items || [];
	
	    var std_attributes = {
	      "line_items": StandardizationHandler.mapItems( items, item_attribute_map ),
	      "product_ids": StandardizationHandler.getItemIds( items )
	    };
	
	    if( event.name == "purchase" )
	    {
	      std_attributes.order_quantity = StandardizationHandler.countItems( items );
	    }
	
	    return std_attributes;
	  },
	
	  getEventName: function( event )
	  {
	    return event_name_map[ event.name ];
	  }
	}; 

 })(); 

ModuleHandler.addElement( "PinterestStandardizer", PinterestStandardizer ); // File end

var TwitterStandardizer = (function TwitterStandardizer()
{ 
 
	return element_interface = 
	{
	  initialize: function()
	  {
	    StandardizationHandler.addEcomStandardizer( "twt", this );
	  },
	
	  getAttributes: function( attributes_in, event )
	  {
	    var items_array = attributes_in.items || [];
	    var first_item = items_array[ 0 ] || {};
	
	    var item_ids = StandardizationHandler.getItemIds( items_array );
	
	    var std_attributes = 
	    {
	      "currency": event.getAttribute( "currency" ) || "NON",
	      "content_name": getContentName( event.name, first_item ) || "none",
	      "content_category": first_item.item_category || "none",
	      "content_type": getContentType( event.name ),
	      "num_items": StandardizationHandler.countItems( items_array ) || 1,
	      "content_ids": JSON.stringify( item_ids )
	    };
	
	    return std_attributes;
	  },
	
	  getEventName: function()
	  {
	    return;
	  }
	};
	
	function getContentType( event_name )
	{
	  if( _contains([ "view_item_list" ], event_name )) return "product_group";
	  if( _contains([ "view_item", "select_item", "add_to_cart", "add_to_wishlist" ], event_name )) return "product";
	  if( _contains([ "begin_checkout", "purchase" ], event_name )) return "product_group";
	  return "product";
	}
	
	function getContentName( event_name, first_item )
	{
	  if( event_name == "view_item_list" ) 
	  {
	    return first_item.item_list_name;
	  }
	
	  if( _contains([ "view_promotion", "select_promotion" ], event_name )) 
	  {
	    return first_item.promotion_name;
	  }
	
	  if( _contains([ "view_item", "select_item" ], event_name )) 
	  {
	    return first_item.item_name;
	  }
	
	  return "none";
	} 

 })(); 

ModuleHandler.addElement( "TwitterStandardizer", TwitterStandardizer ); // File end

var EECMTaggingHandler = (function EECMTaggingHandler()
{ 
 
	return element_interface =
	{
	  execute: function()
	  {
	    var safeHandleGroup = _getRunner({ "func": GroupHandler.execute, "context": GroupHandler, "error_msg": "Error while parsing ecom group" });
	
	    for( var ecom_group_name in config.eec_module_config )
	    {
	      for( var i in config.eec_module_config[ ecom_group_name ])
	      {
	        var group_config = config.eec_module_config[ ecom_group_name ][ i ];
	        var config_group = getConfigGroup( group_config, ecom_group_name );
	
	        if( !config_group ) continue;
	
	        safeHandleGroup.execute( config_group, hasItemConfig( config_group ));
	      }
	    }
	  }
	};
	
	function getConfigGroup( config_obj, group_name )
	{
	  var group_wrapper = _getSingleNode( config_obj.container );
	  if( group_wrapper ) return new ConfigGroup( config_obj, group_wrapper, group_name );
	}
	
	function hasItemConfig( config_group )
	{
	  return config_group.config.item_attributes && Object.keys( config_group.config.item_attributes ).length > 0;
	} 

 })(); 

ModuleHandler.addElement( "EECMTaggingHandler", EECMTaggingHandler ); // File end

var GroupHandler = (function GroupHandler()
{ 
 
	return element_interface =
	{
	  execute: function( config_group, has_item_config )
	  {
	    if( has_item_config ) 
	    {
	      handleGroupWithItemConfig( config_group );
	    }
	
	    else handleGroupWithoutItemConfig( config_group )
	  }
	};
	
	function handleGroupWithoutItemConfig( config_group )
	{
	  if( config_group.isAssetGroup() || config_group.name === "view_item" )
	  {
	    _error( "Ecom group '" + config_group.name + "' should have item config" );
	  }
	  
	  var view_event = ViewEventHandler.execute( config_group, null, config_group.wrapper );
	
	  BasketHandler.getItems().forEach( function( item_state )
	  {
	    var ecom_item = EcomItemHandler.create( "product" ).merge( item_state );
	    view_event.addItem( ecom_item );
	  });
	
	  view_event.addTrigger( config_group.config.trigger );
	}
	
	
	function handleGroupWithItemConfig( config_group )
	{
	  ItemHandler.execute( config_group );
	  
	  if( _contains([ "list", "promotion" ], config_group.name ))
	  {
	    config_group.items.forEach( function( item, index )
	    {
	      item.addAttribute( "index", "CONSTANT", index );
	
	      var view_event = ViewEventHandler.execute( config_group, item, item.wrapper );
	      view_event.addTrigger({ "type": "VISIBILITY", "value": item.wrapper });
	    });
	  }
	
	  else if( config_group.name == "view_item" )
	  {
	    if( !config_group.items.length ) return;
	
	    var view_event = ViewEventHandler.execute( config_group, config_group.items, config_group.items[ 0 ].wrapper );
	    view_event.addTrigger( config_group.config.trigger );
	  }
	
	  else if( _contains([ "view_cart", "begin_checkout", "add_payment_info", "add_shipping_info", "purchase" ], config_group.name ))
	  {
	    var updated_items = BasketHandler.syncItems( config_group.items );
	
	    var view_event = ViewEventHandler.execute( config_group, updated_items, config_group.wrapper );
	    view_event.addTrigger( config_group.config.trigger );
	  }
	
	  else 
	  {
	    _error( "Group name '" + config_group.naame + "' not recognized in tagging handler" );
	  }
	
	  if( config_group.items.length )
	  {
	    ItemEventHandler.execute( config_group );
	  }
	} 

 })(); 

ModuleHandler.addElement( "GroupHandler", GroupHandler ); // File end

var ItemEventHandler = (function ItemEventHandler()
{ 
 
	var safeTagItemAction = _getRunner({ "func": tagItemAction, "error_msg": "Error while trying to create ecom item events" });
	
	var action_events = [ 
	  "select", "add_to_cart_single", "add_to_cart_multiple",
	  "remove_from_cart_single", "remove_from_cart_multiple", "wishlist"
	];
	
	return element_interface =
	{
	  execute: function( ecom_group )
	  {
	    for( var i in ecom_group.items )
	    {
	      for( var j in action_events )
	      {
	        ecom_group.config[ action_events[j] ] && safeTagItemAction.execute( ecom_group.items[i], action_events[j] );
	      }
	    }
	  }
	};
	
	function tagItemAction( item, action )
	{
	  var event_name = EventHelper.getEventName( action, item.type );
	  var event = EcomEventHandler.create( event_name, item, item.wrapper );
	
	  if( ["add_to_cart_single", "remove_from_cart_single"].indexOf( action ) > -1 )
	  {
	    event.addAttribute( "item_quantity", "CONSTANT", 1 );
	  }
	  
	  if( ["add_to_cart_multiple", "remove_from_cart_multiple"].indexOf( action ) > -1 )
	  {
	    event.addAttribute( "item_quantity", "CSS_SELECTOR", item.config.quantity );
	  }
	
	  var trigger = event.addTrigger({ "type": "CLICK", "status": "STALE" });
	
	  trigger.addElements( getTriggerElements( item, action ));
	
	  if( item.config.disabled_class )
	  {
	    trigger.addDisabledClass( item.config.disabled_class );
	  }
	
	  trigger.activate();
	}
	
	function getTriggerElements( item, action_event )
	{
	  var trigger_selector = item.config[ action_event ];
	
	  var full_selector = trigger_selector == "*" ? "*" : trigger_selector + ", " + trigger_selector + " *";
	  
	  return _getNodesArray( full_selector, item.wrapper );
	} 

 })(); 

ModuleHandler.addElement( "ItemEventHandler", ItemEventHandler ); // File end

var ItemHandler = (function ItemHandler()
{ 
 
	var safeProcessSingleItem = _getRunner({ "func": processSingleItem, "error_msg": "Error while trying to get items in a group" });
	
	return element_interface =
	{
	  execute: function( ecom_group )
	  {
	    getItemWrappers( ecom_group ).forEach( function( wrapper )
	    { 
	      safeProcessSingleItem.execute( wrapper, ecom_group );
	    });
	  }
	};
	
	function getItemWrappers( ecom_group )
	{
	  return ecom_group.config.item ? _getNodesArray( ecom_group.config.item, ecom_group.wrapper ) : [ ecom_group.wrapper ];
	}
	
	function processSingleItem( wrapper, ecom_group )
	{
	  var item_attr_config = ecom_group.config && ecom_group.config.item_attributes;
	
	  var type = ecom_group.name.indexOf( "promotion" ) > -1 ? "promotion" : "product";
	  var item = EcomItemHandler.create( type, ecom_group.config, wrapper );
	
	  AttributeHelper.execute( item, item_attr_config );
	
	  if( !item.getAttribute( "currency" ))
	  {
	    item.addAttribute( "currency", "CONSTANT", config.currency );
	  }
	
	  ecom_group.addItem( item );
	} 

 })(); 

ModuleHandler.addElement( "ItemHandler", ItemHandler ); // File end

var ViewEventHandler = (function ViewEventHandler()
{ 
 
	return element_interface =
	{
	  execute: function( config_group, one_or_more_items, event_area_wrapper )
	  {
	    var event_name = EventHelper.getEventName( "view", config_group.name );
	  
	    var event = EcomEventHandler.create( event_name, one_or_more_items, event_area_wrapper );
	    var event_attributes = config_group.config && config_group.config.event_attributes;
	  
	    AttributeHelper.execute( event, event_attributes );
	  
	    return event;
	  }
	}; 

 })(); 

ModuleHandler.addElement( "ViewEventHandler", ViewEventHandler ); // File end

})(); // Module end


(function ExternalEventsModule()
{
	var events_module = ModuleHandler.get( "events" );
	
	var ExternalEventModule = 
	{
	  submitExternalEvent: function( event_data, options )
	  {
	    _run( submitExternalEvent, event_data, options || {});
	  },
	
	  submitHitTemplateEvent( event_name, all_params, tracking_options )
	  {
	    _run( hitTemplateEvent, event_name, all_params, tracking_options );
	  }
	};
	
	function hitTemplateEvent( event_name, all_params, tracking_options )
	{
	  tracking_options = tracking_options || {};
	
	  var conversions_current_event = config.utils.getHitTemplateConversions( tracking_options, event_name, all_params );
	  if( conversions_current_event.length ) tracking_options.template_conversions = conversions_current_event;
	
	  if( event_name == "conversions" && !tracking_options.template_conversions ) return;
	
	  submitExternalEvent( all_params, tracking_options, event_name );
	}
	
	function submitExternalEvent( event_data, options, event_name )
	{
	  if( !event_data || !_isObj( event_data )) return;
	
	  var event_name = event_name || String( event_data.event_category );
	  var event = events_module.create( event_name );
	
	  if( event_name == "conversions" )
	  {
	    event.setEventType( "hit_conversions" );
	    event.addTrackingOption( "whitelist", [] );
	  }
	
	  for( var attr in event_data )
	  {
	    event.addAttribute( attr, "CONSTANT", event_data[ attr ]);
	  }
	
	  if( options.blacklist )
	  {
	    event.addTrackingOption( "blacklist", options.blacklist );
	  }
	
	  if( options.whitelist )
	  {
	    event.addTrackingOption( "whitelist", options.whitelist );
	  }
	
	  if( options.template_conversions )
	  {
	    event.addTrackingOption( "template_conversions", options.template_conversions );
	  }
	
	  event.addTrigger({ "type": "CALLBACK" }).fire();
	}
	
	var module = ModuleHandler.createModule( "external_events", ExternalEventModule );

})(); // Module end


(function PublicModule()
{
	var PublicModule =
	{
	  initialize: function()
	  {
	    var tagging_module = ModuleHandler.get( "tagging_controller" );
	    tagging_module.scheduleTagging();
	
	    var observer_module = ModuleHandler.get( "observer_module" );
	    var external_events_module = ModuleHandler.get( "external_events" );
	    var ecom_events_module = ModuleHandler.get( "ecom_events" );
	    var events_module = ModuleHandler.get( "events" );
	
	    window.gtm_assistant = 
	    {
	      "run": _run,
	      "get": function( key ){ return _run( _get, key ); },
	      "set": function( key, value, merge ){ return _run( _store, key, value, merge ); },
	      "error": _error,
	      "getCookie": _getCookie,
	
	      "flushErrors": function( debug_params ){ return _run( Logger.flushErrors.bind( Logger ), debug_params ); },
	      "logTagError": function( tag_data, debug_params ){ return _run( Logger.logTagError.bind( Logger ), tag_data, debug_params ); },
	
	      "getValue": function( key, object ){ return _run( _getValue, key, object ); },
	      "parseHref": function( href, parse_query ){ return _run( _parseHref, href, parse_query ); },
	
	      "getNumber": function( txt ){ return _run( _getNumber, txt ); },
	      "getNodesArray": function( one_or_more_css_selectors, context_node_object ){ return _run( _getNodesArray, one_or_more_css_selectors, context_node_object ); },
	      "getElementText": function( elem ){ return _run( _getElementText, elem ); },
	
	      "getAttributeOwner": function( owner_id ){ return Registry.get( owner_id ); },
	      "getEventByName": function( event_name ){ return events_module.getEventByName( event_name ); },
	      "getBasketItem": function( item_desc ){ return ecom_events_module.getBasketItem( item_desc ); },
	
	      "submitExternalEvent": function( event_data ){ external_events_module.submitExternalEvent( event_data ); },
	      "submitHitTemplateEvent": function( event_name, all_params, tracking_options ){ external_events_module.submitHitTemplateEvent( event_name, all_params, tracking_options ); },
	      
	      "addPushListener": function( listener_fn, name ){ observer_module.addPushListener( listener_fn, name ); },
	      "addAjaxListener": function( listener_fn, name ){ observer_module.addAjaxListener( listener_fn, name ); },
	
	      "addLifeCycleCallback": function( life_cycle_event, callback, name, listen_to_past ){ observer_module.addLifeCycleEventListener( life_cycle_event, callback, name, listen_to_past ); }
	    };
	  }
	}
	
	window.ModuleHandler = ModuleHandler;
	
	ModuleHandler.createModule( "public_module", PublicModule );

})(); // Module end

	return ModuleHandler.get( 'initializer_module' );
} // getInitializer End 

var VERSION = "3.5.0";

(function initialize()
{
  try
  {
    var initialization_handler = getInitializer();

    initialization_handler.addDeps( function()
    {
      initialization_handler.createConfig( config );
      initialization_handler.initModules();
      initialization_handler.sendReadyEvent();
    });
  }

  catch( err )
  {
    console.error( "Assistant startup error" );
    console.error( err );
  }
  
})();

}