/** @param {(import("/../NetscriptDefinitions").NS)} ns */
export default function getStonks(ns) {
    let { stock } = ns;
    let symbols = stock.getSymbols();
    let datas = symbols.map((ticker) => {
      let org = stock.getOrganization(ticker);
      let forecast = stock.getForecast(ticker);
      let ask = stock.getAskPrice(ticker);
      let bid = stock.getBidPrice(ticker);
      let price = stock.getPrice(ticker);
      let maxShares = stock.getMaxShares(ticker);
      let volatility = stock.getVolatility(ticker);
  
      let [shares, avgPrice, shorts, avgShort] = stock.getPosition(ticker);
      let totalSaleAll = shares ? stock.getSaleGain(ticker, shares, "Long") : 0;
      let totalBuyAllShares = maxShares - shares
      let totalBuyAllCost = 
        shares !== maxShares
          ? stock.getPurchaseCost(ticker, totalBuyAllShares, "Long")
          : 0;
      let totalSpent = avgPrice * shares;
      let totalProfit = totalSaleAll - totalSpent;
      let totalProfitPct = totalSpent ? totalProfit / totalSpent : 0;
  
      return {
        ticker,
        org,
        forecast,
        ask,
        bid,
        price,
        maxShares,
        volatility,
        shares,
        avgPrice,
        shorts,
        avgShort,
        totalSaleAll,
        totalBuyAllShares,
        totalBuyAllCost,
        totalSpent,
        totalProfit,
        totalProfitPct
      };
    });
    return datas
  }

  export function buyMaxShares(ns, ticker) {
    
  }