from typing import Tuple
from constants import orientations

class PlacedWord:
    def __init__(self, word: str, start: Tuple[int, int], end: Tuple[int, int], orientation: int, unavailable_index: int = -1):
        self.word = word
        self.startX = start[0]
        self.startY = start[1]
        self.endX = end[0]
        self.endY = end[1]
        self.orientation = orientation
        self.available_indexes = [c for c in range(len(word))]
        if bool(self.orientation):
            yRange = range(self.startY, self.endY + 1)
            xRange = [self.startX] * len(yRange)
        else:
            xRange = range(self.startX, self.endX + 1)
            yRange = [self.startY] * len(xRange)
        self.positions = [(x, y) for x, y in zip(xRange, yRange)]
        if unavailable_index > -1:
            self.remove_indexes(unavailable_index)

    def __len__(self):
        return len(self.word)

    def __str__(self):
        return "{}:\nOrientation: {}\nStart: ({},{})\nEnd:({},{})".format(self.word, orientations[self.orientation],
                                                                          self.startX, self.startY, self.endX,
                                                                          self.endY)

    def __getitem__(self, item):
        return self.word[item]

    def remove_indexes(self, index):
        remove_indexes = range(max(0, index - 1), min(len(self.word), index + 2))
        self.available_indexes = [a for i, a in enumerate(self.available_indexes) if i not in remove_indexes]
