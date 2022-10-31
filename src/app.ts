import "reflect-metadata";
import "express-async-errors";
import express from "express";
import cors from "cors";

import { Request, Response } from "express";
import userRoutes from "./routes/user.routes";
import handleErrorMiddleware from "./middlewares/handleError.middleware";
import petsRoutes from "./routes/pets.routes";
import roomsRoutes from "./routes/rooms.routes";

const app = express();
app.use(cors());

app.use(express.json());
app.use(userRoutes);
app.use("/pets", petsRoutes);
app.use("/rooms", roomsRoutes);
app.use(handleErrorMiddleware);

app.get("/", (req: Request, res: Response) => {
  return res.json({ message: "Hello World!" });
});

export default app;
