import { maxProfit } from "cct/stock_trader.js"

/**
 *  Algorithmic Stock Trader I
 * 
 * You are given the following array of stock prices (which are numbers) where the 
 * i-th element represents the stock price on day i:
 * 
 * 38,7,3,106,195,71,51,153,36,196,135,77,193,101,189,139,12,125,153,78,5,152,90,192,100,150,37,197,165,159,16,15,187,199,31,69,94,157,73,196,88,179,111,78,3,47,5,130,34,44
 * 
 * Determine the maximum possible profit you can earn using at most one transaction 
 * (i.e. you can only buy and sell the stock once). If no profit can be made then the 
 * answer should be 0. Note that you have to buy the stock before you can sell it
 */

export default function solver (input) {
    let prices = input
    if (!Array.isArray(prices)) prices = prices.split(',').map(i => parseInt(i, 10))

    let solve = maxProfit(1, prices)
   
   return solve
}

// console.log(solver("32,57,59,34,34,149,110,146,81,10,195,74,143,41,35,35,33,82,138,122,34,3,5,32,139,4,139,22,129,195,86,15,187,155,171,32,5,191,47,153,150,193,147,20,67"))