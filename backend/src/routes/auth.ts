import { Router } from "express";
import { UserService } from "../services/userService";

export function authRouter(userService: UserService) {
  const router = Router();

  router.post("/register", (req, res, next) => {
    try {
      const user = userService.register(req.body.email, req.body.password);
      res.status(201).json({ user });
    } catch (err) {
      next(err);
    }
  });

  router.post("/login", (req, res, next) => {
    try {
      res.json(userService.login(req.body.email, req.body.password));
    } catch (err) {
      next(err);
    }
  });

  return router;
}
