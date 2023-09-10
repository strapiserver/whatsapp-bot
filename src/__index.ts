import Fastify from "fastify";

import { Telegraf, Markup } from "telegraf";

import dotenv from "dotenv";
dotenv.config();
const token = process.env.BOT_TOKEN || "";

const server = Fastify({
  logger: true,
});

const bot = new Telegraf(token);

bot.start((ctx) => ctx.reply(ctx.startPayload));
bot.help((ctx) => ctx.reply("Send me a sticker"));

bot.hears("hi", (ctx) => {
  const match = ctx.match;
  ctx.reply(JSON.stringify(match));
});
bot.launch();

// Declare a route
server.get("/", function (request, reply) {
  reply.send({ hello: "world" });
});

const port = +(process.env.PORT || 4444);
// Run the server!
const start = async () => {
  try {
    await server.listen({ port, host: "0.0.0.0" });
  } catch (error) {
    server.log.error(error);
    process.exit(1);
    ("test");
  }
};
start();
