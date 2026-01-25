// ==========================================
// DATABASE SCHEMA UPDATE INSTRUCTIONS
// ==========================================
// This file contains the exact code your backend developer needs to implement
// to add the missing fields to the database

// ==========================================
// 1. MONGODB SCHEMA UPDATE
// ==========================================
// Update your data model schema (usually in models/Data.js or similar)

const dataSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    instagramurl: {
        type: String,
        required: false
    },
    // ✅ ADD THESE NEW FIELDS:
    youtubeUrl: {
        type: String,
        required: false,
        default: ""
    },
    email: {
        type: String,
        required: false,
        default: ""
    },
    address: {
        type: String,
        required: false,
        default: ""
    },
    category: {
        type: String,
        required: false,
        default: ""
    },
    followersRange: {
        type: String,
        required: false,
        default: ""
    },

    // ✅ KEEP THESE EXISTING FIELDS:
    language: {
        type: String,
        required: false,
        default: ""
    },
    gender: {
        type: String,
        required: false,
        default: ""
    },
    state: {
        type: String,
        required: false,
        default: ""
    },
    city: {
        type: String,
        required: false,
        default: ""
    },
    contactno: {
        type: String,
        required: false,
        default: ""
    },
    commercial: {
        type: String,
        required: false,
        default: ""
    },

    // ✅ REMOVE THESE OLD FIELDS:
    // followers: Number,        // ❌ REMOVE THIS
    // averageView: Number,      // ❌ REMOVE THIS  
    // er: Number,               // ❌ REMOVE THIS

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true // This adds createdAt and updatedAt automatically
});

// ==========================================
// 2. DATABASE MIGRATION SCRIPT
// ==========================================
// Run this script once to update existing documents in your database

// Method 1: Using MongoDB Shell
db.data.updateMany(
    {},
    {
        $set: {
            youtubeUrl: "",
            emailAddress: "",
            address: "",
            category: "",
            followersRange: ""
        },
        $unset: {
            followers: "",
            averageView: "",
            er: ""
        }
    }
);

// Method 2: Using Node.js/Mongoose
async function migrateDatabase() {
    try {
        // Add new fields with default values
        await Data.updateMany(
            {},
            {
                $set: {
                    youtubeUrl: "",
                    emailAddress: "",
                    address: "",
                    category: "",
                    followersRange: ""
                }
            }
        );

        // Remove old fields
        await Data.updateMany(
            {},
            {
                $unset: {
                    followers: "",
                    averageView: "",
                    er: ""
                }
            }
        );

        console.log("Database migration completed successfully!");
    } catch (error) {
        console.error("Migration error:", error);
    }
}

// ==========================================
// 3. API ENDPOINT VERIFICATION
// ==========================================
// Ensure your API endpoints handle the new fields

// POST /api/data - Create new data
app.post('/api/data', async (req, res) => {
    try {
        const newData = new Data({
            name: req.body.name,
            instagramurl: req.body.instagramurl,
            youtubeUrl: req.body.youtubeUrl,        // ✅ ADD THIS
            emailAddress: req.body.emailAddress,    // ✅ ADD THIS
            address: req.body.address,              // ✅ ADD THIS
            category: req.body.category,            // ✅ ADD THIS
            followersRange: req.body.followersRange, // ✅ ADD THIS
            language: req.body.language,
            gender: req.body.gender,
            state: req.body.state,
            city: req.body.city,
            contactno: req.body.contactno,
            commercial: req.body.commercial,
            userId: req.user.id
        });

        const savedData = await newData.save();
        res.status(201).json(savedData);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT /api/data/:id - Update data
app.put('/api/data/:id', async (req, res) => {
    try {
        const updatedData = await Data.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                instagramurl: req.body.instagramurl,
                youtubeUrl: req.body.youtubeUrl,        // ✅ ADD THIS
                emailAddress: req.body.emailAddress,    // ✅ ADD THIS
                address: req.body.address,              // ✅ ADD THIS
                category: req.body.category,            // ✅ ADD THIS
                followersRange: req.body.followersRange, // ✅ ADD THIS
                language: req.body.language,
                gender: req.body.gender,
                state: req.body.state,
                city: req.body.city,
                contactno: req.body.contactno,
                commercial: req.body.commercial
            },
            { new: true }
        );

        res.json(updatedData);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ==========================================
// 4. VERIFICATION CHECKLIST
// ==========================================
// After implementing the above, verify:

// ✅ 1. Database schema includes new fields
// ✅ 2. Migration script runs successfully
// ✅ 3. API endpoints accept new fields
// ✅ 4. Frontend can save and retrieve new fields
// ✅ 5. Old fields are removed from database

// ==========================================
// 5. TESTING
// ==========================================
// Test the implementation:

// 1. Add new data via frontend form with YouTube URL, Email, Address
// 2. Check if data appears in database with new fields
// 3. Verify table displays the new fields correctly
// 4. Test editing existing records
// 5. Test export functionality includes new fields

console.log("Database schema update instructions ready!");
