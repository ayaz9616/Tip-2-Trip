// Tip2Trip
import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Plane, MapPin, Users, Calendar, Globe, Mountain, Camera, Heart } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import Navbar from './Navbar'

const Homepage = () => {
    const [isLogin, setIsLogin] = useState(false)
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    })
    const { user } = useSelector(store => store.auth)
    const navigate = useNavigate()

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        // This will be handled by the existing auth system
        if (isLogin) {
            navigate('/login')
        } else {
            navigate('/signup')
        }
    }

    const features = [
        {
            icon: <Globe className="w-8 h-8" />,
            title: "Travel Community",
            description: "Share your travel experiences and discover amazing destinations from fellow travelers."
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "Find Travel Buddy",
            description: "Connect with like-minded travelers and plan your next adventure together."
        },
        {
            icon: <Calendar className="w-8 h-8" />,
            title: "AI Itinerary Planner",
            description: "Get personalized travel itineraries powered by AI based on your preferences."
        },
        {
            icon: <MapPin className="w-8 h-8" />,
            title: "Location-Based Discovery",
            description: "Find hidden gems and popular spots in any destination around the world."
        }
    ]

    if (user) {
        return (
            <>
            <Navbar/>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">
                            Welcome back, {user.username}! 👋
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                            Ready to explore the world? Choose your next adventure:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Link to="/community">
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardHeader>
                                        <div className="flex justify-center mb-2">
                                            <Globe className="w-12 h-12 text-blue-600" />
                                        </div>
                                        <CardTitle>Travel Community</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription>
                                            Share and discover travel experiences
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            </Link>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer opacity-60">
                                <CardHeader>
                                    <div className="flex justify-center mb-2">
                                        <Users className="w-12 h-12 text-green-600" />
                                    </div>
                                    <CardTitle>Find Travel Buddy</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>
                                        Coming soon - Connect with travelers
                                    </CardDescription>
                                </CardContent>
                            </Card>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer opacity-60">
                                <CardHeader>
                                    <div className="flex justify-center mb-2">
                                        <Calendar className="w-12 h-12 text-purple-600" />
                                    </div>
                                    <CardTitle>AI Itinerary Planner</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>
                                        Coming soon - AI-powered planning
                                    </CardDescription>
                                </CardContent>
                            </Card>
                            <Link to={`/community/profile/${user._id}`}>
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardHeader>
                                        <div className="flex justify-center mb-2">
                                            <Heart className="w-12 h-12 text-red-600" />
                                        </div>
                                        <CardTitle>My Profile</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription>
                                            View your travel profile
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            </>
            
        )
    }

    return (

        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <div className="flex justify-center mb-6">
                        <Plane className="w-16 h-16 text-blue-600" />
                    </div>
                    <h1 className="text-5xl font-bold text-gray-800 mb-6">
                        Your Ultimate Travel Companion
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Discover amazing destinations, share your adventures, and connect with fellow travelers from around the world.
                    </p>
                    
                    {/* Auth Form */}
                    <Card className="max-w-md mx-auto mb-12">
                        <CardHeader>
                            <CardTitle className="text-center">
                                {isLogin ? 'Welcome Back' : 'Join Our Community'}
                            </CardTitle>
                            <CardDescription className="text-center">
                                {isLogin ? 'Sign in to continue your journey' : 'Start sharing your travel stories'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {!isLogin && (
                                    <Input
                                        name="username"
                                        placeholder="Username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        required
                                    />
                                )}
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                />
                                <Button type="submit" className="w-full">
                                    {isLogin ? 'Sign In' : 'Sign Up'}
                                </Button>
                            </form>
                            <div className="text-center mt-4">
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="text-blue-600 hover:underline"
                                >
                                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Features Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <Card key={index} className="text-center">
                            <CardHeader>
                                <div className="flex justify-center mb-4">
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        {feature.icon}
                                    </div>
                                </div>
                                <CardTitle>{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>{feature.description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Homepage 