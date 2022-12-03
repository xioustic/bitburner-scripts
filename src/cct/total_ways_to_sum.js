// Total Ways to Sum
// How many different distinct ways can the number x 
// be written as a sum of at least two positive integers?

const range = (start, end) => {
    let result = []
    for (let i = start; i <= end; i++) {
        result.push(i)
    }
    return result
}

const sumArray = arr_nums => {
    let acc = 0
    for (let num of arr_nums) acc += num
    return acc
}

const prevCalcMap = {
    2: 1,
    3: 2,
    4: 4,
    5: 6,
    6: 10,
    7: 14,
    8: 21,
    9: 29,
    10: 41,
    11: 55,
    12: 76,
    13: 100,
    14: 134,
    15: 175,
    16: 230,
    17: 296,
    18: 384,
    19: 489,
    20: 626,
    21: 791,
    22: 1001,
    23: 1254,
    24: 1574,
    25: 1957,
    26: 2435,
    27: 3009,
    28: 3717,
    29: 4564,
    30: 5603,
    31: 6841,
    32: 8348,
    33: 10142,
    34: 12309,
    35: 14882,
    36: 17976,
    37: 21636,
    38: 26014,
    39: 31184,
    40: 37337,
    41: 44582,
    42: 53173,
    43: 63260,
    44: 75174,
    45: 89133,
    46: 105557,
    47: 124753,
    48: 147272,
    49: 173524,
    50: 204225,
    51: 239942,
    52: 281588,
    53: 329930,
    54: 386154,
    55: 451275,
    56: 526822,
    57: 614153,
    58: 715219,
    59: 831819,
    60: 966466,
    61: 1121504,
    62: 1300155,
    63: 1505498,
    64: 1741629,
    65: 2012557,
    66: 2323519,
    67: 2679688,
    68: 3087734,
    69: 3554344,
    70: 4087967,
    71: 4697204,
    72: 5392782,
    73: 6185688
}

export default function solver(input) {
    if (typeof input === 'string') input = parseInt(input, 10)

    if (input in prevCalcMap) return {input, answer: prevCalcMap[input], data: null}

    let solutions = new Set()
    const recursiveSolve = (num, cur_solution) => {
        // console.log(num, cur_solution)
        let solution_sum = sumArray(cur_solution)
        if (solution_sum === num) solutions.add(cur_solution.sort().join(' + '))
        else {
            let max_range = num - solution_sum
            if (cur_solution.length) max_range = Math.min(max_range, cur_solution.slice(-1)[0])
            let next_num_range = range(1, max_range)
            for (let next_num of next_num_range) {
                if (next_num === num) continue
                recursiveSolve(num, [...cur_solution, next_num])
            }
        }
    }
    recursiveSolve(input, [])

    return {input, data: solutions, answer: solutions.size}
}

/**
 * Example: given 4, the answer is 4
 * 3 + 1, 2 + 2, 2 + 1 + 1, 1 + 1 + 1 + 1
 */

// console.log(solver(73))
// for (let i of range(2, 73)) {
//     let result = solver(i)
//     console.log(i, result.answer)
// }