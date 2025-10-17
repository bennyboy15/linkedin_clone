import cloudinary from "../lib/cloudinary";
import Post from "../models/post.model";
import Notification from "../models/notification.model";

export async function getFeedPosts(req,res) {
    try {
        // Get posts that are made by users in current user's connections and extract info of author and user of comment
        const posts = await Post.find({author: {$in: req.user.connections}})
        .populate("author", "name username profilePicture headline")
        .populate("comments.user", "name profilePicture")
        .sort({createdAt: -1});

        res.status(200).json(posts);

    } catch (error) {
        console.log("Error in getFeedPosts post controller:", error.message);
        res.status(500).json({success:false, message: "Internal Server Error"});
    }
};

export async function createPost(req,res) {
    try {
        const {content, image} = req.body;

        let newPost;
        if (image) {
            const result = await cloudinary.uploader.upload(image);
            newPost = new Post({
                author: req.user._id,
                content,
                image:result.secure_url
            });
        } else {
            newPost = new Post({
                author: req.user._id,
                content,
            });
        };

        await newPost.save();

        res.status(201).json(newPost);

    } catch (error) {
        console.log("Error in createPost post controller:", error.message);
        res.status(500).json({success:false, message: "Internal Server Error"});
    }
};

export async function deletePost(req,res) {
    try {
        const {id} = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);

        // Post not found
        if (!post) {
            return res.status(404).json({message: "Post not found"});
        }

        // Current user is not author of post
        if (post.author.toString() !== userId.toString()) {
            return res.status(403).json({message: "Unauthorised - You are not the author of this post"});
        }

        // Delete image from cloudinary
        if (post.image) {
            await cloudinary.uploader.destroy(post.image.split("/").pop().split(".")[0]);
        }

        await Post.findByIdAndDelete(postId);

        res.status(200).json({message: "Post deleted successfully"});

    } catch (error) {
        console.log("Error in deletePost post controller:", error.message);
        res.status(500).json({success:false, message: "Internal Server Error"});
    }
}

export async function getPostById(req,res) {
    try {
        const {id} = req.params;
        const post = await Post.findById(id)
        .populate("author", "name username profilePicture headline")
        .populate("comments.user", "name profilePicture username headline");

        res.status(200).json(post);

    } catch (error) {
        console.log("Error in getPostById post controller:", error.message);
        res.status(500).json({success:false, message: "Internal Server Error"});
    }
};

export async function createComment(req,res) {
    try {
        const {id} = req.params;
        const {content} = req.body;
        
        // Push comment to post
        const post = await Post.findByIdAndUpdate(id, {
            $push: {comments: {user: req.user._id, content}}
        }, {new:true})
        .populate("author", "name email username headline profilePicture");

        // Create a notification if comment owner is not the post owner
        if (post.author.toString() !== req.user._id.toString()) {
            const newNotification = new Notification({
                recipient: post.author,
                type: "comment",
                relatedUser: req.user._id,
                relatedPost: id
            })
            await newNotification.save();
            // todo: Send email
        };

        res.status(200).json(post);
        
    } catch (error) {
        console.log("Error in createComment post controller:", error.message);
        res.status(500).json({success:false, message: "Internal Server Error"});
    }
}