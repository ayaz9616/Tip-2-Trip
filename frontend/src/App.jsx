import { useEffect, useRef } from 'react'
import ChatPage from './components/ChatPage'
import EditProfile from './components/EditProfile'
import Home from './components/Home'
import Homepage from './components/Homepage'
import Login from './components/Login'
import MainLayout from './components/MainLayout'
import CommunityLayout from './components/CommunityLayout'
import TravelCommunity from './components/TravelCommunity'
import Profile from './components/Profile'
import Signup from './components/Signup'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { io } from "socket.io-client";
import { useDispatch, useSelector } from 'react-redux'
import { setOnlineUsers, setMessages } from './redux/chatSlice'
import { setLikeNotification } from './redux/rtnSlice'
import ProtectedRoutes from './components/ProtectedRoutes'
import { setPosts, updatePostComments } from './redux/postSlice'
import NotFound from './components/NotFound'
import Destinations from './components/Destinations'

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <Homepage />
  },
  {
    path: "/community",
    element: <ProtectedRoutes><CommunityLayout /></ProtectedRoutes>,
    children: [
      { path: "", element: <ProtectedRoutes><TravelCommunity /></ProtectedRoutes> },
      { path: "profile/:id", element: <ProtectedRoutes><Profile /></ProtectedRoutes> },
      { path: "account/edit", element: <ProtectedRoutes><EditProfile /></ProtectedRoutes> },
      { path: "chat", element: <ProtectedRoutes><ChatPage /></ProtectedRoutes> },
      { path: "destinations", element: <ProtectedRoutes><Destinations /></ProtectedRoutes> },
      { path: "*", element: <NotFound /> },
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  },
  {
    path: "/legacy",
    element: <ProtectedRoutes><MainLayout /></ProtectedRoutes>,
    children: [
      { path: "", element: <ProtectedRoutes><Home /></ProtectedRoutes> },
      { path: "profile/:id", element: <ProtectedRoutes><Profile /></ProtectedRoutes> },
      { path: "account/edit", element: <ProtectedRoutes><EditProfile /></ProtectedRoutes> },
      { path: "chat", element: <ProtectedRoutes><ChatPage /></ProtectedRoutes> },
      { path: "*", element: <NotFound /> },
    ]
  },
  { path: "*", element: <NotFound /> },
])

function App() {
  const { user } = useSelector(store => store.auth);
  const { messages } = useSelector(store => store.chat);
  const { posts } = useSelector(store => store.post);
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    if (user) {
      const socketio = io('http://localhost:5000', {
        query: {
          userId: user?._id
        },
        transports: ['websocket']
      });
      socketRef.current = socketio;

      // listen all the events
      socketio.on('getOnlineUsers', (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      socketio.on('notification', (notification) => {
        dispatch(setLikeNotification(notification));
      });

      socketio.on('newMessage', (newMessage) => {
        dispatch(setMessages([...messages, newMessage]));
      });

      socketio.on('newPost', (newPost) => {
        dispatch(setPosts([newPost, ...posts]));
      });

      socketio.on('newComment', ({ comment, postId }) => {
        dispatch(updatePostComments({ postId, comment }));
      });

      return () => {
        socketio.close();
        socketRef.current = null;
      }
    } else if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }, [user, dispatch, messages, posts]);

  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  )
}

export default App
