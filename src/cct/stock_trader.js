export function maxProfit(k, prices) {
    let best_score;
  
    const scorePath = (path) => {
      let shares = 0;
      let profit = 0;
      let trades = 0;
      // console.log("scoring", path);
      let path_profit = [];
      for (let i = 0; i < path.length; i++) {
        let price = prices[i];
        let action = path[i];
  
        // not allowed to buy if already have a share
        if (action === "buy" && shares >= 1) {
          profit = -Infinity;
          path_profit.push(profit);
          break;
        }
        // not allowed to sell if we don't have a share
        if (action === "sell" && shares <= 0) {
          profit = -Infinity;
          path_profit.push(profit);
          trades += 1;
          break;
        }
  
        if (action === "buy") {
          shares += 1;
          profit -= price;
          path_profit.push(profit);
        } else if (action === "sell") {
          shares -= 1;
          profit += price;
          path_profit.push(profit);
          trades += 1;
        } else {
          path_profit.push(profit);
        }
      }
      let retval = { path, shares, profit, path_profit, trades };
      // console.log(retval);
      return retval;
    };
  
    let recursive_cnt = 0
    const recursiveSolve = (this_score) => {
      let isFinal = false;
      recursive_cnt += 1
    //   if (recursive_cnt % 100 === 0) console.log(recursive_cnt, this_score)
  
      if (this_score.path.length === prices.length) isFinal = true;
      else if (this_score.trades === k) isFinal = true;
  
      if (isFinal) {
        if (best_score === undefined) best_score = this_score;
        else if (this_score.shares === 0) {
          if (best_score.profit < this_score.profit) best_score = this_score;
        }
      } else {
        // try doing nothing
        let nothingScore = scorePath([...this_score.path, "nothing"]);
        recursiveSolve(nothingScore);
  
        // try doing something
        let actionScore;
        if (this_score.shares) {
          actionScore = scorePath([...this_score.path, "sell"]);
        } else {
          actionScore = scorePath([...this_score.path, "buy"]);
        }
        recursiveSolve(actionScore);
      }
    };
  
    recursiveSolve(scorePath([]));
  
    // console.log("best");
    // console.log(best_score);
  
    return { data: best_score, answer: best_score.profit };
}