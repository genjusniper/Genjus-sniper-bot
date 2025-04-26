const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const token = process.env.TOKEN;
const bot = new TelegramBot(token, { polling: true });
const app = express();

const ADMIN_ID = 6104325632;
let users = [];

// Start Command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || msg.from.first_name;

  if (!users.some(u => u.id === chatId)) {
    users.push({ id: chatId, username });
  }

  const welcome = `Selamat datang di *Genju Sniper Trading Bot*!
Gunakan perintah berikut untuk melihat sinyal:

/xau - Emas (XAUUSD)
/btc - Bitcoin (BTCUSD)
/eth - Ethereum (ETHUSD)
/eurusd - EUR/USD

Hanya admin yang bisa mengirim sinyal manual.`;

  bot.sendMessage(chatId, welcome, { parse_mode: 'Markdown' });
});

const signalTemplates = {
  '/xau': { pair: 'XAUUSD', direction: 'BUY', entry: '2320.50', sl: '2316.00', tp: '2345.00', tf: 'M15' },
  '/btc': { pair: 'BTCUSD', direction: 'SELL', entry: '64900', sl: '65200', tp: '64000', tf: 'M15' },
  '/eth': { pair: 'ETHUSD', direction: 'BUY', entry: '3400', sl: '3365', tp: '3480', tf: 'M15' },
  '/eurusd': { pair: 'EURUSD', direction: 'SELL', entry: '1.0850', sl: '1.0880', tp: '1.0780', tf: 'M15' }
};

bot.onText(/\/(xau|btc|eth|eurusd)/, (msg, match) => {
  const chatId = msg.chat.id;
  const cmd = `/${match[1]}`;
  const signal = signalTemplates[cmd];
  if (!signal) return;

  const message = `📈 *SNIPER SIGNAL*
*Pair:* ${signal.pair}
*Arah:* ${signal.direction}
*Entry:* ${signal.entry}
*SL:* ${signal.sl}
*TP:* ${signal.tp}
*Timeframe:* ${signal.tf}`;

  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

bot.onText(/\/signal (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1];
  if (chatId !== ADMIN_ID) {
    return bot.sendMessage(chatId, '❌ Kamu tidak punya akses kirim sinyal.');
  }

  users.forEach(user => {
    bot.sendMessage(user.id, `📢 *SNIPER SIGNAL*\n${text}`, { parse_mode: 'Markdown' });
  });
});

bot.onText(/\/reminder/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '⏰ *REMINDER*: Jangan lupa OP XAU tadi jam 14:30! Cek Telegram untuk sinyal.', { parse_mode: 'Markdown' });
});

const PORT = process.env.PORT || 10000;
app.get("/", (req, res) => res.send("Genju Sniper Bot is Running..."));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
