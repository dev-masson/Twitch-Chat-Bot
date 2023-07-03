const tmi = require('tmi.js');
const {loadWatchedWords} = require("./watchedWords");
const msgAutomatic = require('./msgAutomatic');
const { searchAndAddToSpotifyQueue, nowPlaying, skipTrack } = require('./spotify');
const e = require('express');

function connectTwitchBot() {
// Configure sua identidade e canais aqui
    const client = new tmi.Client({
        options: {
            debug: false,
            skipMembership: true,
            skipUpdatingEmotesets: true,
        },
        connection: {
            reconnect: true,
            secure: true,
        },
        identity: {
            username: 'UserName', // <== Change this to your  username
            password: 'oauth_token', // <== Change this to your oauth token
        },
        channels: ['channel_Name'], // <== Change this to your channel name
    });

    client.connect().catch(console.error);

    client.on('connected', () => {
        console.log('Bot conectado ao chat da Twitch.');
        msgAutomatic(client, 'channel'); // <== Change this to your channel name
    });

    function reply(channel, message, replyParentMsgId) {
            if (typeof replyParentMsgId === 'object') {
                replyParentMsgId = replyParentMsgId.id;
            }
            if (!replyParentMsgId || typeof replyParentMsgId !== 'string') {
                throw new Error('replyParentMsgId is required.');
            }
            return client.say(channel, message, { 'reply-parent-msg-id': replyParentMsgId });
    }

    client.on('message', (channel, tags, message, self) => {
        const { watchedWords } = loadWatchedWords();
        const replyParentMsgId = tags.id;
        if (message.toLowerCase() === '!music') {
            nowPlaying()
              .then((formattedMessage) => {
                const mention = `@${tags.username}, ${formattedMessage}`
                reply(channel, mention, replyParentMsgId); 
              })
              .catch((error) => {
                console.error('Erro ao obter a música em reprodução:', error);
              });
          }
          else if (self || !message.startsWith('!')) return;

          // Restante do código para verificar palavras assistidas...
          for (let i = 0; i < watchedWords.length; i++) {
            const watchedWord = watchedWords[i];
            if (watchedWord.word === message) {
              const response = `@${tags.username}, ${watchedWord.response}`;
              const replyParentMsgId = tags.id;
              reply(channel, response, replyParentMsgId);
              break;
            }
          }
        });


        client.on('redeem', (channel, username, rewardType, tags, message) => {
          if (rewardType === 'Reward_ID') {  // <== Change this to your reward id
            console.log('Reward Skip musica resgatada');
            console.log('Recompensa sem msg acionada');
            // Lógica para recompensa sem msg
            skipTrack()
              .then((addMusicMessage) => {
                const mention = `@${tags.username}, ${addMusicMessage}`;
                const replyParentMsgId = tags.id;
                reply(channel, mention, replyParentMsgId);
              })
              .catch((error) => {
                const replyParentMsgId = tags.id;
                console.error('Erro ao pular a música:', error.message);
                const mention = `@${tags.username}, Ocorreu um erro ao pular a música.`;
                reply(channel, mention, replyParentMsgId);
              });
          } else if (rewardType === 'Reward_ID') { // <== Change this to your reward id
            const replyParentMsgId = tags.id;
            console.log('Reward Pedir musica resgatada');
            const song = message;
            
            searchAndAddToSpotifyQueue(song)
              .then((addMusicMessage) => {
                const mention = `@${tags.username}, ${addMusicMessage}`;
                reply(channel, mention, replyParentMsgId);
              })
              .catch((error) => {
                console.error('Erro ao adicionar a música à fila:', error.message);
                const mention = `@${tags.username}, Ocorreu um erro ao adicionar a música à fila.`;
                reply(channel, mention, replyParentMsgId);
              });
          } else {
            console.log(`Reward desconhecido resgatado: ${rewardType}`);
          }
        });

        console.log('Bot conectado ao chat da Twitch.');
        
          
}

exports.connectTwitchBot = connectTwitchBot;