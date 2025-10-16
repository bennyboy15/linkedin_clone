import { MailtrapClient } from "mailtrap";
import {config} from "dotenv";

config();

const TOKEN = process.env.MAILTRAP_TOKEN;

export const mailtrapClient = new MailtrapClient({
    token: TOKEN
});

export const sender = {
    email: process.env.MAILTRAP_SENDER,
    name: process.env.MAILTRAP_SENDER_NAME
}
