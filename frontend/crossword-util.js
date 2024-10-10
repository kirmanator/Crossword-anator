import { cluesJson as clues } from './clues.js';

export const ROW_SIZE = Math.max(...clues.map(clue => clue["end"][1])) + 1;
export const COL_SIZE = Math.max(...clues.map(clue => clue["end"][0])) + 1;

export const across = clues.filter(clue => clue['start'][1] === clue['end'][1]);
export const down = clues.filter(clue => clue['start'][0] === clue['end'][0]);
// hashesToClues -> { '0000': 'word1', '0001': 'word1', ... '3729': 'word40' ... }
export const hashesToClues = {};
// clueIndexToCellIndexes -> { 'across': { 0: [0, 1, 2, ...], ... }, 'down': { 1: [35, 66, 97, ...], ...} }
export const clueIndexToCellIndexes = {};
export const acrossAnswers = across.map(clue => clue['answer']);
export const downAnswers = down.map(clue => clue['answer']);
console.log('Across: ' + acrossAnswers);
console.log('Down: ' + downAnswers);

export function getPositionHash(pos) {
	return (pos[0] < 10 ? "0" + pos[0].toString() : pos[0].toString()) + (pos[1] < 10 ? "0" + pos[1].toString() : pos[1].toString());
}

export function calculateCellIndex(pos, rowLength) {
	return (pos[0] * rowLength) + pos[1];
}