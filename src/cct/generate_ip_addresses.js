const validOctet = num => !(num < 0 || num > 255)
const validIPOctets = octets => validIPOctets.length === 4 && validIPOctets.every(validOctet)
const validOctetsFromTriplet = triplet_str => {
    if (triplet_str.length === 0) return []
    if (triplet_str.startsWith('0')) return []

    let valid = []

    if (triplet_str.length >= 1) {
        let octet1_str = triplet_str.slice(0,1)
        let octet1 = parseInt(octet1_str, 10)
        if (validOctet(octet1)) valid.push(octet1)
    }
    if (triplet_str.length >= 2) {
        let octet2_str = triplet_str.slice(0,2)
        let octet2 = parseInt(octet2_str, 10)
        if (validOctet(octet2)) valid.push(octet2)
    }
    if (triplet_str.length >= 3) {
        let octet3_str = triplet_str.slice(0,3)
        let octet3 = parseInt(octet3_str, 10)
        if (validOctet(octet3)) valid.push(octet3)
    }

    return valid
}

export default function solver (input) {
    if (typeof input === 'number') input = input.toString()

    let valid_ips = []

    let iters = 0
    const recursiveSolve = (current, remain) => {
        console.log('current', current, 'remain', remain)
        // iters++
        // if (iters > 10) return
        if (current.length === 4 && remain.length === 0) valid_ips.push(current)
        else if (current.length === 4 && remain.length !== 0) return
        else {
            let triplet = remain.slice(0,3)
            
            let valid_octets = validOctetsFromTriplet(triplet)
            // console.log('triplet', triplet, 'valid_octets', valid_octets)
            if (valid_octets.length === 0) return
            for (let valid_octet of valid_octets) {
                let new_current = [...current, valid_octet]
                let len = valid_octet.toString().length
                let new_remaining = remain.slice(len)
                recursiveSolve(new_current, new_remaining)
            }
        }
    }
    
    recursiveSolve([], input)
    let valid_ip_strings = valid_ips.map(octets => octets.map(octet => octet.toString()).join('.'))

    return {data: valid_ips, answer: valid_ip_strings}
}

// let {answer} = solver("1731624229")
// console.log('[' + answer.join(', ') + ']')