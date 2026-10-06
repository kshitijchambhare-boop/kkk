const mongoose = require('mongoose');
// Works with a local MongoDB or MongoDB Atlas (mongodb+srv://...). Credentials come only from MONGO_URI.
module.exports = async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  console.log('MongoDB connected');
};
