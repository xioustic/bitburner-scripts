// Convenience script to "eval" an ns command.

/** @param {import("../lib/").NS} ns */
export async function main(ns) {
    let [cmd, ...args] = ns.args
    // ns.write('/tmp/tmp.js', 'hi')
    let args_format = args.map(arg => {
        if (!isNaN(arg)) return arg
        // else if (typeof arg === 'string') return '"' + arg + '"'
        else return JSON.stringify(arg)
    }).join(',')
    ns.write('/tmp/ns.js', `
        /** @param {import("../lib/").NS} ns */
        export async function main(ns) {
            let result = await ns.${cmd}(${args_format})
            ns.tprint(JSON.stringify(result, null, 2))
            if (Array.isArray(result)) ns.tprint(result.length)
            else if (typeof result === 'object') ns.print(Object.keys(result).length)
        }
    `, 'w')
    ns.run('tmp/ns.js')
}