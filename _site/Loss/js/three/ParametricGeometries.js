/*
 * @author zz85
 *
 * Experimenting of primitive geometry creation using Surface Parametric equations
 *
 */

THREE.ParametricGeometries = {

	plane: function ( width, height ) {

		return function ( u, v, target ) {

			var x = u * width;
			var y = 0;
			var z = v * height;

			target.set( x, y, z );

		};

	},

	paraboloid: function ( a, b, height ) {

		return function ( u, v, target ) {

			u *= 2 * Math.PI;
			v *= height;

			var x = a * Math.sqrt(v) * Math.cos(u);
			var y = b * Math.sqrt(v) * Math.sin(u);
			var z = v;

			target.set( x, y, z );

		};

	},

	custom: function ( width, height ) {

		return function ( u, v, target ) {

			var x = u * width - width / 2;
			var y = v * height - height / 2;
			var z = Math.pow(x * x + y - 11, 2) / 64 + Math.pow(x + y * y - 7, 2) / 64;

			target.set( x, y, z );

		};

	},

	mnist: function ( width, height ) {
		// var layers = [784,10];
		// var mnist = FC(layers);
		var loss = mnist.landscape();
		return function ( u, v, target ) {

			u -= 0.5;
			v -= 0.5;

			var x = u * width;
			var y = v * height;
			var z = loss(u, v);

			target.set( x, y, z );

		};
	}


};