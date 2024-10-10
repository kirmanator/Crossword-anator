import { getPositionHash, hashesToClues, clueIndexToCellIndexes, acrossAnswers, downAnswers } from './crossword-util.js';

const highlightedClass = 'highlighted';

export function toggleHighlightClues(position) {
	// when input element is clicked, highlight the associated clue based on the position of the input element
	const words = hashesToClues[getPositionHash(position)]
	let index, container;
	words.forEach(word => {
		if (acrossAnswers.includes(word)) {
			index = acrossAnswers.indexOf(word);
			container = document.getElementById('across-container');
		}
		else {
			index = downAnswers.indexOf(word);
			container = document.getElementById('down-container');
		}
		const clueElement = container.children[index];
		if (isHighlighted(clueElement)) {
			clueElement.classList.remove(highlightedClass);
		} else {
			clueElement.classList.add(highlightedClass);
			// concurrent element scrolling on Chrome issue: https://issues.chromium.org/issues/325081538
			// Supposedly won't be available until Chrome v130
			clueElement.scrollIntoView({behavior: "smooth", block: "center"});
		}
	});
}

export function removeAllHighlights(e, styleClass='.'+highlightedClass) {
	document.querySelectorAll(styleClass).forEach(elem => elem.classList.remove(highlightedClass));
}

export function toggleHighlightCells(orientation, clueIndex) {
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