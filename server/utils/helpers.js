export const formatResponse = (success, data, message = '') => {
  return {
    success,
    data,
    message,
    timestamp: new Date().toISOString()
  };
};

export const paginate = (page = 1, limit = 10) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  return { skip, take: parseInt(limit) };
};

export const buildSearchQuery = (search) => {
  if (!search) return {};
  
  return {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } }
    ]
  };
};