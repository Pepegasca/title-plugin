/**
 * title-plugin.js
 * Plugin to fetch the title information from carbyne search
 * OO.plugin defines the custom module
 * @param module name
 * @param factory function
 * @param factory function that will be called by the player to
 * create an instance of the module. This function must
 * @return a constructor for the module class
 */
OO.plugin('title-plugin', function(OO, _, $, W){
  /**
   * Parameters:
   * OO, namespace for PlayerV4
   * _, a reference to underscore.js lib.
   * $, a reference to jQuery lib.
   * W, a reference to window object.
   */

  /**
   * Title Plugin Events Manager
   * @param options.search_url search url
   * @param options.embed_code The embed code currently playing
   */
  var titleEvents = function(options) {
    this.search_url = options.search_url;
    this.embed_code = options.embed_code;
    this. url = `${this.search_url}`;
    this.title_events = [];
    this.doFetch();
  };

  titleEvents.prototype = {
    /**
     * Fetch title plugin events
     */
    doFetch: function() {
      console.log("doFetch");
      fetch(this.url, {
        method: 'get',
        mode: 'no-cors',
        headers: new Headers({'Content-Type': 'application/json'}),
      })
      .then((response) => response.json())
      .then(this.onComplete.bind(this)).catch(this.onError.bind(this));
    },

    /**
     * Update the embed_code in order to fetch updated information
     * @param embed_code The embed code currently playing
     */
    updateEmbedCode: function(embed_code) {
      this.embed_code = embed_code;
      this. url = `${this.search_url}`;
      this.doFetch();
    },

    /**
     * Parse the title events and save them
     */
    onComplete: function(res) {
      this.title_events = res.title_events;
      this.title_value = res.title_value;
    },

    /**
     * Error handling
     */
    onError: function(error) {
      OO.log('An error happended','An error happended' + error);
    },

    /**
     * Expose the saved title_events
     */
    getTitleEvents: function() {
      return this.title_events || [];
    },

    /*
     * Expose the saved title_value (text to be displayed)
     */
    getTitleValue: function() {
      return this.title_value || '';
    },
  };

  /**
   * Video Window Manager
   * @param mainInnerWrapper main video inner wrapper DOM element
   */
  var titleWindow = function(mainInnerWrapper) {

    this.mainInnerWrapper = mainInnerWrapper;
    this.mainInnerWrapper.css('position','relative');
    this.width = this.mainInnerWrapper.width();
    this.height = this.mainInnerWrapper.height();
    this.toasterTab = $("<div/>", {
      id: "toasterTab",
      text:  "",
      css: {
        position: "absolute", top: "10%",   left: "0",  width: "100%",
        height: "10%", textColor: "white", textAlign: "center",
        lineHeight: "50px", fontFamily: "sans-serif, monospace",
        fontSize: "x-large",  zIndex: "11001",
      }
    });
    // By default hide title element
    this.mainInnerWrapper.append(this.toasterTab);
  };

  titleWindow.prototype = {

    /**
     * Show the title element
     * @param text content to be displayed
     */
    displayTitle: function(text) {
      this.toasterTab.text(text);
      this.toasterTab.show();
    },

    /**
     * Hide the title element and erase its text
     */
    hideWatermark: function() {
      this.toasterTab.text('');
      this.toasterTab.hide();
    },

    /**
     * Randomly select a new position of watermar
     */
    setPosition: function() {
      this.currentIdx = idx;
      this.toasterTab.css('top',this.topPos);
      this.toasterTab.css('left',this.leftPos);
    },

    /**
     * Update the size dimensions according
     */
    onSizeChanged: function(width, height) {
      this.width = width;
      this.height = height;
    },
  };

  /**
   * A constructor for this module class will be called by
   * the player to create an instance of the module
   * @param mb is a reference to a message bus object, which
   *  is required to be able to pub/sub to player events.
   * @param id is a unique id assigned to the module (for debug)
   */
  var ooPlayer = {};

  ooPlayer.UIModule = function(mb,id) {
    this.mb = mb;
    this.id = id;
    this.playing = false;
    this.init();
  };

  ooPlayer.UIModule.prototype = {

    /**
     * Subscribe to relevant player events
     */
    init: function() {
      this.mb.subscribe(OO.EVENTS.PLAYED, 'ooPlayer', this.onEnded.bind(this));
      this.mb.subscribe(OO.EVENTS.PAUSED, 'ooPlayer', this.onPaused.bind(this));
      this.mb.subscribe(OO.EVENTS.PLAYING, 'ooPlayer', this.onPlaying.bind(this));
      this.mb.subscribe(OO.EVENTS.SIZE_CHANGED, 'ooPlayer', this.onSizeChanged.bind(this));
      this.mb.subscribe(OO.EVENTS.PLAYER_CREATED, 'ooPlayer', this.onPlayerCreated.bind(this));
      this.mb.subscribe(OO.EVENTS.EMBED_CODE_CHANGED, 'ooPlayer', this.onEmbedCodeChanged.bind(this));
    },

    /**
     * Handles the PLAYER_CREATED event
     * @param event is the event name
     * @param elementId is the elementId of player container
     * @param params is the list of parameters which were passed into
     * player upon creation.
     */
    onPlayerCreated: function(event, elementId, params) {
      // Only create the elements if title-params exists
      if('title-plugin' in params) {
        this.playerRoot = $('#'+elementId);
        this.innerWrapper = $('#' + elementId + ' .innerWrapper');
        this.titleParams = params['title-plugin'];
        this.titleEvents = new titleEvents(this.titleParams);
        this.fetch_span = this.titleParams.fetch_span;
        this.titleWindow = new titleWindow(this.innerWrapper);
        this.showTitle('Mi nuevo titulo');
      }
    },

    /**
     * Wrapper to watermark Events Manager
     */
    doTitleFetch: function() {
      this.titleEvents.doFetch();
    },

    onShownControls: function(event, elementId, params) {
      // Show title on this event
    },

    onHiddenControls: function(event, elementId, params) {
      // Hide title on this event
    },

    /**
     * Wrapper to display Title Window Manager
     * @param text, content to be displayed
     * @param isCenter, 1 if text has to be place in the center of video, 0 otherwise
     */
    showTitle: function(text, isCenter) {
      this.titleWindow.displayTitle(text);
    },

    /**
     * Wrapper to hide Title
     */
    hideTitle: function() {
      this.titleWindow.hideTitle();
    },

    /**
     * Triggered each second, is in charge of iterate every
     * title event and command to display or hide them
     */
    doTitleCheck: function() {
      let title_events = this.titleEvents.getTitleEvents();
      let title_value = this.titleEvents.getTitleValue();
      let showTitle  = this.showTitle.bind(this);
      let hideTitle  = this.hideTitle.bind(this);
      let currentTime = parseInt(((new Date().getTime() + 999) / 1000) , 10);
      console.log(title_value);
      showTitle(title_value, event.center);
    },

    /**
     *
     */
    onSizeChanged: function(event, width, height) {
      this.titleWindow.onSizeChanged(width, height);
    },

    /**
     * Handle basic video player functions, to keep track if is plating or not
     */
    onPaused: function() {
      this.playing = false;
    },

    onPlaying: function() {
      this.playing = true;
    },

    onEnded: function() {
      this.playing = false;
    },

    /**
     * Handles the EMBED_CODE_CHANGED event
     * @param event EMBED_CODE_CHANGED
     * @param embed_code The ID (embed code) of the asset
     * @param options The options JSON object
     */
    onEmbedCodeChanged: function(event, embed_code, options) {
      this.titleEvents.updateEmbedCode(embed_code);
    },
  };

  return ooPlayer.UIModule;
})
