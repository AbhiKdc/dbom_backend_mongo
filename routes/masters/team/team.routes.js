import { Router } from "express";
import { add_team, dropdown_team, list_all_teams, update_team } from "../../../controllers/masters/team/team.controller.js";
import AuthMiddleware from "../../../middlewares/verifyToken.js";

const team_router = Router();

team_router.post("/add", AuthMiddleware, add_team);
team_router.patch("/update/:id", AuthMiddleware, update_team)
team_router.post("/list", AuthMiddleware, list_all_teams)
team_router.get("/dropdown", AuthMiddleware, dropdown_team);


export default team_router