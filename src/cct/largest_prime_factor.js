/**
 * Find Largest Prime Factor
 * 
 * A prime factor is a factor that is a prime number. What is the largest prime factor of 410247769?
 */


const isPrime = num => {
    if (num === 1) return false
    let _isPrime = true
    // can use the sqrt trick to limit what we count up to
    let s = Math.sqrt(num)
    // for (let i = 2; i < num; i++) {
    for (let i = 2; i <= s; i++) {
        if (num % i === 0) {
            _isPrime = false
            break
        }
    }
    return _isPrime
}

export default function solver(input) {
    let number = input
    for (let i = number - 1; i >= 2; i--) {
        if (number % i === 0) {
            if (isPrime(i)) return {answer: i}
        }
    }
    return {answer: null}
}

// console.log(solver(410247769))
// console.log(isPrime(13233799))