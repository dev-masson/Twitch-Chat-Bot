const fs = require('fs');
const path = require('path');

const commandsPath = path.join(__dirname, 'data', 'commands.txt');

function loadWatchedWords() {
    const rawdata = fs.readFileSync(commandsPath, 'utf8');

    // get rawdata, break each line into an array
    const lines = rawdata.split('\n');
    // each line contains a text like "!text|response", so we need to split it again
    // and it must ignore empty lines
    const watchedWords = lines.filter((line) => line.trim() !== '').map((line) => {
        const [word, response] = line.split('|');
        return { word, response };
    })

    return {watchedWords};
}

function saveWatchedWords(watchedWords = []) {
    const lines = watchedWords.map(({word, response}) => `${word}|${response}`);
    const data = lines.join('\n');
    fs.writeFileSync(commandsPath, data);
}

exports.loadWatchedWords = loadWatchedWords;
exports.saveWatchedWords = saveWatchedWords;
