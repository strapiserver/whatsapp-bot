import db from "./db";
import callStrapi from "./gql/callStrapi";
import { AuthMutation } from "./gql/queries";
import dotenv from "dotenv";

dotenv.config();

const Authenticate = async () => {
  const data = await callStrapi(AuthMutation, {
    identifier: process.env.USERNAME,
    password: process.env.PASSWORD,
  });

  if (!data) {
    console.log(
      "📙 \u001b[1;33m  Still waiting for connection, retrying in 5s..."
    );
    setTimeout(() => Authenticate(), 15000);
    return;
  }
  const jwt = data?.login?.jwt;
  if (jwt) {
    console.log("📗 \u001b[1;32m Authorized successfully!");
    db.push(".jwt", jwt);
    db.save();

    return;
  }
  console.error("📙 \u001b[1;33m couldn't authtorize");
  return;
};

export default Authenticate;
