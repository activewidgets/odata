/**
 * Copyright (c) ActiveWidgets SARL. All Rights Reserved.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {http, data, params, operations, convertFilter} from '@activewidgets/options';

let ops = {
    '=': 'eq',
    '>': 'gt',
    '<': 'lt',
    '>=': 'ge',
    '<=': 'le'
};

let format = {
    compare: (path, op, value) => path.join('/') + ' ' + ops[op] + ' ' + (typeof value == 'string' ? "'" + value + "'": value)
}


function encode(id){
    if (Array.isArray(id)){
        return id.map(encode).join(',');
    }
    if (typeof id == 'object'){
        return Object.keys(id).map(name=>`${name}=${encode(id[name])}`).join(',');
    }
    if (typeof id == 'string'){
        return encodeURIComponent(`'${id.replace(/'/g, "''")}'`);
    }
    return id;
}


function defineOperations(url, send){

    function insertRow(data){
        return send(url, {method: 'POST', body: JSON.stringify(data)})
    }

    function updateRow(id, data){
        return send(`${url}(${encode(id)})`, {method: 'PATCH', body: JSON.stringify(data)})
    }

    function deleteRow(id){
        return send(`${url}(${encode(id)})`, {method: 'DELETE'});
    }

    return {insertRow, updateRow, deleteRow};
}


function convertParams({limit, offset, orderBy, where}){
    return {
        $top: limit,
        $skip: offset,
        $orderby: orderBy,
        $filter: convertFilter(where, format),
        $count: true,
        $format: 'json'
    };
}


function extractData(data){
    return {
        items: data.value,
        count: Number(data['@odata.count'])
    };
}


export function odata(serviceURL, fetchConfig){
    return [
        http(serviceURL, fetchConfig),
        operations(defineOperations),
        params(convertParams),
        data(extractData)
    ];
}
