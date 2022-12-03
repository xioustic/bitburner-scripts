// Sanitize Parentheses in Expression

// Given the following string:

// ((()(())()a))))

// remove the minimum number of invalid parentheses in order to validate the string. 
// If there are multiple minimal ways to validate the string, provide all of the possible results. 
// The answer should be provided as an array of strings. 
// If it is impossible to validate the string the result should be an array with only an empty string.

// IMPORTANT: The string may contain letters, not just parentheses. Examples:
// "()())()" -> [()()(), (())()]
// "(a)())()" -> [(a)()(), (a())()]
// ")(" -> [""]

const range = (start, end) => {
    let result = []
    for (let i = start; i <= end; i++) {
        result.push(i)
    }
    return result
}

const expr_valid = expr => {
    let num_left = 0
    let num_right = 0
    for (let char of expr) {
        if (char === '(') num_left += 1
        else if (char === ')') {
            num_right += 1
            if (num_right > num_left) return false
        }
    }
    if (num_left === 0 || num_right === 0) return false
    return num_left === num_right
}

export default function solver (input) {
    //typeof input === 'string'
    let valid_parenthesis = {}

    const recursiveSolve = (cur_string, remaining, num_removed) => {
        // console.log('current', cur_string, 'remain', remaining)
        if (remaining === '') {
            if (expr_valid(cur_string)) {
                let key = num_removed.toString()
                if (!Object.keys(valid_parenthesis).includes(key)) valid_parenthesis[key] = new Set()
                valid_parenthesis[key].add(cur_string)
            }
        } else {
            let next_char = remaining[0]
            let next_remaining = remaining.slice(1)
            // console.log('next_char', next_char, 'next_remaining', next_remaining)
            if (next_char === undefined) return
            if (next_char === ')' || next_char === '(') {
                // don't include the next character
                recursiveSolve(cur_string, next_remaining, num_removed + 1)
            }
            // include the next character
            recursiveSolve(cur_string + next_char, next_remaining, num_removed)
        }
        
    }
    recursiveSolve('', input, 0)

    let minimum_key = Math.min(...Object.keys(valid_parenthesis).map(s => parseInt(s, 10)))
    if (minimum_key === Infinity) valid_parenthesis[Infinity] = [""]
    return {data: valid_parenthesis, input, answer: [...valid_parenthesis[minimum_key]]}
}

// let tests = ['((()(())()a))))', '()())()', '()()()', '(())()', '(a)())()', '(a)()()', '(a())()', ')(']
// let test_results = [0,0,1,1,0,1,1,0]
// for (let test of tests) {
//     console.log(test, expr_valid(test), test_results)
// }

let result = solver(')))a)()))((((a')
console.log(result)
console.log('[' + result.answer.join(', ') + ']')