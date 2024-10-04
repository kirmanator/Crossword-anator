import { getPositionHash } from './crossword-util.js';

const highlightedClass = 'highlighted';

export function toggleHighlightClues(position, hashesToClues, acrossAnswers, downAnswers) {
	// when input element is clicked, highlight the associated clue based on the position of the input element
	const word = hashesToClues[getPositionHash(position)]
	let index, container;
	if (acrossAnswers.includes(word)) {
		index = acrossAnswers.indexOf(word);
		container = document.getElementById('across-container');
	} else {
		index = downAnswers.indexOf(word);
		container = document.getElementById('down-container');
	}
	const clueElement = container.children[index];
	if (isHighlighted(clueElement)) {
		clueElement.classList.remove(highlightedClass);
	} else { 
		clueElement.classList.add(highlightedClass);
		clueElement.scrollIntoView({behavior: "smooth", block: "center"});
	}
}

export function removeAllHighlights() {
	document.querySelectorAll('.'+highlightedClass).forEach(elem => elem.classList.remove(highlightedClass));
}

export function toggleHighlightCells(orientation, clueIndex, clueIndexToCellIndexes) {
	// for each index in clueIndexToCellIndexes[orientation][clueIndex], adjust styling
	const crosswordElement = document.getElementById('crossword');
	clueIndexToCellIndexes[orientation][clueIndex].forEach(cellIndex => {
		toggleHighlight(crosswordElement.children[cellIndex].children[0]);
	});
}

export function toggleHighlight(element) {
	if (isHighlighted(element)) {
		element.classList.remove(highlightedClass);
		return;
	}
	element.classList.add(highlightedClass);
}

export function isHighlighted(element) {
	return element.classList.contains(highlightedClass);
}