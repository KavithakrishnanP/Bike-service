import express from "express";
import {
  createServiceController,
  deleteServiceController,
  getServiceController,
  getSingleServiceController,
  servicePhotoController,
  updateServiceController,
  serviceListController,
  braintreeTokenController,
  brainTreePaymentController
} from "../controllers/ServiceController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import formidable from "express-formidable";

const router = express.Router();

//routes
router.post(
  "/create-service",
  requireSignIn,
  isAdmin,
  formidable(),
  createServiceController
);
//routes
router.put(
  "/update-service/:sid",
  requireSignIn,
  isAdmin,
  formidable(),
  updateServiceController
);

//get service
router.get("/get-service", getServiceController);

//single service
router.get("/get-service/:slug", getSingleServiceController);

//get photo
router.get("/service-photo/:sid", servicePhotoController);

//delete service
router.delete("/delete-service/:sid", deleteServiceController);


//product per page
router.get("/service-list/:page", serviceListController);

//payments routes
//token
router.get("/braintree/token", braintreeTokenController);


//payments
router.post("/braintree/payment", requireSignIn, brainTreePaymentController);
export default router;