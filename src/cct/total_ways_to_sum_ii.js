/**
 * Total Ways to Sum II
 * 
 * How many different distinct ways can the number 196 be written as a sum of integers contained in the set:
 * [1,4,5,8,9,10,11,12]?
 * You may use each integer in the set zero or more times.
 */

//  export default function solver (input, max_runtime = 60000) {
//     let start_time = +(new Date())
//     let failed_time = false

//     let [target_sum, integers] = input

//     console.log('target_sum', target_sum, 'integers', integers)

//     // let solutions = new Set()
//     let solutions_count = 0
//     let num_recursions = 0

//     const recursiveSolve = (current_sum, integers_to_pick_from, current_solution) => {
//         num_recursions += 1
//         if (+(new Date()) - start_time > max_runtime) {
//             failed_time = true
//             return
//         }

//         // if we arrived at the target, this is a solution
//         if (current_sum === target_sum) {
//             // solutions.add(current_solution.sort().join(' + '))
//             solutions_count += 1
//             return
//         }

//         // if we overshot the target, we know this path is fail
//         if (current_sum > target_sum) return

//         // try picking this number again
//         let this_integer = integers_to_pick_from[0]
//         recursiveSolve(current_sum + this_integer, integers_to_pick_from, current_solution.concat(this_integer))
//         // and try again with this number removed if there are any more numbers to pick from
//         if (integers_to_pick_from.length > 1) recursiveSolve(current_sum, integers_to_pick_from.slice(1), current_solution)
//     }
//     recursiveSolve(0, integers, [])

//     let answer = failed_time ? null : solutions_count

//     // data is metadata for the answer, answer is what to pass back to the attempt() command
//     return {data: {num_recursions, /*count2: solutions.size, */count: solutions_count, runtime: +(new Date()) - start_time}, answer: answer}
//   }



// can further optimize:
// when we're making decisions, we're doing it based on what we've added up to so far
// and the remaining coins. because of this, we can cache # of solutions based on this
// per branch state (sum remaining and coins left to pick from)

  export default function solver (input, max_runtime = 60000) {
    let start_time = +(new Date())
    let failed_time = false

    let [target_sum, integers] = input

    console.log('target_sum', target_sum, 'integers', integers)

    let recursion_cnt = 0
    let cache_hit_cnt = 0
    let solutions = new Set() // not possible if we use caching
    const recursiveSolve = (sum_remaining, integers_to_pick_from, integers_picked, cache = undefined, cache_key = undefined) => {
        
        recursion_cnt += 1
        if (sum_remaining === 0) {
            // we got a solution
            // if we're using a cache, we short-circuit branches that skip many/most individual solutions
            if (cache === undefined) solutions.add(integers_picked.join('+'))
            return 1
        } else if (sum_remaining < 0) {
            // this path will not lead to a solution
            return 0
        } else if (integers_to_pick_from.length === 0) {
            return 0
        }

        // cache
        if (cache !== undefined) {
            if (cache_key === undefined) cache_key = sum_remaining+',['+integers_to_pick_from.join(',')+']'
            // if (cache_key === undefined) cache_key = [sum_remaining, integers_to_pick_from]
            if (cache.has(cache_key)) {
                // console.log('used cache!')
                cache_hit_cnt += 1
                return cache.get(cache_key)
            }
        }


        // branch 1 is throwing out this integer
        let integers_if_we_throw_out = integers_to_pick_from.slice(1)
        let branch1
        if (integers_if_we_throw_out.length === 0) branch1 = 0
        else {
            let cache_key1 = sum_remaining+',['+integers_if_we_throw_out.join(',')+']'
            // let cache_key1 = [sum_remaining, integers_if_we_throw_out]
            branch1 = recursiveSolve(sum_remaining, integers_if_we_throw_out, integers_picked, cache, cache_key1)
            if (cache !== undefined) cache.set(cache_key1, branch1)
        }

        // branch 2 is picking this integer
        let this_integer = integers_to_pick_from[0]
        let sum_remaining_if_use_integer = sum_remaining - this_integer
        let cache_key2 = sum_remaining_if_use_integer+',['+integers_to_pick_from.join(',')+']'
        // let cache_key2 = [sum_remaining_if_use_integer,integers_to_pick_from]
        let branch2 = recursiveSolve(sum_remaining_if_use_integer, integers_to_pick_from, integers_picked.concat(this_integer), cache, cache_key2)
        if (cache !== undefined) cache.set(cache_key2, branch2)

        return branch1 + branch2
    }
    let cache = new Map()
    let solutions_count = recursiveSolve(target_sum, integers, [], cache)
    // console.log(cache.size, cache_hit_cnt, recursion_cnt)

    let answer = failed_time ? null : solutions_count

    // data is metadata for the answer, answer is what to pass back to the attempt() command
    return {data: {cache_hit_cnt, recursion_cnt, count: solutions_count, solutions, solutions_size: solutions.size, runtime: +(new Date()) - start_time}, answer: answer}
  }