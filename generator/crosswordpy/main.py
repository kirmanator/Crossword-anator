import json
from constants import max_attempts, jokes_file_path, result_file_path
from crossword import Crossword

if __name__ == "__main__":
    jokes_dict = json.load(open(jokes_file_path, 'r'))
    punchlines = [j['answer'] for j in jokes_dict['clues']]
    max_score = 0
    best_crossword = None
    for _ in range(max_attempts):
        crossword = Crossword(punchlines)
        crossword.generate_grid()
        score = crossword.generate_score()
        if crossword.generate_score() > max_score:
            max_score = score
            best_crossword = crossword
    print(str(best_crossword))
    print("Score:", max_score)
    chosen_punchlines = { pw.word : pw for pw in best_crossword.get_placed_words() }
    chosen_questions = [
        { "clue": j['clue'],
          "answer": j['answer'],
          "start": [chosen_punchlines[j['answer']].startX - best_crossword.minX, chosen_punchlines[j['answer']].startY - best_crossword.minY],
          "end": [chosen_punchlines[j['answer']].endX - best_crossword.minX, chosen_punchlines[j['answer']].endY - best_crossword.minY]
          } for j in jokes_dict['clues'] if j['answer'] in chosen_punchlines.keys()
    ]
    with open(result_file_path, 'w') as cluesFile:
        cluesFile.write("export const cluesJson = " + '},\n'.join(json.dumps(chosen_questions).split('},')) + ";")