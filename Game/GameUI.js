/* global Absurd */
Module(function() {
	"use strict";
	// name: Game
	// targets: Client
	// filenames: Game
	// variables
	var absurd = new Absurd();
	var UI_BUTTON;
	var UI_LOADING_PAGE;
	var UI_GAME_INTERFACE;
	var UI_GAME_MAIN_MENU;
	var UI_PAUSE_MENU;
	/*
	body {
				color: #ffffff;
				background-color: #330000;
				margin: 0px;
				overflow: hidden;
			}

			canvas {
				float:left;
				margin:auto;
				position: absolute;
			}

			#structures{
				position: absolute;
				z-index: 1;
			}
	 */
	absurd.add({
		body: {
			color: "#ffffff",
			backgroundColor: "#330000",
			margin: "0px",
			overflow: "hidden"
		},

		canvas: {
			float: "left",
			margin: "auto",
			position: "absolute",
			zIndex: GAME_DEPTH
		},
		".hidden": {
			display: "none"
		}
	});
	absurd.compile(function(err, css) {
		var style = GUI_MAKE("style");
		style.innerHTML = css;
		document.head.appendChild(style);
	});

	/////////////////////
	// GAME INTERFACE //
	/////////////////////
	UI_GAME_INTERFACE = absurd.component("UI_GAME_INTERFACE", {
		css: {
			"#UI_GAME_INTERFACE": {
				position: "absolute",
				zIndex: GAME_INTERFACE_DEPTH
			}
		},
		html: {
			'div[id="UI_GAME_INTERFACE"]': ""
		},
		constructor: function() {
			this.populate();
		}
	});

	/////////////
	// BUTTON //
	/////////////
	UI_BUTTON = absurd.component("UI_BUTTON", {
		css: {},
		clickAction: function(e) {
			if (typeof this.fn === "function") {
				this.fn(e);
			}
		},
		html: {
			'button[class="UI_BUTTON" data-absurd-event="click:clickAction" data-id="<% this.id %>"]': '<% this.name %>'
		},
		constructor: function(name, id, fn) {
			this.fn = fn;
			this.name = name;
			this.id = id;
			this.populate();
		}
	});

	///////////////////
	// LOADING PAGE //
	///////////////////
	UI_LOADING_PAGE = absurd.component("UI_LOADING_PAGE", {
		css: {
			'#UI_LOADING_PAGE': {
				background: "#000000",
				position: "absolute",
				top: 0,
				bottom: 0,
				right: 0,
				left: 0,
				zIndex:LOADING_DEPTH,
				h1: {
					color: '#F00',
					textAlign: "center"
				}
			}
		},
		html: {
			'#UI_LOADING_PAGE': {
				h1: '<% this.name %>'
			}
		},
		constructor: function(name) {
			this.name = name;
			this.set('parent', this.qs('body')).populate();
		}
	});

	/////////////////
	// PAUSE MENU //
	/////////////////
	UI_PAUSE_MENU = absurd.component("UI_PAUSE_MENU", {
		css: {
			'#UI_PAUSE_MENU': {
				background: "rgba(0,0,0,0.25)",
				position: "absolute",
				top: 0,
				bottom: 0,
				right: 0,
				left: 0,
				zIndex:PAUSE_MENU_DEPTH,
				ul: {
					background: "#000000",
					padding:0,
					margin: "auto",
					width: "50%",
					height:"100%",
					textAlign: "center"
				},
				li: {
					margin:0,
					padding:0,
					listStyle: "none"
				}
			}
		},
		html: {
			'#UI_PAUSE_MENU': {
				ul: [{
					li: "<% this.child('link1') %>"
				}, {
					li: "<% this.child('link2') %>"
				}]
			}
		},
		constructor: function() {
			this.set("children", {
				link1: UI_BUTTON("Main Menu", "", function() {
					STATE_PREVIOUS();
				}),
				link2: UI_BUTTON("exit", "", function() {
					STATE_ACTIVATE(GAME_STATE);
					STATE_ACTIVATE(GAME_INTERFACE_STATE);
				})
			});
			this.set('parent', this.qs('body')).populate();
		}
	});

	////////////////
	// MAIN MENU //
	////////////////
	UI_GAME_MAIN_MENU = absurd.component("UI_GAME_MAIN_MENU", {
		css: {
			'#UI_GAME_MAIN_MENU': {
				background: "#000000",
				position: "absolute",
				top: 0,
				bottom: 0,
				right: 0,
				left: 0,
				zIndex:MAIN_MENU_DEPTH,
				ul: {
					margin: "auto",
					width: "100%",
					textAlign: "center"
				},
				li: {
					listStyle: "none"
				}
			}
		},
		html: {
			'#UI_GAME_MAIN_MENU': {
				ul: [{
					li: "<% this.child('link1') %>"
				}, {
					li: "<% this.child('link2') %>"
				}]
			}
		},
		constructor: function(name) {
			this.set("children", {
				link1: UI_BUTTON("start game", "", function() {
					STATE_ACTIVATE(LOADING_STATE);
					STATE_ACTIVATE(GAME_STATE);
					STATE_ACTIVATE(GAME_INTERFACE_STATE);
				}),
				link2: UI_BUTTON("exit", "", function() {
					STATE_ACTIVATE(GAME_STATE);
					STATE_ACTIVATE(GAME_INTERFACE_STATE);
				})
			});
			this.set('parent', this.qs('body')).populate();
		}
	});
	// end variables
	// functions
	// end functions
	// other
	// end other

	return {
		// return
		// end return
	};
});