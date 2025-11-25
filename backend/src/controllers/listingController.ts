import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Business from "../models/Business";

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Private (Seller)
export const createListing = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      category,
      description,
      location,
      financials,
      revenue,
      profit,
      askingPrice,
      images,
      yearEstablished,
      employees,
      website,
      reasonForSelling,
      details,
    } = req.body;

    // Handle financials (support both nested and flat structure)
    const financialsData = financials || {
      revenue,
      profit,
      askingPrice,
    };

    // Handle details (support both nested and flat structure)
    const detailsData = details || {
      yearEstablished,
      employees,
      website,
      reasonForSelling,
    };

    const listing = await Business.create({
      sellerId: req.user?._id,
      title,
      category,
      description,
      location,
      financials: financialsData,
      details: detailsData,
      images: images || [],
    });

    res.status(201).json(listing);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all listings with filters
// @route   GET /api/listings
// @access  Public
export const getListings = async (req: AuthRequest, res: Response) => {
  try {
    const { search, category, minPrice, maxPrice, location } = req.query;

    let query: any = { status: "approved" }; // Only show approved listings publicly

    // Text Search
    if (search) {
      query.$text = { $search: search as string };
    }

    // Filters
    if (category && category !== "all") {
      query.category = category;
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (minPrice || maxPrice) {
      query["financials.askingPrice"] = {};
      if (minPrice) query["financials.askingPrice"].$gte = Number(minPrice);
      if (maxPrice) query["financials.askingPrice"].$lte = Number(maxPrice);
    }

    const listings = await Business.find(query).populate(
      "sellerId",
      "profile.name profile.avatarUrl"
    );
    res.json(listings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Public (with restrictions for non-approved listings)
export const getListingById = async (req: AuthRequest, res: Response) => {
  try {
    const listing = await Business.findById(req.params.id).populate(
      "sellerId",
      "profile.name profile.avatarUrl email supabaseId"
    );

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Check if listing is public (approved)
    // If not, only owner or admin can view
    if (listing.status !== "approved") {
      const userId = req.user?._id?.toString();
      const sellerId = listing.sellerId.toString();
      const isOwner = userId === sellerId;
      const isAdmin = req.user?.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          message: "This listing is not publicly available",
        });
      }
    }

    res.json(listing);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private (Seller)
export const updateListing = async (req: AuthRequest, res: Response) => {
  try {
    const listing = await Business.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Check ownership
    if (
      listing.sellerId.toString() !== req.user?._id.toString() &&
      req.user?.role !== "admin"
    ) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const updatedListing = await Business.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedListing);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private (Seller/Admin)
export const deleteListing = async (req: AuthRequest, res: Response) => {
  try {
    const listing = await Business.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (
      listing.sellerId.toString() !== req.user?._id.toString() &&
      req.user?.role !== "admin"
    ) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await listing.deleteOne();
    res.json({ message: "Listing removed" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current seller's listings
// @route   GET /api/listings/my-listings
// @access  Private (Seller)
export const getMyListings = async (req: AuthRequest, res: Response) => {
  try {
    const listings = await Business.find({ sellerId: req.user?._id }).sort({
      createdAt: -1,
    });
    res.json(listings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
