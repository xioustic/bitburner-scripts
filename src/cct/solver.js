import array_jumping_game_ii from 'cct/array_jumping_game_ii'
import stock_trader_i from 'cct/stock_trader_i'
import stock_trader_ii from 'cct/stock_trader_ii'
import stock_trader_iii from 'cct/stock_trader_iii'
import stock_trader_iv from 'cct/stock_trader_iv'
import generate_ip_addresses from 'cct/generate_ip_addresses'
import subarray_with_maximum_sum from 'cct/subarray_with_maximum_sum'
import hammingcodes from 'cct/hammingcodes'
import largest_prime_factor from 'cct/largest_prime_factor'
import spiralize_matrix from 'cct/spiralize_matrix'
import total_ways_to_sum from 'cct/total_ways_to_sum'
import total_ways_to_sum_ii from 'cct/total_ways_to_sum_ii'
import unique_paths_grid_i from 'cct/unique_paths_grid_i'

export const SOLVER_FUNCS = {
    "Algorithmic Stock Trader I": stock_trader_i,
    "Algorithmic Stock Trader II": stock_trader_ii,
    "Algorithmic Stock Trader III": stock_trader_iii,
    "Algorithmic Stock Trader IV": stock_trader_iv,
    "Array Jumping Game II": array_jumping_game_ii,
    "Find Largest Prime Factor": largest_prime_factor,
    "Generate IP Addresses": generate_ip_addresses,
    "HammingCodes: Integer to Encoded Binary": hammingcodes,
    "Spiralize Matrix": spiralize_matrix,
    "Subarray with Maximum Sum": subarray_with_maximum_sum,
    "Total Ways to Sum": total_ways_to_sum,
    "Total Ways to Sum II": total_ways_to_sum_ii,
    "Unique Paths in a Grid I": unique_paths_grid_i
}

/** @param {import("../lib").NS} ns */
export async function main(ns) {
    let args = []
    let submit_flag = false
    let probe_flag = false

    for (let arg of ns.args) {
        if (arg === '--submit') submit_flag = true
        if (arg === '--probe') probe_flag = true
        else args.push(arg)
    }
    
    let [filename, hostname] = args
    // ns.tprint(ns.args)
    // ns.tprint('filename ', filename, ' hostname ', hostname)
    let cct_type = ns.codingcontract.getContractType(filename, hostname)
    let data = ns.codingcontract.getData(filename, hostname)
    ns.tprint('ccttype "', cct_type, '" datatype ', typeof data, ' data ', data)
    if (probe_flag) return
    if (cct_type in SOLVER_FUNCS) {
        let func = SOLVER_FUNCS[cct_type]

        let solution = func(data)
        let answer = solution.answer
        ns.tprint(solution)
        if (submit_flag && !(answer === null)) {
            let attempt = ns.codingcontract.attempt(answer, filename, hostname, {returnReward: true})
            ns.tprint('result: ', attempt)
        }
    } else {
        ns.tprint('unknown type ', cct_type)
    }
  }
  