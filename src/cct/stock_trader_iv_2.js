// Algorithmic Stock Trader IV

// You are given the following array with two elements:
// [7, [143,57,153,178,40,199,48,53,102,26,159,83,177,114,144,128,60,61,185,194,58,176,58,5,2,12,167,115,124,172,6,118,170,151,16]]
//
// The first element is an integer k. The second element is an array of stock prices (which are numbers)
// where the i-th element represents the stock price on day i.
// Determine the maximum possible profit you can earn using at most k transactions.
// A transaction is defined as buying and then selling one share of the stock. Note that you cannot
// engage in multiple transactions at once. In other words, you must sell the stock before you can buy it again.
// If no profit can be made, then the answer should be 0.

export default function solver(input) {
  if (typeof input === "string") input = JSON.parse(intput);
  let [k, prices] = input;
  console.log("k", k, "prices", prices);
  if (!Array.isArray(prices))
    prices = prices.split(",").map((i) => parseInt(i, 10));

  let best_result;

  const recursiveSolve = (
    profit,
    current_day_idx,
    num_bought,
    num_sold,
    path
  ) => {
    // check for exit condition
    let isFinal = false;
    // we've used up all our actions
    if (num_bought === num_sold && num_bought === k) isFinal = true;
    // we're at the end of the days
    if (current_day_idx >= prices.length) isFinal = true;

    // if(path.length > 2) { console.log(path, num_bought, num_sold, isFinal) ; return }
    if (isFinal) {
      // console.log('got a final')
      if (best_result === undefined) best_result = { profit, path };
      else if (best_result.profit < profit) best_result = { profit, path };
      return
    }

    // try doing nothing today
    recursiveSolve(profit, current_day_idx + 1, num_bought, num_sold, [
      ...path,
      "nothing",
    ]);

    // try doing something today
    let holding_share = num_bought > num_sold;
    let today_price = prices[current_day_idx]
    if (holding_share) {
      // sell
      recursiveSolve(
        profit + today_price,
        current_day_idx + 1,
        num_bought,
        num_sold + 1,
        [...path, "sold @ " + today_price]
      );
    } else {
      // buy
      recursiveSolve(
        profit - today_price,
        current_day_idx + 1,
        num_bought + 1,
        num_sold,
        [...path, "bought @ " + today_price]
      );
    }
    if (holding_share) {
    }
  };

  recursiveSolve(0, 0, 0, 0, []);

  return { data: best_result, answer: best_result.profit };
}

console.log(
  solver([
    4,
    [
      143, 57, 153, 178, 40, 199, 48, 53, 102, 26, 159, 83, 177, 114, 144, 128,
      60, 61, 185, 194, 58, 176, 58, 5, 2, 12, 167, 115, 124, 172, 6, 118, 170,
      151, 16,
    ],
  ])
);
