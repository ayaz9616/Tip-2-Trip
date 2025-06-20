import React, { useEffect, useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useGetAllMessage from '@/hooks/useGetAllMessage'

const Messages = ({ selectedUser }) => {
    useGetAllMessage();
    const {messages} = useSelector(store=>store.chat);
    const {user} = useSelector(store=>store.auth);
    const messagesEndRef = useRef(null);
    const containerRef = useRef(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    // Scroll to bottom when messages change and user is at bottom
    useEffect(() => {
        if (!showScrollButton) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Show button if not at bottom
    const handleScroll = () => {
        const container = containerRef.current;
        if (!container) return;
        const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
        setShowScrollButton(!isAtBottom);
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setShowScrollButton(false);
    };

    return (    
        <div className='overflow-y-auto flex-1 p-4 relative' ref={containerRef}>
            <div className='flex justify-center'>
                <div className='flex flex-col items-center justify-center'>
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={selectedUser?.profilePicture} alt='profile' />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <span>{selectedUser?.username}</span>
                    <Link to={`/profile/${selectedUser?._id}`}><Button className="h-8 my-2" variant="secondary">View profile</Button></Link>
                </div>
            </div>
            <div className='flex flex-col gap-3'>
                {
                   messages && messages.map((msg) => {
                        return (
                            <div key={msg._id} className={`flex ${msg.senderId === user?._id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-2 rounded-lg max-w-xs break-words ${msg.senderId === user?._id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                                    {msg.message}
                                </div>
                            </div>
                        )
                    })
                }
                <div ref={messagesEndRef} />
            </div>
            {showScrollButton && (
                <Button onClick={scrollToBottom} className="fixed bottom-24 right-10 z-50 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white p-2">
                    ↓
                </Button>
            )}
        </div>  
    )
}

export default Messages