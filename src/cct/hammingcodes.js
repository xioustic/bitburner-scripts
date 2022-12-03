// HammingCodes: Integer to Encoded Binary
// 
// You are given the following decimal Value:
// 1235
// Convert it to a binary representation and encode it as an 'extended Hamming code'. Eg:
// Value 8 is expressed in binary as '1000', which will be encoded with the pattern 'pppdpddd', 
// where p is a parity bit and d a data bit,
// or '10101' (Value 21) will result into (pppdpdddpd) '1001101011'.
// The answer should be given as a string containing only 1s and 0s.
// NOTE: the endianness of the data bits is reversed in relation to the endianness of 
// the parity bits.
// NOTE: The bit at index zero is the overall parity bit, this should be set last.
// NOTE 2: You should watch the Hamming Code video from 3Blue1Brown, which explains 
// the 'rule' of encoding, including the first index parity bit mentioned in the previous note.
// 
// Extra rule for encoding:
// There should be no leading zeros in the 'data bit' section

export const isPowOfTwo = num => {
    let binary = num.toString(2)
    let binarray = binary.split('')

    // powers of two in binary start with 1 and the rest are 0
    if (binarray[0] !== '1') return false
    for (let char of binarray.slice(1)) {
        // console.log(char)
        if (char === '1') return false
    }
    return true
}

// 3Blue1Brown video: https://www.youtube.com/watch?v=X8jsijhllIA
export const generateExtendedHammingCode = (num_or_binarystring) => {
    let binary
    if (typeof num_or_binarystring === 'number') binary = num_or_binarystring.toString(2)
    else binary = num_or_binarystring
    let binarray = binary.split('').map(i => parseInt(i, 10))
    // binarray.reverse()

    // final output
    let output = [null]
    // calculation for the eventual insertion into output
    let parity_vals = {}
    // where we are in gathering data bits
    let data_pos = 0
    // where we are in the output
    let idx = 1
    while (true) {
        // drop out if there's no more data
        if (data_pos >= binarray.length) break

        // skip parity bits in output
        if (isPowOfTwo(idx)) {
            // console.log(idx, 'parity bit, pushing null')
            output.push(null)
            idx++
            continue
        }

        // get the actual data bit from the data
        let this_data_bit = binarray[data_pos]
        data_pos++
        output.push(this_data_bit)

        // figure out which parity bits this matters for
        let idx_binarray = idx.toString(2).split('')
        // start our loop with the least significant bit
        idx_binarray.reverse()
        for (let i = 0; i < idx_binarray.length; i++) {
            // if this index as a binary has a 1 here
            if (idx_binarray[i] === '1') {
                // take the power of two as the output position (corresponding parity bit location)
                let output_pos = 2**i
                console.log(idx, idx_binarray, output_pos)
                // update the parity bit with this data bit
                if (parity_vals[output_pos] === undefined) parity_vals[output_pos] = []
                parity_vals[output_pos].push(parseInt(this_data_bit, 10))
            }
        }
        idx++
    }
    console.log('output without parity')
    console.log(output)
    console.log('parity values')
    // console.log(parity_vals)
    // populate final parity bits
    for (let pos_str of Object.keys(parity_vals)) {
        let pos = parseInt(pos_str, 10)
        let vals = parity_vals[pos]
        let parity = vals.reduce((pv, cv) => pv^cv)
        console.log(pos, vals.join('^'), parity)
        output[pos] = parity
    }
    console.log('parity filled')
    console.log(output)

    // // calculate and set checksum bit
    console.log('with checksum bit')
    output[0] = output.slice(1).reduce((pv, cv) => pv ^ cv)
    console.log(output)

    return output
}

// console.log(generateExtendedHammingCode(1235).join(''))


export default function solver (input) {
    if (typeof input === 'string') input = parseInt(input, 10)

    let solve = generateExtendedHammingCode(input)
    return {data: null, answer: solve.join(''), input}
}
