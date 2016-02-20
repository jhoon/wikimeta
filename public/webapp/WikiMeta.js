define( [
  'dojo/_base/declare'
  , 'dojo/_base/lang'
  , 'dojo/query'
  , 'dojo/html'
  , 'dijit/_WidgetBase'
  , 'dijit/_WidgetsInTemplateMixin'
  , 'dijit/_AttachMixin'
  // no parameters
  , 'dojo/NodeList-dom'
  , 'dojo/NodeList-html'
  , 'dojo/domReady!'
  ], function( declare, lang, query, html, _WidgetBase, _WidgetsInTemplateMixin, _AttachMixin ) {
  declare( "TestWidget", [ _WidgetBase, _AttachMixin ], {
    buildRendering: function() {
      this.inherited( arguments );
      html.set( this.domNode, "<h1>Hello</h1>" );
    }
  } );
  return this;
} );