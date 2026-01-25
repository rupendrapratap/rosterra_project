const mongoose = require('mongoose');
const Data = require('./models/Data');

mongoose.connect('mongodb://localhost:27017/retro-database')
    .then(async () => {
        console.log('Adding test data...');

        // Add a test record with all fields
        const testRecord = new Data({
            name: 'Test User',
            instagramurl: 'https://instagram.com/testuser',
            youtubeUrl: 'https://www.youtube.com/watch?v=test123',
            email: 'test@example.com',
            address: '123 Test Street, Test City',
            category: 'Technology',
            followersRange: '10k-50k',
            language: 'English',
            gender: 'Other',
            state: 'Test State',
            city: 'Test City',
            contactno: '+1234567890',
            commercial: 'Yes',
            userId: '507f1f77bcf86cd799439011' // Test user ID
        });

        await testRecord.save();
        console.log('Test record added successfully!');
        console.log('Record ID:', testRecord._id);

        process.exit(0);
    })
    .catch(err => {
        console.error('Database connection error:', err);
        process.exit(1);
    });
