var model = null;
define( [
  'dojo/_base/declare'
  , 'dojo/_base/lang'
  , 'dojo/Stateful'
  , 'dojo/query'
  , 'dojo/html'
  , 'dijit/_WidgetBase'
  , 'dijit/_WidgetsInTemplateMixin'
  , 'dijit/_AttachMixin'
  // no parameters
  , 'dojo/NodeList-dom'
  , 'dojo/NodeList-html'
  , 'dojo/domReady!'
  ], function( declare, lang, Stateful, query, html, _WidgetBase, _WidgetsInTemplateMixin, _AttachMixin ) {
  model = new Stateful( {
    "game_points": "1001pt",
    "game_time": "06:59",
    "game_instructions": "Hola mundo!!!",
    "game_instructions_type": "alert alert-info"
    
  } );
  
  declare( "TestWidget", [ _WidgetBase, _AttachMixin ], {
    buildRendering: function() {
      this.inherited( arguments );
      html.set( this.domNode, "<h1>Hello</h1>" );
    }
  } );
  return this;
} );