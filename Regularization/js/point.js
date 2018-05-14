function point(x, y) {
	return {'x': x, 'y': y};
}

function scale(a, scalar) {
	return point(a.x * scalar, a.y * scalar);
}

function shift(a, scalar) {
	return point(a.x + scalar, a.y + scalar);
}

function add(a, b) {
	return point(a.x + b.x, a.y + b.y);
}

function sub(a, b) {
	return point(a.x - b.x, a.y - b.y);
}

function mult(a, b) {
	return point(a.x * b.x, a.y * b.y);
}

function div(a, b) {
	return point(a.x / b.x, a.y / b.y);
}

function sqrt(a) {
	return point(a.x**0.5, a.y**0.5);
}

function square(a) {
	return point(a.x**2, a.y**2);
}

function l2norm(a) {
	return (a.x**2 + a.y**2)**0.5;
}