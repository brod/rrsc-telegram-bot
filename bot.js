// bot.js
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const runAvailabilityCheck = require('./check-reservation');

const app = express();
const PORT = process.env.PORT || 3000;

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

// Health check endpoint
app.get('/healthz', (req, res) => {
  console.log('💓 Health check received');
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

// Day-specific commands
const dayAbbreviations = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun'
};

Object.keys(dayAbbreviations).forEach((cmd) => {
  bot.onText(new RegExp(`/${cmd}`, 'i'), async (msg) => {
    const chatId = msg.chat.id;
    const filter = dayAbbreviations[cmd];
    bot.sendMessage(chatId, `🔍 Checking court availability (${filter})...`);
    try {
      const result = await runAvailabilityCheck(cmd);
      const chunks = result.match(/[\s\S]{1,4000}/g);
      for (const chunk of chunks) {
        await bot.sendMessage(chatId, chunk);
      }
    } catch (err) {
      bot.sendMessage(chatId, `❗ Error: ${err.message}`);
    }
  });
});

// All days (Mon–Sun)
bot.onText(/\/all/i, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `📅 Checking availability for all days (Mon–Sun)...`);
  try {
    const result = await runAvailabilityCheck('all');
    const chunks = result.match(/[\s\S]{1,4000}/g);
    for (const chunk of chunks) {
      await bot.sendMessage(chatId, chunk);
    }
  } catch (err) {
    bot.sendMessage(chatId, `❗ Error: ${err.message}`);
  }
});

// Month-specific commands
const validMonths = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

validMonths.forEach((month) => {
  bot.onText(new RegExp(`/${month}`, 'i'), async (msg) => {
    const chatId = msg.chat.id;
    const label = month.charAt(0).toUpperCase() + month.slice(1);
    bot.sendMessage(chatId, `📅 Checking court availability for ${label}...`);
    try {
      const result = await runAvailabilityCheck(null, month);
      const chunks = result.match(/[\s\S]{1,4000}/g);
      for (const chunk of chunks) {
        await bot.sendMessage(chatId, chunk);
      }
    } catch (err) {
      bot.sendMessage(chatId, `❗ Error: ${err.message}`);
    }
  });
});

// Fallback for unrecognized input
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.toLowerCase();
  if (
    !text.startsWith('/start') &&
    !text.startsWith('/check') &&
    !text.includes('court') &&
    !text.includes('availability') &&
    !text.includes('status') &&
    !Object.keys(dayAbbreviations).some(day => text.startsWith(`/${day}`)) &&
    !validMonths.some(month => text.startsWith(`/${month}`)) &&
    !text.startsWith('/all')
  ) {
    bot.sendMessage(
      chatId,
      `🤖 Hello!
        Try one of these:
        • /check — Mon–Wed
        • /all — all days
        • /mon — Mondays
        • /june — June only
        ...and so on

        Or click the "Check Courts" button with /start`
    );
  }
});

bot.on('polling_error', (error) => {
  console.error('🚨 Polling error:', error.message || error);
});

app.listen(PORT, () => {
  console.log(`🌐 Express server running on port ${PORT}`);
});
