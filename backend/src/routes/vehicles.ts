import { NextFunction, Request, Response, Router } from "express";
import { requireAdmin } from "../middleware/auth";
import { VehicleService } from "../services/vehicleService";
import { HttpError } from "../types";

// turns the :id from the url into a number or throws a 400
function parseId(req: Request): number {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    throw new HttpError(400, "Invalid vehicle id");
  }
  return id;
}

export function vehicleRouter(service: VehicleService) {
  const router = Router();

  // small wrapper so every handler doesn't need its own try/catch
  const handle =
    (fn: (req: Request, res: Response) => void) => (req: Request, res: Response, next: NextFunction) => {
      try {
        fn(req, res);
      } catch (err) {
        next(err);
      }
    };

  router.get("/", handle((_req, res) => {
    res.json(service.getAll());
  }));

  // NOTE: this has to come before any "/:id" route or "search" would be treated as an id
  router.get("/search", handle((req, res) => {
    res.json(service.search(req.query as any));
  }));

  router.post("/", handle((req, res) => {
    res.status(201).json(service.create(req.body));
  }));

  router.put("/:id", handle((req, res) => {
    res.json(service.update(parseId(req), req.body));
  }));

  router.delete("/:id", requireAdmin, handle((req, res) => {
    service.delete(parseId(req));
    res.status(204).send();
  }));


  router.post("/:id/purchase", handle((req, res) => {
    const vehicle = service.purchase(parseId(req), req.body?.quantity);
    res.json(vehicle);
  }));

  router.post("/:id/restock", requireAdmin, handle((req, res) => {
    const vehicle = service.restock(parseId(req), req.body?.quantity);
    res.json(vehicle);
  }));

  return router;
}
