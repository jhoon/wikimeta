var model = null;
define( [
  'dojo/_base/declare'
  , 'dojo/_base/lang'
  , 'dojo/_base/array'
  , 'dojo/Stateful'
  , 'dojo/dom'
  , 'dojo/on'
  , 'dojo/_base/event'
  , 'dojo/query'
  , 'dojo/string'
  , 'dojo/Deferred'
  , 'dojo/html'
  , 'dojo/dom-construct'
  , 'dojo/dom-class'
  , 'dijit/_WidgetBase'
  , 'dijit/_WidgetsInTemplateMixin'
  , 'dijit/_AttachMixin'
  , 'dstore/Memory'
  , 'dojo/request'
  , 'webapp/utils/domArgs'
  , 'dojo/fx/easing'
  , 'dojo/_base/fx'
  // no parameters
  , 'dojo/NodeList-dom'
  , 'dojo/NodeList-html'
  , 'dojo/domReady!'
  ], function( declare, lang, array, Stateful, dom, on, evt, query, string, Deferred, html, domConstruct, domClass, _WidgetBase, _WidgetsInTemplateMixin, _AttachMixin, Memory, request, domArgs, easing, baseFx ) {
  var REPLACE_PATTERN = /\$\{([^\}]+)\}/g;
  var util = {
    template: function( templateId, wrapTemplate ) {
      try {
        var template = lang.replace( wrapTemplate || "{0}", [ "{0}" ] )
        return lang.replace( template, [ query( lang.replace( "#{0}", [ templateId ] ) )[ 0 ].innerHTML ] );
      } catch ( ex ) {
        return "<span>!!!Error</span>";
      }
    },
    loadCategoryByName: function( categoryName ) {
      var loadCallback = new Deferred();
      request( lang.replace( 'webapp/data/{0}.json', [ categoryName ] ) ).then( lang.hitch( this, function( data ) {
        var jsonData = JSON.parse( data );
        var orderCouter = 0;
        var randomList = jsonData.map( function( elem ) {
          return {
            img: elem.img,
            year: elem.year,
            title: elem.title,
            wiki: elem.wiki,
            _random: Math.random()
          }
        } ).sort( function( first, second ) {
          return ( first._random < second._random ? -1 : ( first._random > second._random ? 1 : 0 ) )
        } ).map( function( elem ) {
          elem.id = orderCouter++;
          elem.content = "Lorem ipsum dolor sit amet";
          return elem;
        } )
        loadCallback.resolve( randomList );
      } ), lang.hitch( function( err ) {
        loadCallback.cancel( err );
      } ) );
      return loadCallback
    }
  }
  model = new Stateful( {
    "game_points": 0,
    "game_time": "06:59",
    "game_instructions": "---",
    "game_instructions_type": "alert alert-info",
    "game_finished_message": ""
  } );
  declare( "PageController", [ _WidgetBase, _AttachMixin ], {
    state: 'SELECT_SLOT',
    cardPlay: null,
    cards: null,
    _timerId: null,
    _seconds: null,
    _startClock: function() {
      clearInterval( this._timerId );
      this._timerId = setInterval( lang.hitch( this, this._updateTime ), 1000 );
    },
    _stopClock: function() {
      clearInterval( this._timerId );
    },
    _updateTime: function() {
      this._seconds++;
      var date = new Date( null );
      date.setSeconds( this._seconds ); // specify value for SECONDS here
      model.set( 'game_time', date.toISOString().substr( 11, 8 ) )
    },
    constructor: function() {
      this.inherited( arguments );
      this.cardPlay = [];
      this.cards = [];
    },
    buildRendering: function() {
      this.inherited( arguments );
      //query( '#btn-start-game' ).on( 'click', lang.hitch( this, this.startGame ) )
      //query( '#btn-restart-game' ).on( 'click', lang.hitch( this, this.restartGame ) )
      query( '.wm-category-button' ).on( 'click', lang.hitch( this, this.startGame ) )
    },
    restartGame: function() {
      this.startGame();
    },
    startGame: function() {
      var target = evt.fix( event ).currentTarget;
      var categoryId = target.attributes[ 'data-category' ].value;
      this.cards = [];
      this.cardPlay = [];
      util.loadCategoryByName( categoryId ).then( lang.hitch( this, this._updateData ) );
      $( "#modal_start" ).modal( 'hide' );
    },
    _updateData: function( data ) {
      if ( data.length < 1 ) {
        throw "Not enought Cards"
      };
      query( "#rowContent" ).empty();
      this.cardPlay.push( data.pop() );
      this.cards = data;
      this._initUI();
    },
    _initUI: function() {
      model.set( "game_instructions_type", "alert alert-info" );
      model.set( "game_instructions", "Let's get started!" );
      // first card
      var cardPlayedData = this.cardPlay[ 0 ];
      cardPlayedData.played = true;
      var domCard = this._createCard( cardPlayedData );
      var domSlotLeft = this._createSlot();
      var domSlotRight = this._createSlot();
      domConstruct.place( domSlotLeft, "rowContent", "last" );
      domConstruct.place( domCard, "rowContent", "last" );
      domConstruct.place( domSlotRight, "rowContent", "last" );
      // update selected
      var nextCardData = this.cards[ this.cards.length - 1 ];
      var currentSelectedCard = this._createNextCard( nextCardData );
      domConstruct.place( currentSelectedCard, "currentCard", "only" );
      this._startClock();
    },
    _createCard: function( data ) {
      return domConstruct.toDom( lang.replace( util.template( "template_card", "<td>{0}</td>" ), data, REPLACE_PATTERN ) );
    },
    _createNextCard: function( data ) {
      return domConstruct.toDom( lang.replace( util.template( "template_current_card" ), data, REPLACE_PATTERN ) );
    },
    _createSlot: function() {
      var slotDom = domConstruct.toDom( lang.replace( util.template( "template_slot", "<td>{0}</td>" ), {}, REPLACE_PATTERN ) );
      query( '.wm-select', slotDom ).on( 'click', lang.hitch( this, this._handleSelectSlot ) );
      query( '.wm-ok', slotDom ).on( 'click', lang.hitch( this, this._handleOkSlot ) );
      query( '.wm-cancel', slotDom ).on( 'click', lang.hitch( this, this._handleCancelSlot ) );
      return slotDom;
    },
    _showOkCancel: function( node ) {
      query( '*.wm-select', node ).addClass( 'wm-hide' )
      query( '*.wm-ok', node ).removeClass( 'wm-hide' )
      query( '*.wm-cancel', node ).removeClass( 'wm-hide' )
    },
    _showSelect: function( node ) {
      query( '*.wm-select', node ).removeClass( 'wm-hide' )
      query( '*.wm-ok', node ).addClass( 'wm-hide' )
      query( '*.wm-cancel', node ).addClass( 'wm-hide' )
    },
    _handleSelectSlot: function() {
      if ( this.cards.length == 0 ) {
        return;
      };
      this._showSelect( null );
      var slotDom = evt.fix( event ).currentTarget.parentNode;
      this.state = "CONFIRM_SLOT";
      this._showOkCancel( slotDom )
      model.set( "game_instructions_type", "alert alert-warning" );
      model.set( "game_instructions", "Are you sure?" );
    },
    _handleOkSlot: function() {
      var slotDom = evt.fix( event ).currentTarget.parentNode;
      var currentCard = this.cards.pop();
      currentCard.played = true;
      this.state = "SELECT_SLOT";
      this._showSelect( slotDom );
      // adding card
      var newCardPlayed = this._createCard( currentCard );
      var domSlotRight = this._createSlot();
      domConstruct.place( domSlotRight, slotDom.parentNode, "after" );
      domConstruct.place( newCardPlayed, slotDom.parentNode, 'after' );
      // update next card
      if ( this.cards.length > 0 ) {
        var currentSelectedCard = this._createNextCard( this.cards[ this.cards.length - 1 ] );
        domConstruct.place( currentSelectedCard, "currentCard", "only" );
        this._check( currentCard, newCardPlayed );
      } else if ( this.cards.length == 0 ) {
        query( '#currentCard' ).empty();
      }
    },
    _check: function( card, cardDom ) {
      var number = query( '.wm-card[data-played="true"]' ).filter( function( elem ) {
        return !domClass.contains( elem, 'wm-card-error' );
      } ).map( function( elem ) {
        return parseInt( elem.attributes[ 'data-year' ].value );
      } );
      var isCorrect = false;
      isCorrect = number.join( "|" ) == number.sort().join( "|" );
      if ( isCorrect ) {
        model.set( "game_points", model.game_points + 100 );
        model.set( "game_instructions_type", "alert alert-success" );
        model.set( "game_instructions", "That's right! :)" );
      } else {
        model.set( "game_points", model.game_points - 50 );
        query( '.wm-card', cardDom ).addClass( "wm-card-error" );
        model.set( "game_instructions_type", "alert alert-danger" );
        model.set( "game_instructions", "Wrong date! :(" );
      }
      baseFx.animateProperty( {
        node: query( '.wm-score' )[ 0 ],
        properties: {
          fontSize: {
            start: 10,
            end: 30,
            unit: 'px'
          }
        },
        easing: easing.linear
      } ).play();
      if ( this.cards.length == 0 ) {
        model.set( 'game_finished_message', lang.replace( "You finished!", this.model ) );
      };
    },
    _handleCancelSlot: function() {
      var slotDom = evt.fix( event ).currentTarget.parentNode;
      this.state = "SELECT_SLOT";
      this._showSelect( slotDom );
      model.set( "game_instructions_type", "alert alert-info" );
      model.set( "game_instructions", "Select a slot" );
    },
    startup: function() {
      this.inherited( arguments );
      query( '.wm-pre-load' ).removeClass( 'wm-pre-load' );
      $( '#modal_start' ).modal( "show" );
    }
  } );
  return this;
} );