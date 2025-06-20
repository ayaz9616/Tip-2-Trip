import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-8 text-lg text-gray-600">Sorry, the page you are looking for does not exist.</p>
      <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700 text-white">Go Home</Button>
    </div>
  );
};

export default NotFound; 