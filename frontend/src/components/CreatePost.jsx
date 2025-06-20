// Tip2Trip
import React, { useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { readFileAsDataURL } from '@/lib/utils';
import { Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '@/redux/postSlice';

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef();
  const [file, setFile] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    city: "",
    state: "",
    country: "",
    experienceType: "other",
    tags: ""
  });
  const {user} = useSelector(store=>store.auth);
  const {posts} = useSelector(store=>store.post);
  const dispatch = useDispatch();

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const dataUrl = await readFileAsDataURL(file);
      setImagePreview(dataUrl);
    }
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleSelectChange = (value) => {
    setFormData({ ...formData, experienceType: value });
  }

  const createPostHandler = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim() || !formData.description.trim() || !formData.city.trim() || !formData.state.trim() || !formData.country.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!imagePreview) {
      toast.error("Please select an image");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("city", formData.city);
    formDataToSend.append("state", formData.state);
    formDataToSend.append("country", formData.country);
    formDataToSend.append("experienceType", formData.experienceType);
    if (formData.tags.trim()) {
      formDataToSend.append("tags", formData.tags);
    }
    if (imagePreview) formDataToSend.append("image", file);

    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/post/addpost`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]));
        toast.success(res.data.message);
        setOpen(false);
        // Reset form
        setFormData({
          title: "",
          description: "",
          city: "",
          state: "",
          country: "",
          experienceType: "other",
          tags: ""
        });
        setImagePreview("");
        setFile("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  }

  const experienceTypes = [
    { value: "adventure", label: "Adventure" },
    { value: "cultural", label: "Cultural" },
    { value: "food", label: "Food & Dining" },
    { value: "nature", label: "Nature & Outdoors" },
    { value: "urban", label: "Urban Exploration" },
    { value: "relaxation", label: "Relaxation" },
    { value: "other", label: "Other" }
  ];

  return (
    <Dialog open={open}>
      <DialogContent onInteractOutside={() => setOpen(false)} className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className='text-center font-semibold text-xl'>Share Your Travel Experience</DialogHeader>
        
        <div className='flex gap-3 items-center mb-4'>
          <Avatar>
            <AvatarImage src={user?.profilePicture} alt="img" />
            <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className='font-semibold'>{user?.username}</h1>
            <span className='text-gray-600 text-sm'>Share your adventure</span>
          </div>
        </div>

        <form onSubmit={createPostHandler} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Experience Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Give your experience a catchy title..."
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Tell us about your amazing experience..."
              className="min-h-[100px]"
              required
            />
          </div>

          {/* Location Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="City"
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State/Province *</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="State/Province"
                required
              />
            </div>
            <div>
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="Country"
                required
              />
            </div>
          </div>

          {/* Experience Type */}
          <div>
            <Label htmlFor="experienceType">Experience Type</Label>
            <Select value={formData.experienceType} onValueChange={handleSelectChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select experience type" />
              </SelectTrigger>
              <SelectContent>
                {experienceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags (optional)</Label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="Add tags separated by commas (e.g., beach, sunset, hiking)"
            />
          </div>

          {/* Image Upload */}
          <div>
            <Label>Experience Photo *</Label>
            {imagePreview && (
              <div className='w-full h-64 flex items-center justify-center mb-4'>
                <img src={imagePreview} alt="preview_img" className='object-cover h-full w-full rounded-md' />
              </div>
            )}
            <input ref={imageRef} type='file' className='hidden' onChange={fileChangeHandler} accept="image/*" />
            <Button 
              type="button"
              onClick={() => imageRef.current.click()} 
              className='w-full bg-[#0095F6] hover:bg-[#258bcf]'
            >
              <MapPin className="mr-2 h-4 w-4" />
              Select Photo
            </Button>
          </div>

          {/* Submit Button */}
          {imagePreview && (
            loading ? (
              <Button disabled className="w-full">
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Creating Post...
              </Button>
            ) : (
              <Button type="submit" className="w-full">
                Share Experience
              </Button>
            )
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreatePost