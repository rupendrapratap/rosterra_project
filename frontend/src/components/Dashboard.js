import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import * as XLSX from 'xlsx';
import ImportMapper from './ImportMapper';
import './Dashboard.css';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Other'
];

const STATE_CITIES = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
  'Karnataka': ['Bangalore', 'Hubli', 'Mysore', 'Gulbarga', 'Belgaum'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Noida'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'],
  'Haryana': ['Gurgaon', 'Faridabad', 'Panipat', 'Ambala'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat'],
  'Other': ['Inter-state', 'International']
};

const CATEGORIES = [
  'Lifestyle', 'Fashion', 'Tech', 'Education', 'Entertainment', 'Finance',
  'Travel', 'Food', 'Health & Fitness', 'Gaming', 'Beauty', 'Business', 'Other'
];

const PLATFORMS = [
  'Instagram', 'YouTube', 'TikTok', 'Facebook', 'Twitter', 'Other'
];

const LANGUAGES = [
  'English', 'Hindi', 'Punjabi', 'Bengali', 'Gujarati', 'Marathi',
  'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Other'
];

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [importUrl, setImportUrl] = useState('');
  const [showUrlImport, setShowUrlImport] = useState(false);
  const [showFilterCategories, setShowFilterCategories] = useState(false);
  const [showFormCategories, setShowFormCategories] = useState(false);
  const [showFormPlatforms, setShowFormPlatforms] = useState(false);
  const [showImportMapper, setShowImportMapper] = useState(false);
  const [importFile, setImportFile] = useState(null);

  const [showFilterPlatforms, setShowFilterPlatforms] = useState(false);
  const [showFilterLanguages, setShowFilterLanguages] = useState(false);
  const [showFormLanguages, setShowFormLanguages] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    instagramurl: '',
    youtubeurl: '',
    email: '',
    followers: '',
    language: [],
    gender: '',
    state: '',
    city: '',
    contactno: '',
    commercial: '',
    category: [],
    platform: [],
    averageView: 0,
    er: 0,
    age: '',
    contentType: ''
  });
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  };

  // Filters
  const [filters, setFilters] = useState({
    name: '',
    instagramurl: '',
    youtubeurl: '',
    email: '',
    followers: '',
    language: [],
    gender: '',
    state: '',
    city: '',
    contactno: '',
    commercial: '',
    category: [],
    platform: []
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/data');
      setData(response.data);
      setFilteredData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...data];

    if (filters.name) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(filters.name.toLowerCase())
      );
    }



    if (filters.youtubeurl) {
      filtered = filtered.filter(item =>
        item.youtubeurl?.toLowerCase().includes(filters.youtubeurl.toLowerCase())
      );
    }

    if (filters.email) {
      filtered = filtered.filter(item =>
        item.email?.toLowerCase().includes(filters.email.toLowerCase())
      );
    }

    if (filters.followers) {
      filtered = filtered.filter(item => {
        const itemFollowers = item.followers;
        const range = filters.followers;

        // If it's already a range string, compare directly
        if (typeof itemFollowers === 'string' && (itemFollowers.includes('-') || itemFollowers.includes('+'))) {
          return itemFollowers === range;
        }

        // Fallback for numbers
        const val = parseInt(itemFollowers) || 0;
        if (range === '1-5k') return val >= 1000 && val <= 5000;
        if (range === '5-10k') return val > 5000 && val <= 10000;
        if (range === '10-20k') return val > 10000 && val <= 20000;
        if (range === '20-50k') return val > 20000 && val <= 50000;
        if (range === '50-100k') return val > 50000 && val <= 100000;
        if (range === '100-300k') return val > 100000 && val <= 300000;
        if (range === '300-500k') return val > 300000 && val <= 500000;
        if (range === '500+') return val > 500000;

        return true;
      });
    }

    if (filters.language && filters.language.length > 0) {
      filtered = filtered.filter(item => {
        const itemLanguages = Array.isArray(item.language)
          ? item.language
          : (item.language ? [item.language] : []);

        return filters.language.some(l => itemLanguages.includes(l));
      });
    }

    if (filters.gender) {
      filtered = filtered.filter(item =>
        item.gender?.toLowerCase() === filters.gender.toLowerCase()
      );
    }

    if (filters.state) {
      filtered = filtered.filter(item =>
        item.state === filters.state
      );
    }

    if (filters.city) {
      filtered = filtered.filter(item =>
        item.city === filters.city
      );
    }

    if (filters.contactno) {
      filtered = filtered.filter(item =>
        item.contactno?.toLowerCase().includes(filters.contactno.toLowerCase())
      );
    }

    if (filters.commercial) {
      filtered = filtered.filter(item =>
        item.commercial?.toLowerCase().includes(filters.commercial.toLowerCase())
      );
    }

    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter(item => {
        const itemCategories = Array.isArray(item.category)
          ? item.category
          : (item.category ? [item.category] : []);

        return filters.category.some(c => itemCategories.includes(c));
      });
    }

    if (filters.platform && filters.platform.length > 0) {
      filtered = filtered.filter(item => {
        const itemPlatforms = Array.isArray(item.platform)
          ? item.platform
          : (item.platform ? [item.platform] : []);

        return filters.platform.some(p => itemPlatforms.includes(p));
      });
    }

    setFilteredData(filtered);
  };

  const handleCategoryToggle = (cat) => {
    setFilters(prev => {
      const current = prev.category;
      const next = current.includes(cat)
        ? current.filter(c => c !== cat)
        : [...current, cat];
      return { ...prev, category: next };
    });
  };

  const handleFilterPlatformToggle = (platform) => {
    setFilters(prev => {
      const current = prev.platform || [];
      const next = current.includes(platform)
        ? current.filter(p => p !== platform)
        : [...current, platform];
      return { ...prev, platform: next };
    });
  };

  const handlePlatformToggle = (platform) => {
    setFormData(prev => {
      const current = prev.platform || [];
      const next = current.includes(platform)
        ? current.filter(p => p !== platform)
        : [...current, platform];
      return { ...prev, platform: next };
    });
  };


  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportFile(file);
    setShowImportMapper(true);
    e.target.value = ''; // Reset input
  };

  const handleMappedImport = async (mappedData) => {
    try {
      setLoading(true);
      const response = await api.post('/api/data/import-json', { data: mappedData });
      alert(response.data.message);
      setShowImportMapper(false);
      setImportFile(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error importing data');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlImport = async () => {
    if (!importUrl.trim()) {
      alert('Please enter a URL');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/api/data/import-url', { url: importUrl });
      alert(`Successfully imported ${response.data.count} record(s) from URL!`);
      setImportUrl('');
      setShowUrlImport(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error importing from URL');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFormCategoryToggle = (cat) => {
    setFormData(prev => {
      const current = prev.category || [];
      const next = current.includes(cat)
        ? current.filter(c => c !== cat)
        : [...current, cat];
      return { ...prev, category: next };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      if (editingItem) {
        await api.put(`/api/data/${editingItem._id}`, formData);
        alert('Data updated successfully!');
      } else {
        await api.post('/api/data', formData);
        alert('Data added successfully!');
      }

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      instagramurl: item.instagramurl || '',
      youtubeurl: item.youtubeurl || '',
      email: item.email || '',
      followers: item.followers || '',
      language: Array.isArray(item.language) ? item.language : (item.language ? [item.language] : []),
      gender: item.gender || '',
      state: item.state || '',
      city: item.city || '',
      contactno: item.contactno || '',
      commercial: item.commercial || '',
      category: Array.isArray(item.category) ? item.category : (item.category ? [item.category] : []),
      platform: Array.isArray(item.platform) ? item.platform : (item.platform ? [item.platform] : []),
      averageView: item.averageView || 0,
      er: item.er || 0,
      age: item.age || '',
      contentType: item.contentType || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/api/data/${id}`);
      alert('Entry deleted successfully!');
      fetchData();
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting data');
    } finally {
      setLoading(false);
    }
  };



  const handleLanguageToggle = (lang) => {
    setFormData(prev => {
      const languages = Array.isArray(prev.language) ? prev.language : (prev.language ? [prev.language] : []);
      if (languages.includes(lang)) {
        return { ...prev, language: languages.filter(l => l !== lang) };
      } else {
        return { ...prev, language: [...languages, lang] };
      }
    });
  };

  const handleFilterLanguageToggle = (lang) => {
    setFilters(prev => {
      const languages = Array.isArray(prev.language) ? prev.language : (prev.language ? [prev.language] : []);
      if (languages.includes(lang)) {
        return { ...prev, language: languages.filter(l => l !== lang) };
      } else {
        return { ...prev, language: [...languages, lang] };
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredData.map(item => item._id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const exportSelected = () => {
    if (selectedIds.size === 0) {
      alert('Please select at least one record to export.');
      return;
    }

    const selectedData = data.filter(item => selectedIds.has(item._id));
    exportToExcel(selectedData, 'selected-data');
  };

  const exportAll = () => {
    if (data.length === 0) {
      alert('No data to export!');
      return;
    }
    exportToExcel(data, 'all-data');
  };

  const exportToExcel = (dataToExport, filename) => {
    const exportData = dataToExport.map(item => ({
      'Name': item.name || '',
      'Instagram URL': item.instagramurl || '',
      'YouTube URL': item.youtubeurl || '',
      'Email': item.email || '',
      'Followers': item.followers || 0,
      'Average View': item.averageView || 0,
      'ER (%)': item.er || 0,
      'Language': Array.isArray(item.language) ? item.language.join(', ') : (item.language || ''),
      'Gender': item.gender || '',
      'State': item.state || '',
      'City': item.city || '',
      'Contact No': item.contactno || '',
      'Commercial': item.commercial || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `${filename}-${dateStr}.xlsx`);
    alert(`Exported ${dataToExport.length} record(s) successfully!`);
  };

  const clearAllData = async () => {
    if (!window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const ids = Array.from(selectedIds);
      if (ids.length > 0) {
        await api.post('/api/data/delete-multiple', { ids });
        alert('Selected data cleared!');
      } else {
        // Delete all
        for (let item of data) {
          await api.delete(`/api/data/${item._id}`);
        }
        alert('All data cleared!');
      }
      fetchData();
      setSelectedIds(new Set());
    } catch (error) {
      alert(error.response?.data?.message || 'Error clearing data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      instagramurl: '',
      youtubeurl: '',
      email: '',
      followers: '',
      language: '',
      gender: '',
      state: '',
      city: '',
      contactno: '',
      commercial: '',
      category: [],
      platform: '',
      averageView: 0,
      er: 0,
      age: '',
      contentType: ''
    });
    setEditingItem(null);
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      instagramurl: '',
      youtubeurl: '',
      email: '',
      followers: '',
      language: '',
      gender: '',
      state: '',
      city: '',
      contactno: '',
      commercial: '',
      category: [],
      platform: ''
    });
  };



  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="dashboard-body">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2 className="rosterra-logo">Rosterra</h2>
          </div>
          <div className="nav-user">
            <button onClick={toggleTheme} style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              marginRight: '1rem'
            }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <span className="user-email">{user?.email}</span>
            <span className="user-role" style={{ marginLeft: '10px', padding: '4px 8px', backgroundColor: user?.role === 'admin' ? '#4CAF50' : '#2196F3', color: 'white', borderRadius: '4px', fontSize: '12px' }}>
              {user?.role === 'admin' ? 'Admin' : 'Talent Manager'}
            </span>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Rosterra Dashboard</h1>
            <div className="data-stats">
              <div className="stat-item">
                <span className="stat-label">Total Records:</span>
                <span className="stat-value">{data.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Selected:</span>
                <span className="stat-value">{selectedIds.size}</span>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="upload-section">
            {(user?.role === 'admin' || user?.role === 'talent_manager') && (
              <div className="upload-card">
                <h3>📤 Upload Excel/CSV File</h3>
                <p>Upload a file (.xlsx, .xls, .csv) to import data</p>
                <input
                  type="file"
                  id="excelFileInput"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <button
                  className="btn btn-primary"
                  onClick={() => document.getElementById('excelFileInput').click()}
                >
                  Choose File
                </button>
              </div>
            )}

            <div className="action-buttons-top">
              {(user?.role === 'admin' || user?.role === 'talent_manager') && (
                <button className="btn btn-secondary" onClick={() => { resetForm(); setShowModal(true); }}>
                  ➕ Add Data Manually
                </button>
              )}
              {user?.role === 'admin' && (
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate('/admin/signup')}
                >
                  👤 Create User
                </button>
              )}
              <button
                className="btn btn-primary"
                onClick={exportSelected}
                disabled={selectedIds.size === 0}
              >
                📥 Export Selected
              </button>
              <button className="btn btn-secondary" onClick={exportAll}>
                📥 Export All
              </button>
              {(user?.role === 'admin' || user?.role === 'talent_manager') && (
                <button className="btn btn-secondary" onClick={() => setShowUrlImport(!showUrlImport)}>
                  🔗 Import from URL
                </button>
              )}
              {user?.role === 'admin' && (
                <button className="btn btn-danger" onClick={clearAllData}>
                  🗑️ Clear Selected
                </button>
              )}
            </div>
            {showUrlImport && (user?.role === 'admin' || user?.role === 'talent_manager') && (
              <div className="url-import-section" style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <h4>Import from URL (Google Sheets, CSV, Excel)</h4>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <input
                    type="text"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    placeholder="Enter URL (e.g., Google Sheets link, CSV URL, Excel file URL)"
                    style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                  <button className="btn btn-primary" onClick={handleUrlImport} disabled={loading}>
                    Import
                  </button>
                  <button className="btn btn-secondary" onClick={() => { setShowUrlImport(false); setImportUrl(''); }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {showImportMapper && importFile && (
            <ImportMapper
              file={importFile}
              onImport={handleMappedImport}
              onClose={() => {
                setShowImportMapper(false);
                setImportFile(null);
              }}
            />
          )}

          {/* Filters Section */}
          <div className="filters-section">
            <h3>🔍 Filter Data</h3>
            <div className="filters-grid">
              <div className="filter-group">
                <label htmlFor="filterName">Name</label>
                <input
                  type="text"
                  id="filterName"
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  placeholder="Search by name..."
                />
              </div>

              <div className="filter-group full-width">
                <label>Platform (Click to select)</label>
                <button
                  type="button"
                  className={`btn-toggle-categories ${showFilterPlatforms ? 'active' : ''}`}
                  onClick={() => setShowFilterPlatforms(!showFilterPlatforms)}
                >
                  {showFilterPlatforms ? 'Close Platform Panel' : 'Open Platform Panel'}
                  {(filters.platform || []).length > 0 && <span className="selected-count">{(filters.platform || []).length} Selected</span>}
                </button>
                {showFilterPlatforms && (
                  <div className="dnd-container animate-in">
                    <div className="dnd-zone">
                      <span>Available Pool</span>
                      <div className="category-dnd-list">
                        {PLATFORMS.filter(p => !(filters.platform || []).includes(p)).map(p => (
                          <div
                            key={p}
                            className="category-tag available"
                            onClick={() => handleFilterPlatformToggle(p)}
                          >
                            {p}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="dnd-zone">
                      <span>Selected Platforms</span>
                      <div className="category-dnd-list selected">
                        {(filters.platform || []).map(p => (
                          <div
                            key={p}
                            className="category-tag selected"
                            onClick={() => handleFilterPlatformToggle(p)}
                          >
                            {p}
                          </div>
                        ))}
                        {(filters.platform || []).length === 0 && <div className="dnd-placeholder">No platforms selected</div>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="filter-group full-width">
                <label>Categories (Click to select)</label>
                <button
                  type="button"
                  className={`btn-toggle-categories ${showFilterCategories ? 'active' : ''}`}
                  onClick={() => setShowFilterCategories(!showFilterCategories)}
                >
                  {showFilterCategories ? 'Close Category Panel' : 'Open Category Panel'}
                  {(filters.category || []).length > 0 && <span className="selected-count">{(filters.category || []).length} Selected</span>}
                </button>
                {showFilterCategories && (
                  <div className="dnd-container animate-in">
                    <div className="dnd-zone">
                      <span>Available Pool</span>
                      <div className="category-dnd-list">
                        {CATEGORIES.filter(cat => !(filters.category || []).includes(cat)).map(cat => (
                          <div key={cat} className="category-tag available" onClick={() => handleCategoryToggle(cat)}>
                            {cat}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="dnd-zone">
                      <span>Selected Categories</span>
                      <div className="category-dnd-list selected">
                        {(filters.category || []).map(cat => (
                          <div key={cat} className="category-tag selected" onClick={() => handleCategoryToggle(cat)}>
                            {cat}
                          </div>
                        ))}
                        {(filters.category || []).length === 0 && <div className="dnd-placeholder">No categories selected</div>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="filter-group">
                <label htmlFor="filterEmail">Email</label>
                <input
                  type="text"
                  id="filterEmail"
                  value={filters.email}
                  onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                  placeholder="Filter by email..."
                />
              </div>
              <div className="filter-group">
                <label htmlFor="filterFollowers">Followers Range</label>
                <select
                  id="filterFollowers"
                  value={filters.followers}
                  onChange={(e) => setFilters({ ...filters, followers: e.target.value })}
                >
                  <option value="">All Ranges</option>
                  <option value="1-5k">1-5k</option>
                  <option value="5-10k">5-10k</option>
                  <option value="10-20k">10-20k</option>
                  <option value="20-50k">20-50k</option>
                  <option value="50-100k">50-100k</option>
                  <option value="100-300k">100-300k</option>
                  <option value="300-500k">300-500k</option>
                  <option value="500+">500+</option>
                </select>
              </div>
              <div className="filter-group full-width">
                <label>Language (Click to select)</label>
                <button
                  type="button"
                  className={`btn-toggle-categories ${showFilterLanguages ? 'active' : ''}`}
                  onClick={() => setShowFilterLanguages(!showFilterLanguages)}
                >
                  {showFilterLanguages ? 'Close Language Panel' : 'Open Language Panel'}
                  {(filters.language || []).length > 0 && <span className="selected-count">{(filters.language || []).length} Selected</span>}
                </button>
                {showFilterLanguages && (
                  <div className="dnd-container animate-in">
                    <div className="dnd-zone">
                      <span>Available Pool</span>
                      <div className="category-dnd-list">
                        {LANGUAGES.filter(lang => !(filters.language || []).includes(lang)).map(lang => (
                          <div
                            key={lang}
                            className="category-tag available"
                            onClick={() => handleFilterLanguageToggle(lang)}
                          >
                            {lang}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="dnd-zone">
                      <span>Selected Languages</span>
                      <div className="category-dnd-list selected">
                        {(filters.language || []).map(lang => (
                          <div
                            key={lang}
                            className="category-tag selected"
                            onClick={() => handleFilterLanguageToggle(lang)}
                          >
                            {lang}
                          </div>
                        ))}
                        {(filters.language || []).length === 0 && <div className="dnd-placeholder">No languages selected</div>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="filter-group">
                <label htmlFor="filterGender">Gender</label>
                <select
                  id="filterGender"
                  value={filters.gender}
                  onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                >
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="filterState">State</label>
                <select
                  id="filterState"
                  value={filters.state}
                  onChange={(e) => setFilters({ ...filters, state: e.target.value, city: '' })}
                >
                  <option value="">All States</option>
                  {INDIAN_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="filterCity">City</label>
                <select
                  id="filterCity"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  disabled={!filters.state}
                >
                  <option value="">{filters.state ? 'All Cities' : 'Select State First'}</option>
                  {filters.state && STATE_CITIES[filters.state]?.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="filterContactNo">Contact No</label>
                <input
                  type="text"
                  id="filterContactNo"
                  value={filters.contactno}
                  onChange={(e) => setFilters({ ...filters, contactno: e.target.value })}
                  placeholder="Filter by contact no..."
                />
              </div>
              <div className="filter-group">
                <label htmlFor="filterCommercial">Commercial</label>
                <input
                  type="text"
                  id="filterCommercial"
                  value={filters.commercial}
                  onChange={(e) => setFilters({ ...filters, commercial: e.target.value })}
                  placeholder="Filter by commercial..."
                />
              </div>
            </div>
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>

          {/* Data Table */}
          <div className="table-section">
            <div className="table-header">
              <h3>Data Table</h3>
              <div className="table-controls">
                <label className="select-all-label">
                  <input
                    type="checkbox"
                    checked={filteredData.length > 0 && selectedIds.size === filteredData.length}
                    onChange={handleSelectAll}
                  />
                  <span>Select All</span>
                </label>
              </div>
            </div>

            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="checkbox-col">
                        <input
                          type="checkbox"
                          checked={filteredData.length > 0 && selectedIds.size === filteredData.length}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Instagram URL</th>
                      <th>YouTube URL</th>
                      <th>Category</th>
                      <th>Platform</th>
                      <th>Followers</th>
                      <th>Language</th>
                      <th>Gender</th>
                      <th>State</th>
                      <th>City</th>
                      <th>Contact No</th>
                      <th>Commercial</th>
                      <th className="actions-col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan="15" className="empty-message">
                          No data available. Upload an Excel file or add data manually.
                        </td>
                      </tr>
                    ) : (
                      filteredData.map(item => (
                        <tr
                          key={item._id}
                          className={selectedIds.has(item._id) ? 'selected' : ''}
                        >
                          <td className="checkbox-col">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(item._id)}
                              onChange={() => handleSelectRow(item._id)}
                            />
                          </td>
                          <td>{item.name || 'N/A'}</td>
                          <td>{item.email || 'N/A'}</td>
                          <td>
                            {item.instagramurl ? (
                              <a href={item.instagramurl} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>
                                {item.instagramurl.length > 20 ? item.instagramurl.substring(0, 20) + '...' : item.instagramurl}
                              </a>
                            ) : 'N/A'}
                          </td>
                          <td>
                            {item.youtubeurl ? (
                              <a href={item.youtubeurl} target="_blank" rel="noopener noreferrer" style={{ color: '#ff0000' }}>
                                {item.youtubeurl.length > 20 ? item.youtubeurl.substring(0, 20) + '...' : item.youtubeurl}
                              </a>
                            ) : 'N/A'}
                          </td>
                          <td>{Array.isArray(item.category) ? item.category.join(', ') : (item.category || 'N/A')}</td>
                          <td>{Array.isArray(item.platform) ? item.platform.join(', ') : (item.platform || 'N/A')}</td>
                          <td>{item.followers || 'N/A'}</td>
                          <td>{item.language || 'N/A'}</td>
                          <td>{item.gender || 'N/A'}</td>
                          <td>{item.state || 'N/A'}</td>
                          <td>{item.city || 'N/A'}</td>
                          <td>{item.contactno || 'N/A'}</td>
                          <td>{item.commercial || 'N/A'}</td>
                          <td className="actions-col">
                            {user?.role === 'admin' && (
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                  className="btn-icon"
                                  onClick={() => handleEdit(item)}
                                  title="Edit"
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '13px',
                                    fontWeight: '500'
                                  }}
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  className="btn-icon delete"
                                  onClick={() => handleDelete(item._id)}
                                  title="Delete"
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '13px',
                                    fontWeight: '500'
                                  }}
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            )}
                            {user?.role !== 'admin' && (
                              <span style={{ color: '#999', fontSize: '13px' }}>View Only</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main >

      {/* Modal */}
      {
        showModal && (
          <div className="modal show" onClick={(e) => e.target.className === 'modal show' && setShowModal(false)}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editingItem ? 'Edit Data' : 'Add New Data'}</h3>
                <span className="modal-close" onClick={() => { setShowModal(false); resetForm(); }}>
                  &times;
                </span>
              </div>
              <form className="data-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="inputName">Name *</label>
                    <input
                      type="text"
                      id="inputName"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputInstagramUrl">Instagram URL</label>
                    <input
                      type="url"
                      id="inputInstagramUrl"
                      name="instagramurl"
                      value={formData.instagramurl}
                      onChange={handleInputChange}
                      placeholder="Enter Instagram URL"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputYoutubeUrl">YouTube URL</label>
                    <input
                      type="url"
                      id="inputYoutubeUrl"
                      name="youtubeurl"
                      value={formData.youtubeurl}
                      onChange={handleInputChange}
                      placeholder="Enter YouTube URL"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="inputEmail">Email</label>
                    <input
                      type="email"
                      id="inputEmail"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="inputFollowers">Followers Range *</label>
                    <select
                      id="inputFollowers"
                      name="followers"
                      value={formData.followers}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Range</option>
                      <option value="1-5k">1-5k</option>
                      <option value="5-10k">5-10k</option>
                      <option value="10-20k">10-20k</option>
                      <option value="20-50k">20-50k</option>
                      <option value="50-100k">50-100k</option>
                      <option value="100-300k">100-300k</option>
                      <option value="300-500k">300-500k</option>
                      <option value="500+">500+</option>
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label>Language * (Click to select)</label>
                    <button
                      type="button"
                      className={`btn-toggle-categories ${showFormLanguages ? 'active' : ''}`}
                      onClick={() => setShowFormLanguages(!showFormLanguages)}
                    >
                      {showFormLanguages ? 'Close Language Panel' : 'Open Language Panel'}
                      {(formData.language || []).length > 0 && <span className="selected-count">{(formData.language || []).length} Selected</span>}
                    </button>
                    {showFormLanguages && (
                      <div className="dnd-container animate-in">
                        <div className="dnd-zone">
                          <span>Available Pool</span>
                          <div className="category-dnd-list">
                            {LANGUAGES.filter(lang => !(formData.language || []).includes(lang)).map(lang => (
                              <div
                                key={lang}
                                className="category-tag available"
                                onClick={() => handleLanguageToggle(lang)}
                              >
                                {lang}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="dnd-zone">
                          <span>Selected Languages</span>
                          <div className="category-dnd-list selected">
                            {(formData.language || []).map(lang => (
                              <div
                                key={lang}
                                className="category-tag selected"
                                onClick={() => handleLanguageToggle(lang)}
                              >
                                {lang}
                              </div>
                            ))}
                            {(formData.language || []).length === 0 && <div className="dnd-placeholder">Select at least one language</div>}
                          </div>
                        </div>
                      </div>
                    )}
                    {formData.language.length === 0 && <span style={{ color: 'red', fontSize: '12px' }}>Please select at least one language</span>}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Categories * (Click to select)</label>
                    <button
                      type="button"
                      className={`btn-toggle-categories ${showFormCategories ? 'active' : ''}`}
                      onClick={() => setShowFormCategories(!showFormCategories)}
                    >
                      {showFormCategories ? 'Close Category Panel' : 'Open Category Panel'}
                      {(formData.category || []).length > 0 && <span className="selected-count">{(formData.category || []).length} Selected</span>}
                    </button>
                    {showFormCategories && (
                      <div className="dnd-container animate-in">
                        <div className="dnd-zone">
                          <span>Available Pool</span>
                          <div className="category-dnd-list">
                            {CATEGORIES.filter(cat => !(formData.category || []).includes(cat)).map(cat => (
                              <div key={cat} className="category-tag available" onClick={() => handleFormCategoryToggle(cat)}>
                                {cat}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="dnd-zone">
                          <span>Selected Categories</span>
                          <div className="category-dnd-list selected">
                            {(formData.category || []).map(cat => (
                              <div key={cat} className="category-tag selected" onClick={() => handleFormCategoryToggle(cat)}>
                                {cat}
                              </div>
                            ))}
                            {(formData.category || []).length === 0 && <div className="dnd-placeholder">Select at least one category</div>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="form-group full-width">
                    <label>Platforms * (Click to Select)</label>
                    <button type="button" className={`btn-toggle-categories ${showFormPlatforms ? 'active' : ''}`} onClick={() => setShowFormPlatforms(!showFormPlatforms)}>
                      <span>{showFormPlatforms ? 'Close Platform Panel' : 'Open Platform Panel'}</span>
                      <span className="selected-count">{(formData.platform || []).length} Selected</span>
                    </button>
                    {showFormPlatforms && (
                      <div className="dnd-container animate-in">
                        <div className="dnd-zone">
                          <span>Available Pool</span>
                          <div className="category-dnd-list">
                            {PLATFORMS.filter(p => !(formData.platform || []).includes(p)).map(p => (
                              <div key={p} className="category-tag" onClick={() => handlePlatformToggle(p)}>
                                {p}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="dnd-zone">
                          <span>Selected Platforms</span>
                          <div className="category-dnd-list selected">
                            {(formData.platform || []).map(p => (
                              <div key={p} className="category-tag selected" onClick={() => handlePlatformToggle(p)}>
                                {p}
                              </div>
                            ))}
                            {(formData.platform || []).length === 0 && <div className="dnd-placeholder">Select at least one platform</div>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="inputGender">Gender *</label>
                    <select
                      id="inputGender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputState">State *</label>
                    <select
                      id="inputState"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="inputCity">City *</label>
                    <select
                      id="inputCity"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.state}
                    >
                      <option value="">Select City</option>
                      {formData.state && STATE_CITIES[formData.state] ? (
                        STATE_CITIES[formData.state].map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))
                      ) : (
                        formData.state && <option value={formData.city}>{formData.city || "Enter custom City below"}</option>
                      )}
                      {formData.state && !STATE_CITIES[formData.state] && (
                        <option value="Other">Other</option>
                      )}
                    </select>
                    {!STATE_CITIES[formData.state] && formData.state && (
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Enter city manually"
                        style={{ marginTop: '10px' }}
                      />
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputContactNo">Contact No</label>
                    <input
                      type="tel"
                      id="inputContactNo"
                      name="contactno"
                      value={formData.contactno}
                      onChange={handleInputChange}
                      placeholder="Enter contact number"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="inputCommercial">Commercial</label>
                    <input
                      type="text"
                      id="inputCommercial"
                      name="commercial"
                      value={formData.commercial}
                      onChange={handleInputChange}
                      placeholder="Enter commercial"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => { setShowModal(false); resetForm(); }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div >
        )
      }
    </div >
  );
};

export default Dashboard;


