const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust path as needed
const Data = require('./models/Data'); // Adjust path as needed

// Connect to MongoDB
// Note: We need the connection string. I'll try to process.env or a default local one.
// Assuming local default based on previous context or common defaults.
// The user is on Windows, likely using localhost.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/data-management-system';
// I need to check where the connection string is defined. Usually in server.js or .env.
// I'll peek at server.js first to be safe, but writing this file is fine for now as I can edit it.

async function runDebug() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Get all Users
        const users = await User.find({});
        console.log('\n--- UERS ---');
        const userMap = {};
        const adminIds = [];
        users.forEach(u => {
            console.log(`ID: ${u._id}, Name: ${u.name || u.email}, Role: ${u.role}`);
            userMap[u._id.toString()] = { name: u.name || u.email, role: u.role };
            if (u.role === 'admin') adminIds.push(u._id.toString());
        });

        // 2. Get Data Counts by User
        const allData = await Data.find({});
        console.log(`\n--- DATA STATS (Total: ${allData.length}) ---`);

        const counts = {};
        let unknownUserCount = 0;

        allData.forEach(d => {
            const uid = d.userId ? d.userId.toString() : 'null';
            if (!counts[uid]) counts[uid] = 0;
            counts[uid]++;
        });

        console.log('Count by User ID:');
        let managerVisibleCount = 0;

        for (const [uid, count] of Object.entries(counts)) {
            const userInfo = userMap[uid] || { name: 'UNKNOWN_USER', role: '???' };
            console.log(`User: ${userInfo.name} (${userInfo.role}) [${uid}] -> ${count} records`);

            // Calculate what a standard manager sees
            // Logic: Own + Admin's
            // We simulate "Standard Manager" as someone who is NOT this uid (unless they are, but let's assume we are calculating for a GENERIC manager)
            // Actually, let's verify visibility for EACH user type.
        }

        console.log('\n--- VISIBILITY ANALYSIS ---');
        // Admin sees ALL.
        console.log(`Admin sees: ${allData.length}`);

        // Simulation: For each Talent Manager found
        const managers = users.filter(u => u.role !== 'admin');
        if (managers.length === 0) {
            console.log('No Talent Managers found to simulate.');
        } else {
            managers.forEach(mgr => {
                const mgrId = mgr._id.toString();
                // Logic: Own records + Records owned by ANY Admin
                let visible = 0;
                allData.forEach(d => {
                    const dUid = d.userId ? d.userId.toString() : 'null';
                    if (dUid === mgrId || adminIds.includes(dUid)) {
                        visible++;
                    }
                });
                console.log(`Manager ${mgr.email} (${mgrId}) sees: ${visible}`);
            });
        }

        // Identify the "Missing" records for managers
        // Records not owned by Manager AND not owned by Admin
        // effectively records owned by OTHER managers (or null)

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

runDebug();
