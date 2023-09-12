import qrcode from "qrcode-terminal";
import {
  Buttons,
  Client,
  List,
  LocalAuth,
  Location,
  MessageMedia,
} from "whatsapp-web.js";
import { coordinatesRegex } from "./helper";
import db from "./db";
import { Session } from "./session";
import startReminder from "./startReminder";

const client = new Client({
  authStrategy: new LocalAuth(),
  // proxyAuthentication: { username: 'username', password: 'password' },
  puppeteer: {
    // args: ['--proxy-server=proxy-server-that-requires-authentication.example.com'],
    //headless: false,
  },
});
//https://wa.me/79626876107?text=start
// check image metadata or compare to previous
// add users via QR code or link
// create multiple visitkas!

client.initialize();
startReminder();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("AUTHENTICATED");
});

client.on("ready", () => {
  console.log("Client is ready!");
});

/////////////

client.on("message", async (message) => {
  const session = new Session(message, client);

  // if (session.waiting === "start") {
  //   session.send("started");
  //   session.waitingFor("end");
  //   return;
  // }
  if (session.m === "restart") {
    session.send("🧹 The exchanger was removed");
    session.sendMenu();
    session.waitingFor("start");
    return;
  }

  //// REGISTRATION + RATES UPDATE PROCESS

  switch (session.waiting) {
    case "start":
      session.send("📍 If you are in exchanger now please send your location");
      session.waitingFor("location");
      break;

    case "location":
      if (message.location) {
        const { latitude, longitude } = message.location;
        session.send(`✅ Your exchanger location is set!`);
        session.send(
          `${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}`
        );
        session.setCoordinates(+latitude, +longitude);
        session.send("📸 Now make a picture of the exchanger outside", 4000);
        session.waitingFor("exchanger_picture");
        break;
      }
      if (session.m.match(coordinatesRegex)) {
        const [latitude, longitude] = session.m
          .replace(/[{( )}]/g, "")
          .split(",");
        session.setCoordinates(+latitude, +longitude);
        console.log(+latitude, +longitude);
        session.send("📸 Now make a picture of the exchanger outside");
        session.waitingFor("exchanger_picture");
        break;
      }
      session.send("📍 Please send location like in example:");
      session.send("_41.03325,   28.98181_");
      session.send("Or choose command: ");
      session.sendMenu();
      break;

    case "exchanger_picture":
      if (session.m === "skip") {
        session.send("📸 You skipped setting exchanger image");
        session.registerExchanger();
        session.waitingFor("ready");
        break;
      }
      const exchangerImage = await session.checkImage();
      if (exchangerImage) {
        session.registerExchanger();
        session.waitingFor("ready");
        break;
      }
      session.send("📸 Waiting for exchanger picture");
      session.send("⏭️ Type *skip* if you can't make a picture now");
      session.send("Or choose command: ");
      session.sendMenu();
      break;

    case "ready":
      const ratesImage = await session.checkImage();
      if (ratesImage) {
        session.send(`🔍 Your rates will be updated after AI recognition`);
        session.send(
          "⌛ After 6 hours you will be reminded to retake photo",
          4000
        );
        break;
      }
    default:
      session.sendMenu();
  }

  // session.send("Now make a picture of your exchange rates 📸");
  // session.waitingFor("location");

  // if (message.hasMedia) {
  //   const { mimetype, filesize } = await message.downloadMedia();
  //   console.log(mimetype, " fileSize: ", filesize);
  //   if (mimetype === "image/jpeg" && filesize && filesize < 5_000_000) {
  //     sm("Your rates will be recognized and updated... ⌛");
  //   } else {
  //     sm("Wrong image format or too big");
  //   }
  //   return;
  // }
  // if (message.location) {
  //   const { latitude, longitude } = message.location;
  //   sm(`Your exchanger location is set to:`);
  //   sm(`${Number(latitude).toFixed(4)} ${Number(longitude).toFixed(4)}`);
  //   sm("Now make a picture of your exchange rates 📸");
  //   return;
  // }
  // if (m === "start") {
  //   sm(
  //     "If you are in the exchanger now please send your location. If not please send the сoordinates as in example:"
  //   );
  //   sm("_41.03325,   28.98181_");
  // } else if (m.match(coordinatesRegex)) {
  //   const [latitude, longitude] = m.split(" ");
  //   sm("The coordinates for exchanger were set");
  //   sm("Now make a picture of your exchange rates 📸");
  //   console.log(parseFloat(latitude), parseFloat(longitude));
  // } else if (m === "human") {
  //   sm("Please wait for an operator to join the dialogue... ⌛");
  // } else {
  //   sm(
  //     "Please type *start* to restart again or *human* to talk to an operator."
  //   );
  // }
});
