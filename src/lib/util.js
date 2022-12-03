export function pprint(ns, obj) {
    ns.tprint(JSON.stringify(obj, null, 2))
}

export function arrToObj(arr, keyOrKeyFunc) {
    let result = {}

    let keyFunc
    if (typeof keyOrKeyFunc === 'string') keyFunc = item => item[keyOrKeyFunc]
    else keyFunc = keyOrKeyFunc

    for (let item of arr) {
        let key = keyFunc(item)
        result[key] = item
    }

    return result
}