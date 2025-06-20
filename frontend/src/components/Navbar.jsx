import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Plane, Search, Menu, X, LogOut, User, Settings } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { setAuthUser } from '../redux/authSlice'
import { setPosts, setSelectedPost } from '../redux/postSlice'
import { toast } from 'sonner'
import axios from 'axios'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu'

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const { user } = useSelector(store => store.auth)
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/logout`, { withCredentials: true })
            if (res.data.success) {
                dispatch(setAuthUser(null))
                dispatch(setSelectedPost(null))
                dispatch(setPosts([]))
                navigate("/")
                toast.success(res.data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Logout failed')
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/community?search=${encodeURIComponent(searchQuery)}`)
        }
    }

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Travel Community', path: '/community' },
        { name: 'Find Travel Buddy', path: '/buddy', disabled: true },
        { name: 'AI Itinerary Planner', path: '/planner', disabled: true },
    ]

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/'
        }
        return location.pathname.startsWith(path)
    }

    return (
        <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <Plane className="w-8 h-8 text-blue-600" />
                        <span className="text-xl font-bold text-gray-900">TravelPlanner</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.disabled ? '#' : item.path}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isActive(item.path)
                                        ? 'text-blue-600 bg-blue-50'
                                        : item.disabled
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                                onClick={item.disabled ? (e) => e.preventDefault() : undefined}
                            >
                                {item.name}
                                {item.disabled && <span className="ml-1 text-xs">(Soon)</span>}
                            </Link>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
                        <form onSubmit={handleSearch} className="w-full">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    type="text"
                                    placeholder="Search destinations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4"
                                />
                            </div>
                        </form>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.profilePicture} alt={user.username} />
                                            <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.username}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate(`/community/profile/${user._id}`)}>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate('/community/account/edit')}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logoutHandler}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="hidden md:flex items-center space-x-2">
                                <Link to="/login">
                                    <Button variant="ghost">Sign In</Button>
                                </Link>
                                <Link to="/signup">
                                    <Button>Sign Up</Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                        {/* Mobile Search */}
                        <form onSubmit={handleSearch} className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    type="text"
                                    placeholder="Search destinations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4"
                                />
                            </div>
                        </form>

                        {/* Mobile Navigation Items */}
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.disabled ? '#' : item.path}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${
                                    isActive(item.path)
                                        ? 'text-blue-600 bg-blue-50'
                                        : item.disabled
                                        ? 'text-gray-400'
                                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                                onClick={() => {
                                    if (!item.disabled) {
                                        setIsMobileMenuOpen(false)
                                    }
                                }}
                            >
                                {item.name}
                                {item.disabled && <span className="ml-1 text-xs">(Soon)</span>}
                            </Link>
                        ))}

                        {/* Mobile Auth */}
                        {!user && (
                            <div className="pt-4 space-y-2">
                                <Link to="/login" className="block">
                                    <Button variant="ghost" className="w-full justify-start">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link to="/signup" className="block">
                                    <Button className="w-full justify-start">
                                        Sign Up
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar 