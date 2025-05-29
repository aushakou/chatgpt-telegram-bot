import express, { Request, Response , Application } from 'express';
import { connectToMongoose } from './config/mongoose';
import dotenv from 'dotenv';

require("./telegramBot");

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send("bot is running...");
});

connectToMongoose().then(() => {
  app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
  });
});
