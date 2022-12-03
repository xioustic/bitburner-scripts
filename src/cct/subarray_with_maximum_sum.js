// Subarray with Maximum Sum
//
// Given the following integer array, find the contiguous subarray (containing at least one number) 
// which has the largest sum and return that sum. 'Sum' refers to the sum of all the numbers in the subarray.
// -1,-7,9,0,0,-3,-6,7,8,-5,-6,-9,-1,-8,-1,7,-9,-10,1,6,0,-2,8,3,-4,-9

const range = (start, end) => {
    let result = []
    for (let i = start; i <= end; i++) {
        result.push(i)
    }
    return result
}

const sumArray = arr_nums => arr_nums.reduce((pv, cv) => pv + cv, 0)

export default function solver (input) {
    if (typeof input === 'string') input = input.split(',').map(i => parseInt(i, 10))
    let input_length = input.length
    // console.log(input_length)

    let possible_lengths = range(1, input_length)
    // console.log(possible_lengths)

    let best_solution
    for (let subarray_length of possible_lengths) {
        let num_subarrays_with_length = input_length - subarray_length + 1
        // console.log(subarray_length, 'has', num_subarrays_with_length, 'possibilities')

        for (let slice_start of range(0, num_subarrays_with_length - 1)) {
            // console.log('slice_start', slice_start)
            let subarray = input.slice(slice_start, slice_start + subarray_length)
            let sum = sumArray(subarray)
            // console.log(subarray, sum)

            let result = {subarray, sum}
            if (best_solution === undefined) best_solution = result
            else if (best_solution.sum < result.sum) best_solution = result
        }
        // break
    }

    // console.log(best_solution)

    return {data: best_solution, answer: best_solution.sum, input}
}

let problem = [-2,-1,8,2,-7,3,-8,8,8,2,10,-6,-2,-7,-8,-4,1,4,2,7,2,-5,1,9,10,-9,-6,10,1]
console.log(solver(problem)) // 16