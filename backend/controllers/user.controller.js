import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js"

export async function getSuggestedConnections(req,res){
    try {
        
        // Current User's connections
        const currentUser = await User.findById(req.user._id).select("connections");

        const suggestedUsers = await User.find({
            _id:{$ne: req.user._id, $nin: currentUser.connections} // Not equal to current user and not in current user's connections array
        }).select("name username profilePicture headline").limit(3);

        res.json(suggestedUsers);

    } catch (error) {
        console.log("Error in getSuggestedConnections user controller:", error.message);
        res.status(500).json({success:false, message: "Internal Server Error"});
    }
};

export async function getPublicProfile(req,res) {
    try {
        // Find user
        const {username} = req.params;
        const user = await User.findOne({username:username}).select("-password");
        
        // If not found
        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        res.json(user);

    } catch (error) {
        console.log("Error in getPublicProfile user controller:", error.message);
        res.status(500).json({success:false, message: "Internal Server Error"});
    }
};

export async function updateProfile(req,res) {
    try {
        const allowedFields = ["name", "username", "headline", "about", "location", "profilePicture", "bannerImg", "skills", "experience", "education"];
        const updatedData = {};

        // Build object of changed properties
        for (const field of allowedFields) {
            if (req.body[field]) {
                updatedData[field] = req.body[field];
            }
        };

        // Updating profile picture
        if (req.body.profilePicture) {
            const result = await cloudinary.uploader.upload(req.body.profilePicture);
            updatedData.profilePicture = result.secure_url;
        };

        // Updating banner img
        if (req.body.bannerImg) {
            const result = await cloudinary.uploader.upload(req.body.bannerImg);
            updatedData.bannerImg = result.secure_url;
        };

        // Update user
        const user = await User.findByIdAndUpdate(req.user._id, {$set: updatedData}, {new:true}).select("-password");
        res.json(user);

    } catch (error) {
        console.log("Error in updateProfile user controller:", error.message);
        res.status(500).json({success:false, message: "Internal Server Error"});
    }
};
