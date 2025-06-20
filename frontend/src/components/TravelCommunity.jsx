// Tip2Trip
import React, { useState, useEffect } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Search, MapPin, Filter, Globe, Mountain, Coffee, Building, Heart, Users } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { setPosts } from '../redux/postSlice'
import axios from 'axios'
import { toast } from 'sonner'
import Posts from './Posts'

const TravelCommunity = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [searchQuery, setSearchQuery] = useState('')
    const [experienceType, setExperienceType] = useState('all')
    const [loading, setLoading] = useState(false)
    const { posts } = useSelector(store => store.post)
    const dispatch = useDispatch()

    // Get search params from URL
    useEffect(() => {
        const search = searchParams.get('search') || ''
        const type = searchParams.get('experienceType') || 'all'
        setSearchQuery(search)
        setExperienceType(type)
    }, [searchParams])

    const handleSearch = async (e) => {
        e.preventDefault()
        if (searchQuery.trim() || experienceType !== 'all') {
            const params = new URLSearchParams()
            if (searchQuery.trim()) params.set('search', searchQuery)
            if (experienceType !== 'all') params.set('experienceType', experienceType)
            setSearchParams(params)
            await fetchPosts(params)
        } else {
            // Clear search and fetch all posts
            setSearchParams({})
            await fetchAllPosts()
        }
    }

    const fetchPosts = async (params) => {
        try {
            setLoading(true)
            const queryString = params.toString()
            const url = queryString 
                ? `${import.meta.env.VITE_BACKEND_URL}/api/v1/post/search?${queryString}`
                : `${import.meta.env.VITE_BACKEND_URL}/api/v1/post/all`
            
            const res = await axios.get(url, { withCredentials: true })
            if (res.data.success) {
                dispatch(setPosts(res.data.posts))
            }
        } catch (error) {
            console.log(error)
            toast.error('Failed to search posts')
        } finally {
            setLoading(false)
        }
    }

    const fetchAllPosts = async () => {
        try {
            setLoading(true)
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/post/all`, { withCredentials: true })
            if (res.data.success) {
                dispatch(setPosts(res.data.posts))
            }
        } catch (error) {
            console.log(error)
            toast.error('Failed to fetch posts')
        } finally {
            setLoading(false)
        }
    }

    const clearFilters = () => {
        setSearchQuery('')
        setExperienceType('all')
        setSearchParams({})
        fetchAllPosts()
    }

    const experienceTypes = [
        { value: 'all', label: 'All Experiences', icon: <Globe className="w-4 h-4" /> },
        { value: 'adventure', label: 'Adventure', icon: <Mountain className="w-4 h-4" /> },
        { value: 'cultural', label: 'Cultural', icon: <Users className="w-4 h-4" /> },
        { value: 'food', label: 'Food & Dining', icon: <Coffee className="w-4 h-4" /> },
        { value: 'nature', label: 'Nature & Outdoors', icon: <Mountain className="w-4 h-4" /> },
        { value: 'urban', label: 'Urban Exploration', icon: <Building className="w-4 h-4" /> },
        { value: 'relaxation', label: 'Relaxation', icon: <Heart className="w-4 h-4" /> },
        { value: 'other', label: 'Other', icon: <Globe className="w-4 h-4" /> }
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Travel Community
                    </h1>
                    <p className="text-gray-600">
                        Discover amazing travel experiences from around the world
                    </p>
                </div>

                {/* Search and Filters */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="w-5 h-5" />
                            Search & Filter
                        </CardTitle>
                        <CardDescription>
                            Find travel experiences by location, type, or keywords
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        Search Destinations
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            placeholder="Search by city, country, or keywords..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        Experience Type
                                    </label>
                                    <Select value={experienceType} onValueChange={setExperienceType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select experience type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {experienceTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    <div className="flex items-center gap-2">
                                                        {type.icon}
                                                        {type.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-end gap-2">
                                    <Button type="submit" className="flex-1" disabled={loading}>
                                        {loading ? 'Searching...' : 'Search'}
                                    </Button>
                                    {(searchQuery || experienceType !== 'all') && (
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={clearFilters}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Results */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Travel Experiences
                        </h2>
                        <div className="text-sm text-gray-600">
                            {posts.length} experience{posts.length !== 1 ? 's' : ''} found
                        </div>
                    </div>
                </div>

                {/* Posts */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading experiences...</p>
                    </div>
                ) : posts.length > 0 ? (
                    <Posts />
                ) : (
                    <Card className="text-center py-12">
                        <CardContent>
                            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No experiences found
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Try adjusting your search criteria or explore all experiences
                            </p>
                            <Button onClick={clearFilters} variant="outline">
                                View All Experiences
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default TravelCommunity 