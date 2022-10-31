import "reflect-metadata";
import "express-async-errors";
import express from "express";
import cors from "cors";

import userRoutes from "./routes/user.routes";
import handleErrorMiddleware from "./middlewares/handleError.middleware";
import petsRoutes from "./routes/pets.routes";
import reviewRoutes from "./routes/reviews.routes";
import serviceRoutes from "./routes/services.routes";
import reservationRoutes from "./routes/reservations.routes";

const app = express();
app.use(cors());

app.use(express.json());
app.use(userRoutes);
app.use(reviewRoutes);
app.use(serviceRoutes);
app.use("/pets", petsRoutes);
app.use("/reservations", reservationRoutes);
app.use(handleErrorMiddleware);

export default app;
