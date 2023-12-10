const fs = require("fs");

// const analysisTable = [
//     "О", "И", "Е", "А", "Н", "Т", "С", "Р", "В",
//     "Л", "К", "М", "Д", "П", "У", "Я", "Ы", "Ь",
//     "Г", "З", "Б", "Ч", "Х", "Ж", "Ш", "Ю",
//     "Ц", "Щ", "Э", "Ф", "Ъ", "Ё"
// ]

const analysisTable = [
    "О", "Е", "А", "И", "Н", "Т", "С", "Р", "В",
    "Л", "К", "М", "Д", "П", "У", "Я", "Ы", "Ь",
    "Г", "З", "Б", "Ч", "Й", "Х", "Ж", "Ш", "Ю",
    "Ц", "Щ", "Э", "Ф", "Ъ", "Ё"
]

const PATH = {
    preparedText: "./rawText.txt",
    decryptionText: "./result/decryptionText.txt",
    decryptionKey: "./result/decryptionKey.txt",
    resultStat: "./result/resultStat.txt", 
}

function getText(path){
    return fs.promises.readFile(path, { encoding: "utf-8" });
}

async function writeText(path, data, consoleMessage = ""){
    fs.promises.access(path, fs.constants.F_OK)
        .then(() => {})
        .catch(() => fs.promises.writeFile(path, data))
        .then(() =>  { if(consoleMessage) console.log(consoleMessage) })
}

function analyzeText(text){
    let result = {};
    for(let s of text){
        if(s in result)
            result[s]++;
        else
            result[s] = 1;
    }
    
    return result;
}

function getResultStat(stat){
    const len = Object.values(stat).reduce((prev, cur) => prev + cur);
    let result = {
        len: len,
        index: Number((Object.values(stat).reduce((prev, cur) => prev + cur*(cur-1), 0) / (len * (len-1))).toFixed(4)),
        symbols: []
    };
    for(let s in stat){
        result.symbols.push({[s]: Number((stat[s] / len).toFixed(4))});
    }
    result.symbols.sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);
    writeText(PATH.resultStat, JSON.stringify(result), "resultStat writed");
    return result;
}

function getDecryptionKey(resultStat){
    result = {};
    for(let s of resultStat.symbols)
        result[Object.keys(s)[0]] = analysisTable.shift();
    writeText(PATH.decryptionKey, JSON.stringify(result), "decryptionKey writed");
    return result;
}

function decipherText(text, key){
    let result = [];

    for(let s of text){
        result.push(key[s]);
    }

    writeText(PATH.decryptionText, result.join(""), "decryptionText writed");
}

async function main(){
    let text = (await getText(PATH.preparedText)).toString();
    let resultStat = getResultStat(analyzeText(text));
    let decryptionKey = getDecryptionKey(resultStat);

    decipherText(text, decryptionKey);
}

main();