const fs = require('fs');
const configJson = JSON.parse(fs.readFileSync('../config/config.json', 'utf8'));

const keyboard = configJson['keyboard'];
let keyboardMap = new Map();

const objectTypes = require('object-types');

var result = arrayTest();

console.log(result);
console.log(keyboardMap);
console.log("------------append map--------------");
console.log(appendMap());

function appendMap(){
    var map = {"1" : 1, "2" : 2};
    var oldMap = {"3":3, "4":4};
    var newMap = Object.assign(map, oldMap);
    console.log(map);//same with newMap
    return newMap;
}

function logJson(arr) {
    var type = objectTypes(arr);
    var keyboardResult = [];
    arr.forEach(obj => {
        type = objectTypes(obj);
        if (type === 'object') {
            let keys = Object.keys(obj);
            keyboardResult.push(keys);
            keys.forEach(key => {
                keyboardMap.set(key, obj[key]);
                console.log(key + " : " + obj[key]);
            });
        } else if (type === 'array') {
            // second depth for one line multi button.
            var subKeyboard = [];
            obj.forEach(subObj => {
                let subType = objectTypes(subObj);
                if (subType === 'object') {
                    let keys = Object.keys(subObj);
                    keys.forEach(key => {
                        subKeyboard.push(key);
                        keyboardMap.set(key, subObj[key]);
                        console.log(key + " : " + subObj[key]);
                    });
                }
            });
            keyboardResult.push(subKeyboard);
        }
    });
    return keyboardResult;
}

function arrayTest() {
    const arr = [{"key1": "val1"}, [{"key2": "val2", "key2_2": "val2_2"}, {"key3": "val3"}]];
    return logJson(arr, "");
    // arr.forEach((cur) => {
    //     let obj = cur;
    //     console.log(obj.key + " : " + obj.value);
    //
    // });

}