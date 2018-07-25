const fs = require('fs');
const configJson                    = JSON.parse(fs.readFileSync('../config/config.json', 'utf8'));

const keyboard                      = configJson['keyboard'];
let keyboardMap                     = new Map();

const objectTypes = require('object-types');

arrayTest();

function logJson(arr, tap) {
    var type= objectTypes(arr);

    for(var i in arr){
        var key =i;
        // type = objectTypes(key);
        var val = arr[key];
        type = objectTypes(val);
        console.log(tap + key + " : " + val);
        if(val.length > 0) {
            var nextTap = tap + "  ";
            logJson(val, nextTap);
        }
    }

}

function arrayTest() {
    const arr = [{"key1" : "val1"}, [{"key2":"val2", "key2_2": "val2_2"},{"key3":"val3"}]];
    logJson(arr, "");
    // arr.forEach((cur) => {
    //     let obj = cur;
    //     console.log(obj.key + " : " + obj.value);
    //
    // });

}