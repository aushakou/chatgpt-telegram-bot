import { Bot, GrammyError, HttpError } from "grammy";
import OpenAI from "openai";

require('dotenv').config();

const telegramToken = process.env['TELEGRAM_BOT_TOKEN'];
if (!telegramToken) throw new Error('TELEGRAM_BOT_TOKEN is not set');
const bot = new Bot(telegramToken);

// test ids
const enabledIds = [307438771];

const openaiToken = process.env['OPENAI_API_KEY'];
if (!openaiToken) throw new Error('OPENAI_API_KEY is not set');

// OpenAIApi required config
const client = new OpenAI({
  apiKey: openaiToken,
});

bot.command("profile", async (ctx) => {
  const message = ctx.message;
  if (message) {
    const chatId = message.chat.id;
    const m = "Profile\n"
            + "Name: " + ctx.from.first_name + " " + ctx.from.last_name + "\n"
            + "ID: " + chatId + "\n"
            + "Bot access: " + enabledIds.includes(chatId);
    console.log(m);
    await ctx.reply(m);
  } else {
    await ctx.reply("Error. Message is undefined.");
  }
 });

//This function would be added to the dispatcher as a handler for messages coming from the Bot API
bot.on("message", async (ctx) => {
  //Print to console
  console.log(
    `${ctx.from.first_name} wrote ${
      "text" in ctx.message ? ctx.message.text : ""
    }`,
  );

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
      }
    }, 500); // update every 500ms

    // Await the response while the animation is running
    let response;
    try {
      response = await client.responses.create({
        model: 'gpt-4o',
        instructions: '',
        input: ctx.message.text,
      });
    } finally {
      running = false;
      clearInterval(interval);
    }

    // Final message
    await ctx.api.editMessageText(
      ctx.chat.id,
      sentMessage.message_id,
      response.output_text,
      { parse_mode: "Markdown" }
    );
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

//Start the Bot
bot.start();
