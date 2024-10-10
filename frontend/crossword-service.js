import { cluesJson as clues } from './clues.js';
import { calculateCellIndex, getPositionHash, across, down, ROW_SIZE, COL_SIZE, acrossAnswers, downAnswers, hashesToClues, clueIndexToCellIndexes } from './crossword-util.js';
import { cursorPosition, setCursorPosition, checkForArrowKeys } from './cell-navigation-service.js';
import { toggleHighlightClues, removeAllHighlights, toggleHighlightCells } from './highlight-service.js';

var cswd = document.querySelector(':root');
cswd.style.setProperty('--columns', COL_SIZE);
cswd.style.setProperty('--rows', ROW_SIZE);

let acrossPositions = new Array();
let downPositions = new Array();

// Initialize an empty grid
const grid = Array.from({ length: ROW_SIZE }, () => Array(COL_SIZE).fill(''));

function placeWord(word, start, end) {
	let [startCol, startRow] = start;
	let [endCol, endRow] = end;
	let clueIndex, orientation;
	
	if (acrossAnswers.includes(word)) {
		acrossPositions.push(getPositionHash(start));
		clueIndex = acrossPositions.length - 1;
		orientation = 'across';
	} else if (downAnswers.includes(word)) {
		downPositions.push(getPositionHash(start));
		clueIndex = downPositions.length - 1;
		orientation = 'down';
	}
	
	if (!(orientation in clueIndexToCellIndexes)) {
		clueIndexToCellIndexes[orientation] = {};
	}
	
	if (orientation === 'across') {
		for (let col = startCol; col <= endCol; col++) {
			grid[startRow][col] = word[col - startCol];
			populateMaps(word, new Array(startRow, col), orientation, clueIndex);
		}
	} else {
		for (let row = startRow; row <= endRow; row++) {
			grid[row][startCol] = word[row - startRow];
			populateMaps(word, new Array(row, startCol), orientation, clueIndex);
		}
	}
}

function populateMaps(word, pos, orientation, clueIndex) {
	const posHash = getPositionHash(pos);
	if (!(posHash in hashesToClues)) {
		hashesToClues[posHash] = new Array();
	}
	hashesToClues[posHash].push(word);
	if (clueIndex in clueIndexToCellIndexes[orientation]) {
		clueIndexToCellIndexes[orientation][clueIndex].push(calculateCellIndex(pos, COL_SIZE));
	} else {
		clueIndexToCellIndexes[orientation][clueIndex] = new Array();
		clueIndexToCellIndexes[orientation][clueIndex].push(calculateCellIndex(pos, COL_SIZE));
	}
}

function renderGrid() {
	const crosswordElement = document.getElementById('crossword');
	crosswordElement.innerHTML = ''; // Clear any existing content

	for (let row = 0; row < ROW_SIZE; row++) {
		for (let col = 0; col < COL_SIZE; col++) {
			const cellValue = grid[row][col];
			const cell = document.createElement('div');
			if (cellValue) {
				const position = getPositionHash(new Array(col, row));
				let placeHolder;
				if (acrossPositions.includes(position)) {
					placeHolder = (acrossPositions.indexOf(position) + 1).toString();
				} else if (downPositions.includes(position)) {
					placeHolder = (downPositions.indexOf(position) + 1).toString();
				} else {
					placeHolder = "";
				}
				cell.className = 'crossword-cell';
				const input = document.createElement('input');
				input.setAttribute("type", "text");
				input.setAttribute("placeholder", placeHolder);
				input.setAttribute("maxLength", 1);
				input.setAttribute("value", "");
				input.addEventListener('click', e => {
					removeAllHighlights();
					setCursorPosition(row, col);
					toggleHighlightClues(cursorPosition);
					e.stopPropagation();
				});
				//input.addEventListener('onfocusout', () => toggleHighlightClues(new Array(row, col)));
				cell.appendChild(input);
			} else {
				cell.className = 'crossword-cell empty-cell';
			}
			crosswordElement.appendChild(cell);
		}
	}
}

function renderClues() {
	const acrossContainer = document.getElementById('across-container');
	const downContainer = document.getElementById('down-container');

	across.forEach(({ clue }, index) => {
		const clueItem = document.createElement('div');
		clueItem.className = 'clue';
		clueItem.textContent = `${index + 1}. ${clue}`;
		clueItem.addEventListener('click', e => { 
			toggleHighlightCells('across', index);
			e.stopPropagation();
		});
		acrossContainer.appendChild(clueItem);
	});
	
	down.forEach(({ clue }, index) => {
		const clueItem = document.createElement('div');
		clueItem.className = 'clue';
		clueItem.textContent = `${index + 1}. ${clue}`;
		clueItem.addEventListener('click', e => { 
			toggleHighlightCells('down', index);
			e.stopPropagation();
		});
		downContainer.appendChild(clueItem);
	});
}

function addEventListeners() {
	const elementsArray = document.querySelectorAll("input");
	elementsArray.forEach(function(elem) {
		elem.addEventListener("keydown", e => checkForArrowKeys(e, ROW_SIZE, COL_SIZE));
	});
	document.getElementById('app-container').addEventListener('click', removeAllHighlights);
	document.getElementById('hint').addEventListener('click', hint);
	document.addEventListener('keydown', (event) => {
	  if (event.ctrlKey && event.key === 'h') {
		event.preventDefault(); // Prevent the default browser save action
		hint();
	  }
	});
}

function confirmCrossword() {
	
}

function hint() {
	// hint for current position
	// check if letter in current input matches the one in the grid
	
	const childIndex = calculateCellIndex(cursorPosition, COL_SIZE);
	const childElements = document.getElementById("crossword").children;
	if (childElements[childIndex].firstChild !== null) {
		childElements[childIndex].firstChild.value = grid[cursorPosition[0]][cursorPosition[1]];
		//childElements[childIndex].firstChild.disabled = true;
		const matches = grid[cursorPosition[0]][cursorPosition[1]].toLowerCase() === childElements[childIndex].firstChild?.value.toLowerCase();
		console.log(matches);
		return matches;
	}
	return false;
}

clues.forEach(({ answer, start, end }) => {
	try {
		placeWord(answer, start, end);
	} catch (error) {
		console.log(error);
		console.log(answer);
		console.log(start);
		console.log(end);
	}
});

renderGrid();
renderClues();
addEventListeners();