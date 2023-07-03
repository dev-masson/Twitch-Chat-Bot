function msgAutomatic(client, channel) {
  const mensagens = [
    'Você pode escolher a próxima música resgatando a recompensa "pedir musica" nos pontos do canal.',
    'Não esqueça de seguir o canal e digitar "!drops" para receber suas skins.',
  ];

  let currentMessageIndex = 0;

  setInterval(() => {
    const message = mensagens[currentMessageIndex];
    client.say(channel, message);

    currentMessageIndex++;
    if (currentMessageIndex >= mensagens.length) {
      currentMessageIndex = 0;
    }
  }, 1800000);
}

module.exports = msgAutomatic;
