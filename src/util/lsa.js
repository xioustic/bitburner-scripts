import { scanAnalyze } from "lib/scanAnalyze";

/** @param {import(".").NS} ns */
export async function main(ns) {
  let dedupe = false;

  let arg_flag = "";
  let grep;
  for (let arg of ns.args) {
    if (arg_flag === "grep") {
      grep = arg;
      arg_flag = "";
    } else if (arg === "--dedupe" || arg === "--uniq") dedupe = true;
    else if (arg === "--grep") arg_flag = "grep";
  }

  if (ns.args.length && ["--dedupe", "--uniq"].includes(ns.args[0]))
    dedupe = true;
  let scan_data = await scanAnalyze(ns);

  let server_files = Object.values(scan_data).map((sd) => ({
    files: sd.files,
    hostname: sd.hostname,
  }));
  
  // apply grep
  if (grep !== undefined) {
    server_files = server_files.map(({ files, hostname }) => {
        return { hostname, files: files.filter(file => file.includes(grep)) };
      });
  }

  // sort by number of files
  server_files.sort((a, b) => b.files.length - a.files.length);

  // apply dedupe
  if (dedupe) {
    let seen_files = new Set();
    server_files = server_files.map(({ files, hostname }) => {
      let filtered_files = files.filter((file) => {
        if (seen_files.has(file)) return false;
        seen_files.add(file);
        return true;
      });
      return {hostname, files: filtered_files}
    });
  }

  for (let { files, hostname } of server_files) {
    if (files.length) {
      ns.tprint("+ " + hostname);
      for (let file of files) {
        ns.tprint("  - " + file);
      }
    }
  }
}
