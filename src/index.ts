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

const sendMessage = (from: string, text: string) =>
  client.sendMessage(from, text);

client.on("message", async (message) => {
  const sm = (text: string) => sendMessage(message.from, text);
  const m = message.body.toLowerCase();
  console.log("client.info: ", client.info);

  if (message.hasMedia) {
    const { mimetype, filesize } = await message.downloadMedia();
    console.log(mimetype, " fileSize: ", filesize);
    if (mimetype === "image/jpeg" && filesize && filesize < 5_000_000) {
      sm("Your rates will be recognized and updated... ⌛");
    } else {
      sm("Wrong image format or too big");
    }
    return;
  }
  if (message.location) {
    const { latitude, longitude } = message.location;
    sm(`Your exchanger location is set to:`);
    sm(`${Number(latitude).toFixed(4)} ${Number(longitude).toFixed(4)}`);
    sm("Now make a picture of your exchange rates 📸");
    return;
  }
  if (m === "start") {
    sm(
      "If you are in the exchanger now please send your location. If not please send the сoordinates as in example:"
    );
    sm("_41.03325,   28.98181_");
  } else if (m.match(coordinatesRegex)) {
    const [latitude, longitude] = m.split(" ");
    sm("The coordinates for exchanger were set");
    sm("Now make a picture of your exchange rates 📸");
    console.log(parseFloat(latitude), parseFloat(longitude));
  } else if (m === "human") {
    sm("Please wait for an operator to join the dialogue... ⌛");
  } else {
    sm(
      "Please type *start* to restart again or *human* to talk to an operator."
    );
  }
});
