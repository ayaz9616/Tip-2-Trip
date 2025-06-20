import { createSlice } from "@reduxjs/toolkit";
const postSlice = createSlice({
    name:'post',
    initialState:{
        posts:[],
        selectedPost:null,
    },
    reducers:{
        //actions
        setPosts:(state,action) => {
            state.posts = action.payload;
        },
        setSelectedPost:(state,action) => {
            state.selectedPost = action.payload;
        },
        updatePostComments: (state, action) => {
            const { postId, comment } = action.payload;
            state.posts = state.posts.map(post =>
                post._id === postId
                    ? { ...post, comments: [...post.comments, comment] }
                    : post
            );
            if (state.selectedPost && state.selectedPost._id === postId) {
                state.selectedPost = {
                    ...state.selectedPost,
                    comments: [...state.selectedPost.comments, comment]
                };
            }
        }
    }
});
export const {setPosts, setSelectedPost} = postSlice.actions;
export const { updatePostComments } = postSlice.actions;
export default postSlice.reducer;