import { sendConnectionAcceptedEmail } from "../emails/emailHandlers";
import ConnectionRequest from "../models/connectionRequest.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export async function getUserConnections(req,res) {
    try {
        const user = await User.findById(req.user._id).populate("connections", "name username profilePicture headline connections");
        res.status(200).json(user.connections);
    } catch (error) {
        console.log("Error in getUserConnections connection controller:",error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export async function getConnectionRequests(req,res) {
    try {
        const connectionRequests = await ConnectionRequest.find({recipient:req.user._id, status:"pending"})
        .populate("sender", "name username profilePicture headline connections");

        res.status(200).json(connectionRequests);

    } catch (error) {
        console.log("Error in getConnectionRequests connection controller:",error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export async function getConnectionStatus(req,res){
    try {
		const targetUserId = req.params.userId;
		const currentUserId = req.user._id;

        // Already connected
		const currentUser = req.user;
		if (currentUser.connections.includes(targetUserId)) {
			return res.json({ status: "connected" });
		}

        // Pending request
		const pendingRequest = await ConnectionRequest.findOne({
			$or: [
				{ sender: currentUserId, recipient: targetUserId },
				{ sender: targetUserId, recipient: currentUserId },
			],
			status: "pending",
		});
		if (pendingRequest) {
			if (pendingRequest.sender.toString() === currentUserId.toString()) {
				return res.json({ status: "pending" });
			} else {
				return res.json({ status: "received", requestId: pendingRequest._id });
			}
		}

		// if no connection or pending request found
		res.json({ status: "not_connected" });
	} catch (error) {
		console.log("Error in getConnectionStatus connection controller:",error.message);
		res.status(500).json({ message: "Server error" });
	}
};

export async function removeConnection(req,res) {
    try {
        const {userId} = req.params;
        const currentUserId = req.user._id;

        await User.findByIdAndUpdate(currentUserId, {$pull: {connections: userId}}); // current user's connections
        await User.findByIdAndUpdate(userId, {$pull: {connections: currentUserId}}); // other user's connections

        res.json({message:"Connection removed successfully"});
    } catch (error) {
        console.log("Error in removeConnection connection controller:",error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export async function sendConnectionRequest(req,res) {
    try {
        const {userId} = req.params;
        const senderId = req.user._id;

        // If current user equals user trying to connect with
        if (senderId.toString() === userId) {
            return res.status(400).json({message: "You cannot send a connection request to yourself" });
        };

        // Already have a connection with this user
        if (req.user.connections.includes(userId)) {
            return res.status(400).json({message: "You already connected with this user" });
        };

        // Already have sent a request
        const existingRequest = await ConnectionRequest.findOne({
            sender: senderId,
            recipient: userId,
            status: "pending"
        });
        if (existingRequest) {
            return res.status(400).json({message: "A connection request already exists"});
        }

        // Does recipient exist?
        const recipient = await User.findById(userId);
        if (!recipient) {
            return res.status(404).json({message: "User not found" });
        }

        // New connection request
        const newConnectionRequest = new ConnectionRequest({
            sender: senderId,
            recipient:recipient,
        });

        await newConnectionRequest.save();

        res.status(201).json({message: "Connection request sent successfully"});

    } catch (error) {
        console.log("Error in sendConnectionRequest connection controller:",error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export async function acceptConnectionRequest(req,res) {
    try {
        const {requestId} = req.params;
        const userId = req.user._id;

        const request = ConnectionRequest.findById(requestId)
        .populate("sender", "name email username")
        .populate("recipient", "name username");

        // Request exists?
        if (!request) {
            return res.status(404).json({message: "Connection request was not found"});
        };

        // Check if request for current user
        if (request.recipient._id.toString() !== userId.toString()) {
            return res.status(403).json({message: "Not authroised to accept this request"});
        };

        // Request already processed?
        if (request.status !== "pending") {
            return res.status(400).json({message: "Request has already been processed"});
        };

        request.status = "accepted";
        await request.save();

        // Push new connection to current user and sender user
        await User.findByIdAndUpdate(request.sender._id, {$addToSet: {connections:userId}}); // sender connection
        await User.findByIdAndUpdate(userId, {$addToSet: {connections:request.sender._id}}); // current user connection

        // Create notification
        const notification = new Notification({
            recipient: request.sender._id,
            type:"connectionAccepted",
            relatedUser: userId,
        });
        await notification.save();

        res.status(200).json({message: "Connection request accepted successfully"});

        // Send connection accepted email
        const senderEmail = request.sender.email;
        const senderName = request.sender.name;
        const recipientName = request.recipient.name;
        const profileUrl = process.env.CLIENT_URL + "/profile/" + request.recipient.username;
        
        try {
            await sendConnectionAcceptedEmail(senderEmail, senderName, recipientName, profileUrl);
        } catch (error) {
            console.error("Error in sendConnectionAcceptedEmail:", error);
        }

    } catch (error) {
        console.log("Error in acceptConnectionRequest connection controller:",error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export async function rejectConnectionRequest(req,res) {
    try {
        const {requestId} = req.params;
        const userId = req.user._id;

        const request = ConnectionRequest.findById(requestId);

        // Request exists?
        if (!request) {
            return res.status(404).json({message: "Connection request was not found"});
        };

        // Check if request for current user
        if (request.recipient._id.toString() !== userId.toString()) {
            return res.status(403).json({message: "Not authroised to accept this request"});
        };

        // Request already processed?
        if (request.status !== "pending") {
            return res.status(400).json({message: "Request has already been processed"});
        };

        request.status = "rejected";
        await request.save();

        res.status(200).json({message: "Connection request rejected"});

    } catch (error) {
        console.log("Error in rejectConnectionRequest connection controller:",error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};