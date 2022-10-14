const TgApi = require('node-telegram-bot-api')
const { start } = require('repl');
const { Sequelize } = require('sequelize');
const sequelize = require('./db');
const UserModel = require('./models');
require('dotenv').config();

const token = process.env.Bot_token;

const bot = new TgApi(token, {polling: true} )

const chats = {}

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Сейчас я загадаю цифру от 0 до 9, а ты должен ее угадать!')
    const randomNumber = Math.floor( Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Отгадывай', gameOptions)
}


const start = async () => {
    
    try {
        await Sequelize.autentificate()
        await Sequelize.sync()
        
    } catch (e) {
        console.log('Подключение к бд сломалось', e)
    }

    bot.setMyCommands([
        {command: '/start', description: 'Начальное приветствие'},
        {command: '/info', description: 'Получить инфу'},
        {command: '/game', description: 'Давай сыграем в угадайку'},


    ])

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        try { 
            if (text === '/start') {
                await UserModel.crate({chatId})
                await bot.sendMessage(chatId, 'Добро пожаловать!')
                return bot.sendMessage(chatId, 'https://tlgrm.ru/_/stickers/948/536/94853628-1df7-3d40-bad9-5c57b32dd5e8/2.webp')
            }
            if (text === '/info') {
                const user = await UserModel.findOne({chatId})
             return bot.sendMessage(chatId, ` Тебя зовут ${msg.from.first_name}`)
            }
            if (text === '/game') {
                return startGame(chatId);
            }
            return bot.sendMessage(chatId, 'Быканул???');
        } catch (e) {
            return bot.sendMessage(chatId, 'Произошла какая то ошибочка!)');
        }
    })


    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data === '/again'){
           return startGame(chatId)
        }
        const user = await UserModel.findOne({chatId})
        if(data == chats[chatId]) {
            user.right += 1;
            return await bot.sendMessage(chatId, `Поздравляю ты отгдала цифру ${chats[chatId]}`, againOptions)
        }
        else {
            user.wrong += 1;
            return bot.sendMessage(chatId, `Лох, это была цифра ${chats[chatId]}`, againOptions)
        }
        await user.save();
    })
}

start()