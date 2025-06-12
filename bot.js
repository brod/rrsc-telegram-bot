const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const runAvailabilityCheck = require('./check-reservation');

const app = express();
const PORT = process.env.PORT || 3000;

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

// Health check endpoint for cron-job pings
app.get('/healthz', (req, res) => {
  res.send('✅ Bot is alive and running.');
});

// Start command
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

// General check command
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

// Day-specific commands (e.g., /mon, /tue)
const dayAbbreviations = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun'
};

Object.keys(dayAbbreviations).forEach((cmd) => {
  bot.onText(new RegExp(`/${cmd}`, 'i'), async (msg) => {
    const chatId = msg.chat.id;
    const filter = dayAbbreviations[cmd];

    bot.sendMessage(chatId, `🔍 Checking court availability (${filter})...`);

    try {
      const result = await runAvailabilityCheck(cmd); // pass "mon", "tue", etc.
      const chunks = result.match(/[\s\S]{1,4000}/g);
      for (const chunk of chunks) {
        await bot.sendMessage(chatId, chunk);
      }
    } catch (err) {
      bot.sendMessage(chatId, `❗ Error: ${err.message}`);
    }
  });
});

// Inline button handler
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

  bot.answerCallbackQuery(callbackQuery.id);
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.toLowerCase();

  if (
    !text.startsWith('/start') &&
    !text.startsWith('/check') &&
    !text.includes('court') &&
    !text.includes('availability') &&
    !text.includes('status') &&
    !Object.keys(dayAbbreviations).some(day => text.startsWith(`/${day}`))
  ) {
    bot.sendMessage(
      chatId,
      `🤖 Hello!\n\nTry one of these:\n• /check — all days\n• /mon — Mondays\n• /tue — Tuesdays\n• /wed — Wednesdays\n...and so on\n\nOr click the "Check Courts" button with /start`
    );
  }
});

app.listen(PORT, () => {
  console.log(`🌐 Express server running on port ${PORT}`);
});
