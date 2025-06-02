require('dotenv').config();
const mongoose = require('mongoose');

async function fixAllUrls() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const patterns = [
      { find: 'http://localhost:3000', replacement: 'https://easyloan.onrender.com' },
      { find: 'https://localhost:3000', replacement: 'https://easyloan.onrender.com' },
      { find: 'https://easyloan-1.onrender.com', replacement: 'https://easyloan.onrender.com' },
    ];

    // Update user profile pictures
    for (const { find, replacement } of patterns) {
      const userResult = await mongoose.connection.db.collection('users').updateMany(
        { profilePic: { $regex: find, $options: 'i' } },
        [{
          $set: {
            profilePic: {
              $replaceOne: {
                input: '$profilePic',
                find,
                replacement,
              },
            },
          },
        }]
      );
      console.log(`Updated ${userResult.modifiedCount} user profile pictures for ${find}`);
    }

    // Update loan documents
    for (const { find, replacement } of patterns) {
      const loanResult = await mongoose.connection.db.collection('loans').updateMany(
        { documents: { $elemMatch: { $regex: find, $options: 'i' } } },
        [{
          $set: {
            documents: {
              $map: {
                input: '$documents',
                as: 'doc',
                in: {
                  $replaceOne: {
                    input: '$$doc',
                    find,
                    replacement,
                  },
                },
              },
            },
          },
        }]
      );
      console.log(`Updated ${loanResult.modifiedCount} loan documents for ${find}`);
    }

    console.log('URLs updated successfully');
  } catch (error) {
    console.error('Error updating URLs:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

fixAllUrls();