
const sessionConfig = {
  secret: process.env.JWT_SECRET || '',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, 
    maxAge: 24 * 60 * 60 * 1000 // 24 jam
  }
};

export default sessionConfig;