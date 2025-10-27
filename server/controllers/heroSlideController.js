import prisma from '../config/database.js';

export const getHeroSlides = async (req, res) => {
  try {
    const heroSlides = await prisma.heroSlide.findMany({
      orderBy: { order: 'asc' }
    });

    res.json(heroSlides);
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    res.status(500).json({ 
      error: 'Failed to fetch hero slides',
      details: error.message 
    });
  }
};

export const createHeroSlide = async (req, res) => {
  try {
    const { title, description, image, buttonText, buttonLink, order, active = true } = req.body;

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
    });

    res.status(201).json({
      message: 'Hero slide created successfully',
      heroSlide
    });
  } catch (error) {
    console.error('Error creating hero slide:', error);
    res.status(500).json({ 
      error: 'Failed to create hero slide',
      details: error.message 
    });
  }
};

export const updateHeroSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image, buttonText, buttonLink, order, active } = req.body;

    const heroSlide = await prisma.heroSlide.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(image && { image }),
        ...(buttonText && { buttonText }),
        ...(buttonLink && { buttonLink }),
        ...(order && { order }),
        ...(active !== undefined && { active })
      }
    });

    res.json({
      message: 'Hero slide updated successfully',
      heroSlide
    });
  } catch (error) {
    console.error('Error updating hero slide:', error);
    res.status(500).json({ 
      error: 'Failed to update hero slide',
      details: error.message 
    });
  }
};

export const deleteHeroSlide = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.heroSlide.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Hero slide deleted successfully' });
  } catch (error) {
    console.error('Error deleting hero slide:', error);
    res.status(500).json({ 
      error: 'Failed to delete hero slide',
      details: error.message 
    });
  }
};