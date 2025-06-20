import { useState, useRef } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import React from 'react';
import { ArrowLeft } from 'lucide-react';

// TODO: Replace with your actual API keys
const OPENTRIPMAP_API_KEY = import.meta.env.VITE_OPENTRIPMAP_API_KEY;
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

const FAMOUS_CITIES = [
  'Lucknow', 'Jaipur', 'Varanasi', 'Goa', 'Kerala', 'Mysore', 'Udaipur', 'Delhi', 'Mumbai', 'Kolkata', 'Amritsar', 'Hampi'
];

// Tip2Trip
const Destinations = () => {
  const [search, setSearch] = useState('');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [placeDescription, setPlaceDescription] = useState('');
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const recTimeout = useRef(null);
  const [defaultCityImages, setDefaultCityImages] = useState([]);
  const [showDefault, setShowDefault] = useState(true);

  // Fetch images for famous cities on mount
  React.useEffect(() => {
    const fetchImages = async () => {
      const promises = FAMOUS_CITIES.map(async (city) => {
        try {
          const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(city)}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=1`);
          const data = await res.json();
          return {
            name: city,
            image: data.results?.[0]?.urls?.small || '',
          };
        } catch {
          return { name: city, image: '' };
        }
      });
      setDefaultCityImages(await Promise.all(promises));
    };
    fetchImages();
  }, []);

  // Fetch places from OpenTripMap
  const fetchPlaces = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPlaces([]);
    try {
      // 1. Get coordinates for the city
      const geoRes = await fetch(`https://api.opentripmap.com/0.1/en/places/geoname?name=${encodeURIComponent(search)}&apikey=${OPENTRIPMAP_API_KEY}`);
      const geoData = await geoRes.json();
      if (!geoData.lat || !geoData.lon) throw new Error('City not found');
      // 2. Get places around the city
      const placesRes = await fetch(`https://api.opentripmap.com/0.1/en/places/radius?radius=5000&lon=${geoData.lon}&lat=${geoData.lat}&rate=3&format=json&limit=12&apikey=${OPENTRIPMAP_API_KEY}`);
      const placesData = await placesRes.json();
      setPlaces(placesData);
    } catch (err) {
      setError('No places found or API error.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch place details and Unsplash photos
  const handleCardClick = async (place) => {
    setSelectedPlace(place);
    setModalOpen(true);
    setPhotos([]);
    setPlaceDescription('');
    // 1. Fetch place details
    try {
      const detailRes = await fetch(`https://api.opentripmap.com/0.1/en/places/xid/${place.xid}?apikey=${OPENTRIPMAP_API_KEY}`);
      const detailData = await detailRes.json();
      setPlaceDescription(detailData.wikipedia_extracts?.text || detailData.info?.descr || 'No description available.');
    } catch {
      setPlaceDescription('No description available.');
    }
    // 2. Fetch Unsplash photos
    try {
      const unsplashRes = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(place.name)}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=12`);
      const unsplashData = await unsplashRes.json();
      setPhotos(unsplashData.results || []);
    } catch {
      setPhotos([]);
    }
  };

  // Fetch recommendations as user types
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setRecommendations([]);
    if (recTimeout.current) clearTimeout(recTimeout.current);
    if (value.length < 2) return;
    recTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.opentripmap.com/0.1/en/places/geoname?name=${encodeURIComponent(value)}&apikey=${OPENTRIPMAP_API_KEY}`);
        const data = await res.json();
        if (data && data.name) {
          setRecommendations([{ name: data.name, country: data.country, lat: data.lat, lon: data.lon }]);
        } else {
          setRecommendations([]);
        }
      } catch {
        setRecommendations([]);
      }
    }, 400);
  };

  // When a recommendation is clicked
  const handleRecClick = (rec) => {
    setSearch(rec.name);
    setRecommendations([]);
    setShowDefault(false);
    // Optionally, you can trigger fetchPlaces here automatically:
    // fetchPlaces({ preventDefault: () => {} });
  };

  // When a default city card is clicked
  const handleDefaultCityClick = async (cityName) => {
    setShowDefault(false);
    setSearch(cityName);
    // Fetch place details for the city itself (simulate a place object)
    setSelectedPlace({ name: cityName });
    setModalOpen(true);
    setPhotos([]);
    setPlaceDescription('');
    // Fetch Unsplash photos for the city
    try {
      const unsplashRes = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(cityName)}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=12`);
      const unsplashData = await unsplashRes.json();
      setPhotos(unsplashData.results || []);
    } catch {
      setPhotos([]);
    }
    // Optionally, fetch a description from Wikipedia or OpenTripMap (not always available for city names)
    try {
      const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cityName)}`);
      const wikiData = await wikiRes.json();
      setPlaceDescription(wikiData.extract || 'No description available.');
    } catch {
      setPlaceDescription('No description available.');
    }
  };

  // Back button handler
  const handleBack = () => {
    setShowDefault(true);
    setPlaces([]);
    setSearch('');
    setRecommendations([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 relative">
        <h1 className="text-3xl font-bold mb-6 text-center">Destinations</h1>
        <form onSubmit={fetchPlaces} className="flex gap-2 mb-8 justify-center relative">
          <Input
            value={search}
            onChange={handleInputChange}
            placeholder="Search for a city (e.g., Paris, Tokyo, New York)"
            className="w-2/3"
            autoComplete="off"
          />
          <Button type="submit" disabled={loading}>{loading ? 'Searching...' : 'Search'}</Button>
          {/* Recommendations dropdown */}
          {recommendations.length > 0 && (
            <div className="absolute left-0 top-full mt-1 w-2/3 bg-white border border-gray-200 rounded shadow z-10 max-h-48 overflow-y-auto">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                  onClick={() => handleRecClick(rec)}
                >
                  {rec.name}{rec.country ? `, ${rec.country}` : ''}
                </div>
              ))}
            </div>
          )}
        </form>
        {/* Back arrow button if not showing default */}
        {!showDefault && (
          <button
            onClick={handleBack}
            className="absolute top-4 left-4 z-20 bg-white rounded-full shadow p-2 hover:bg-gray-100 focus:outline-none"
            title="Back to Destinations"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        )}
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        {/* Show default city cards if no search results */}
        {places.length === 0 && showDefault && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {defaultCityImages.map(city => (
              <Card key={city.name} className="cursor-pointer hover:shadow-lg transition" onClick={() => handleDefaultCityClick(city.name)}>
                <CardHeader>
                  <CardTitle className="truncate">{city.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {city.image ? (
                    <img src={city.image} alt={city.name} className="rounded-md object-cover w-full h-32 mb-2" />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-400">No image</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {places.map(place => (
            <Card key={place.xid} className="cursor-pointer hover:shadow-lg transition" onClick={() => handleCardClick(place)}>
              <CardHeader>
                <CardTitle className="truncate">{place.name || 'Unknown Place'}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-sm">{place.kinds?.split(',')[0]}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {/* Modal for place details and photos */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="mb-2 text-xl font-bold">{selectedPlace?.name}</DialogHeader>
          <div className="mb-4 text-gray-700 text-sm">{placeDescription}</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photos.length > 0 ? (
              photos.map(photo => (
                <img
                  key={photo.id}
                  src={photo.urls.small}
                  alt={photo.alt_description || selectedPlace?.name}
                  className="rounded-md object-cover w-full h-40"
                />
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-400">No photos found.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Destinations; 