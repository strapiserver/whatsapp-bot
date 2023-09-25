import { Client, Message, MessageMedia } from "whatsapp-web.js";
import db from "./db";

import fs, { createReadStream } from "fs";
import callStrapi from "./gql/callStrapi";
import { uploadMutation, createExchangerMutation } from "./gql/queries";

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
      }
      this.send("Wrong image format or too big!");
      return;
    }
    return;
  };

  sendMenu = () => {
    this.send("Type one of commands:");
    this.waiting === "ready" && this.send("*open* - activate exchanger");
    this.waiting === "ready" && this.send("*close* - disable exchanger");
    this.send("*restart* - register exchanger");
    this.send("*human* - talk to an operator");
  };

  sendImage = (name: string) => {
    const exampleImage = fs.readFileSync(`./src/public/${name}.jpg`, "base64");
    const media = new MessageMedia("image/jpg", exampleImage);
    this.send(media);
  };

  registerExchanger = async () => {
    db.save();
    const registrationData = db.getData(`.${this.message.from}`);
    const { latitude, longitude } = registrationData.coordinates;

    callStrapi(createExchangerMutation, {
      lat: latitude,
      lng: longitude,
      contact: this.message.from,
      opened: true,
    });

    // const { FormData } = require("formdata-node");
    // const file = await blobFrom("./1.png", "image/png");
    // const form = new FormData();

    // form.append("files", file, "1.png");

    this.send("✅ The exchanger is registered!");
    this.send("💲 Please make a picture of USD/EUR rates like in example:");
    this.sendImage("ratesExample");
    this.send(
      "✨ The AI system will recognize rates and update it on the map",
      4000
    );
  };

  uploadImage = (file: any) => {
    // const blob = new Blob(file);
    callStrapi(uploadMutation, {
      file: {},
      refId: "1",
      ref: "api::physical-exchanger.physical-exchanger",
      field: "photo",
      info: {
        name: "test2",
        alternativeText: "",
        caption: "test2",
      },
    });
  };
}
