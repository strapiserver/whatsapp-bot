import { Client, Message, MessageMedia } from "whatsapp-web.js";
import db from "./db";
import fs from "fs";
import callStrapi from "./gql/callStrapi";
import { createExchangerMutation } from "./gql/queries";

export class Session {
  message: Message;
  client: Client;
  waiting: string;
  m: string;

  constructor(message: Message, client: Client) {
    this.message = message;
    this.client = client;
    this.waiting = db.exists(`.${message.from}.waiting`)
      ? db.getData(`.${message.from}.waiting`)
      : "start";
    this.m = message.body.toLowerCase();
  }

  send = (m: string | MessageMedia, timeout?: number) => {
    const f = () => this.client.sendMessage(this.message.from, m);
    timeout ? setTimeout(f, timeout) : f();
  };

  waitingFor = (waiting: string) =>
    db.push(`.${this.message.from}.waiting`, waiting);

  setCoordinates = (latitude: number, longitude: number) =>
    db.push(`.${this.message.from}.coordinates`, { latitude, longitude });

  checkImage = async () => {
    if (this.message.hasMedia) {
      const { mimetype, filesize, data } = await this.message.downloadMedia();
      if (mimetype === "image/jpeg" && filesize && filesize < 5_000_000) {
        return data;
      } else {
        this.send("Wrong image format or too big!");
      }
      return;
    }
  };

  sendMenu = () => {
    this.waiting === "ready" && this.send("*open* - open exchanger");
    this.waiting === "ready" && this.send("*close* - close exchanger");
    this.send("*restart* - register exchanger");
    this.send("*human* - talk to an operator");
  };

  sendImage = (name: string) => {
    const exampleImage = fs.readFileSync(`./src/public/${name}.jpg`, "base64");
    const media = new MessageMedia("image/jpg", exampleImage);
    this.send(media);
  };

  registerExchanger = () => {
    db.save();
    const registrationData = db.getData(`.${this.message.from}`);
    const { latitude, longitude } = registrationData.coordinates;

    callStrapi(createExchangerMutation, {
      lat: latitude,
      lng: longitude,
      contact: this.message.from,
      opened: true,
    });
    this.send("✅ The exchanger is registered!");
    this.send("💲 Please make a picture of USD/EUR rates like in example:");
    this.sendImage("ratesExample");
    this.send("✨ The AI system will recognize rates and update map", 4000);
  };
}
