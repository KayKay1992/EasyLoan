require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');

async function updateUrls() {
  try {
    // Validate MONGO_URI
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Update user profile pictures
    const userResult = await mongoose.connection.db.collection('users').updateMany(
      { profilePic: { $regex: '^http://localhost:3000' } },
      [
        {
          $set: {
            profilePic: {
              $replaceOne: {
                input: '$profilePic',
                find: 'http://localhost:3000',
                replacement: 'https://easyloan.onrender.com',
              },
            },
          },
        },
      ]
    );
    console.log(`Updated ${userResult.modifiedCount} user profile pictures`);

    // Update loan documents
    const loanResult = await mongoose.connection.db.collection('loans').updateMany(
      { documents: { $elemMatch: { $regex: '^http://localhost:3000' } } },
      [
        {
          $set: {
            documents: {
              $map: {
                input: '$documents',
                as: 'doc',
                in: {
                  $replaceOne: {
                    input: '$$doc',
                    find: 'http://localhost:3000',
                    replacement: 'https://easyloan.onrender.com',
                  },
                },
              },
            },
          },
        },
      ]
    );
    console.log(`Updated ${loanResult.modifiedCount} loan documents`);

    console.log('URLs updated successfully');
  } catch (error) {
    console.error('Error updating URLs:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

updateUrls();