// Tip2Trip
import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import LeftSidebar from './LeftSidebar'

const CommunityLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex pt-16">
        <LeftSidebar />
        <div className="flex-1 ml-[16%]">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default CommunityLayout 