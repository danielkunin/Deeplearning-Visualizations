class Point {

	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	scale(scalar) {
		this.x *= scalar;
		this.y *= scalar;
	}

	shift(scalar) {
		this.x += scalar;
		this.y += scalar;
	}

	add(point) {
		this.x += point.x;
		this.y += point.y;
	}

	sub(point) {
		this.x -= point.x;
		this.y -= point.y;
	}

	mult(point) {
		this.x *= point.x;
		this.y *= point.y;
	}

	div(point) {
		this.x /= point.x;
		this.y /= point.y;
	}

	sqrt() {
		this.x = this.x**0.5;
		this.y = this.y**0.5;
	}

	square() {
		this.x = this.x**2;
		this.y = this.y**2;
	}

}

function Zero() {
	return new Point(0,0);
}

function One() {
	return new Point(1,1);
}