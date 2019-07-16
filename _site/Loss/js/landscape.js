if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var renderer, scene, camera;//stats

init();
animate();


function init() {

	var container = document.getElementById( 'container' );

	//

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xb0b0b0 );

	//

	camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set( 0, 0, 200 );

	//

	var group = new THREE.Group();
	scene.add( group );

	//

	var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.6 );
	directionalLight.position.set( 0.75, 0.75, 1.0 ).normalize();
	scene.add( directionalLight );

	var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.2 );
	scene.add( ambientLight );

	//

	var helper = new THREE.GridHelper( 160, 10 );
	helper.rotation.x = Math.PI / 2;
	group.add( helper );


	//

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	//

	var controls = new THREE.OrbitControls( camera, renderer.domElement );

	//

	// stats = new Stats();
	// container.appendChild( stats.dom );

	//

	window.addEventListener( 'resize', onWindowResize, false );

}


function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	requestAnimationFrame( animate );

	render();
	// stats.update();

}

function render() {

	renderer.render( scene, camera );

}




var geometry, object, material;

function removeLandscape() {

	scene.remove(object); 

}

function addLandscape() {

	material = new THREE.MeshPhongMaterial( {
					color: 0x156289,
					emissive: 0x072534,
					side: THREE.DoubleSide,
					flatShading: true
				} )


	geometry = new THREE.ParametricBufferGeometry( THREE.ParametricGeometries.mnist(20,20), 10, 10 );
	object = new THREE.Mesh( geometry, material );
	object.position.set( 0, 0, 0 );
	object.scale.multiplyScalar( 5 );

	scene.add( object );
}


var mnist = FC();

THREE.ParametricGeometries = {

	mnist: function ( width, height ) {
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

$("#load").on("click", function() {
	mnist.load('data/mnist_test.csv.zip');
});

$('#layers').change(function(){ 
    var val = $(this).val();
    if (val == "zero") {
    	mnist.setLayers([784, 10]);
    } else if (val == "one") {
    	mnist.setLayers([784, 300, 10]);
    } else if (val == "two") {
    	mnist.setLayers([784, 300, 300, 10]);
    }
});

$('#loss').change(function(){ 
    var val = $(this).val();
    mnist.setLoss(val);
});

$("#train").on("click", function() {
	mnist.train();
});

$("#landscape").on("click", function() {
	removeLandscape();
	addLandscape();
});

