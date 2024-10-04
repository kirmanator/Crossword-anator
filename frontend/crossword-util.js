export function getPositionHash(pos) {
	return (pos[0] < 10 ? "0" + pos[0].toString() : pos[0].toString()) + (pos[1] < 10 ? "0" + pos[1].toString() : pos[1].toString());
}

export function calculateCellIndex(pos, rowLength) {
	return (pos[0] * rowLength) + pos[1];
}