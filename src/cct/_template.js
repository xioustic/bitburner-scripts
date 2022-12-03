/**
 * Total Ways to Sum II
 * 
 * How many different distinct ways can the number 196 be written as a sum of integers contained in the set:
 * [1,4,5,8,9,10,11,12]?
 * You may use each integer in the set zero or more times.
 */



 export default function solver (input, max_runtime = 30000) {
    let start_time = 0
    let answer = null

    let [n, integers] = input


    // data is metadata for the answer, answer is what to pass back to the attempt() command
    // if answer is null, it is considered a failure
    return {data: {}, answer: null}
  }