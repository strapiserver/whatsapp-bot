import { Client, Message } from "whatsapp-web.js";
import db from "./db";

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

  send = (text: string) => {
    this.client.sendMessage(this.message.from, text);
    console.log(this.waiting);
  };
  waitingFor = (waiting: string) =>
    db.push(`.${this.message.from}.waiting`, waiting);
  setCoordinates = (latitude: number, longitude: number) =>
    db.push(`.${this.message.from}.coordinates`, { latitude, longitude });
}
