
const sessionConfig = {
  secret: process.env.JWT_SECRET || '5001',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure:  process.env.NODE_ENV === 'produxtion', 
    maxAge: 24 * 60 * 60 * 1000 
  }
};

export default sessionConfig;