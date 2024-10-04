import { calculateCellIndex } from './crossword-util.js';
import { toggleHighlightClues } from './highlight-service.js';

export let cursorPosition = new Array(0,0);

export function checkForArrowKeys(e, numRows, numColumns) {
	console.log(e.code);
	const childIndex = calculateCellIndex(cursorPosition, numColumns);
	const childElements = document.getElementById("crossword").children;
	
	if (e.code == 'ArrowDown' && cursorPosition[0] < numRows - 1) {
		updateFocusedInput(e.code, childElements, childIndex, numColumns);
	} else if (e.code == 'ArrowUp' && cursorPosition[0] > 0) {
		updateFocusedInput(e.code, childElements, childIndex, numColumns);
	} else if (e.code == 'ArrowRight' && cursorPosition[1] < numColumns - 1) {
		updateFocusedInput(e.code, childElements, childIndex, numColumns);
	} else if (e.code == 'ArrowLeft' && cursorPosition[1] > 0) {
		updateFocusedInput(e.code, childElements, childIndex, numColumns);
	}
}

export function updateCursorPosition(row, col) {
	setCursorPosition(row, col);
	if (row >= 0 && col >= 0) {
		toggleHighlightClues(cursorPosition);
	}
}

export function setCursorPosition(row, col) {
	console.log("Updating cursor position to: (" + row.toString() + ", " + col.toString() + ")");
	cursorPosition = new Array(row, col);
}

export function updateFocusedInput(code, childElements, childIndex, numColumns) {
	let newPosition = cursorPosition;
	switch(code) {
		case "ArrowDown":
			newPosition = new Array(cursorPosition[0] + 1, cursorPosition[1]);
			break;
		case "ArrowUp":
			newPosition = new Array(cursorPosition[0] - 1, cursorPosition[1]);
			break;
		case "ArrowLeft":
			newPosition = new Array(cursorPosition[0], cursorPosition[1] - 1);
			break;
		case "ArrowRight":
			newPosition = new Array(cursorPosition[0], cursorPosition[1] + 1);
			break;
	}
	const newIndex = calculateCellIndex(newPosition, numColumns);
	if (childElements[newIndex].firstChild !== null ) {
		childElements[childIndex].firstChild?.blur();
		childElements[newIndex].firstChild.focus();
		setCursorPosition(newPosition[0], newPosition[1]);
	}
}