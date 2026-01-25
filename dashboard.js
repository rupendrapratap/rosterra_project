// Data Management Dashboard
class DataManager {
    constructor() {
        this.data = this.loadData();
        this.filteredData = [...this.data];
        this.currentEditId = null;
        this.selectedIds = new Set();
        // Theme Toggle
        const themeToggle = document.getElementById('themeToggle');
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            if (themeToggle) themeToggle.textContent = '🌙';
        }

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const isLight = document.body.classList.toggle('light-mode');
                localStorage.setItem('theme', isLight ? 'light' : 'dark');
                themeToggle.textContent = isLight ? '🌙' : '☀️';
            });
        }

        this.init();
    }

    init() {
        this.initCategories();
        this.attachEventListeners();
        this.renderTable();
        this.updateStats();
    }

    // Load data from localStorage
    loadData() {
        const stored = localStorage.getItem('tableData');
        return stored ? JSON.parse(stored) : [];
    }

    // Save data to localStorage
    saveData() {
        localStorage.setItem('tableData', JSON.stringify(this.data));
        this.filteredData = this.applyFilters();
        this.renderTable();
        this.updateStats();
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Attach event listeners
    attachEventListeners() {
        // Excel file upload
        const fileInput = document.getElementById('excelFileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        // Add data button
        const addBtn = document.getElementById('addDataBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddModal());
        }

        // Export buttons
        const exportSelected = document.getElementById('exportSelectedBtn');
        const exportAll = document.getElementById('exportAllBtn');

        if (exportSelected) {
            exportSelected.addEventListener('click', () => this.exportSelected());
        }

        if (exportAll) {
            exportAll.addEventListener('click', () => this.exportAll());
        }

        // Clear data button
        const clearBtn = document.getElementById('clearDataBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllData());
        }

        // Filter inputs
        const filterInputs = ['filterName', 'filterAge', 'filterFollowers', 'filterEmail', 'filterYoutube', 'filterCategory', 'filterPlatform', 'filterCity', 'filterState', 'filterGender'];
        filterInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.applyFilters());
                element.addEventListener('change', () => this.applyFilters());
            }
        });

        // Clear filters
        const clearFilters = document.getElementById('clearFiltersBtn');
        if (clearFilters) {
            clearFilters.addEventListener('click', () => this.clearFilters());
        }

        // Modal
        const modal = document.getElementById('dataModal');
        const closeModal = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        const form = document.getElementById('dataForm');

        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeModal());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveDataEntry();
            });
        }

        // Select all checkbox
        const selectAllHeader = document.getElementById('selectAllHeader');
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');

        if (selectAllHeader) {
            selectAllHeader.addEventListener('change', (e) => {
                this.selectAll(e.target.checked);
            });
        }

        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                this.selectAll(e.target.checked);
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    window.location.href = 'index.html';
                }
            });
        }

        // Dropdowns population
        this.initDropdowns();
        this.initLanguages();
    }

    initDropdowns() {
        this.states = [
            'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
            'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
            'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
            'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
            'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
            'Delhi', 'Other'
        ];

        this.cities = {
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

        this.categories = [
            'Lifestyle', 'Fashion', 'Tech', 'Education', 'Entertainment', 'Finance',
            'Travel', 'Food', 'Health & Fitness', 'Gaming', 'Beauty', 'Business', 'Other'
        ];

        this.platforms = ['Instagram', 'YouTube', 'TikTok', 'Facebook', 'Twitter', 'Other'];

        this.languages = [
            'English', 'Hindi', 'Punjabi', 'Bengali', 'Gujarati', 'Marathi',
            'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Other'
        ];

        const stateSelect = document.getElementById('inputState');
        const citySelect = document.getElementById('inputCity');

        if (stateSelect) {
            this.states.forEach(state => {
                const option = document.createElement('option');
                option.value = state;
                option.textContent = state;
                stateSelect.appendChild(option);
            });

            stateSelect.addEventListener('change', () => {
                this.updateCitySelect(stateSelect.value);
            });
        }

        // Also handle filter dropdowns
        const filterStateSelect = document.getElementById('filterState');
        const filterCitySelect = document.getElementById('filterCity');
        const filterLanguageSelect = document.getElementById('filterContentType');

        if (filterStateSelect) {
            this.states.forEach(state => {
                const option = document.createElement('option');
                option.value = state;
                option.textContent = state;
                filterStateSelect.appendChild(option);
            });

            filterStateSelect.addEventListener('change', () => {
                this.updateFilterCitySelect(filterStateSelect.value);
                this.applyFilters();
            });
        }
    }

    initCategories() {
        const pools = {
            filter: document.getElementById('filterCategoryPool'),
            form: document.getElementById('inputCategoryPool')
        };
        const selected = {
            filter: document.getElementById('filterCategorySelected'),
            form: document.getElementById('inputCategorySelected')
        };

        if (!pools.filter || !pools.form) return;

        // Render tags into pools
        this.categories.forEach(cat => {
            const tagFilter = document.createElement('div');
            tagFilter.className = 'category-tag';
            tagFilter.textContent = cat;
            tagFilter.dataset.value = cat;
            pools.filter.appendChild(tagFilter);

            const tagForm = document.createElement('div');
            tagForm.className = 'category-tag';
            tagForm.textContent = cat;
            tagForm.dataset.value = cat;
            pools.form.appendChild(tagForm);
        });

        // Initialize Sortable for Filters
        new Sortable(pools.filter, {
            group: 'filterCategories',
            animation: 150,
            onEnd: () => {
                this.applyFilters();
                this.updateTagCounts();
            }
        });
        new Sortable(selected.filter, {
            group: 'filterCategories',
            animation: 150,
            onEnd: () => {
                this.applyFilters();
                this.updateTagCounts();
            }
        });

        // Initialize Sortable for Form
        new Sortable(pools.form, {
            group: 'formCategories',
            animation: 150,
            onEnd: () => this.updateTagCounts()
        });
        new Sortable(selected.form, {
            group: 'formCategories',
            animation: 150,
            onEnd: () => this.updateTagCounts()
        });

        // Initialize Sortable for Form
        new Sortable(pools.form, {
            group: 'formCategories',
            animation: 150,
            onEnd: updateCounts
        });
        new Sortable(selected.form, {
            group: 'formCategories',
            animation: 150,
            onEnd: updateCounts
        });

        // Toggle Logic
        const setupToggle = (btnId, containerId) => {
            const btn = document.getElementById(btnId);
            const container = document.getElementById(containerId);
            if (btn && container) {
                btn.addEventListener('click', () => {
                    const isHidden = container.style.display === 'none';
                    container.style.display = isHidden ? 'flex' : 'none';
                    btn.classList.toggle('active', isHidden);
                    btn.querySelector('span').textContent = isHidden ? 'Close Category Panel' : 'Open Category Panel';
                    if (isHidden) container.classList.add('animate-in');
                });
            }
        };

        setupToggle('toggleFilterCategories', 'filterCategoryDnd');
        setupToggle('toggleFormCategories', 'formCategoryDnd');

        // Init Platforms
        this.initPlatforms(setupToggle);

        // Init Languages
        this.initLanguages();

        this.updateTagCounts();
    }



    initLanguages() {
        // Toggle Logic reused
        const setupToggle = (btnId, containerId) => {
            const btn = document.getElementById(btnId);
            const container = document.getElementById(containerId);
            if (btn && container) {
                btn.addEventListener('click', () => {
                    const isHidden = container.style.display === 'none';
                    container.style.display = isHidden ? 'flex' : 'none';
                    btn.classList.toggle('active', isHidden);
                    btn.querySelector('span').textContent = isHidden ? 'Close Language Panel' : 'Open Language Panel';
                    if (isHidden) container.classList.add('animate-in');
                });
            }
        };

        const pools = {
            filter: document.getElementById('filterLanguagePool'),
            form: document.getElementById('inputLanguagePool')
        };
        const selected = {
            filter: document.getElementById('filterLanguageSelected'),
            form: document.getElementById('inputLanguageSelected')
        };

        if (!pools.filter || !pools.form) return;

        // Render tags
        this.languages.forEach(l => {
            const tagFilter = document.createElement('div');
            tagFilter.className = 'category-tag';
            tagFilter.textContent = l;
            tagFilter.dataset.value = l;
            pools.filter.appendChild(tagFilter);

            const tagForm = document.createElement('div');
            tagForm.className = 'category-tag';
            tagForm.textContent = l;
            tagForm.dataset.value = l;
            pools.form.appendChild(tagForm);
        });

        // Initialize Sortable
        const setupSortable = (el, group) => {
            new Sortable(el, {
                group: group,
                animation: 150,
                onEnd: () => {
                    if (group.includes('filter')) this.applyFilters();
                    this.updateTagCounts();
                }
            });
        };

        setupSortable(pools.filter, 'filterLanguages');
        setupSortable(selected.filter, 'filterLanguages');
        setupSortable(pools.form, 'formLanguages');
        setupSortable(selected.form, 'formLanguages');

        setupToggle('toggleFilterLanguages', 'filterLanguageDnd');
        setupToggle('toggleFormLanguages', 'formLanguageDnd');
    }
    initPlatforms(setupToggle) {
        const pools = {
            filter: document.getElementById('filterPlatformPool'),
            form: document.getElementById('inputPlatformPool')
        };
        const selected = {
            filter: document.getElementById('filterPlatformSelected'),
            form: document.getElementById('inputPlatformSelected')
        };

        if (!pools.filter || !pools.form) return;

        // Render platform tags
        this.platforms.forEach(p => {
            const tagFilter = document.createElement('div');
            tagFilter.className = 'category-tag';
            tagFilter.textContent = p;
            tagFilter.dataset.value = p;
            pools.filter.appendChild(tagFilter);

            const tagForm = document.createElement('div');
            tagForm.className = 'category-tag';
            tagForm.textContent = p;
            tagForm.dataset.value = p;
            pools.form.appendChild(tagForm);
        });

        // Initialize Sortable for Filters (Platforms)
        new Sortable(pools.filter, {
            group: 'filterPlatforms',
            animation: 150,
            onEnd: () => {
                this.applyFilters();
                this.updateTagCounts();
            }
        });
        new Sortable(selected.filter, {
            group: 'filterPlatforms',
            animation: 150,
            onEnd: () => {
                this.applyFilters();
                this.updateTagCounts();
            }
        });

        // Initialize Sortable for Form (Platforms)
        new Sortable(pools.form, {
            group: 'formPlatforms',
            animation: 150,
            onEnd: () => this.updateTagCounts()
        });
        new Sortable(selected.form, {
            group: 'formPlatforms',
            animation: 150,
            onEnd: () => this.updateTagCounts()
        });

        setupToggle('toggleFilterPlatforms', 'filterPlatformDnd');
        setupToggle('toggleFormPlatforms', 'formPlatformDnd');
    }

    updateTagCounts() {
        const filterCount = document.getElementById('filterSelectedCount');
        const filterSelected = document.getElementById('filterCategorySelected');
        if (filterCount && filterSelected) filterCount.textContent = `${filterSelected.children.length} Selected`;

        const formCount = document.getElementById('formSelectedCount');
        const formSelected = document.getElementById('inputCategorySelected');
        if (formCount && formSelected) formCount.textContent = `${formSelected.children.length} Selected`;

        const filterPlatformCount = document.getElementById('filterPlatformCount');
        const filterPlatformSelected = document.getElementById('filterPlatformSelected');
        if (filterPlatformCount && filterPlatformSelected) filterPlatformCount.textContent = `${filterPlatformSelected.children.length} Selected`;

        const formPlatformCount = document.getElementById('formPlatformCount');
        const formPlatformSelected = document.getElementById('inputPlatformSelected');
        if (formPlatformCount && formPlatformSelected) formPlatformCount.textContent = `${formPlatformSelected.children.length} Selected`;

        const filterLanguageCount = document.getElementById('filterLanguageCount');
        const filterLanguageSelected = document.getElementById('filterLanguageSelected');
        if (filterLanguageCount && filterLanguageSelected) filterLanguageCount.textContent = `${filterLanguageSelected.children.length} Selected`;

        const formLanguageCount = document.getElementById('formLanguageCount');
        const formLanguageSelected = document.getElementById('inputLanguageSelected');
        if (formLanguageCount && formLanguageSelected) formLanguageCount.textContent = `${formLanguageSelected.children.length} Selected`;
    }

    updateFilterCitySelect(state) {
        const citySelect = document.getElementById('filterCity');
        if (!citySelect) return;

        citySelect.innerHTML = '<option value="">All Cities</option>';

        if (state && this.cities[state]) {
            this.cities[state].forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                citySelect.appendChild(option);
            });
        }
    }

    updateCitySelect(state, selectedCity = '') {
        const citySelect = document.getElementById('inputCity');
        if (!citySelect) return;

        citySelect.innerHTML = '<option value="">Select City</option>';

        if (state && this.cities[state]) {
            citySelect.disabled = false;
            this.cities[state].forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                if (city === selectedCity) {
                    option.selected = true;
                }
                citySelect.appendChild(option);
            });
        } else if (state) {
            citySelect.disabled = false;
            const option = document.createElement('option');
            option.value = 'Other';
            option.textContent = 'Other';
            citySelect.appendChild(option);
        } else {
            citySelect.disabled = true;
        }
    }

    // Handle Excel file upload
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const fileName = document.getElementById('fileName');
        if (fileName) {
            fileName.textContent = `Selected: ${file.name}`;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Get first sheet
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                // Process and add data
                const processed = jsonData.map(row => {
                    // Map common column names
                    const entry = {
                        id: this.generateId(),
                        name: this.getField(row, ['name', 'Name', 'NAME', 'fullname', 'Full Name']),
                        email: this.getField(row, ['email', 'Email', 'EMAIL', 'e-mail', 'E-mail', 'mail', 'Mail']),
                        age: parseInt(this.getField(row, ['age', 'Age', 'AGE'])),
                        gender: this.getField(row, ['gender', 'Gender', 'GENDER', 'sex', 'Sex']),
                        followers: this.getField(row, ['followers', 'Followers', 'FOLLOWERS', 'follower', 'Follower']) || '0',
                        instagramurl: this.getField(row, ['instagramurl', 'Instagram URL', 'instagram url', 'instagram', 'Instagram', 'insta url', 'Insta URL']),
                        youtubeurl: this.getField(row, ['youtubeurl', 'YouTube URL', 'youtube url', 'youtube', 'YouTube', 'yt url', 'YT URL']),
                        category: this.getField(row, ['category', 'Category', 'CATEGORY', 'cat', 'Cat']),
                        platform: this.getField(row, ['platform', 'Platform', 'PLATFORM', 'site', 'Site']),
                        city: this.getField(row, ['city', 'City', 'CITY']),
                        state: this.getField(row, ['state', 'State', 'STATE']),
                        createdAt: new Date().toISOString()
                    };

                    // Only add if has name
                    if (entry.name) {
                        return entry;
                    }
                    return null;
                }).filter(item => item !== null);

                // Add to existing data
                this.data = [...this.data, ...processed];
                this.saveData();
                this.showNotification(`Successfully imported ${processed.length} record(s)!`);

                // Reset file input
                event.target.value = '';
                if (fileName) {
                    fileName.textContent = '';
                }
            } catch (error) {
                alert('Error reading Excel file. Please make sure it is a valid Excel file.');
                console.error(error);
            }
        };

        reader.readAsArrayBuffer(file);
    }

    // Helper to get field from row (case-insensitive)
    getField(row, possibleKeys) {
        for (let key of possibleKeys) {
            if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
                return String(row[key]).trim();
            }
        }
        return '';
    }

    // Apply filters
    applyFilters() {
        const nameFilter = document.getElementById('filterName').value.toLowerCase();
        const ageFilter = document.getElementById('filterAge').value;
        const contentTypeFilter = document.getElementById('filterContentType').value.toLowerCase();
        const cityFilter = document.getElementById('filterCity').value.toLowerCase();
        const stateFilter = document.getElementById('filterState').value.toLowerCase();
        const genderFilter = document.getElementById('filterGender').value.toLowerCase();
        const selectedContainer = document.getElementById('filterCategorySelected');
        const selectedCategories = Array.from(selectedContainer.children).map(tag => tag.dataset.value.toLowerCase());
        const selectedPlatformContainer = document.getElementById('filterPlatformSelected');
        const selectedPlatforms = Array.from(selectedPlatformContainer.children).map(tag => tag.dataset.value.toLowerCase());
        const selectedLanguageContainer = document.getElementById('filterLanguageSelected');
        const selectedLanguages = selectedLanguageContainer ? Array.from(selectedLanguageContainer.children).map(tag => tag.dataset.value.toLowerCase()) : [];

        this.filteredData = this.data.filter(item => {
            // Category filter
            const itemCats = Array.isArray(item.category) ? item.category : (item.category ? [item.category] : []);
            if (selectedCategories.length > 0 && !selectedCategories.some(cat => itemCats.map(c => c.toLowerCase()).includes(cat))) {
                return false;
            }

            // Platform filter
            const itemPlatforms = Array.isArray(item.platform) ? item.platform : (item.platform ? [item.platform] : []);
            if (selectedPlatforms.length > 0 && !selectedPlatforms.some(p => itemPlatforms.map(ip => ip.toLowerCase()).includes(p))) {
                return false;
            }
            // Name filter
            if (nameFilter && !item.name?.toLowerCase().includes(nameFilter)) {
                return false;
            }

            // Age filter
            if (ageFilter) {
                const age = item.age || 0;
                switch (ageFilter) {
                    case '0-18':
                        if (age > 18) return false;
                        break;
                    case '19-30':
                        if (age < 19 || age > 30) return false;
                        break;
                    case '31-45':
                        if (age < 31 || age > 45) return false;
                        break;
                    case '46-60':
                        if (age < 46 || age > 60) return false;
                        break;
                    case '60+':
                        if (age <= 60) return false;
                        break;
                }
            }

            // Language (Content Type) filter
            const itemLangs = Array.isArray(item.contentType) ? item.contentType : (item.contentType ? [item.contentType] : []); // Using contentType field for language in vanilla implementation legacy
            if (selectedLanguages.length > 0 && !selectedLanguages.some(l => itemLangs.map(il => il.toLowerCase()).includes(l))) {
                return false;
            }

            // City filter
            if (cityFilter && item.city?.toLowerCase() !== cityFilter) {
                return false;
            }

            // State filter
            if (stateFilter && item.state?.toLowerCase() !== stateFilter) {
                return false;
            }

            // Gender filter
            if (genderFilter && item.gender?.toLowerCase() !== genderFilter) {
                return false;
            }

            // Followers range filter
            const followersFilter = document.getElementById('filterFollowers').value;
            if (followersFilter) {
                const count = item.followers; // This might now be a string like "1-5k"
                // If the stored data is already a range string, we compare strings directly
                if (typeof count === 'string') {
                    if (count !== followersFilter) return false;
                } else {
                    // Fallback for legacy numerical data
                    const val = parseInt(count) || 0;
                    if (followersFilter === '1-5k' && (val < 1000 || val > 5000)) return false;
                    if (followersFilter === '5-10k' && (val <= 5000 || val > 10000)) return false;
                    if (followersFilter === '10-20k' && (val <= 10000 || val > 20000)) return false;
                    if (followersFilter === '20-50k' && (val <= 20000 || val > 50000)) return false;
                    if (followersFilter === '50-100k' && (val <= 50000 || val > 100000)) return false;
                    if (followersFilter === '100-300k' && (val <= 100000 || val > 300000)) return false;
                    if (followersFilter === '300-500k' && (val <= 300000 || val > 500000)) return false;
                    if (followersFilter === '500+' && val <= 500000) return false;
                }
            }

            // Email filter
            const emailFilter = document.getElementById('filterEmail').value.toLowerCase();
            if (emailFilter && !item.email?.toLowerCase().includes(emailFilter)) {
                return false;
            }

            // Youtube filter
            const youtubeFilter = document.getElementById('filterYoutube').value.toLowerCase();
            if (youtubeFilter && !item.youtubeurl?.toLowerCase().includes(youtubeFilter)) {
                return false;
            }

            return true;
        });

        this.renderTable();
        return this.filteredData;
    }

    // Clear filters
    clearFilters() {
        document.getElementById('filterName').value = '';
        document.getElementById('filterAge').value = '';
        document.getElementById('filterFollowers').value = '';
        document.getElementById('filterEmail').value = '';
        document.getElementById('filterYoutube').value = '';
        document.getElementById('filterCity').value = '';
        document.getElementById('filterState').value = '';
        document.getElementById('filterContentType').value = '';
        document.getElementById('filterGender').value = '';

        // Reset Filter Tags
        const filterPool = document.getElementById('filterCategoryPool');
        const filterSelected = document.getElementById('filterCategorySelected');
        if (filterPool && filterSelected) {
            Array.from(filterSelected.children).forEach(tag => filterPool.appendChild(tag));
        }

        document.getElementById('filterPlatform').value = '';

        // Reset Filter Languages
        const filterLangPool = document.getElementById('filterLanguagePool');
        const filterLangSelected = document.getElementById('filterLanguageSelected');
        if (filterLangPool && filterLangSelected) {
            Array.from(filterLangSelected.children).forEach(tag => filterLangPool.appendChild(tag));
        }
        this.updateFilterCitySelect('');
        this.updateTagCounts();
        this.applyFilters();
    }

    // Render table
    renderTable() {
        const tbody = document.getElementById('tableBody');
        if (!tbody) return;

        if (this.filteredData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-message">
                        No data available. Upload an Excel file or add data manually.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredData.map(item => `
            <tr class="${this.selectedIds.has(item.id) ? 'selected' : ''}">
                <td class="checkbox-col">
                    <input type="checkbox" class="row-checkbox" data-id="${item.id}" 
                           ${this.selectedIds.has(item.id) ? 'checked' : ''}>
                </td>
                <td>${this.escapeHtml(item.name || 'N/A')}</td>
                <td>${this.escapeHtml(item.email || 'N/A')}</td>
                <td>${item.age || 'N/A'}</td>
                <td>${this.escapeHtml(item.gender || 'N/A')}</td>
                <td>${this.escapeHtml(String(item.followers) || 'N/A')}</td>
                <td>
                    ${item.instagramurl ? `<a href="${item.instagramurl}" target="_blank">Instagram</a>` : 'N/A'}
                </td>
                <td>
                    ${item.youtubeurl ? `<a href="${item.youtubeurl}" target="_blank">YouTube</a>` : 'N/A'}
                </td>
                <td>${this.escapeHtml(Array.isArray(item.category) ? item.category.join(', ') : (item.category || 'N/A'))}</td>
                <td>${this.escapeHtml(item.platform || 'N/A')}</td>
                <td>${this.escapeHtml(item.city || 'N/A')}</td>
                <td>${this.escapeHtml(item.state || 'N/A')}</td>
                <td class="actions-col">
                    <button class="btn-icon" onclick="dataManager.editEntry('${item.id}')" title="Edit">
                        ✏️ Edit
                    </button>
                    <button class="btn-icon delete" onclick="dataManager.deleteEntry('${item.id}')" title="Delete">
                        🗑️ Delete
                    </button>
                </td>
            </tr>
        `).join('');

        // Attach checkbox listeners
        const checkboxes = tbody.querySelectorAll('.row-checkbox');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', (e) => {
                const id = e.target.getAttribute('data-id');
                if (e.target.checked) {
                    this.selectedIds.add(id);
                    e.target.closest('tr').classList.add('selected');
                } else {
                    this.selectedIds.delete(id);
                    e.target.closest('tr').classList.remove('selected');
                }
                this.updateSelectedCount();
            });
        });

        this.updateSelectedCount();
    }

    // Select all rows
    selectAll(checked) {
        const checkboxes = document.querySelectorAll('.row-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = checked;
            const id = cb.getAttribute('data-id');
            const row = cb.closest('tr');

            if (checked) {
                this.selectedIds.add(id);
                row.classList.add('selected');
            } else {
                this.selectedIds.delete(id);
                row.classList.remove('selected');
            }
        });
        this.updateSelectedCount();
    }

    // Update stats
    updateStats() {
        const totalRecords = document.getElementById('totalRecords');
        if (totalRecords) {
            totalRecords.textContent = this.data.length;
        }
        this.updateSelectedCount();
    }

    // Update selected count
    updateSelectedCount() {
        const selectedRecords = document.getElementById('selectedRecords');
        const exportSelectedBtn = document.getElementById('exportSelectedBtn');

        if (selectedRecords) {
            selectedRecords.textContent = this.selectedIds.size;
        }

        if (exportSelectedBtn) {
            exportSelectedBtn.disabled = this.selectedIds.size === 0;
        }
    }

    // Show add modal
    showAddModal() {
        this.currentEditId = null;
        const modal = document.getElementById('dataModal');
        const form = document.getElementById('dataForm');
        const title = document.getElementById('modalTitle');

        if (title) title.textContent = 'Add New Data';
        if (form) form.reset();

        // Reset Form Tags
        const formPool = document.getElementById('inputCategoryPool');
        const formSelected = document.getElementById('inputCategorySelected');
        if (formPool && formSelected) {
            Array.from(formSelected.children).forEach(tag => formPool.appendChild(tag));
        }

        const langPool = document.getElementById('inputLanguagePool');
        const langSelected = document.getElementById('inputLanguageSelected');
        if (langPool && langSelected) {
            Array.from(langSelected.children).forEach(tag => langPool.appendChild(tag));
        }

        this.updateTagCounts();
        if (modal) modal.classList.add('show');
    }

    // Edit entry
    editEntry(id) {
        const item = this.data.find(d => d.id === id);
        if (!item) return;

        this.currentEditId = id;
        const modal = document.getElementById('dataModal');
        const form = document.getElementById('dataForm');
        const title = document.getElementById('modalTitle');

        if (title) title.textContent = 'Edit Data';

        document.getElementById('inputName').value = item.name || '';
        document.getElementById('inputEmail').value = item.email || '';
        document.getElementById('inputAge').value = item.age || '';
        document.getElementById('inputFollowers').value = item.followers || '';
        document.getElementById('inputGender').value = item.gender || '';
        document.getElementById('inputInstagram').value = item.instagramurl || '';
        document.getElementById('inputYoutube').value = item.youtubeurl || '';
        document.getElementById('inputContentType').value = item.contentType || '';
        document.getElementById('inputState').value = item.state || '';

        const formPool = document.getElementById('inputCategoryPool');
        const formSelected = document.getElementById('inputCategorySelected');
        const itemCats = Array.isArray(item.category) ? item.category : (item.category ? [item.category] : []);

        if (formPool && formSelected) {
            // First move all to pool
            Array.from(formSelected.children).forEach(tag => formPool.appendChild(tag));
            // Move item categories to selected
            Array.from(formPool.children).forEach(tag => {
                if (itemCats.includes(tag.dataset.value)) {
                    formSelected.appendChild(tag);
                }
            });
        }

        this.updateTagCounts();

        // Reset and populate platform toggle
        const platformPool = document.getElementById('inputPlatformPool');
        const platformSelected = document.getElementById('inputPlatformSelected');
        const itemPlatforms = Array.isArray(item.platform) ? item.platform : (item.platform ? [item.platform] : []);

        if (platformPool && platformSelected) {
            // Move all to pool
            Array.from(platformSelected.children).forEach(tag => platformPool.appendChild(tag));
            // Move selected
            Array.from(platformPool.children).forEach(tag => {
                if (itemPlatforms.includes(tag.dataset.value)) {
                    platformSelected.appendChild(tag);
                }
            });
        });
    }

    // Populate Languages
    const langPool = document.getElementById('inputLanguagePool');
    const langSelected = document.getElementById('inputLanguageSelected');
    // Legacy contentType mapped to language
    const itemLangs = Array.isArray(item.contentType) ? item.contentType : (item.contentType ? [item.contentType] : []);

    if(langPool && langSelected) {
    // First move all to pool
    Array.from(langSelected.children).forEach(tag => langPool.appendChild(tag));
    // Move item langs to selected
    Array.from(langPool.children).forEach(tag => {
        if (itemLangs.includes(tag.dataset.value)) {
            langSelected.appendChild(tag);
        }
    });
}
document.getElementById('inputAvgView').value = item.averageView || 0;
document.getElementById('inputER').value = item.er || 0;
this.updateCitySelect(item.state, item.city);

if (modal) modal.classList.add('show');
    }

// Save data entry
saveDataEntry() {
    const name = document.getElementById('inputName').value.trim();
    const email = document.getElementById('inputEmail').value.trim();
    const age = parseInt(document.getElementById('inputAge').value);
    const followers = document.getElementById('inputFollowers').value; // Now a range string
    const gender = document.getElementById('inputGender').value.trim();
    const instagramurl = document.getElementById('inputInstagram').value.trim();
    const youtubeurl = document.getElementById('inputYoutube').value.trim();

    const formLangSelected = document.getElementById('inputLanguageSelected');
    const contentType = Array.from(formLangSelected.children).map(tag => tag.dataset.value); // Array

    const state = document.getElementById('inputState').value.trim();
    const city = document.getElementById('inputCity').value.trim();
    const formSelected = document.getElementById('inputCategorySelected');
    const category = Array.from(formSelected.children).map(tag => tag.dataset.value);

    const formPlatformSelected = document.getElementById('inputPlatformSelected');
    const platform = Array.from(formPlatformSelected.children).map(tag => tag.dataset.value);
    const averageView = parseInt(document.getElementById('inputAvgView').value) || 0;
    const er = parseFloat(document.getElementById('inputER').value) || 0;

    if (!name || !email || !age || !gender || !contentType || !city || !state || !followers || category.length === 0 || platform.length === 0) {
        alert('Please fill in all required fields (including at least one category)!');
        return;
    }

    const entry = {
        id: this.currentEditId || this.generateId(),
        name,
        email,
        age,
        followers,
        gender,
        instagramurl,
        youtubeurl,
        contentType,
        city,
        state,
        category,
        platform,
        averageView,
        er,
        updatedAt: new Date().toISOString()
    };

    if (this.currentEditId) {
        const index = this.data.findIndex(d => d.id === this.currentEditId);
        if (index !== -1) {
            this.data[index] = entry;
        }
    } else {
        entry.createdAt = new Date().toISOString();
        this.data.push(entry);
    }

    this.saveData();
    this.closeModal();
    this.showNotification(this.currentEditId ? 'Data updated successfully!' : 'Data added successfully!');
}

// Delete entry
deleteEntry(id) {
    if (!confirm('Are you sure you want to delete this entry?')) {
        return;
    }

    this.data = this.data.filter(d => d.id !== id);
    this.selectedIds.delete(id);
    this.saveData();
    this.showNotification('Entry deleted successfully!');
}

// Close modal
closeModal() {
    const modal = document.getElementById('dataModal');
    if (modal) modal.classList.remove('show');
    this.currentEditId = null;
}

// Export selected data
exportSelected() {
    if (this.selectedIds.size === 0) {
        alert('Please select at least one record to export.');
        return;
    }

    const selectedData = this.data.filter(item => this.selectedIds.has(item.id));
    this.exportToExcel(selectedData, 'selected-data');
}

// Export all data
exportAll() {
    if (this.data.length === 0) {
        alert('No data to export!');
        return;
    }

    this.exportToExcel(this.data, 'all-data');
}

// Export to Excel
exportToExcel(data, filename) {
    // Prepare data for export
    const exportData = data.map(item => ({
        'Name': item.name || '',
        'Email': item.email || '',
        'Age': item.age || '',
        'Followers': item.followers || 0,
        'Gender': item.gender || '',
        'Instagram URL': item.instagramurl || '',
        'YouTube URL': item.youtubeurl || '',
        'Category': item.category || '',
        'City': item.city || '',
        'State': item.state || ''
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');

    // Generate filename with date
    const dateStr = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}-${dateStr}.xlsx`;

    // Write file
    XLSX.writeFile(wb, fullFilename);
    this.showNotification(`Exported ${data.length} record(s) successfully!`);
}

// Clear all data
clearAllData() {
    if (!confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        return;
    }

    this.data = [];
    this.selectedIds.clear();
    this.saveData();
    this.showNotification('All data cleared!');
}

// Utility functions
escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

showNotification(message) {
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}
}

// Initialize Data Manager
let dataManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        dataManager = new DataManager();
    });
} else {
    dataManager = new DataManager();
}


