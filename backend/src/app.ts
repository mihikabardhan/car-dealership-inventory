import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { DB } from "./db";
import { authenticate } from "./middleware/auth";
import { authRouter } from "./routes/auth";
import { vehicleRouter } from "./routes/vehicles";
import { UserService } from "./services/userService";
import { VehicleService } from "./services/vehicleService";
import { HttpError } from "./types";

// We pass the db in so tests can use their own database file
export function createApp(db: DB) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const userService = new UserService(db);
  const vehicleService = new VehicleService(db);

  app.use("/api/auth", authRouter(userService));
  // everything under /api/vehicles needs a valid token
  app.use("/api/vehicles", authenticate, vehicleRouter(vehicleService));

  // central error handler, any next(err) ends up here
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  });

  return app;
}
