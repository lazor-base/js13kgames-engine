var Physics = Module(function() {
	// name: Physics
	// target: Client
	// filenames: Engine

	// variables
	var axes = [];
	var edge, axis, verticeList1, verticeList2, axes1, axes2;
	var vectors = [];
	var projections = [];
	var overlap = 9e9;
	var mathPiDividedBy180 = Math.PI / 180;
	// end variables

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
		return LIST_GET(size, "f32");
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
		var vertices1 = rotate(getVertices(entity1, LIST_CLEAN(verticeList1)), entity1);
		var vertices2 = rotate(getVertices(entity2, LIST_CLEAN(verticeList2)), entity2);
		var index = -1;
		axes[0] = getAxes(vertices1, LIST_CLEAN(axes1));
		axes[1] = getAxes(vertices2, LIST_CLEAN(axes2));
		for (var i = 0; i < axes.length; i++) {
			for (var e = 0; e < axes[i].length; e += 2) {
				index++;
				setXY(axis, getValue(axes[i], e + X), getValue(axes[i], e + Y));
				// project both shapes onto the axis
				var projection1 = project(axis, entity1, vertices1, LIST_CLEAN(projections[index]));
				index++;
				var projection2 = project(axis, entity2, vertices2, LIST_CLEAN(projections[index]));

				// do the projections overlap?
				if (!overlapping(projection1, projection2)) {
					// then we can guarantee that the shapes do not overlap
					return false;
				} else {
					// get the overlap
					var projectionOverlap = getOverlap(projection1, projection2);
					// check for minimum
					if (projectionOverlap < overlap) {
						// then set this one as the smallest
						setXY(MTV, getValue(axis, X), getValue(axis, Y));
						setValue(MTV, 2, projectionOverlap);
					}
				}
			}
		}
		// if we get here then we know that every axis had overlap on it
		// so we can guarantee an intersection
		return MTV;
	}

	function project(axis, entity, vertices, vector) {
		setXY(vector, getValue(vertices, X), getValue(vertices, Y));
		var min = dot(axis, vector);
		var max = min;
		for (var i = 0; i < vertices.length; i += 2) {
			setXY(vector, getValue(vertices, i + X), getValue(vertices, i + Y));
			var projection = dot(axis, vector);
			if (projection < min) {
				min = projection;
			} else if (projection > max) {
				max = projection;
			}
		}
		var offset = dot(axis, entity);
		setXY(vector, min + offset, max + offset);
		return vector;
	}

	function getVertices(entity, vertices, rotated) {
		// counter clockwise vertices
		var width = (getValue(entity, WIDTH) / 2);
		var height = (getValue(entity, HEIGHT) / 2);
		setValue(vertices, 0, -width); // top left
		setValue(vertices, 1, -height);
		setValue(vertices, 2, +width); // top right
		setValue(vertices, 3, -height);
		setValue(vertices, 4, +width); // bottom right
		setValue(vertices, 5, +height);
		setValue(vertices, 6, -width); // bottom left
		setValue(vertices, 7, +height);
		if (rotated) {
			return rotate(vertices, entity);
		}
		return vertices;
	}

	function getAxes(vertices, axes) {
		var length = vertices.length;
		var index = -1;
		for (var i = 0; i < length; i += 2) {
			index++;
			var vector1 = LIST_CLEAN(vectors[index]);
			index++;
			var vector2 = LIST_CLEAN(vectors[index]);
			setXY(vector1, getValue(vertices, i + X), getValue(vertices, i + Y));
			var e = i + 2;
			if (e === length) {
				e = 0;
			}
			setXY(vector2, getValue(vertices, e + X), getValue(vertices, e + Y));
			subtract(vector1, vector2, LIST_CLEAN(edge));
			var normal = perpendicular(edge);
			setXY(axes, getValue(normal, X), getValue(normal, Y), i);
		}
		return axes;
	}

	function rotate(vertices, entity) {
		for (var i = 0; i < vertices.length; i += 2) {
			var x = getValue(vertices, i + X);
			var y = getValue(vertices, i + Y);
			var angle = getValue(entity, ANGLE) * mathPiDividedBy180;
			setXY(vertices, ((x * Math.cos(angle)) - (y * Math.sin(angle))), ((x * Math.sin(angle)) + (y * Math.cos(angle))), i);
		}
		return vertices;
	}

	function perpendicular(vector) {
		// pretty sure you need to detect what is the run and what is the rise in order to do -run/rise for an angled polygon. eg y may be run and x may be rise, if its flipped 90 degrees.
		var x = getValue(vector, X);
		var y = getValue(vector, Y);
		setXY(vector, y, -x);
		return normalize(vector);
	}

	function normalize(vector) {
		var lengthSquared = dot(vector, vector);
		var length = Math.sqrt(lengthSquared);
		if (length > 0) {
			setXY(vector, getValue(vector, X) / length, getValue(vector, Y) / length);
		}
		return vector;
	}

	function subtract(vector1, vector2, result) {
		setXY(result, getValue(vector1, X) - getValue(vector2, X), getValue(vector1, Y) - getValue(vector2, Y));
		return result;
	}
	// end functions

	// other
	GUI_ON("ready", function() {
		edge = getf32List(2);
		axis = getf32List(2);
		verticeList1 = getf32List(8);
		verticeList2 = getf32List(8);
		axes1 = getf32List(8);
		axes2 = getf32List(8);
		for (var i = 0; i < 16; i++) {
			vectors.push(getf32List(2));
		}
		for (var i = 0; i < 16; i++) {
			projections.push(getf32List(2));
		}
	});
	// end other

	return {
		// return
		test: test,
		getVertices: getVertices
		// end return
	};
});
if (typeof module !== "undefined") {
	module.exports = Physics;
}
