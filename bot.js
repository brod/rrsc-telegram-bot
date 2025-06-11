const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const runAvailabilityCheck = require('./check-reservation'); 

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

bot.onText(/\/start/i, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, '👋 Welcome to the Round Rock Sport Center Court Availability Bot by Rucky! What would you like to do?', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Check Courts', callback_data: 'check_availability' }]
      ]
    }
  });
});

bot.onText(/\/check|court|availability|status/i, async (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, '🔍 Checking court availability...');

  try {
    const result = await runAvailabilityCheck();
    const chunks = result.match(/[\s\S]{1,4000}/g); 

    for (const chunk of chunks) {
      await bot.sendMessage(chatId, chunk);
    }
  } catch (err) {
    bot.sendMessage(chatId, `❗ Error: ${err.message}`);
  }
});

bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const action = callbackQuery.data;

  if (action === 'check_availability') {
    bot.sendMessage(chatId, '🔍 Checking court availability...');

    try {
      const result = await runAvailabilityCheck();
      const chunks = result.match(/[\s\S]{1,4000}/g);

      for (const chunk of chunks) {
        await bot.sendMessage(chatId, chunk);
      }
    } catch (err) {
      bot.sendMessage(chatId, `❗ Error: ${err.message}`);
    }
  }

  bot.answerCallbackQuery(callbackQuery.id); // Acknowledge click
});

// Catch-all: unrecognized messages
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.toLowerCase();

  if (
    !text.startsWith('/start') &&
    !text.startsWith('/check') &&
    !text.includes('court') &&
    !text.includes('availability') &&
    !text.includes('status')
  ) {
    bot.sendMessage(
      chatId,
      `🤖 Hi! I didn't understand that.\n\nYou can type:\n• /check\n• court\n• availability\n\nOr click the "Check Courts" button with /start`
    );
  }
});