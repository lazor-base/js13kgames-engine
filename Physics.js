<<<<<<< HEAD
var Physics = Module(function(event) {
	// name: physics

	// variables
	var axes = [];
	var smallest = {};
	var overlap = 9e9;
	// end variables
=======
var Physics = Module(function() {
	var axes = [];
	var numbers = List.get(2,"f32");
	numbers.set(0,9e9);
	numbers.set(1,Math.PI/180);
>>>>>>> Working lighting implementation

	// functions
	function dot(vector1, vector2) {
		return (getValue(vector1, X) * getValue(vector2, X)) + (getValue(vector1, Y) * getValue(vector2, Y));
	}

	function getOverlap(vector1, vector2) {
		return Math.min(getValue(vector1, Y), getValue(vector2, Y)) - Math.max(getValue(vector1, X), getValue(vector2, X));
	}

	function overlapping(vector1, vector2) {
		return !(getValue(vector1, X) > getValue(vector2, Y) || getValue(vector2, X) > getValue(vector1, Y));
	}

	function getf32List(size) {
		return List.get(size, "f32");
	}

	function putInList() {
		for (var i = 0; i < arguments.length; i++) {
			List.put(arguments[i]);
		}
	}

	function getValue(list, index) {
		return list.get(index);
	}

	function setValue(list, index, value) {
		return list.set(index, value);
	}

	function setXY(list, x, y, increment) {
		increment = increment || 0;
		setValue(list, increment + X, x);
		setValue(list, increment + Y, y);
	}

	function test(entity1, entity2) {
		// Minimum Translation Vector (MTV)
		var MTV = getf32List(3);
		var axis = getf32List(2);
		axes.length = 0;
		var vertices1 = rotate(getVertices(entity1), entity1);
		var vertices2 = rotate(getVertices(entity2), entity2);
		axes.push(getAxes(vertices1), getAxes(vertices2));
		for (var i = 0; i < axes.length; i++) {
			for (var e = 0; e < axes[i].length; e += 2) {
				setXY(axis, getValue(axes[i], e + X), getValue(axes[i], e + Y))
				// project both shapes onto the axis
				var projection1 = project(axis, entity1, vertices1);
				var projection2 = project(axis, entity2, vertices2);

				// do the projections overlap?
				if (!overlapping(projection1, projection2)) {
					// then we can guarantee that the shapes do not overlap
					putInList(projection1, projection2, axes[0], axes[1], axis, MTV, vertices1, vertices2)
					return false;
				} else {
					// get the overlap
					var projectionOverlap = getOverlap(projection1, projection2);
					putInList(projection1, projection2)
					// check for minimum
					if (projectionOverlap < getValue(numbers,0)) {
						// then set this one as the smallest
						setXY(MTV, getValue(axis, X), getValue(axis, Y))
						setValue(MTV, 2, projectionOverlap);
					}
				}
			}
		}
		// if we get here then we know that every axis had overlap on it
		// so we can guarantee an intersection
		putInList(axes[0], axes[1], axis, vertices1, vertices2)
		return MTV;
	}

	function project(axis, entity, vertices) {
		var vector = getf32List(2);
		setXY(vector, getValue(vertices, X), getValue(vertices, Y))
		var min = dot(axis, vector);
		var max = min;
		for (var i = 0; i < vertices.length; i += 2) {
			setXY(vector, getValue(vertices, i + X), getValue(vertices, i + Y))
			var projection = dot(axis, vector);
			if (projection < min) {
				min = projection;
			} else if (projection > max) {
				max = projection;
			}
		}
		var offset = dot(axis, entity);
		setXY(vector, min + offset, max + offset)
		return vector;
	}

	function getVertices(entity, rotated) {
		// counter clockwise vertices
		var width = (getValue(entity, WIDTH) / 2);
		var height = (getValue(entity, HEIGHT) / 2);
		var vertices = getf32List(8);
		setValue(vertices, 0, -width); // top left
		setValue(vertices, 1, -height);
		setValue(vertices, 2, +width); // top right
		setValue(vertices, 3, -height);
		setValue(vertices, 4, +width); // bottom right
		setValue(vertices, 5, +height);
		setValue(vertices, 6, -width); // bottom left
		setValue(vertices, 7, +height);
		if(rotated) {
			return rotate(vertices,entity);
		}
		return vertices;
	}

	function getAxes(vertices) {
		var length = vertices.length;
		var axes = getf32List(length);
		for (var i = 0; i < length; i += 2) {
			var vector1 = getf32List(2);
			var vector2 = getf32List(2);
			setXY(vector1, getValue(vertices, i + X), getValue(vertices, i + Y))
			var e = i + 2;
			if (e === length) {
				e = 0;
			}
			setXY(vector2, getValue(vertices, e + X), getValue(vertices, e + Y))
			var edge = subtract(vector1, vector2);
			var normal = perpendicular(edge);
			setXY(axes, getValue(normal, X), getValue(normal, Y), i)
			putInList(normal);
		}
		return axes;
	}

	function rotate(vertices, entity) {
		for (var i = 0; i < vertices.length; i += 2) {
			var x = getValue(vertices, i + X);
			var y = getValue(vertices, i + Y);
			var angle = getValue(entity, ANGLE) * getValue(numbers,1);
			setXY(vertices, ((x * Math.cos(angle)) - (y * Math.sin(angle))), ((x * Math.sin(angle)) + (y * Math.cos(angle))), i)
		}
		return vertices;
	}

	function perpendicular(vector) {
		// pretty sure you need to detect what is the run and what is the rise in order to do -run/rise for an angled polygon. eg y may be run and x may be rise, if its flipped 90 degrees.
		var x = getValue(vector, X);
		var y = getValue(vector, Y);
		setXY(vector, y, -x)
		return normalize(vector);
	}

	function normalize(vector) {
		var lengthSquared = dot(vector, vector);
		var length = Math.sqrt(lengthSquared);
		if (length > 0) {
			setXY(vector, getValue(vector, X) / length, getValue(vector, Y) / length)
		}
		return vector;
	}

	function subtract(vector1, vector2) {
		var result = getf32List(2);
		setXY(result, getValue(vector1, X) - getValue(vector2, X), getValue(vector1, Y) - getValue(vector2, Y))
		putInList(vector1, vector2);
		return result;
	}
	// end functions

	// other
	// end other

	return {
		// return
		test: test,
		getVertices: getVertices
		// end return
	}
});
if (typeof module !== "undefined") {
	module.exports = Physics;
}