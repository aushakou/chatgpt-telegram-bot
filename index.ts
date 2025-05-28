import express, { Request, Response , Application } from 'express';
import dotenv from 'dotenv';

require("./telegramBot");

require('dotenv').config();

const app: Application = express();
const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send("bot is running...");
});

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
