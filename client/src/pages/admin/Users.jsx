import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Shield,
  Key,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react'
import axios from 'axios'

const Users = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER'
  })
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [submitLoading, setSubmitLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchUsers()
    }
  }, [user, pagination.page, searchTerm])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/admin/users', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm
        }
      })
      setUsers(response.data.users)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Error fetching users:', error)
      alert('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleResetPasswordChange = (e) => {
    const { name, value } = e.target
    setResetPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.password && !showEditForm) newErrors.password = 'Password is required'
    if (formData.password && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateResetPassword = () => {
    const newErrors = {}

    if (!resetPasswordData.newPassword) newErrors.newPassword = 'New password is required'
    if (resetPasswordData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters'
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitLoading(true)
    try {
      if (showEditForm && selectedUser) {
        // Update existing user (without password)
        const updateData = { ...formData }
        if (!updateData.password) {
          delete updateData.password
        }
        
        await axios.put(`/api/admin/users/${selectedUser.id}`, updateData)
        alert('User updated successfully!')
      } else {
        // Create new user
        await axios.post('/api/admin/users', formData)
        alert('User created successfully!')
      }
      
      resetForm()
      fetchUsers()
    } catch (error) {
      console.error('Error saving user:', error)
      const errorMsg = error.response?.data?.error || 'Failed to save user'
      alert(`Error: ${errorMsg}`)
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateResetPassword()) {
      return
    }

    setSubmitLoading(true)
    try {
      await axios.post(`/api/admin/users/${selectedUser.id}/reset-password`, {
        newPassword: resetPasswordData.newPassword
      })
      alert('Password reset successfully!')
      setShowResetPassword(false)
      setResetPasswordData({ newPassword: '', confirmPassword: '' })
    } catch (error) {
      console.error('Error resetting password:', error)
      alert(error.response?.data?.error || 'Failed to reset password')
    } finally {
      setSubmitLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'CUSTOMER'
    })
    setSelectedUser(null)
    setShowAddForm(false)
    setShowEditForm(false)
    setErrors({})
  }

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't show existing password
      role: user.role
    })
    setSelectedUser(user)
    setShowEditForm(true)
  }

  const handleDelete = async (userId, userEmail) => {
    if (!confirm(`Are you sure you want to delete user: ${userEmail}?`)) {
      return
    }

    try {
      await axios.delete(`/api/admin/users/${userId}`)
      alert('User deleted successfully!')
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert(error.response?.data?.error || 'Failed to delete user')
    }
  }

  const handleResetPasswordClick = (user) => {
    setSelectedUser(user)
    setShowResetPassword(true)
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }))
    }
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p>You need administrator privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage system users and permissions</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200 font-semibold flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New User
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden border">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((userItem) => (
                    <tr key={userItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {userItem.name}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {userItem.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          userItem.role === 'ADMIN' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          <Shield className="h-3 w-3 mr-1 inline" />
                          {userItem.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(userItem.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {userItem._count?.orders || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(userItem)}
                            className="text-blue-600 hover:text-blue-900 transition duration-200"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleResetPasswordClick(userItem)}
                            className="text-yellow-600 hover:text-yellow-900 transition duration-200"
                            title="Reset Password"
                          >
                            <Key className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(userItem.id, userItem.email)}
                            disabled={userItem.id === user.id}
                            className="text-red-600 hover:text-red-900 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={userItem.id === user.id ? "Cannot delete yourself" : "Delete user"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> users
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-4 py-2 border rounded-md text-sm font-medium ${
                      pagination.page === i + 1
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {users.length === 0 && (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'Try a different search term' : 'Get started by adding your first user'}
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200"
              >
                Add First User
              </button>
            </div>
          )}
        </>
      )}

      {/* Add/Edit User Modal */}
      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {showEditForm ? 'Edit User' : 'Add New User'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {(!showEditForm || formData.password) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password {!showEditForm && '*'}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={showEditForm ? "Leave empty to keep current" : "Enter password"}
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                    {showEditForm && (
                      <p className="mt-1 text-xs text-gray-500">
                        Leave empty to keep current password
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                    disabled={submitLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {submitLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    {submitLoading ? 'Saving...' : (showEditForm ? 'Update User' : 'Create User')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPassword && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Reset Password for {selectedUser.name}
              </h2>
              
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password *
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={resetPasswordData.newPassword}
                    onChange={handleResetPasswordChange}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.newPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter new password"
                  />
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={resetPasswordData.confirmPassword}
                    onChange={handleResetPasswordChange}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm new password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetPassword(false)
                      setResetPasswordData({ newPassword: '', confirmPassword: '' })
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                    disabled={submitLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {submitLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    {submitLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users