const TgApi = require("node-telegram-bot-api");
const { start } = require("repl");
const { gameOptions, againOptions } = require("./options");
require("dotenv").config();

const token = process.env.Bot_token;

const bot = new TgApi(token, { polling: true });

const chats = {};

const startGame = async (chatId) => {
  await bot.sendMessage(
    chatId,
    "Сейчас я загадаю цифру от 0 до 9, а ты должен ее угадать!"
  );
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, "Отгадывай", gameOptions);
};

try {
} catch (e) {
  console.log("Подключение к бд сломалось", e);
}

bot.setMyCommands([
  { command: "/start", description: "Начальное приветствие" },
  { command: "/info", description: "Получить инфу" },
  { command: "/game", description: "Давай сыграем в угадайку" },
]);

bot.on("message", async (msg) => {
  const text = msg.text;
  const chatId = msg.chat.id;
  try {
    if (text === "/start") {
      await bot.sendMessage(chatId, "Добро пожаловать!");
      return bot.sendSticker(
        chatId,
        "https://chpic.su/_data/stickers/y/Yebenks_by_fStikBot/Yebenks_by_fStikBot_119.webp"
      );
    }
    if (text === "/info") {
      return bot.sendMessage(chatId, ` Тебя зовут ${msg.from.first_name}`);
    }
    if (text === "/game") {
      return startGame(chatId);
    }
    return bot.sendMessage(chatId, "Быканул???");
  } catch (e) {
    return bot.sendMessage(chatId, "Произошла какая то ошибочка!)");
  }
});

bot.on("callback_query", async (msg) => {
  const data = msg.data;
  const chatId = msg.message.chat.id;
  if (data === "/again") {
    return startGame(chatId);
  }

  if (data == chats[chatId]) {
    return await bot.sendMessage(
      chatId,
      `Поздравляю ты отгдала цифру ${chats[chatId]}`,
      againOptions
    );
  } else {
    return bot.sendMessage(
      chatId,
      `Лох, это была цифра ${chats[chatId]}`,
      againOptions
    );
  }
});

start();
