import { cluesJson as clues } from './clues.js';
import { calculateCellIndex, getPositionHash } from './crossword-util.js';
import { cursorPosition, checkForArrowKeys, updateCursorPosition } from './cell-navigation-service.js';
import { toggleHighlightClues, removeAllHighlights, toggleHighlightCells } from './highlight-service.js';

// Define the grid size
const ROW_SIZE = Math.max(...clues.map(clue => clue["end"][1])) + 1;
const COL_SIZE = Math.max(...clues.map(clue => clue["end"][0])) + 1;

var cswd = document.querySelector(':root');
cswd.style.setProperty('--columns', COL_SIZE);
cswd.style.setProperty('--rows', ROW_SIZE);

//let cursorPosition = new Array(0,0);
let acrossPositions = new Array();
let downPositions = new Array();

// Initialize an empty grid
const grid = Array.from({ length: ROW_SIZE }, () => Array(COL_SIZE).fill(''));
const across = clues.filter(clue => clue['start'][1] === clue['end'][1]);
const down = clues.filter(clue => clue['start'][0] === clue['end'][0]);
// hashesToClues -> { '0000': 'word1', '0001': 'word1', ... '3729': 'word40' ... }
const hashesToClues = {};
// clueIndexToCellIndexes -> { 'across': { 0: [0, 1, 2, ...], 1: [35, 66, 97, ...] ... }, 'down': {...} }
const clueIndexToCellIndexes = {};
const acrossAnswers = across.map(clue => clue['answer']);
const downAnswers = down.map(clue => clue['answer']);
console.log('Across: ' + acrossAnswers);
console.log('Down: ' + downAnswers);

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
			populateMaps(word, new Array(startRow, col), orientation, clueIndex, hashesToClues);
		}
	} else {
		for (let row = startRow; row <= endRow; row++) {
			grid[row][startCol] = word[row - startRow];
			populateMaps(word, new Array(row, startCol), orientation, clueIndex, hashesToClues);
		}
	}
}

function populateMaps(word, pos, orientation, clueIndex) {
	const posHash = getPositionHash(pos);
	hashesToClues[posHash] = word;
	if (clueIndex in clueIndexToCellIndexes[orientation]) {
		clueIndexToCellIndexes[orientation][clueIndex].push(calculateCellIndex(pos));
	} else {
		clueIndexToCellIndexes[orientation][clueIndex] = new Array();
		clueIndexToCellIndexes[orientation][clueIndex].push(calculateCellIndex(pos));
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
					updateCursorPosition(row, col);
					e.stopPropagation();
				});
				input.addEventListener('onfocusout', () => toggleHighlightClues(new Array(row, col), hashesToClues, acrossAnswers, downAnswers));
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
			toggleHighlightCells('across', index, clueIndexToCellIndexes);
			e.stopPropagation();
		});
		acrossContainer.appendChild(clueItem);
	});
	
	down.forEach(({ clue }, index) => {
		const clueItem = document.createElement('div');
		clueItem.className = 'clue';
		clueItem.textContent = `${index + 1}. ${clue}`;
		clueItem.addEventListener('click', e => { 
			toggleHighlightCells('down', index, clueIndexToCellIndexes);
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