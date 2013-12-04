var Entity = Module(function(event){
	var components = {};
	function Entity() {}
	Entity.prototype.toggle = function(id) {

	};
	function Component() {}
	return {
		Entity:Entity,
		Component:Component
	};
});
if (typeof module !== "undefined") {
	module.exports = Entity;
}