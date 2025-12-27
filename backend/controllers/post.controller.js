import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

// Tip2Trip

export const addNewPost = async (req, res) => {
    try {
        const { 
            title, 
            description, 
            city, 
            state, 
            country, 
            experienceType, 
            tags 
        } = req.body;
        const image = req.file;
        const authorId = req.id;

        if (!image) return res.status(400).json({ message: 'Image required' });
        if (!title || !description || !city || !state || !country) {
            return res.status(400).json({ 
                message: 'Title, description, and location fields are required' 
            });
        }

        // Check if Cloudinary is configured
        if (!process.env.CLOUDINARY_CLOUD_NAME || 
            !process.env.CLOUDINARY_API_KEY || 
            !process.env.CLOUDINARY_API_SECRET) {
            return res.status(500).json({
                message: 'Image upload service not configured. Please set up Cloudinary credentials.',
                success: false
            });
        }

        // image upload 
        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        // buffer to data uri
        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUri);
        
        // Parse tags if provided
        const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
        
        const post = await Post.create({
            title,
            description,
            location: {
                city,
                state,
                country
            },
            image: cloudResponse.secure_url,
            author: authorId,
            experienceType: experienceType || 'other',
            tags: tagsArray
        });
        
        const user = await User.findById(authorId);
        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({ path: 'author', select: '-password' });

        // Emit newPost event to all clients
        io.emit('newPost', post);

        return res.status(201).json({
            message: 'Travel experience shared successfully!',
            post,
            success: true,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Failed to create post. Please check your image upload configuration.',
            success: false
        });
    }
}
export const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture' })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            });
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to fetch posts', success: false });
    }
};
export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 }).populate({
            path: 'author',
            select: 'username, profilePicture'
        }).populate({
            path: 'comments',
            sort: { createdAt: -1 },
            populate: {
                path: 'author',
                select: 'username, profilePicture'
            }
        });
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to fetch user posts', success: false });
    }
}
export const likePost = async (req, res) => {
    try {
        const likeKrneWalaUserKiId = req.id;
        const postId = req.params.id; 
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        // like logic started
        await post.updateOne({ $addToSet: { likes: likeKrneWalaUserKiId } });
        await post.save();

        // implement socket io for real time notification
        const user = await User.findById(likeKrneWalaUserKiId).select('username profilePicture');
         
        const postOwnerId = post.author.toString();
        if(postOwnerId !== likeKrneWalaUserKiId){
            // emit a notification event
            const notification = {
                type:'like',
                userId:likeKrneWalaUserKiId,
                userDetails:user,
                postId,
                message:'Your post was liked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification);
        }

        return res.status(200).json({message:'Post liked', success:true});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to like post', success: false });
    }
}
export const dislikePost = async (req, res) => {
    try {
        const likeKrneWalaUserKiId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        // like logic started
        await post.updateOne({ $pull: { likes: likeKrneWalaUserKiId } });
        await post.save();

        // implement socket io for real time notification
        const user = await User.findById(likeKrneWalaUserKiId).select('username profilePicture');
        const postOwnerId = post.author.toString();
        if(postOwnerId !== likeKrneWalaUserKiId){
            // emit a notification event
            const notification = {
                type:'dislike',
                userId:likeKrneWalaUserKiId,
                userDetails:user,
                postId,
                message:'Your post was liked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification);
        }



        return res.status(200).json({message:'Post disliked', success:true});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to dislike post', success: false });
    }
}
export const addComment = async (req,res) =>{
    try {
        const postId = req.params.id;
        const commentKrneWalaUserKiId = req.id;

        const {text} = req.body;

        const post = await Post.findById(postId);

        if(!text) return res.status(400).json({message:'text is required', success:false});

        const comment = await Comment.create({
            text,
            author:commentKrneWalaUserKiId,
            post:postId
        })

        await comment.populate({
            path:'author',
            select:"username profilePicture"
        });
        
        post.comments.push(comment._id);
        await post.save();

        // Real-time: Emit newComment event to all clients
        io.emit('newComment', { comment, postId });

        // Real-time: Notify post owner if not the commenter
        const postOwnerId = post.author.toString();
        if (postOwnerId !== commentKrneWalaUserKiId) {
            const user = await User.findById(commentKrneWalaUserKiId).select('username profilePicture');
            const notification = {
                type: 'comment',
                userId: commentKrneWalaUserKiId,
                userDetails: user,
                postId,
                message: 'commented on your post'
            };
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification);
        }

        return res.status(201).json({
            message:'Comment Added',
            comment,
            success:true
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to add comment', success: false });
    }
};
export const getCommentsOfPost = async (req,res) => {
    try {
        const postId = req.params.id;

        const comments = await Comment.find({post:postId}).populate('author', 'username profilePicture');

        if(!comments) return res.status(404).json({message:'No comments found for this post', success:false});

        return res.status(200).json({success:true,comments});

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to fetch comments', success: false });
    }
}
export const deletePost = async (req,res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'Post not found', success:false});

        // check if the logged-in user is the owner of the post
        if(post.author.toString() !== authorId) return res.status(403).json({message:'Unauthorized'});

        // delete post
        await Post.findByIdAndDelete(postId);

        // remove the post id from the user's post
        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id => id.toString() !== postId);
        await user.save();

        // delete associated comments
        await Comment.deleteMany({post:postId});

        return res.status(200).json({
            success:true,
            message:'Post deleted'
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to delete post', success: false });
    }
}
export const bookmarkPost = async (req,res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'Post not found', success:false});
        
        const user = await User.findById(authorId);
        if(user.bookmarks.includes(post._id)){
            // already bookmarked -> remove from the bookmark
            await user.updateOne({$pull:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({type:'unsaved', message:'Post removed from bookmark', success:true});

        }else{
            // bookmark krna pdega
            await user.updateOne({$addToSet:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({type:'saved', message:'Post bookmarked', success:true});
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to update bookmark', success: false });
    }
}
export const searchPosts = async (req, res) => {
    try {
        const { search, experienceType, country, city } = req.query;
        let query = {};

        // Search by location (city, state, country)
        if (search) {
            query.$or = [
                { 'location.city': { $regex: search, $options: 'i' } },
                { 'location.state': { $regex: search, $options: 'i' } },
                { 'location.country': { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Filter by experience type
        if (experienceType && experienceType !== 'all') {
            query.experienceType = experienceType;
        }

        // Filter by specific country
        if (country) {
            query['location.country'] = { $regex: country, $options: 'i' };
        }

        // Filter by specific city
        if (city) {
            query['location.city'] = { $regex: city, $options: 'i' };
        }

        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture' })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            });

        return res.status(200).json({
            posts,
            success: true,
            total: posts.length
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Search failed',
            success: false
        });
    }
};