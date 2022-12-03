/** @param {NS} ns */
export async function main(ns) {
    const func = ns.hack.bind(ns)

    let target = ns.args[0]
    let expected_start = ns.args[1]
    let expected_runtime = ns.args[2]
    let expected_complete = ns.args[3]
    
    let actual_start = +(new Date())

    if (expected_start !== undefined) {
        ns.print('starting at ', actual_start, ' (', actual_start-expected_start,'ms delay)')
    } else {
        ns.print('starting at ', actual_start)
    }
    let result = await func(target)
    let actual_end = +(new Date())
    let actual_runtime = actual_end - actual_start
    ns.print(`finished at ${actual_end} in ${actual_runtime}ms`)
    ns.print('return value: ', result)
    return result
}