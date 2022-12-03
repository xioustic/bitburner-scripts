/**
 * Array Jumping Game II
 * 
 * You are given the following array of integers:
 * 
 * 1,1,5,4,2,4,0,5,1,3,3,0,3,1,2,1,2,2,0,1
 * 
 * Each element in the array represents your MAXIMUM jump length at that position. 
 * This means that if you are at position i and your maximum jump length is n, you can 
 * jump to any position from i to i+n.
 * 
 * Assuming you are initially positioned at the start of the array, determine the minimum 
 * number of jumps to reach the end of the array.
 * 
 * If it's impossible to reach the end, then the answer should be 0.
 */

/**
 * @param {number[]} input 
 */
 export default function solver (input) {

    let best
    const recursiveSolve = (path_front, jumps_made) => {
        if (path_front.length <= 1) {
            // we've reached the end!
            if (best === undefined) best = jumps_made
            if (jumps_made.length < best.length) best = jumps_made
        } else {
            let max_jump = path_front[0]
            // if 0 we have no jumps available to us
            if (max_jump === 0) return

            // loop thru possible jumps
            for (let i = 1; i <= max_jump; i++) {
                // do this jump
                recursiveSolve (path_front.slice(i), jumps_made.concat(i))
            }
        }
    }
    recursiveSolve(input, [])

    return {answer: best === undefined ? 0 : best.length, data: best, input}
 }