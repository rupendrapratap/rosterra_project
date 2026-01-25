const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const Data = require('../models/Data');
const auth = require('../middleware/auth');

// Configure HTTPS agent (for development - accepts self-signed certificates)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false // Only for development - set to true in production
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel files are allowed.'));
    }
  }
});

// Get all data for logged in user
router.get('/', auth, async (req, res) => {
  try {
    const data = await Data.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    console.error('Get data error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single data entry
router.get('/:id', auth, async (req, res) => {
  try {
    const data = await Data.findOne({ _id: req.params.id, userId: req.user._id });
    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Get single data error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new data entry
router.post('/', auth, async (req, res) => {
  try {
    const { name, instagramurl, youtubeUrl, email, address, category, followersRange, language, gender, state, city, contactno, commercial } = req.body;

    // Validation
    if (!name || !gender || !city || !state) {
      return res.status(400).json({ message: 'Name, gender, city, and state are required fields' });
    }

    const data = new Data({
      name,
      instagramurl: instagramurl || '',
      youtubeUrl: youtubeUrl || '',
      email: email || '',
      address: address || '',
      category: category || '',
      followersRange: followersRange || '',
      language: language || '',
      gender,
      state,
      city,
      contactno: contactno || '',
      commercial: commercial || '',
      userId: req.user._id
    });

    await data.save();
    res.status(201).json({ message: 'Data created successfully', data });
  } catch (error) {
    console.error('Create data error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update data entry
router.put('/:id', auth, async (req, res) => {
  try {
    // Only admins can update data
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can edit data.' });
    }

    const { name, instagramurl, youtubeUrl, email, address, category, followersRange, language, gender, state, city, contactno, commercial } = req.body;

    const data = await Data.findOne({ _id: req.params.id, userId: req.user._id });
    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }

    if (name !== undefined) data.name = name;
    if (instagramurl !== undefined) data.instagramurl = instagramurl;
    if (youtubeUrl !== undefined) data.youtubeUrl = youtubeUrl;
    if (email !== undefined) data.email = email;
    if (address !== undefined) data.address = address;
    if (category !== undefined) data.category = category;
    if (followersRange !== undefined) data.followersRange = followersRange;
    if (language !== undefined) data.language = language;
    if (gender !== undefined) data.gender = gender;
    if (state !== undefined) data.state = state;
    if (city !== undefined) data.city = city;
    if (contactno !== undefined) data.contactno = contactno;
    if (commercial !== undefined) data.commercial = commercial;
    data.updatedAt = Date.now();

    await data.save();
    res.json({ message: 'Data updated successfully', data });
  } catch (error) {
    console.error('Update data error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete data entry
router.delete('/:id', auth, async (req, res) => {
  try {
    // Only admins can delete data
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can delete data.' });
    }

    const data = await Data.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }
    res.json({ message: 'Data deleted successfully' });
  } catch (error) {
    console.error('Delete data error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete multiple data entries
router.post('/delete-multiple', auth, async (req, res) => {
  try {
    // Only admins can delete data
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can delete data.' });
    }

    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Please provide array of IDs' });
    }

    const result = await Data.deleteMany({
      _id: { $in: ids },
      userId: req.user._id
    });

    res.json({ message: `${result.deletedCount} record(s) deleted successfully` });
  } catch (error) {
    console.error('Delete multiple error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload Excel file
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Read Excel file
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    // Helper function to get field value (case-insensitive and handles spaces/underscores)
    const getField = (row, possibleKeys) => {
      // First try exact matches
      for (let key of possibleKeys) {
        if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
          return String(row[key]).trim();
        }
      }
      // Then try case-insensitive matches
      const rowKeys = Object.keys(row);
      for (let key of possibleKeys) {
        for (let rowKey of rowKeys) {
          if (rowKey.toLowerCase().replace(/[\s_\-]/g, '') === key.toLowerCase().replace(/[\s_\-]/g, '')) {
            if (row[rowKey] !== undefined && row[rowKey] !== null && row[rowKey] !== '') {
              return String(row[rowKey]).trim();
            }
          }
        }
      }
      return '';
    };

    // Process and validate data
    const processedData = [];
    for (let row of jsonData) {
      const name = getField(row, ['name', 'Name', 'NAME', 'fullname', 'Full Name']);
      const instagramurl = getField(row, ['instagramurl', 'Instagram URL', 'instagram url', 'instagram', 'Instagram', 'insta url', 'Insta URL']);
      const followersStr = getField(row, ['followers', 'Followers', 'FOLLOWERS', 'follower', 'Follower']);
      const followers = followersStr ? parseInt(followersStr) : 0;
      const averageViewStr = getField(row, ['averageview', 'Average View', 'average view', 'avg view', 'Avg View', 'averageviews', 'Average Views']);
      const averageView = averageViewStr ? parseInt(averageViewStr) : 0;
      const erStr = getField(row, ['er', 'ER', 'er (%)', 'ER (%)', 'engagement rate', 'Engagement Rate', 'engagement', 'Engagement']);
      const er = erStr ? parseFloat(erStr) : 0;
      const language = getField(row, ['language', 'Language', 'LANGUAGE', 'lang', 'Lang']);
      const gender = getField(row, ['gender', 'Gender', 'GENDER', 'sex', 'Sex']);
      const state = getField(row, ['state', 'State', 'STATE']);
      const city = getField(row, ['city', 'City', 'CITY']);
      const contactno = getField(row, ['contactno', 'Contact No', 'contact no', 'Contact Number', 'contact number', 'ContactNo', 'contactNo', 'CONTACTNO', 'contact_no', 'Contact_No', 'CONTACT_NO', 'phone', 'Phone', 'PHONE', 'phone number', 'Phone Number', 'phone_number', 'Phone_Number', 'mobile', 'Mobile', 'MOBILE', 'mobile number', 'Mobile Number', 'mobile_number', 'Mobile_Number', 'contact', 'Contact', 'CONTACT', 'whatsapp', 'WhatsApp', 'whatsapp number', 'WhatsApp Number']);
      const commercial = getField(row, ['commercial', 'Commercial', 'COMMERCIAL', 'Commercials', 'commercials', 'COMMERCIALS', 'commercial value', 'Commercial Value', 'commercial_value', 'Commercial_Value']);

      if (name && gender && city && state) {
        const dataEntry = {
          name,
          instagramurl: instagramurl || '',
          followers: !isNaN(followers) && followers >= 0 ? followers : 0,
          averageView: !isNaN(averageView) && averageView >= 0 ? averageView : 0,
          er: !isNaN(er) && er >= 0 && er <= 100 ? er : 0,
          language: language || '',
          gender: ['Male', 'Female', 'Other'].includes(gender) ? gender : 'Other',
          state,
          city,
          contactno: contactno || '',
          commercial: commercial || '',
          userId: req.user._id
        };
        processedData.push(dataEntry);
      }
    }

    if (processedData.length === 0) {
      return res.status(400).json({ message: 'No valid data found in Excel file' });
    }

    // Insert data
    const result = await Data.insertMany(processedData);
    res.json({
      message: `Successfully imported ${result.length} record(s)`,
      count: result.length,
      data: result
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error processing file', error: error.message });
  }
});

// Helper function to download file from URL
const downloadFile = (url, redirectCount = 0) => {
  return new Promise((resolve, reject) => {
    // Prevent infinite redirects
    if (redirectCount > 5) {
      reject(new Error('Too many redirects'));
      return;
    }

    try {
      const parsedUrl = new URL(url);
      const client = parsedUrl.protocol === 'https:' ? https : http;

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname + (parsedUrl.search || ''),
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache'
        },
        timeout: 30000, // 30 seconds timeout
        agent: parsedUrl.protocol === 'https:' ? httpsAgent : undefined
      };

      const req = client.request(options, (response) => {
        // Handle redirects
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          const redirectUrl = new URL(response.headers.location, url).href;
          return downloadFile(redirectUrl, redirectCount + 1).then(resolve).catch(reject);
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download file: HTTP ${response.statusCode} ${response.statusMessage}`));
          return;
        }

        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', reject);
      });

      req.on('error', (error) => {
        reject(new Error(`Network error: ${error.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    } catch (error) {
      reject(new Error(`Invalid URL: ${error.message}`));
    }
  });
};

// Helper function to convert Google Sheets URL to CSV export URL
const convertGoogleSheetsUrl = (url) => {
  try {
    const urlObj = new URL(url);

    // Check if it's a Google Sheets URL
    if (urlObj.hostname.includes('docs.google.com') && urlObj.pathname.includes('/spreadsheets/')) {
      // Extract spreadsheet ID
      const match = urlObj.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match) {
        const sheetId = match[1];
        // Extract gid from URL if present, otherwise use 0
        const gidMatch = urlObj.hash.match(/gid=(\d+)/);
        const gid = gidMatch ? gidMatch[1] : '0';
        // Convert to CSV export URL - make sure sheet is publicly accessible
        return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
      }
    }

    return url; // Return original URL if not Google Sheets
  } catch (error) {
    return url; // Return original URL on error
  }
};

// Import from URL (Google Sheets, CSV, Excel files)
router.post('/import-url', auth, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'Please provide a URL' });
    }

    // Convert Google Sheets URL to CSV export if needed
    const downloadUrl = convertGoogleSheetsUrl(url);

    // Download the file
    let fileBuffer;
    try {
      console.log(`Attempting to download from URL: ${downloadUrl}`);
      fileBuffer = await downloadFile(downloadUrl);
      console.log(`Successfully downloaded ${fileBuffer.length} bytes`);
    } catch (error) {
      console.error('Download error:', error);
      return res.status(400).json({
        message: `Failed to download file from URL: ${error.message}`,
        details: 'Make sure the URL is accessible and the file is publicly available. For Google Sheets, ensure the sheet is shared with "Anyone with the link can view" permission.'
      });
    }

    // Determine file type and parse
    let jsonData = [];
    const urlLower = url.toLowerCase();

    if (urlLower.includes('.csv') || urlLower.includes('format=csv') || urlLower.includes('docs.google.com')) {
      // Parse CSV with proper handling of quoted fields
      const csvString = fileBuffer.toString('utf-8');
      const lines = csvString.split(/\r?\n/).filter(line => line.trim());

      if (lines.length === 0) {
        return res.status(400).json({ message: 'CSV file is empty' });
      }

      // Parse CSV line handling quoted fields
      const parseCSVLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          const nextChar = line[i + 1];

          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              current += '"';
              i++; // Skip next quote
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };

      const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim());

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = parseCSVLine(lines[i]).map(v => v.replace(/^"|"$/g, '').trim());
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        jsonData.push(row);
      }
    } else if (urlLower.includes('.xlsx') || urlLower.includes('.xls')) {
      // Parse Excel
      const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      jsonData = xlsx.utils.sheet_to_json(worksheet);
    } else {
      // Try to parse as Excel first, then CSV
      try {
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        jsonData = xlsx.utils.sheet_to_json(worksheet);
      } catch (error) {
        // Fallback to CSV with proper parsing
        const csvString = fileBuffer.toString('utf-8');
        const lines = csvString.split(/\r?\n/).filter(line => line.trim());

        if (lines.length === 0) {
          return res.status(400).json({ message: 'File is empty or invalid format' });
        }

        // Parse CSV line handling quoted fields
        const parseCSVLine = (line) => {
          const result = [];
          let current = '';
          let inQuotes = false;

          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
              if (inQuotes && nextChar === '"') {
                current += '"';
                i++; // Skip next quote
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim());

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const values = parseCSVLine(lines[i]).map(v => v.replace(/^"|"$/g, '').trim());
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          jsonData.push(row);
        }
      }
    }

    // Helper function to get field value (case-insensitive and handles spaces/underscores)
    const getField = (row, possibleKeys) => {
      // First try exact matches
      for (let key of possibleKeys) {
        if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
          return String(row[key]).trim();
        }
      }
      // Then try case-insensitive matches
      const rowKeys = Object.keys(row);
      for (let key of possibleKeys) {
        for (let rowKey of rowKeys) {
          if (rowKey.toLowerCase().replace(/[\s_\-]/g, '') === key.toLowerCase().replace(/[\s_\-]/g, '')) {
            if (row[rowKey] !== undefined && row[rowKey] !== null && row[rowKey] !== '') {
              return String(row[rowKey]).trim();
            }
          }
        }
      }
      return '';
    };

    // Process and validate data
    const processedData = [];
    for (let row of jsonData) {
      const name = getField(row, ['name', 'Name', 'NAME', 'fullname', 'Full Name']);
      const instagramurl = getField(row, ['instagramurl', 'Instagram URL', 'instagram url', 'instagram', 'Instagram', 'insta url', 'Insta URL']);
      const followersStr = getField(row, ['followers', 'Followers', 'FOLLOWERS', 'follower', 'Follower']);
      const followers = followersStr ? parseInt(followersStr) : 0;
      const averageViewStr = getField(row, ['averageview', 'Average View', 'average view', 'avg view', 'Avg View', 'averageviews', 'Average Views']);
      const averageView = averageViewStr ? parseInt(averageViewStr) : 0;
      const erStr = getField(row, ['er', 'ER', 'er (%)', 'ER (%)', 'engagement rate', 'Engagement Rate', 'engagement', 'Engagement']);
      const er = erStr ? parseFloat(erStr) : 0;
      const language = getField(row, ['language', 'Language', 'LANGUAGE', 'lang', 'Lang']);
      const gender = getField(row, ['gender', 'Gender', 'GENDER', 'sex', 'Sex']);
      const state = getField(row, ['state', 'State', 'STATE']);
      const city = getField(row, ['city', 'City', 'CITY']);
      const contactno = getField(row, ['contactno', 'Contact No', 'contact no', 'Contact Number', 'contact number', 'ContactNo', 'contactNo', 'CONTACTNO', 'contact_no', 'Contact_No', 'CONTACT_NO', 'phone', 'Phone', 'PHONE', 'phone number', 'Phone Number', 'phone_number', 'Phone_Number', 'mobile', 'Mobile', 'MOBILE', 'mobile number', 'Mobile Number', 'mobile_number', 'Mobile_Number', 'contact', 'Contact', 'CONTACT', 'whatsapp', 'WhatsApp', 'whatsapp number', 'WhatsApp Number']);
      const commercial = getField(row, ['commercial', 'Commercial', 'COMMERCIAL', 'Commercials', 'commercials', 'COMMERCIALS', 'commercial value', 'Commercial Value', 'commercial_value', 'Commercial_Value']);

      if (name && gender && city && state) {
        const dataEntry = {
          name,
          instagramurl: instagramurl || '',
          followers: !isNaN(followers) && followers >= 0 ? followers : 0,
          averageView: !isNaN(averageView) && averageView >= 0 ? averageView : 0,
          er: !isNaN(er) && er >= 0 && er <= 100 ? er : 0,
          language: language || '',
          gender: ['Male', 'Female', 'Other'].includes(gender) ? gender : 'Other',
          state,
          city,
          contactno: contactno || '',
          commercial: commercial || '',
          userId: req.user._id
        };
        processedData.push(dataEntry);
      }
    }

    if (processedData.length === 0) {
      return res.status(400).json({ message: 'No valid data found in the file' });
    }

    // Insert data
    const result = await Data.insertMany(processedData);
    res.json({
      message: `Successfully imported ${result.length} record(s) from URL`,
      count: result.length,
      data: result
    });
  } catch (error) {
    console.error('Import URL error:', error);
    res.status(500).json({ message: 'Error processing URL', error: error.message });
  }
});

module.exports = router;


