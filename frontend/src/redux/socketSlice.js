// Tip2Trip
import { createSlice } from "@reduxjs/toolkit";

const socketSlice = createSlice({
    name: "socketio",
    initialState: {
        // Remove socket instance from state
        // socket: null
    },
    reducers: {
        // Remove setSocket action
        // setSocket: (state, action) => {
        //     state.socket = action.payload;
        // }
    }
});
// Remove export of setSocket
// export const { setSocket } = socketSlice.actions;
export default socketSlice.reducer;