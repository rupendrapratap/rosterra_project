const mongoose = require('mongoose');
const Data = require('./models/Data');

mongoose.connect('mongodb://localhost:27017/retro-database')
    .then(async () => {
        console.log('Checking database records...');

        // Get first record
        const record = await Data.findOne({});
        if (record) {
            console.log('First record found:');
            console.log('  ID:', record._id);
            console.log('  Name:', record.name);
            console.log('  Email:', record.email);
            console.log('  YouTube URL:', record.youtubeUrl);
            console.log('  Address:', record.address);
            console.log('  Category:', record.category);
            console.log('  Followers Range:', record.followersRange);
            console.log('  ---');
        } else {
            console.log('No records found in database');
        }

        // Check if email field exists in schema
        const schemaFields = Object.keys(Data.schema.paths);
        console.log('Schema fields:', schemaFields);
        console.log('Has email field:', schemaFields.includes('email'));

        process.exit(0);
    })
    .catch(err => {
        console.error('Database connection error:', err);
        process.exit(1);
    });
