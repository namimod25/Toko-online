import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    ArrowUp,
    ArrowDown,
    Image as ImageIcon,
    Save,
    X
} from 'lucide-react'
import axios from 'axios'

const HeroSlides = () => {
    const { user } = useAuth()
    const [heroSlides, setHeroSlides] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingSlide, setEditingSlide] = useState(null)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: '',
        buttonText: '',
        buttonLink: '',
        order: 0,
        active: true
    })
    const [errors, setErrors] = useState({})
    const [submitLoading, setSubmitLoading] = useState(false)

    useEffect(() => {
        if (user && user.role === 'ADMIN') {
            fetchHeroSlides()
        }
    }, [user])

    const fetchHeroSlides = async () => {
        try {
            const response = await axios.get('/api/admin/hero-slides')
            setHeroSlides(response.data)
        } catch (error) {
            console.error('Error fetching hero slides:', error)
            alert('Failed to load hero slides')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.title.trim()) newErrors.title = 'Title is required'
        if (!formData.description.trim()) newErrors.description = 'Description is required'
        if (!formData.image.trim()) newErrors.image = 'Image URL is required'
        if (!formData.buttonText.trim()) newErrors.buttonText = 'Button text is required'
        if (!formData.buttonLink.trim()) newErrors.buttonLink = 'Button link is required'
        if (formData.order < 0) newErrors.order = 'Order must be non-negative'

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
            if (editingSlide) {
                await axios.put(`/api/admin/hero-slides/${editingSlide.id}`, formData)
                alert('Hero slide updated successfully!')
            } else {
                await axios.post('/api/admin/hero-slides', formData)
                alert('Hero slide created successfully!')
            }

            resetForm()
            fetchHeroSlides()
        } catch (error) {
            console.error('Error saving hero slide:', error)
            alert(error.response?.data?.error || 'Failed to save hero slide')
        } finally {
            setSubmitLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            image: '',
            buttonText: '',
            buttonLink: '',
            order: 0,
            active: true
        })
        setEditingSlide(null)
        setShowForm(false)
        setErrors({})
    }

    const handleEdit = (slide) => {
        setFormData({
            title: slide.title,
            description: slide.description,
            image: slide.image,
            buttonText: slide.buttonText,
            buttonLink: slide.buttonLink,
            order: slide.order,
            active: slide.active
        })
        setEditingSlide(slide)
        setShowForm(true)
    }

    const handleDelete = async (slideId) => {
        if (!confirm('Are you sure you want to delete this hero slide?')) {
            return
        }

        try {
            await axios.delete(`/api/admin/hero-slides/${slideId}`)
            alert('Hero slide deleted successfully!')
            fetchHeroSlides()
        } catch (error) {
            console.error('Error deleting hero slide:', error)
            alert('Failed to delete hero slide')
        }
    }

    const handleToggleActive = async (slideId) => {
        try {
            await axios.patch(`/api/admin/hero-slides/${slideId}/toggle`)
            fetchHeroSlides()
        } catch (error) {
            console.error('Error toggling hero slide:', error)
            alert('Failed to toggle hero slide')
        }
    }

    const moveSlide = async (slideId, direction) => {
        const slide = heroSlides.find(s => s.id === slideId)
        const currentOrder = slide.order
        const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1

        // Find the slide that will be swapped
        const targetSlide = heroSlides.find(s => s.order === newOrder)

        if (!targetSlide) return

        try {
            // Swap orders
            await Promise.all([
                axios.put(`/api/admin/hero-slides/${slideId}`, { order: newOrder }),
                axios.put(`/api/admin/hero-slides/${targetSlide.id}`, { order: currentOrder })
            ])

            fetchHeroSlides()
        } catch (error) {
            console.error('Error moving slide:', error)
            alert('Failed to move slide')
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manage Hero Slides</h1>
                    <p className="text-gray-600 mt-2">Manage your landing page hero section slides</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200 font-semibold flex items-center"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add New Slide
                </button>
            </div>

            {/* Hero Slides List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {heroSlides.map((slide, index) => (
                    <div key={slide.id} className="bg-white rounded-lg shadow-md overflow-hidden border">
                        <div className="relative h-48 overflow-hidden">
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'
                                }}
                            />
                            <div className="absolute top-2 right-2 flex space-x-1">
                                <button
                                    onClick={() => handleToggleActive(slide.id)}
                                    className={`p-1 rounded-full ${slide.active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                                        }`}
                                >
                                    {slide.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                </button>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${slide.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {slide.active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                {slide.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {slide.description}
                            </p>

                            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                <span>Order: {slide.order}</span>
                                <span>Button: {slide.buttonText}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => moveSlide(slide.id, 'up')}
                                        disabled={index === 0}
                                        className="p-1 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ArrowUp className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => moveSlide(slide.id, 'down')}
                                        disabled={index === heroSlides.length - 1}
                                        className="p-1 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ArrowDown className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(slide)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition duration-200"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(slide.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded transition duration-200"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {heroSlides.length === 0 && (
                <div className="text-center py-12">
                    <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Hero Slides</h3>
                    <p className="text-gray-600 mb-6">Get started by creating your first hero slide</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200"
                    >
                        Create First Slide
                    </button>
                </div>
            )}

            {/* Add/Edit Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingSlide ? 'Edit Hero Slide' : 'Add New Hero Slide'}
                                </h2>
                                <button
                                    onClick={resetForm}
                                    className="text-gray-400 hover:text-gray-600 transition duration-200"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Title *
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.title ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Enter slide title"
                                        />
                                        {errors.title && (
                                            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Order
                                        </label>
                                        <input
                                            type="number"
                                            name="order"
                                            value={formData.order}
                                            onChange={handleInputChange}
                                            min="0"
                                            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.order ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Display order"
                                        />
                                        {errors.order && (
                                            <p className="mt-1 text-sm text-red-600">{errors.order}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter slide description"
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Image URL *
                                    </label>
                                    <input
                                        type="url"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.image ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    {errors.image && (
                                        <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                                    )}
                                    {formData.image && (
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                                            <img
                                                src={formData.image}
                                                alt="Preview"
                                                className="h-32 object-cover rounded border"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/400x200?text=Invalid+Image+URL'
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Button Text *
                                        </label>
                                        <input
                                            type="text"
                                            name="buttonText"
                                            value={formData.buttonText}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.buttonText ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="e.g., Shop Now, Learn More"
                                        />
                                        {errors.buttonText && (
                                            <p className="mt-1 text-sm text-red-600">{errors.buttonText}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Button Link *
                                        </label>
                                        <input
                                            type="text"
                                            name="buttonLink"
                                            value={formData.buttonLink}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.buttonLink ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="e.g., /products, /about"
                                        />
                                        {errors.buttonLink && (
                                            <p className="mt-1 text-sm text-red-600">{errors.buttonLink}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        id="active"
                                        name="active"
                                        type="checkbox"
                                        checked={formData.active}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                                        Active (visible on landing page)
                                    </label>
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
                                        <Save className="h-4 w-4 mr-2" />
                                        {submitLoading ? 'Saving...' : (editingSlide ? 'Update Slide' : 'Create Slide')}
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

export default HeroSlides