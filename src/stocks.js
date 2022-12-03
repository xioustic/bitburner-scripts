import { awaitMs, buildASCIITable } from "utils";
import getStonks from "./lib/stonks";

const DEFINITELY_BUY_PCT = 0.56
const TAKE_PROFIT_PCT = 0.54
const PANIC_SELL_PCT = 0.5

function buyMaxStockShares(ns, ticker) {
    let playerMoney = ns.getServerMoneyAvailable('home')
    let ticker_data = getStonks(ns).filter(stonk => stonk.ticker === ticker)[0]
    let availableMoneyToPurchaseWith = playerMoney - 100000
    let sharesRemainingToBuy = ticker_data.maxShares - ticker_data.shares
    let sharesCanAfford = Math.floor(availableMoneyToPurchaseWith / ticker_data.ask)
    let actualSharesCanBuy = Math.max(Math.min(sharesCanAfford, sharesRemainingToBuy), 0)
    if (actualSharesCanBuy !== 0) ns.stock.buyStock(ticker, actualSharesCanBuy)
    return actualSharesCanBuy
}

function sellMaxStockShares(ns, ticker) {
    let ticker_data = getStonks(ns).filter(stonk => stonk.ticker === ticker)[0]
    let sharesToSell = ticker_data.shares || 0
    console.log('trying to sell', ticker, sharesToSell)
    console.log(ticker_data)
    if (sharesToSell) ns.stock.sellStock(ticker, sharesToSell)
    return sharesToSell
}

/** @param {import("./lib").NS} ns */
export async function main(ns) {
    ns.disableLog("ALL")
    let actionLog = []
    while (true) {
        ns.clearLog()
  let stonks = getStonks(ns)

  const COLORS = {
    red: "\u001b[31m",
    green: "\u001b[32m",
    brightRed: "\u001b[31;1m",
    brightGreen: "\u001b[32;1m",
    reset: "\u001b[0m",
  };
  let datas = [...stonks].sort((a, b) => b.forecast - a.forecast)

  let time = (new Date()).toString().split(' ')[4]
  for (let data of datas) {
    // consider buying
    if (data.shares !== data.maxShares) {
      if (data.forecast > DEFINITELY_BUY_PCT) {
        let bought = buyMaxStockShares(ns, data.ticker)
        let spent = (bought*data.ask) + 100000
        let fSpent = ns.nFormat(spent, '$0.00a')
        if (bought) actionLog.push(`${time}: bought ${bought} shares of ${data.ticker} for ${fSpent}`)
      }
    }
    // stocks i have
    if (data.shares !== 0) {
        // console.log('i have', data.ticker, data.shares)
        if (data.forecast < TAKE_PROFIT_PCT && data.totalProfit - 100000 > 0) {
                let sold = sellMaxStockShares(ns, data.ticker)
                let gain = (sold * data.bid) - 100000
                let fGain = ns.nFormat(gain, '$0.00a')
                let fProfit = ns.nFormat(data.totalProfit, '$0.00a')
                if (data.totalProfit > 0) fProfit = '+' + fProfit
                if (sold) actionLog.push(`${time}: sold ${sold} shares of ${data.ticker} for ${fGain} (${fProfit}) (profit)`)
        } else if (data.forecast < PANIC_SELL_PCT) {
            let sold = sellMaxStockShares(ns, data.ticker)
            let gain = (sold * data.bid) - 100000
            let fGain = ns.nFormat(gain, '$0.00a')
            let fProfit = ns.nFormat(data.totalProfit, '$0.00a')
            if (data.totalProfit > 0) fProfit = '+' + fProfit
            if (sold) actionLog.push(`${time}: sold ${sold} shares of ${data.ticker} for ${fGain} (${fProfit}) (panic)`)
        }
    }
  }

  let format_datas = datas.map((data) => {
    let retval = { ...data };
    for (let key of ["price", "ask", "bid", "totalProfit", "totalSpent"]) {
      retval[key] = ns.nFormat(retval[key], "0.00a");
      if (data[key] < 1000) retval[key] += ' '
    }
    for (let key of ["volatility", "forecast", "totalProfitPct"]) {
      retval[key] = ns.nFormat(retval[key], "0.00%");
    }

    let forecastColor;
    let { forecast } = data;
    if (forecast > 0.7) forecastColor = COLORS.brightGreen + '^^ ';
    else if (forecast > 0.5) forecastColor = COLORS.green + ' ^ ';
    else if (forecast > 0.3) forecastColor = COLORS.red + ' v ';
    else forecastColor = COLORS.brightRed + 'vv ';
    retval["forecast"] = forecastColor + retval["forecast"] + COLORS.reset;

    let totalProfitPrefix = ''
    let totalProfitSuffix = ''
    let { totalProfit } = data;
    if (totalProfit > 0) totalProfitPrefix = '+'
    else if (totalProfit < 0) totalProfitPrefix = ''
    else totalProfitPrefix = ' '
    retval["totalProfit"] = `${totalProfitPrefix}${retval["totalProfit"]}${totalProfitSuffix}`;

    retval["profit"] = retval["totalProfit"]
    retval["pPct"] = retval["totalProfitPct"]
    retval["spent"] = retval["totalSpent"]
    retval["vola"] = retval["volatility"]

    return retval;
  });

  let table = buildASCIITable(
    format_datas,
    ["org", "ticker", "price", "ask", "bid", "spent", "profit", "pPct", "vola", "forecast"],
    undefined,
    "right"
  );
  let actionLogStr = actionLog.slice(-5)
  actionLogStr.reverse()
  actionLogStr = actionLogStr.join('\n')

  ns.print("\n", table, '\n', actionLogStr);
  await awaitMs(6000)
    }
}
