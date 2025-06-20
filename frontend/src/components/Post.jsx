// Tip2Trip
import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Bookmark, MessageCircle, MoreHorizontal, Send, MapPin, Globe } from 'lucide-react'
import { Button } from './ui/button'
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from './CommentDialog'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Badge } from './ui/badge'

const Post = ({ post }) => {
    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);
    const { user } = useSelector(store => store.auth);
    const { posts } = useSelector(store => store.post);
    const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
    const [postLike, setPostLike] = useState(post.likes.length);
    const [comment, setComment] = useState(post.comments);
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if (inputText.trim()) {
            setText(inputText);
        } else {
            setText("");
        }
    }

    const likeOrDislikeHandler = async () => {
        try {
            const action = liked ? 'dislike' : 'like';
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/post/${post._id}/${action}`, { withCredentials: true });
            console.log(res.data);
            if (res.data.success) {
                const updatedLikes = liked ? postLike - 1 : postLike + 1;
                setPostLike(updatedLikes);
                setLiked(!liked);

                // apne post ko update krunga
                const updatedPostData = posts.map(p =>
                    p._id === post._id ? {
                        ...p,
                        likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                    } : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const commentHandler = async () => {

        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/post/${post._id}/comment`, { text }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            console.log(res.data);
            if (res.data.success) {
                const updatedCommentData = [...comment, res.data.comment];
                setComment(updatedCommentData);

                const updatedPostData = posts.map(p =>
                    p._id === post._id ? { ...p, comments: updatedCommentData } : p
                );

                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
                setText("");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const deletePostHandler = async () => {
        try {
            const res = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/v1/post/delete/${post?._id}`, { withCredentials: true })
            if (res.data.success) {
                const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id);
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.messsage);
        }
    }

    const bookmarkHandler = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/post/${post?._id}/bookmark`, {withCredentials:true});
            if(res.data.success){
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const getExperienceTypeColor = (type) => {
        const colors = {
            adventure: 'bg-orange-100 text-orange-800',
            cultural: 'bg-purple-100 text-purple-800',
            food: 'bg-red-100 text-red-800',
            nature: 'bg-green-100 text-green-800',
            urban: 'bg-blue-100 text-blue-800',
            relaxation: 'bg-pink-100 text-pink-800',
            other: 'bg-gray-100 text-gray-800'
        };
        return colors[type] || colors.other;
    };

    const formatExperienceType = (type) => {
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    return (
        <div className='my-8 w-full max-w-sm mx-auto bg-white rounded-lg shadow-md overflow-hidden'>
            {/* Header */}
            <div className='p-4 border-b'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <Avatar>
                            <AvatarImage src={post.author?.profilePicture} alt="post_image" />
                            <AvatarFallback>{post.author?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className='flex items-center gap-3'>
                            <h1 className="font-semibold">{post.author?.username}</h1>
                            {user?._id === post.author._id && <Badge variant="secondary">Author</Badge>}
                        </div>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <MoreHorizontal className='cursor-pointer' />
                        </DialogTrigger>
                        <DialogContent className="flex flex-col items-center text-sm text-center">
                            {
                            post?.author?._id !== user?._id && <Button variant='ghost' className="cursor-pointer w-fit text-[#ED4956] font-bold">Unfollow</Button>
                            }
                            
                            <Button variant='ghost' className="cursor-pointer w-fit">Add to favorites</Button>
                            {
                                user && user?._id === post?.author._id && <Button onClick={deletePostHandler} variant='ghost' className="cursor-pointer w-fit">Delete</Button>
                            }
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Image */}
            <img
                className='w-full aspect-square object-cover'
                src={post.image}
                alt="post_img"
            />

            {/* Content */}
            <div className='p-4'>
                {/* Title and Experience Type */}
                <div className='mb-3'>
                    <h2 className='text-lg font-bold text-gray-900 mb-2'>{post.title}</h2>
                    <div className='flex items-center gap-2 mb-2'>
                        <Badge className={getExperienceTypeColor(post.experienceType)}>
                            {formatExperienceType(post.experienceType)}
                        </Badge>
                        {post.tags && post.tags.length > 0 && (
                            <div className='flex gap-1'>
                                {post.tags.slice(0, 3).map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                        #{tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Location */}
                {post.location && (
                    <div className='flex items-center gap-2 mb-3 text-sm text-gray-600'>
                        <MapPin className="w-4 h-4" />
                        <span>
                            {post.location.city}, {post.location.state}, {post.location.country}
                        </span>
                    </div>
                )}

                {/* Description */}
                <p className='text-gray-700 mb-4 leading-relaxed'>
                    {post.description}
                </p>

                {/* Actions */}
                <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center gap-3'>
                        {
                            liked ? <FaHeart onClick={likeOrDislikeHandler} size={'24'} className='cursor-pointer text-red-600' /> : <FaRegHeart onClick={likeOrDislikeHandler} size={'22px'} className='cursor-pointer hover:text-gray-600' />
                        }

                        <MessageCircle onClick={() => {
                            dispatch(setSelectedPost(post));
                            setOpen(true);
                        }} className='cursor-pointer hover:text-gray-600' />
                        <Send className='cursor-pointer hover:text-gray-600' />
                    </div>
                    <Bookmark onClick={bookmarkHandler} className='cursor-pointer hover:text-gray-600' />
                </div>

                {/* Likes count */}
                <span className='font-medium block mb-3'>{postLike} likes</span>

                {/* Comments preview */}
                {
                    comment.length > 0 && (
                        <span onClick={() => {
                            dispatch(setSelectedPost(post));
                            setOpen(true);
                        }} className='cursor-pointer text-sm text-gray-400 block mb-3'>
                            View all {comment.length} comments
                        </span>
                    )
                }

                {/* Comment input */}
                <div className='flex items-center justify-between border-t pt-3'>
                    <input
                        type="text"
                        placeholder='Add a comment...'
                        value={text}
                        onChange={changeEventHandler}
                        className='outline-none text-sm w-full'
                    />
                    {
                        text && <span onClick={commentHandler} className='text-[#3BADF8] cursor-pointer font-medium'>Post</span>
                    }
                </div>
            </div>

            <CommentDialog open={open} setOpen={setOpen} />
        </div>
    )
}

export default Post