import { calculateCellIndex, COL_SIZE } from './crossword-util.js';
import { toggleHighlightClues, removeAllHighlights } from './highlight-service.js';

export let cursorPosition = new Array(0,0);

export function checkForArrowKeys(e, numRows) {
	console.log(e.code);
	const childIndex = calculateCellIndex(cursorPosition, COL_SIZE);
	const childElements = document.getElementById("crossword").children;
	
	if (e.code == 'ArrowDown' && cursorPosition[0] < numRows - 1) {
		updateFocusedInput(e.code, childElements, childIndex, COL_SIZE);
	} else if (e.code == 'ArrowUp' && cursorPosition[0] > 0) {
		updateFocusedInput(e.code, childElements, childIndex, COL_SIZE);
	} else if (e.code == 'ArrowRight' && cursorPosition[1] < COL_SIZE - 1) {
		updateFocusedInput(e.code, childElements, childIndex, COL_SIZE);
	} else if (e.code == 'ArrowLeft' && cursorPosition[1] > 0) {
		updateFocusedInput(e.code, childElements, childIndex, COL_SIZE);
	}
}

export function setCursorPosition(row, col) {
	console.log("Updating cursor position to: (" + row.toString() + ", " + col.toString() + ")");
	cursorPosition = new Array(row, col);
}

export function updateFocusedInput(code, childElements, childIndex) {
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
	const newIndex = calculateCellIndex(newPosition, COL_SIZE);
	if (childElements[newIndex].firstChild !== null ) {
		removeAllHighlights('.clue.highlighted');
		toggleHighlightClues(newPosition, true);
		childElements[childIndex].firstChild?.blur();
		childElements[newIndex].firstChild.focus();
		setCursorPosition(newPosition[0], newPosition[1]);
	}
}