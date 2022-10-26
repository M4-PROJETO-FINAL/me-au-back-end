import express from "express";
import "reflect-metadata";
import { Request, Response } from "express";

const app = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  return res.json({ message: "Hello World!" });
});

export default app;
