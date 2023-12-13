const fs = require("fs");

const analysisTable = [
    " ", "И", "О", "Е", "А", "Т", "Н", "Р", "С", "В",
    "Л", "К", "М", "П", "Я", "Ы", "Ь", "Д", "З",
    "У", "Б", "Ч", "Ф", "Ш", "Г", "Х", "Щ", "Ю",
    "Ц", "Ж", "Э", "Й", "Ъ", "Ё"
]

const PATH = {
    preparedText: "./rawText.txt",
    decryptedText: "./result/decryptedText.txt",
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

function findWords(text){
    let parts = [];
    let partLen = 10;
    let part;

    while(partLen >= 3){
        distArr = [];
        for(let i=0; i<text.length-partLen+1; i++){
            part = text.slice(i, i+partLen);
            lastIndex = i;
            do{
                currentIndex = text.indexOf(part, lastIndex + partLen);
                if(currentIndex !== -1){
                    distArr.push(currentIndex - lastIndex);
                    lastIndex = currentIndex;
                }
            }
            while(currentIndex !== -1);  
        }

        if(distArr.length > 1){
            parts.push({word: part, qty: distArr.length});
            partLen--;
        }
        else
            partLen--;   
    }
    return parts;
}

function decipherText(text, key){
    let result = [];

    for(let s of text){
        result.push(key[s]);
    }

    writeText(PATH.decryptedText, result.join(""), "decryptedText writed");
    return result.join("");
}

async function main(){
    let text = (await getText(PATH.preparedText)).toString();
    let resultStat = getResultStat(analyzeText(text));
    let decryptionKey = getDecryptionKey(resultStat);

    let decipheredText =  decipherText(text, decryptionKey);
    findWords(decipheredText);
}

main();