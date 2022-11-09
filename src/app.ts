import "reflect-metadata";
import "express-async-errors";
import express from "express";
import cors from "cors";

import handleErrorMiddleware from "./middlewares/handleError.middleware";
import { appRoutes } from "./routes";
import updateReservationStatus from "./middlewares/updateReservationStatus.middleware";

const app = express();

app.use(cors());
app.use(express.json());

app.use(updateReservationStatus);
appRoutes(app);

app.use(handleErrorMiddleware);

export default app;
