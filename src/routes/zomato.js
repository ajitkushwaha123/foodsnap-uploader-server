import express from "express";
import { scrapeZomatoMenu } from "../controller/zomato-controller.js";

const zomatoRoutes = express.Router();

zomatoRoutes.post("/scrape", scrapeZomatoMenu);

export default zomatoRoutes;
