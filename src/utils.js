export const awaitMs = ms => new Promise(res => setTimeout(res, ms))

/**
 * Behavior similar to Python's range function.
 * @param {number} end_or_start
 * @param {number} maybe_end
 * @returns number[]
 */
export const range = (end_or_start, maybe_end = null) => {
  let end = maybe_end === null ? end_or_start : maybe_end;
  let start = maybe_end === null ? 0 : end_or_start;

  let retval = [];
  for (let i = start; i <= end; i++) retval.push(i);
  return retval;
};

/**
 *
 * @param {number[]} arr_nums
 * @returns number
 */
export const sumArray = (arr_nums) => {
  let acc = 0;
  for (let num of arr_nums) acc += num;
  return acc;
};

const asciiLength = str => {
  // example: "\u001b[31;1m" "\u001b[0m"
  let regex = /\u001b\[(\d+;)?\d+m/g
  // return str.length
  return str.replace(regex, '').length
}

/**
 *
 * @param {Record<string, any>[]} list_of_objs
 * @param {string[]} header_keys - which keys to present in the table
 * @param {string[]} opt_headers - headers for the table; otherwise uses keys
 */
export const buildASCIITable = (
  list_of_objs,
  header_keys = undefined,
  opt_headers = undefined,
  align = 'left',
  spacing = 2,
  spacing_char = ' | '
) => {
  if (header_keys === undefined) header_keys = [...new Set(list_of_objs.map(obj => Object.keys(obj)).flatten())]
  let headers = opt_headers === undefined ? header_keys : opt_headers;

  let output = [];
  output.push(headers);

  // add each object to table
  for (let obj of list_of_objs) output.push(header_keys.map((key) => obj[key] === undefined ? '' : obj[key].toString()));

  // calculate padding per column
  let col_sizes = headers.map(header => header.length + spacing)
//   console.log(col_sizes)
  for (let row of output) {
    for (let idx = 0; idx < row.length; idx++) {
        let val = row[idx]
        col_sizes[idx] = Math.max(col_sizes[idx], asciiLength(val) + spacing)
    }
  }
//   console.log(col_sizes)

  // add padding
  for (let row of output) {
    for (let idx = 0; idx < row.length; idx++) {
        row[idx] = align === 'right' ? row[idx].padStart(col_sizes[idx]) : row[idx].padEnd(col_sizes[idx])
    }
  }

  // turn rows to strings
  let row_strs = output.map(row => row.join(spacing_char))
  
  // add header sep
  let header_str = row_strs[0]
  let header_sep = [...header_str].map(_ => '-').join('')
  let final_output = [row_strs[0], header_sep, ...row_strs.slice(1)]

  let final_output_str = final_output.join('\n')
  return final_output_str
};

export const objectDive = (obj, key_series) => {
    if (key_series.length === 0) return obj
    let this_key = key_series[0]
    let remaining_keys = key_series.slice(1)
    return objectDive(obj[this_key], remaining_keys)
}