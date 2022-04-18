/**
 * Copyright (c) ActiveWidgets SARL. All Rights Reserved.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export function literal(value){
    return typeof value == 'string' ? `'${value.replace(/'/g,"''")}'` : value;
}


export function like(name, operator, pattern){

    let parts = pattern.split('%'),
        length = parts.length,
        start = parts[0],
        end = parts[length-1],
        middle = length == 3 ? parts[1] : '',
        filter = '';

    if (operator === 'ilike'){
        return ilike(name, pattern, length, start, end, middle);
    }

    if (length == 1){
        return name + ' eq ' + literal(pattern);
    }

    if (start) {
        filter = `startswith(${name}, ${literal(start)})`;
    }

    if (end) {
        filter += filter ? ' and ' : '';
        filter += `endswith(${name}, ${literal(end)})`;
    }

    if (middle) {
        filter += filter ? ' and ' : '';
        filter += `contains(${name}, ${literal(middle)})`;
    }

    if (length > 3){
        throw Error('Unsupported LIKE pattern: ' + pattern);
    }

    return filter;
}


function ilike(name, pattern, length, start, end, middle){

    let filter = '';

    if (length == 1){
        return `tolower(${name}) eq ${literal(pattern.toLowerCase())}`;
    }

    if (start) {
        filter = `startswith(tolower(${name}), ${literal(start.toLowerCase())})`;
    }

    if (end) {
        filter += filter ? ' and ' : '';
        filter += `endswith(tolower(${name}), ${literal(end.toLowerCase())})`;
    }

    if (middle) {
        filter += filter ? ' and ' : '';
        filter += `contains(tolower(${name}), ${literal(middle.toLowerCase())})`;
    }

    if (length > 3){
        throw Error('Unsupported ILIKE pattern: ' + pattern);
    }

    return filter;
}