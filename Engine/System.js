var System = Module(function(event) {
	"use strict";
	// name: System
	// targets: Client
	// filenames: Engine

	// variables
	var systems = new Map();
	var hosts = new Map();
	var children = new Map();
	// end variables

	// functions

	function construct(constructor, args) {
		function F() {
			return constructor.apply(this, args);
		}
		F.prototype = constructor.prototype;
		return new F();
	}

	function AddSystem(name, parameters) {
		if (systems.has(name) === false) {
			throw new Error("System does not exist.");
		}
		this.systems.set(name, new System(name).setup(parameters));
		this.installedSystems[name] = 1;
		return this;
	}

	function SetProperty(system, property, value) {
		if (this.installedSystems[system] === 0) {
			throw new Error("This system:" + system + ", is not part of this entity.");
		}
		var localSystem = this.systems.get(system);
		if (value !== undefined) {
			localSystem.data[property] = value;
		} else {
			localSystem.data = property;
		}
	}

	function GetProperty(system, property) {
		if (this.installedSystems[system] === 0) {
			throw new Error("This system:" + system + ", is not part of this entity.");
		}
		var data = this.systems.get(system).data;
		if (property !== undefined) {
			return data[property];
		}
		return data;
	}

	function SetupSystem(parameters) {
		this.data = this.parent.get(SETUP).apply(this, parameters);
		return this;
	}

	function defineSystem(name, mutable, data, type, setupFn, cloneFn) {
		if (systems.has(name)) {
			throw new Error("System already exists.");
		}
		var map = new Map();
		map.set(MUTABLE, mutable);
		map.set(DATA, data);
		map.set(TYPE, type);
		map.set(SETUP, setupFn);
		map.set(CLONE, cloneFn);
		systems.set(name, map);
	}

	function System(name) {
		this.name = name;
		this.parent = systems.get(name);
		this.systemType = this.parent.get(TYPE);
		this.data = this.parent.get(DATA);
		this.subSystems = [];
		return this;
	}

	System.prototype.setup = SetupSystem;

	function hostEntity(name) {
		var host = new Host(name);
		hosts.set(name, host);
		return host;
	}

	function Host() {
		this.name = name;
		this.installedSystems = new Uint8Array(systems.size);
		this.systems = new Map();
		return this;
	}

	Host.prototype.addSystem = AddSystem;

	function childEntity(name, parent) {
		if (children.has(name)) {
			throw new Error("Child entity already exists.");
		}
		var child = new Child(name, parent);
		children.set(name, child);
		return child;
	}

	function Child(name, parent) {
		this.name = name;
		this.parent = hosts.get(parent);
		this.installedSystems = new Uint8Array(systems.size);
		this.systems = new Map();
		for (var i = 0; i < this.parent.installedSystems.length; i++) {
			if (this.parent.installedSystems[i]) {
				this.installedSystems[i] = 1;
				var parentSystem = this.parent.systems.get(i);
				var subsystem = new System(i);
				subsystem.data = parentSystem.parent.get(CLONE)(parentSystem.data);
				this.systems.set(i, subsystem);
			}
		}
		return this;
	}

	Child.prototype.addSystem = AddSystem;

	Child.prototype.get = GetProperty;

	Child.prototype.set = SetProperty;



	function cloneChild(entity) {
		return new Entity(entity);
	}

	function Entity(name) {
		this.name = name;
		this.parent = children.get(name);
		this.installedSystems = this.parent.installedSystems;
		this.systems = new Map();
		for (var i = 0; i < this.parent.installedSystems.length; i++) {
			if (this.parent.installedSystems[i]) {
				this.installedSystems[i] = 1;
				var parentSystem = this.parent.systems.get(i);
				var subsystem = new System(i);
				subsystem.data = parentSystem.parent.get(CLONE)(parentSystem.data);
				this.systems.set(i, subsystem);
			}
		}
		return this;
	}

	Entity.prototype.get = GetProperty;

	Entity.prototype.set = SetProperty;


	function EntityDefinition(name) {
		this.name = name;
		this.installedSystems = new Uint8Array(systems.size);
		this.systems = new Map();
	}


	EntityDefinition.prototype.addSystem = function(name, parameters) {
		if (systems.has(name) === false) {
			throw new Error("System does not exist.");
		}
		this.systems.set(name, construct(System, parameters));
	};
	EntityDefinition.prototype.child = function() {

	};

	function systemReady() {
		event.emit("systemReady");
	}
	// end functions

	// other
	// end other

	return {
		// return
		system: defineSystem,
		child: childEntity,
		host: hostEntity,
		clone: cloneChild,
		ready: systemReady,
		on: event.on
		// end return
	};
});

if (typeof module !== "undefined") {
	module.exports = System;
}