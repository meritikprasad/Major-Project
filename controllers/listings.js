// const { urlencoded } = require('express');
const Listing = require('../models/listing.js');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async (req, res) => {  // forgot async and await
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });  // no slash at starting
};

module.exports.renderNewForm = (req, res) => {
    // if(!req.isAuthenticated()) {
    //     req.flash("error", "you must be logged in to create listing!");
    //     return res.redirect("/login");
    // }
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");  // 4th using flash variable and defining it
        return res.redirect("/listings"); // maam didn't add return
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    // let {title, description, image, price, country, location} = req.body;
    // let listing = req.body.listing;

    //one way
    // if(!req.body.listing){
    //     throw new ExpressError(400, "send valid data for listing");
    // }
    // if(!newListing.title) {
    //     throw new ExpressError(400, "Title is missing");
    // }
    // if(!newListing.description) {
    //     throw new ExpressError(400, "Description is missing");
    // }
    // if(!newListing.location) {
    //     throw new ExpressError(400, "Location is missing");
    // }

    //or the other way -shifted above

    let response = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1
        })
        .send();
    // .then(response => {
    //     const match = response.body;
    // });


    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = response.body.features[0].geometry;
    let savedListing = await newListing.save();
    
    console.log("saved listing is : \n", savedListing);

    req.flash("success", "New Listing Created"); // 4th using flash variable and defining it
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "listing you requested to Edit for does not exist");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250"); // waah use of string replace
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    if (!req.body.listing) {
        throw new ExpressError(400, "send valid data for listing");
    }

    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });  // revise but felt here
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
        console.log(listing);
    }

    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    // console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};