// name: entity
var Entity = Module(function(event){
	// variables
	var components = {};
	// end variables

	// functions
	function Entity() {}
	Entity.prototype.toggle = function(id) {

	};
	function Component() {}
	// end fucntions

	return {
		// return
		Entity:Entity,
		Component:Component
		// end return
	};
});
if (typeof module !== "undefined") {
	module.exports = Entity;
}