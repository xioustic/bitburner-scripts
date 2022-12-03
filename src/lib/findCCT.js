import getHostnames from "lib/getHostnames";
import findPath from "lib/findPath";
import { SOLVER_FUNCS } from "cct/solver";

/** @param {import(".").NS} ns */
export async function main(ns) {
    let hostnames = await getHostnames(ns)

    let cct_found = []
    for (let hostname of hostnames) {
        let files = await ns.ls(hostname)
        let ccts = files.filter(file => file.toLowerCase().endsWith('.cct'))
        if (ccts.length) {
            let paths = await findPath(ns, hostname)
            let path = paths[0]
            let base_cmd = `home;connect ${path.join(';connect ')}`
            for (let filename of ccts) {
                let cmd = base_cmd + ';run ' + filename
                let cct_type = ns.codingcontract.getContractType(filename, hostname)
                let cct_data = ns.codingcontract.getData(filename, hostname)
                cct_found.push({cmd, hostname, filename, cct_type, cct_data})
            }
        }
    }

    cct_found.sort((a, b) => a.cct_type.localeCompare(b.cct_type))

    let output = []
    for (let {cmd, hostname, filename, cct_type, cct_data} of cct_found) {
        // output.push(`${filename} (${cct_type}) @ ${hostname}: ${typeof cct_data} ${cct_data}`)
        let _cct_type = cct_type
        if (cct_type in SOLVER_FUNCS) _cct_type += '*'
        output.push(`${filename} (${_cct_type}) @ ${hostname}`)
        output.push(cmd)
        output.push('-----')
    }

    ns.tprint('CCTs:\n',output.join('\n'))
}