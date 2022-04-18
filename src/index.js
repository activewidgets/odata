/**
 * Copyright (c) ActiveWidgets SARL. All Rights Reserved.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {http, data, params, operations, convertSort, convertFilter} from '@activewidgets/options';
import {like, literal} from './like.js';

const operators = {

    /* equality */
    '=': ' eq ',
    '<>': ' ne ',
    '!=': ' ne ',

    /* comparison */
    '<': ' lt ',
    '>': ' gt ',
    '<=': ' le ',
    '>=': ' ge ',

    /* text */
    'LIKE': 'like',
    'ILIKE': 'ilike',

    /* logical */
    'NOT': 'not ',
    'AND': ' and ',
    'OR': ' or '
};

const formatting = {
    equality: (name, operator, value) => name + operator + literal(value),
    comparison: (name, operator, value) => name + operator + literal(value),
    text: (name, operator, pattern) => like(name, operator, pattern),
    logical: (operator, expr) => operator == 'not ' ? `not (${expr})` : `(${expr.join(operator)})`
};

function sortExpr(name, direction){
    return `${name} ${direction}`;
}

function mergeAll(items){
    return items.join();
}

function convertParams({where, orderBy, limit, offset}){
    return {
        $filter: convertFilter(where, operators, formatting, '/'),
        $orderby: convertSort(orderBy, sortExpr, mergeAll, '/'),
        $top: limit,
        $skip: offset,
        $count: true,
        $format: 'json'
    };
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
