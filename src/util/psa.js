import getAllProcesses from "lib/getAllProcesses";
import { buildASCIITable } from "utils";

/** @param {import("../lib").NS} ns */
export async function main(ns) {
    let procs = await getAllProcesses(ns)
    // ns.tprint(JSON.stringify(proc, null, 2))
    for (let proc of procs) {
        let {filename, args} = proc
        if (filename.endsWith('weaken.js') || filename.endsWith('grow.js') || filename.endsWith('hack.js')) {
            if (args.length > 1) {
                proc.start = args[1]
                proc.duration = args[2]
                proc.end = proc.start + proc.duration
                proc.remain = proc.end - +(new Date())

                proc.START = new Date(proc.start).toString().split(' ')[4]
                proc.END = new Date(proc.end).toString().split(' ')[4]
                proc.DUR = Math.floor(proc.duration / 1000)
                proc.REM = Math.floor(proc.remain / 1000)
            }
        }
    }
    
    procs = procs.sort((a, b) => a.hostname.localeCompare(b.hostname))
    procs = procs.sort((a, b) => a.args.join(',').localeCompare(b.args.join(',')))

    procs = procs.sort((a, b) => a.args[0] - b.args[0])
    let table = buildASCIITable(procs, ["pid", "hostname", "filename", "threads", "args", "START", "END", "REM", "DUR"])
    ns.tprint('\n', table)
}