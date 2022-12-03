/**
 * Shortest Path in a Grid
 *
 * You are located in the top-left corner of the following grid:
 *
 *   [[0,0,0,0,0,0,1,0],
 *    [0,0,0,1,0,1,0,0],
 *    [0,0,1,1,1,1,0,0],
 *    [0,0,1,1,0,0,0,0],
 *    [1,0,1,1,0,0,0,0],
 *    [1,1,0,0,1,0,0,0]]
 *
 * You are trying to find the shortest path to the bottom-right corner of the grid, but
 * there are obstacles on the grid that you cannot move onto. These obstacles are denoted by '1',
 * while empty spaces are denoted by 0.
 *
 * Determine the shortest path from start to finish, if one exists. The answer should be given
 * as a string of UDLR characters, indicating the moves along the path
 *
 * NOTE: If there are multiple equally short paths, any of them is accepted as answer. If there
 * is no path, the answer should be an empty string.
 * NOTE: The data returned for this contract is an 2D array of numbers representing the grid.
 *
 * Examples:
 *
 *     [[0,1,0,0,0],
 *      [0,0,0,1,0]]
 *
 * Answer: 'DRRURRD'
 *
 *     [[0,1],
 *      [1,0]]
 *
 * Answer: ''
 */

/**
 *
 * @param {number[][]} input
 * @returns
 */
export default function solver(input) {
  let grid = input;

  let start_x = 0;
  let start_y = 0;

  let dest_x = grid[0].length - 1;
  let dest_y = grid.length - 1;

  let recursion_cnt = 0;
  //   let best_solution = "";
  let solutions = new Set();

  // cur_coord, visited list => best path
  let cache = new Map();
  let cache2 = new Map();
  let best_so_far = ''
  const recursiveSolve = (cur_path, cur_coords, visited = undefined) => {
    recursion_cnt++;
    if (visited === undefined) visited = new Set();

    let [x, y] = cur_coords;
    // console.log('x', x, 'y', y, 'path', cur_path)
    // console.log(visited)

    if (x === dest_x && y === dest_y) {
      // console.log('solution:', cur_path)
      if (best_so_far === '') best_so_far = cur_path;
      if (cur_path.length < best_so_far.length) best_so_far = cur_path;
      return cur_path;
    }

    // we can safely bail if we're worse off than anything we've done so far
    if (best_so_far !== '' && cur_path.length > best_so_far.length) return ""

    let coord_str = `(${x},${y})`;

    // if (cache.has(coord_str)) return cache.get(coord_str)

    visited = new Set([...visited, coord_str]);

    let try_coords = [
      [x, y - 1, "U"], // up
      [x, y + 1, "D"], // down
      [x - 1, y, "L"], // left
      [x + 1, y, "R"], // right
    ];

    let overall_best_path = "";
    let best_dir = ""

    for (let [x2, y2, dir] of try_coords) {
      // already been here
      if (visited.has(`(${x2},${y2})`)) continue;
      // out of bounds
      if (x2 < 0 || x2 > dest_x) continue;
      if (y2 < 0 || y2 > dest_y) continue;
      // obstacle
      if (grid[y2][x2] === 1) continue;

      let this_best_path
      let this_path = cur_path + dir;
      this_best_path = recursiveSolve(this_path, [x2, y2], visited);

      // skip fail
      if (this_best_path === "") continue;
      // do default
      if (overall_best_path === "") {
        overall_best_path = this_best_path;
        best_dir = dir
      }
      else if (overall_best_path.length > this_best_path.length) {
        overall_best_path = this_best_path;
        best_dir = dir
      }
    }

    if (best_dir !== '') {
      if (cache.get(coord_str)) {
        console.log(coord_str, best_dir, overall_best_path.length, cache.get(coord_str), cache2.get(coord_str).length)  
      }
      cache.set(coord_str,best_dir)
      cache2.set(coord_str, overall_best_path)
      // cache2.set(coord_str, overall_best_path.length)
    }

    /** CACHE STUFF STARTS */
    // let cache_entry = cache.get(coord_str)
    // if entry is undefined or unsolved, set it and return
    // if (cache_entry === undefined || cache_entry === '') {
    //     cache.set(coord_str, overall_best_path)
    //     return overall_best_path
    // }
    // if we have no solution, return cache
    // if (overall_best_path === '') return cache_entry
    // if we have a solution that is better, set cache and return
    // if (overall_best_path.length < cache_entry.length) {
    //     cache.set(coord_str, overall_best_path)
    //     return overall_best_path
    // }
    // otherwise it should be safe to return the cache
    // return cache_entry
    /** CACHE STUFF ENDS */

    return overall_best_path

    // let cache_entry = cache.get(coord_str)
    // if (cache_entry === undefined) {
    //     if (overall_best_path !== '') cache.set(coord_str, overall_best_path)
    // } else {
    //     if (overall_best_path !== '') {
    //         if (cache_entry.length > overall_best_path.length) {
    //             cache.set(coord_str, overall_best_path)
    //             return overall_best_path
    //         } else {
    //             return cache_entry
    //         }
    //     }
    // }
  };
  let best_solution = recursiveSolve("", [start_x, start_y]);

  return {
    input,
    data: {
      best_solution,
      solutions,
      recursion_cnt,
      cache,
      step_cnt: best_solution.length,
    },
    answer: best_solution,
  };
}
