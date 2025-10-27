import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Calendar } from 'lucide-react'

const Profile = () => {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Please log in to view your profile.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 h-32"></div>
          
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-16">
              <div className="bg-white p-2 rounded-full shadow-lg">
                <div className="bg-blue-100 w-24 h-24 rounded-full flex items-center justify-center">
                  <User className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              
              <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600">{user.role}</p>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Personal Information
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="text-gray-900 capitalize">{user.role.toLowerCase()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Member since</p>
                      <p className="text-gray-900">2024</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Account Statistics
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Pending Orders</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">$0.00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile