/**
 * Spiralize Matrix
 *
 * Given the following array of arrays of numbers representing a 2D matrix, return the elements
 * of the matrix as an array in spiral order:
 *
 *     [
 *         [ 6,17,14, 5,45,17,32,34,17,32,49]
 *         [46,13,33, 6,17,50,36,21,32,31,13]
 *         [23,25,12,12, 1,27, 9,21,32,23, 4]
 *         [27,30, 2, 5,37,26,10,18,41,40,30]
 *         [38, 8,39,11,20,48,12,17, 5,37,47]
 *         [13,47,41,28, 5, 7,15,20,13,24,20]
 *         [13,26, 2,42,28,50,50,28,22,49,50]
 *         [42,16,25,20,44,18,11,35, 6,46, 2]
 *         [50,13,10,19,27,12,33, 7,23, 9,14]
 *         [31,30,21,29,31,41, 1,48,27,50,44]
 *         [18,32,18, 7,26,50,23, 2, 1, 7,24]
 *     ]
 *
 * Here is an example of what spiral order should be:
 *
 *     [
 *         [1, 2, 3]
 *         [4, 5, 6]
 *         [7, 8, 9]
 *     ]
 *
 * Answer: [1, 2, 3, 6, 9, 8 ,7, 4, 5]
 *
 * Note that the matrix will not always be square:
 *
 *     [
 *         [1,  2,  3,  4]
 *         [5,  6,  7,  8]
 *         [9, 10, 11, 12]
 *     ]
 *
 * Answer: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]
 */

const rotateGridRight = grid => {
    let new_grid = []
    // generate num_rows based on num_cols
    for (let i = 0; i < grid[0].length; i++) {
        new_grid.push([])
    }
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            new_grid[j].push(grid[i][j])
        }
    }
    return new_grid
}

const rotateGridLeft = grid => {
    let new_grid = rotateGridRight(grid)
    new_grid.reverse()
    return new_grid
}

export default function solver(input) {
  let grid = input
  let grid_copy = [...grid].map(row => [...row])

  let answer = []
  while (true) {
    // get every item of the first row into the answer
    for (let row_itm of grid_copy[0]) {
        answer.push(row_itm)
    }
    // remove the first row
    grid_copy = grid_copy.slice(1)
    // console.log(grid_copy)

    // if there's nothing left, we're done
    if (grid_copy.length === 0) break

    // otherwise, rotate the grid to the left
    grid_copy = rotateGridLeft(grid_copy)
    // console.log(grid_copy)
  }

  return {
    input,
    data: {answer, answer_str: '[' + answer.join(', ') + ']'},
    answer,
  };
}

// let input_txt = `
// [
//     [ 6,17,14, 5,45,17,32,34,17,32,49],
//     [46,13,33, 6,17,50,36,21,32,31,13],
//     [23,25,12,12, 1,27, 9,21,32,23, 4],
//     [27,30, 2, 5,37,26,10,18,41,40,30],
//     [38, 8,39,11,20,48,12,17, 5,37,47],
//     [13,47,41,28, 5, 7,15,20,13,24,20],
//     [13,26, 2,42,28,50,50,28,22,49,50],
//     [42,16,25,20,44,18,11,35, 6,46, 2],
//     [50,13,10,19,27,12,33, 7,23, 9,14],
//     [31,30,21,29,31,41, 1,48,27,50,44],
//     [18,32,18, 7,26,50,23, 2, 1, 7,24]
// ]
// `


// console.log(solver(JSON.parse(input_txt)))

// console.log(solver([
//     [1,2,3,4],
//     [5,6,7,8],
//     [9,10,11,12]
// ]))