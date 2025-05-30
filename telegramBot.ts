import { Bot, GrammyError, HttpError } from "grammy";
import { run, sequentialize } from "@grammyjs/runner";
import OpenAI from "openai";
import dotenv from 'dotenv';
import { Session } from './models/Session';
import { Log } from './models/Log';
import { User } from './models/User';
import { Message } from './models/Message';

dotenv.config();

const telegramToken = process.env['TELEGRAM_BOT_TOKEN'];
if (!telegramToken) throw new Error('TELEGRAM_BOT_TOKEN is not set');
const bot = new Bot(telegramToken);

const enabledIds = process.env.ENABLED_IDS
  ? process.env.ENABLED_IDS.split(',').map(id => parseInt(id.trim(), 10))
  : [];

const openaiToken = process.env['OPENAI_API_KEY'];
if (!openaiToken) throw new Error('OPENAI_API_KEY is not set');

// OpenAIApi required config
const client = new OpenAI({
  apiKey: openaiToken,
});

// grammY provides the sequentialize middleware that ensures that
// messages from the same chat are handled sequentially, preventing race conditions
bot.use(sequentialize((ctx) => ctx.chat?.id.toString()));

bot.command("profile", async (ctx) => {
  const timestamp = new Date();
  const [session, user] = await Promise.all([
    Session.findOne({ userId: ctx.from?.id.toString(), status: 'active' }),
    User.findOne({ telegramId: ctx.from?.id.toString() })
  ]);
  if (session) {
    if (session.startTime.getTime() < timestamp.getTime() - 1000 * 60 * 60 * parseInt(process.env.SESSION_TIMEOUT_HOURS || '5')) {
      session.status = 'ended';
      await session.save();
    }
  }
  // Create session and user if they don't exist
  const [newSession, newUser] = await Promise.all([
    !session || session.status === 'ended' ? new Session({
      userId: ctx.from?.id.toString(),
      createdAt: timestamp,
    }).save() : session,
    !user ? new User({
      username: ctx.from?.first_name + ' ' + ctx.from?.last_name || 'unknown',
      telegramId: ctx.from?.id?.toString() || 'unknown',
      createdAt: timestamp,
      apiAccess: enabledIds.includes(Number(ctx.from?.id)),
    }).save() : user
  ]);

  try {
    const logEntry = new Log({
      username: ctx.from?.first_name + ' ' + ctx.from?.last_name || 'unknown',
      userid: ctx.message?.chat.id.toString() || 'unknown',
      message: ctx.message?.text || 'unknown',
      timestamp,
    });
    await logEntry.save();
  } catch (error) {
    console.error('Error saving log:', error);
  }
  const message = ctx.message;
  if (message) {
    const chatId = message.chat.id;
    const m = "Profile\n"
            + "Name: " + ctx.from.first_name + " " + ctx.from.last_name + "\n"
            + "ID: " + chatId + "\n"
            + "Bot access: " + enabledIds.includes(chatId) + "\n"
            + "Total messages: " + newUser?.totalMessages;
    console.log(m);
    await ctx.reply(m);
  } else {
    await ctx.reply("Error. Message is undefined.");
  }
 });

bot.on("message", async (ctx) => {
  console.log(
    `${ctx.from.first_name} wrote ${
      "text" in ctx.message ? ctx.message.text : ""
    }`,
  );

  const timestamp = new Date();

  try {
    const logEntry = new Log({
      username: ctx.from?.first_name + ' ' + ctx.from?.last_name || 'unknown',
      userid: ctx.message?.chat.id.toString() || 'unknown',
      message: ctx.message?.text || 'unknown',
      timestamp,
    });
    await logEntry.save();
  } catch (error) {
    console.error('Error saving log:', error);
  }

  if (ctx.message.text && enabledIds.includes(ctx.message.chat.id)) {
    let m = ".";
    const sentMessage = await ctx.reply(m);

    let running = true;
    let dotCount = 1;

    // Start animation loop
    const interval = setInterval(async () => {
      if (!running) return;
      dotCount = (dotCount % 3) + 1; // loop between 1 to 3 dots
      m = ".".repeat(dotCount);
      try {
        await ctx.api.editMessageText(
          ctx.chat.id,
          sentMessage.message_id,
          m
        );
      } catch (err) {
        console.error("Failed to edit message:", err);
        if (err instanceof GrammyError && err.description.includes('Too Many Requests')) {
          running = false; // Stop animation if we hit rate limit
        }
      }
    }, 1000);

    // Await the response while the animation is running
    let response;
    let messageWithContext = ctx.message?.text;
    try {
      // Use Promise.all for parallel operations
      const [session, user] = await Promise.all([
        Session.findOne({ userId: ctx.from?.id.toString(), status: 'active' }),
        User.findOne({ telegramId: ctx.from?.id.toString() })
      ]);
  
      if (session) {
        if (session.startTime.getTime() < timestamp.getTime() - 1000 * 60 * 60 * parseInt(process.env.SESSION_TIMEOUT_HOURS || '5')) {
          session.status = 'ended';
          await session.save();
        }
      }
      // Create session and user if they don't exist
      const [newSession, newUser] = await Promise.all([
        !session || session.status === 'ended' ? new Session({
          userId: ctx.from?.id.toString(),
          createdAt: timestamp,
        }).save() : session,
        !user ? new User({
          username: ctx.from?.first_name + ' ' + ctx.from?.last_name || 'unknown',
          telegramId: ctx.from?.id?.toString() || 'unknown',
          createdAt: timestamp,
          apiAccess: enabledIds.includes(Number(ctx.from?.id)),
        }).save() : user
      ]);
      newUser.totalMessages++;
      await newUser.save();
      const userMessageHistory = await Message.find({ 
        session: newSession._id,
        sender: newUser._id 
      }).sort({ createdAt: 1 }).limit(100);
      const assistantMessageHistory = await Message.find({ 
        session: newSession._id,
        sender: (await User.findOne({ telegramId: "ChatGPT" }))?._id
      }).sort({ createdAt: 1 }).limit(100);
      // Create message with the guaranteed session and user
      const message = new Message({
        session: newSession._id,
        sender: newUser._id,
        content: ctx.message?.text || 'unknown',
        createdAt: timestamp,
      });
      await message.save();
      
      if (userMessageHistory.length > 0) {
        messageWithContext = "Earlier conversation:\n";
        for (let i = 0; i < userMessageHistory.length; i++) {
          if (userMessageHistory[i]) {
            messageWithContext += "User: " + userMessageHistory[i].content + "\n";
          }
          if (assistantMessageHistory[i]) {
            messageWithContext += "Assistant: " + assistantMessageHistory[i].content + "\n";
          }
        }
        messageWithContext += "\nCurrent question:\n" + ctx.message?.text;
      }
    } catch (error) {
      console.error('Error in database operations:', error);
    }
    if (process.env.OPENAI_API_ENABLED === 'true') {
      try {
        response = await client.responses.create({
          model: 'gpt-4o',
          instructions: '',
          tools: [ {
            type: "web_search_preview",
            search_context_size: "low",
          } ],
          input: messageWithContext,
        });
      } finally {
        running = false;
        clearInterval(interval);
      }
    } else {
      running = false;
      clearInterval(interval);
      response = {
        output_text: 'Sorry, ChatGPT API is disabled. New update is in progress!',
      };
    }

    try {
      // Final message
      await ctx.api.editMessageText(
        ctx.chat.id,
        sentMessage.message_id,
        response.output_text,
        { parse_mode: "Markdown" }
      );
      // Use Promise.all for parallel operations
      const [session, user] = await Promise.all([
        Session.findOne({ userId: ctx.from?.id.toString() }),
        User.findOne({ telegramId: "ChatGPT" })
      ]);
  
      // Create session and user if they don't exist
      const [newSession, newUser] = await Promise.all([
        !session ? new Session({
          userId: ctx.from?.id.toString(),
          createdAt: timestamp,
        }).save() : session,
        !user ? new User({
          username: "ChatGPT",
          telegramId: "ChatGPT",
          createdAt: timestamp,
          apiAccess: false
        }).save() : user
      ]);
  
      // Create message with the guaranteed session and user
      const message = new Message({
        session: newSession._id,
        sender: newUser._id,
        content: response.output_text || 'unknown',
        createdAt: timestamp,
      });
      await message.save();
    } catch (error) {
      console.error('Error in database operations:', error);
    }

    try {
      const logEntry = new Log({
        username: 'ChatGPT',
        userid: ctx.message.chat.id.toString(),
        message: response.output_text || 'unknown',
        timestamp,
      });
      await logEntry.save();
    } catch (error) {
      console.error('Error saving log:', error);
    }
  } else {
    await ctx.reply("User is not authorized to use this bot.");
  }
});

// Error Handling
bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
      console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
      console.error("Could not contact Telegram:", e);
    } else {
      console.error("Unknown error:", e);
    }
  });

// Start the Bot
// grammyjs/runner plugin enables concurrent processing of updates,
// allowing telegram bot to handle multiple user interactions in parallel without interference
run(bot);
