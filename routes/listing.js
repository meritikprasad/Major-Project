const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require('../models/listing.js');
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require('../controllers/listings.js');
// const {index} = require('../controllers/listings.js'); // it works too
const multer  = require('multer');
const {storage} = require('../cloudConfig.js');
const upload = multer({ storage });
// const upload = multer({ dest: 'uploads/' });

// New Route - this is should be above /:id or new be taken as id
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Index and Create Route
router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing));

// Show, Update and Delete Route
router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, upload.single("listing[image]"), isOwner, validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;



// Show Route
// router.get("/:id", wrapAsync(listingController.showListing));
// Update Route
// router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing));
// Delete Route
// router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));
// Index Route
// router.get("/", wrapAsync(listingController.index));
// Create Route
// router.post("/", isLoggedIn, validateListing, wrapAsync(listingController.createListing));