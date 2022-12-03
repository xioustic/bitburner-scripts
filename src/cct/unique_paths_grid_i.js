/**
 * Unique Paths in a Grid I
 *
 * You are in a grid with 8 rows and 4 columns, and you are positioned in the top-left
 * corner of that grid. You are trying to reach the bottom-right corner of the grid, but
 * you can only move down or right on each step. Determine how many unique paths there are
 * from start to finish.
 *
 * NOTE: The data returned for this contract is an array with the number of rows and columns:
 *
 * [8, 4]
 */

export default function solver(input) {
  let problem = input;

  let num_valid_paths = 0;

  let dest_x = problem[0] - 1;
  let dest_y = problem[1] - 1;

  let recursion_cnt = 0
  const recursiveSolve = (cur_path, cur_coords) => {
    recursion_cnt++

    if (cur_coords[0] === dest_x && cur_coords[1] === dest_y) {
      // console.log('valid path:', cur_path)
      num_valid_paths++;
    } else {
      let can_move_right = cur_coords[0] !== dest_x;
      let can_move_down = cur_coords[1] !== dest_y;

      if (can_move_right)
        recursiveSolve(
          [...cur_path, "right"],
          [cur_coords[0] + 1, cur_coords[1]]
        );
      if (can_move_down)
        recursiveSolve(
          [...cur_path, "down"],
          [cur_coords[0], cur_coords[1] + 1]
        );
    }
  };
  recursiveSolve([], [0, 0]);

  return { input, data: {num_valid_paths, recursion_cnt}, answer: num_valid_paths };
}
