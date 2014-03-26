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
	UI_BUTTON = absurd.component("UI_BUTTON", {
		css: {
			'#loading': {
				background: "#000000",
				h1: {
					color: '#F00',
				}
			}

		},
		linkClicked: STRUCTURES_EVENT,
		html: {
			'button[class="UI_BUTTON" data-absurd-event="click:linkClicked" data-id="<% this.id %>"]': '<% this.name %>'
		},
		constructor: function(name, id) {
			this.name = name;
			this.id = id;
			this.populate();
		}
	});
	UI_LOADING_PAGE = absurd.component("UI_LOADING_PAGE", {
		css: {
			'#loading': {
				background: "#000000",
				h1: {
					color: '#F00',
				}
			}
		},
		html: {
			'#loading': {
				h1: '<% this.name %>'
			}
		},
		constructor: function(name) {
			this.name = name;
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