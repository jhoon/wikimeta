var model = null;
define( [
  'dojo/_base/declare'
  , 'dojo/_base/lang'
  , 'dojo/_base/array'
  , 'dojo/Stateful'
  , 'dojo/dom'
  , 'dojo/query'
  , 'dojo/string'
  , 'dojo/Deferred'
  , 'dojo/html'
  , 'dojo/dom-construct'
  , 'dijit/_WidgetBase'
  , 'dijit/_WidgetsInTemplateMixin'
  , 'dijit/_AttachMixin'
  , 'dstore/Memory'
  , 'dojo/request'
  // no parameters
  , 'dojo/NodeList-dom'
  , 'dojo/NodeList-html'
  , 'dojo/domReady!'
  ], function( declare, lang, array, Stateful, dom, query, string, Deferred, html, domConstruct, _WidgetBase, _WidgetsInTemplateMixin, _AttachMixin, Memory, request ) {
  model = new Stateful( {
    "game_points": "1001pt",
    "game_time": "06:59",
    "game_instructions": "Hola mundo!!!",
    "game_instructions_type": "alert alert-info"
  } );
  // available statuses: play, choose, confirm, success, failure, 
  screenStatus = "play";
  cardPlay = [
    {
      order: 100,
      title: "Sample Title",
      year: 1994,
      content: "Lorem ipsum dolor sit amet"
    }
    ];
  cardList = [];
  var CollectionDB = declare( null, {
    constructor: function( args ) {
      declare.safeMixin( this, args );
    }
  } );
  declare( "Db", [], {
    constructor: function() {
      this.inherited( arguments );
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
          elem.order = orderCouter++;
          elem.content = "Lorem ipsum dolor sit amet";
          return elem;
        } )
        loadCallback.resolve( randomList );
      } ), lang.hitch( function( err ) {
        loadCallback.cancel( err );
      } ) );
      return loadCallback
    }
  } );
  declare( "TestWidget", [ _WidgetBase, _AttachMixin ], {
    _db: new Db(),
    cardTemplate: '<td id="${order}"><div class="thumbnail wm-card"><div class="caption text-center"><h3>${title}</h3></div><img src="https://unsplash.it/80?blur" class="img-responsive img-thumbnail"><div class="caption text-center"><p>${content}<strong class="mark">${year}</strong></p></div></div></td>',
    slotTemplate: '<td><div id="${id}" class="wm-card-slot"><button class="btn btn-default btn-block">+</button></div></td>',
    buildRendering: function() {
      // loading cards
      this.inherited( arguments );
      this._db.loadCategoryByName( 'movies-90s' ).then( lang.hitch( this, function( data ) {
        cardList = data;
        html.set( this.domNode, "<h1>Hello</h1>" );
        this.updateCurrentCard();
        this.updatePlayingCards();
      } ) );
    },
    executePlay: function() {
      // on the first click
      if ( screenStatus == "play" ) {
        this.choose();
        screenStatus = "choose";
      } else if ( screenStatus == "choose" ) {
        this.confirm();
        screenStatus = "play";
      }
    },
    choose: function() {
      this.setModel( "warning", "Are you sure?" );
      // TODO: Make every slot the common size
      // query()
      // TODO: Identify the caller and make it wider
      // dom.byId();
    },
    confirm: function() {
      this.setModel( "success", "Keep Playing" );
      cardPlay.splice( 0, 0, cardList[ 0 ] );
      cardList.splice( 0, 1 );
      this.updateCurrentCard();
      this.updatePlayingCards();
      // TODO: End the game if necessary
    },
    /*
    Helper function to change the title of the page
    */
    setModel: function( className, message ) {
      model.set( "game_instructions_type", "alert alert-" + className );
      model.set( "game_instructions", message );
    },
    /*
    Updates the current card to be played
    */
    updateCurrentCard: function() {
      html.set( dom.byId( "current-card" ), cardList[ 0 ].title );
    },
    /*
    Updates the list of cards that are currently in play
    */
    updatePlayingCards: function() {
      that = this;
      domConstruct.empty( "rowContent" );
      var rowContent = dom.byId( "rowContent" );
      array.forEach( cardPlay, function( entry, i ) {
        if ( i == 0 ) {
          that.addSlot( i );
        }
        domConstruct.place( string.substitute( that.cardTemplate, entry ), rowContent );
        that.addSlot( i + 1 );
      } );
      query( ".btn.btn-default" ).on( "click", lang.hitch( this, this.executePlay ) );
    },
    /*
    Helper function to add a new slot in the table
    */
    addSlot: function( slotNumber ) {
      slot = {
        id: "slot" + slotNumber
      };
      domConstruct.place( string.substitute( that.slotTemplate, slot ), dom.byId( "rowContent" ) );
    }
  } );
  return this;
} );