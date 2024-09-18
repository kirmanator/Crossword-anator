import random
from functools import reduce
from itertools import product

from constants import max_size, HORIZONTAL, VERTICAL
from placed_word import PlacedWord
from typing import Tuple

class Crossword:
    def __init__(self, answers, empty_char = '_'):
        self.answers = answers
        random.shuffle(self.answers)
        self.grid = list()
        self.placed_words = {HORIZONTAL: [], VERTICAL: []}
        self.occupied_positions = dict()
        self.most_recent_word = None
        self.empty_char = empty_char
        self.minX = 0
        self.minY = 0
        self.maxX = 0
        self.maxY = 0

    def __str__(self):
        return "\n".join([" ".join(row) for row in self.grid])

    def __len__(self):
        return len(self.answers)

    def get_placed_words(self):
        return self.placed_words[HORIZONTAL] + self.placed_words[VERTICAL]

    def fill_grid(self):
        row_length = (self.maxY - self.minY) + 1
        column_length = (self.maxX - self.minX) + 1
        self.grid = [[self.empty_char] * column_length for _ in range(row_length)]

        for pw in self.get_placed_words():
            for c in range(len(pw)):
                if pw.orientation == HORIZONTAL:
                    self.grid[pw.startY - self.minY][(c - self.minX) + pw.startX] = pw[c]
                else:
                    self.grid[(c - self.minY) + pw.startY][pw.startX - self.minX] = pw[c]

    def record_placed_word(self, new_placed_word: PlacedWord):
        for i, p in enumerate(new_placed_word.positions):
            self.occupied_positions[p] = new_placed_word[i]

    def generate_score(self):
        square_grid_score = min(len(self.grid), len(self.grid[0])) / max(len(self.grid), len(self.grid[0]))
        average_size = int((len(self.grid) + len(self.grid[0])) / 2)
        closest_to_optimal_size_score = 1 - (min(max_size, abs(average_size - max_size))/max_size)
        placed_words_score = len(self.placed_words) / float(len(self.answers))
        flat_mapped_characters = reduce(lambda a, b: a + b, self.grid)
        characters_only = "".join(flat_mapped_characters).replace(self.empty_char, '')
        empty_space_score = len(characters_only) / float(len(flat_mapped_characters) - len(characters_only))
        letters_used_score = len(characters_only) / sum(list(map(lambda a: len(a), self.answers)))
        return square_grid_score + placed_words_score + empty_space_score + letters_used_score + closest_to_optimal_size_score

    def has_conflict(self, word: str, start: Tuple[int, int], end: Tuple[int, int], new_orientation: int):
        if bool(new_orientation):
            yRange = range(start[1], end[1] + 1)
            xRange = [start[0]] * len(yRange)
        else:
            xRange = range(start[0], end[0] + 1)
            yRange = [start[1]] * len(xRange)
        for i, pos in enumerate(zip(xRange, yRange)):
            try:
                if not self.occupied_positions[pos] == word[i]:
                    return True
            except KeyError:
                check_positions = [(pos[0] - new_orientation, pos[1] - (1 - new_orientation)), (pos[0] + new_orientation, pos[1] + (1 - new_orientation))]
                if i == 0:
                    check_positions.append((pos[0] - (1 - new_orientation), pos[1] - new_orientation))
                elif i == len(word) - 1:
                    check_positions.append((pos[0] + (1 - new_orientation), pos[1] + new_orientation))
                if any(x in self.occupied_positions for x in check_positions):
                    return True
        return False

    def set_grid_boundaries(self, minX: int, minY: int, maxX: int, maxY: int):
        self.minX = minX
        self.minY = minY
        self.maxX = maxX
        self.maxY = maxY

    def place_word(self, new_word: str):
        if not self.most_recent_word:
            orient = random.randint(HORIZONTAL, VERTICAL)
            start = (0, 0)
            end = ((len(new_word) - 1) * (1 - orient), (len(new_word) - 1) * orient)
            new_placed_word = PlacedWord(new_word, start, end, orient)
        else:
            orient = 1 - self.most_recent_word.orientation
            new_placed_word = self.place_crossed_word(new_word, orient)
        if new_placed_word is not None:
            self.record_placed_word(new_placed_word)

            self.set_grid_boundaries(min(self.minX, new_placed_word.startX), min(self.minY, new_placed_word.startY),
                                 max(self.maxX, new_placed_word.endX), max(self.maxY, new_placed_word.endY))
            self.most_recent_word = new_placed_word
            self.placed_words[orient].append(new_placed_word)
            return True
        else:
            return False

    def place_crossed_word(self, new_word: str, new_word_orient: int, attempts: int = 0):
        crossed_orientation = 1 - new_word_orient
        if attempts >= len(self.placed_words[crossed_orientation]):
            return None
        crossed_word = self.placed_words[crossed_orientation][random.randint(0, len(self.placed_words[crossed_orientation]) - 1)]
        common_letters = list(set(new_word).intersection(set([crossed_word[i] for i in crossed_word.available_indexes])))
        placed = False
        while len(common_letters) and not placed:
            random.shuffle(common_letters)
            letter = common_letters[0]
            new_word_indices = [i for i, l in enumerate(new_word) if l == letter]
            placed_word_indices = [i for i, l in enumerate(crossed_word.word) if l == letter]
            combinations = list(product(new_word_indices, placed_word_indices))
            most_recent_combo = None
            for i, combo in enumerate(combinations):
                startX = crossed_word.startX + (combo[1] * new_word_orient) - (combo[0] * (1 - new_word_orient))
                startY = crossed_word.startY - (combo[0] * new_word_orient) + (combo[1] * (1 - new_word_orient))
                endX = startX + ((len(new_word) - 1) * (1 - new_word_orient))
                endY = startY + ((len(new_word) - 1) * new_word_orient)
                if not self.has_conflict(new_word, (startX, startY), (endX, endY), new_word_orient):
                    start = (startX, startY)
                    end = (endX, endY)
                    placed = True
                    most_recent_combo = combinations[i]
                    break
            common_letters.remove(letter)
        if not placed:
            return self.place_crossed_word(new_word, new_word_orient, attempts + 1)
        crossed_word.remove_indexes(most_recent_combo[1])
        new_placed_word = PlacedWord(new_word, start, end, new_word_orient, most_recent_combo[0])
        return new_placed_word

    def generate_grid(self):
        for answer in self.answers:
            self.place_word(answer)
        self.fill_grid()