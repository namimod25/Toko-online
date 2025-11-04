import prisma from '../config/database.js'

//  all hero slides (untuk admin)
export const getHeroSlides = async (req, res) => {
  try {
    const heroSlides = await prisma.heroSlide.findMany({
      orderBy: { order: 'asc' }
    })

    res.json(heroSlides)
  } catch (error) {
    console.error('Error fetching hero slides:', error)
    res.status(500).json({ 
      error: 'Failed to fetch hero slides',
      details: error.message 
    })
  }
}

// Get hero slides untuk landing page
export const getActiveHeroSlides = async (req, res) => {
  try {
    const heroSlides = await prisma.heroSlide.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    })

    res.json(heroSlides)
  } catch (error) {
    console.error('Error fetching active hero slides:', error)
    res.status(500).json({ 
      error: 'Failed to fetch hero slides',
      details: error.message 
    })
  }
}

// Create new hero slide
export const createHeroSlide = async (req, res) => {
  try {
    const { title, description, image, buttonText, buttonLink, order, active = true } = req.body

    // Validate required fields
    if (!title || !description || !image || !buttonText || !buttonLink) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const heroSlide = await prisma.heroSlide.create({
      data: {
        title,
        description,
        image,
        buttonText,
        buttonLink,
        order: order || 0,
        active
      }
    })

    res.status(201).json({
      message: 'Hero slide created successfully',
      heroSlide
    })
  } catch (error) {
    console.error('Error creating hero slide:', error)
    res.status(500).json({ 
      error: 'Failed to create hero slide',
      details: error.message 
    })
  }
}

// Update hero slide
export const updateHeroSlide = async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, image, buttonText, buttonLink, order, active } = req.body

    const heroSlide = await prisma.heroSlide.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(image && { image }),
        ...(buttonText && { buttonText }),
        ...(buttonLink && { buttonLink }),
        ...(order !== undefined && { order }),
        ...(active !== undefined && { active })
      }
    })

    res.json({
      message: 'Hero slide updated successfully',
      heroSlide
    })
  } catch (error) {
    console.error('Error updating hero slide:', error)
    res.status(500).json({ 
      error: 'Failed to update hero slide',
      details: error.message 
    })
  }
}

// Delete hero slide
export const deleteHeroSlide = async (req, res) => {
  try {
    const { id } = req.params

    await prisma.heroSlide.delete({
      where: { id: parseInt(id) }
    })

    res.json({ message: 'Hero slide deleted successfully' })
  } catch (error) {
    console.error('Error deleting hero slide:', error)
    res.status(500).json({ 
      error: 'Failed to delete hero slide',
      details: error.message 
    })
  }
}

// Toggle hero slide active status
export const toggleHeroSlide = async (req, res) => {
  try {
    const { id } = req.params

    const slide = await prisma.heroSlide.findUnique({
      where: { id: parseInt(id) }
    })

    if (!slide) {
      return res.status(404).json({ error: 'Hero slide not found' })
    }

    const updatedSlide = await prisma.heroSlide.update({
      where: { id: parseInt(id) },
      data: { active: !slide.active }
    })

    res.json({
      message: `Hero slide ${updatedSlide.active ? 'activated' : 'deactivated'} successfully`,
      heroSlide: updatedSlide
    })
  } catch (error) {
    console.error('Error toggling hero slide:', error)
    res.status(500).json({ 
      error: 'Failed to toggle hero slide',
      details: error.message 
    })
  }
}