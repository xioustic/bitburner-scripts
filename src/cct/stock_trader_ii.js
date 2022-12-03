import { maxProfit } from 'cct/stock_trader.js'
import { range } from 'utils.js'

/**
 * Algorithmic Stock Trader II
 * 
 * You are given the following array of stock prices (which are numbers) where the i-th element
 * represents the stock price on day i:
 * 
 * 88,123,97,108,114,144,35,153,36,114,54,152,71,34,40,4,72,189,46,29,91
 * 
 * Determine the maximum possible profit you can earn using as many transactions as you'd like. 
 * A transaction is defined as buying and then selling one share of the stock. 
 * Note that you cannot engage in multiple transactions at once. In other words, you must sell 
 * the stock before you buy it again.
 * 
 * If no profit can be made, then the answer should be 0
 */

const MAX_K = 9

 export default function solver (input) {
  let prices = input
  if (!Array.isArray(prices)) prices = prices.split(',').map(i => parseInt(i, 10))

  let best_so_far = undefined
  let definitely = false
  for (let k of range(1, MAX_K)) {
    let solve = maxProfit(k, prices)
    console.log(k, solve)

    // default
    if (best_so_far === undefined) best_so_far = solve
    else if (best_so_far.answer < solve.answer) best_so_far = solve
    // stop if answer is same as last, we know we're good
    else if (best_so_far.answer === solve.answer) {definitely = true ; break}
  }

 if (best_so_far === undefined) throw Error("failed to find wtf")
 return {...best_so_far, data: {...best_so_far.data, definitely}}
}