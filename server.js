const express = require('express');
const cors = require('cors');
const { connectTwitchBot } = require('./twitch');
const { loadWatchedWords, saveWatchedWords} = require('./watchedWords')

const app = express();
const port = 3000;

app.use(cors({ origin: true }));
app.use(express.json());

app.use(express.static('public'));

app.get('/api/commands', (req, res) => {
    const { watchedWords } = loadWatchedWords();
    res.status(200).json({ watchedWords });
})

app.post('/api/commands', (req, res) => {
    const { word, response } = req.body;
    const { watchedWords } = loadWatchedWords();
    const newWatchedWords = [...watchedWords, {word, response}];
    saveWatchedWords(newWatchedWords);
    res.status(200).json({ watchedWords: newWatchedWords });
})

app.delete('/api/commands/:word', (req, res) => {
    const { word } = req.params
    const { watchedWords } = loadWatchedWords();
    const newWatchedWords = watchedWords.filter((watchedWord) => watchedWord.word !== word);
    saveWatchedWords(newWatchedWords);
    res.status(200).json({ watchedWords: newWatchedWords });
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
})

connectTwitchBot()