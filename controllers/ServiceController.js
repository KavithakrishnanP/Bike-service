import ServicesModel from "../models/ServicesModel.js";
import OrderModel from "../models/OrderModel.js";
import fs from "fs";
import slugify from "slugify";
import braintree from "braintree";
import dotenv from "dotenv";

dotenv.config();

//payment gateway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export const createServiceController = async (req, res) => {
  try {
    const { name, description, cost, price,  shipping } =
      req.fields;
    const { photo } = req.files;
    //Validation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case description:
        return res.status(500).send({ error: "Description is Required" });
        case !cost:
        return res.status(500).send({ error: "Cost is Required" });
      case !price:
        return res.status(500).send({ error: "Price is Required" });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: "photo is Required and should be less then 1mb" });
    }

    const service = new ServicesModel({ ...req.fields, slug: slugify(name) });
    if (photo) {
        service.photo.data = fs.readFileSync(photo.path);
        service.photo.contentType = photo.type;
    }
    await service.save();
    res.status(201).send({
      success: true,
      message: "Service Created Successfully",
      service,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating service",
    });
  }
};

//get all products
export const getServiceController = async (req, res) => {
  try {
    const services = await ServicesModel
      .find({})
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      counTotal: services.length,
      message: "Allservice ",
      services,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr in getting service",
      error: error.message,
    });
  }
};

// get single product
export const getSingleServiceController = async (req, res) => {
  try {
    const service = await ServicesModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
    res.status(200).send({
      success: true,
      message: "Single service Fetched",
      service,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting single service",
      error,
    });
  }
};

// get photo
export const servicePhotoController = async (req, res) => {
  try {
    const service = await ServicesModel.findById(req.params.sid).select("photo");
    if ( service.photo.data) {
      res.set("Content-type", service.photo.contentType);
      return res.status(200).send(service.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting photo",
      error,
    });
  }
};

//delete controller
export const deleteServiceController = async (req, res) => {
  try {
    await ServicesModel.findByIdAndDelete(req.params.sid).select("-photo");
    res.status(200).send({
      success: true,
      message: "Service Deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting service",
      error,
    });
  }
};

//update controller
export const updateServiceController = async (req, res) => {
  try {
    const { name, description, price, booking} =
      req.fields;
    const { photo } = req.files;
    //Validation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !price:
        return res.status(500).send({ error: "Price is Required" });
      
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: "photo is Required and should be less then 1mb" });
    }

    const service = await ServicesModel.findByIdAndUpdate(
      req.params.sid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );
    if (photo) {
        service.photo.data = fs.readFileSync(photo.path);
        service.photo.contentType = photo.type;
    }
    await service.save();
    res.status(201).send({
      success: true,
      message: "service Updated Successfully",
      service,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Update service",
    });
  }
};

export const serviceListController = async (req, res) => {
  try {
    const perPage = 2;
    const page = req.params.page ? req.params.page : 1;
    const services = await ServicesModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      services,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in per page ctrl",
      error,
    });
  }
};

//payment gateway api
//token
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};


//payment
export const brainTreePaymentController = async (req, res) => {
  try {
    const { nonce, cart } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new OrderModel({
            services: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};