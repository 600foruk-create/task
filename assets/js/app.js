        // ========== CONFIGURATION ==========
        const API_URL = 'https://palegoldenrod-dotterel-292319.hostingersite.com/api.php';

        // ========== GLOBAL VARIABLES ==========
        let categories = [];
        let users = [
            { id: 1, username: 'admin', password: 'admin123', name: 'Administrator', email: 'admin@seastone.com', type: 'admin', designation: 'admin' }
        ];
        let userHistory = {};
        let assignments = {};
        let taskDateRanges = {};
        let currentUser = null;
        let editingId = null;
        let editCategoryId = null;
        let editSubcategoryPath = null;
        let editItemPath = null;
        let otpTimer = null;
        let autoRefreshTimer = null;
        let midnightTimer = null;
        let lastAdminTab = 'dashboard';
        let lastUserTab = 'daily';
        let currentCategoryId = null;
        let currentSubcategoryId = null;
        let companies = [];
        
        // Company Settings
        let companySettings = {
            name: 'Seastone Pipe Industry',
            address: '',
            phone: '',
            email: '',
            footer: '',
            logo: ''
        };

        // Track expanded state for task hierarchy
        let expandedCategories = {};
        let expandedSubcategories = {};
        // Track expanded state for assignment categories
        let assignmentExpandedState = {};

        // ========== LOAD COMPANY SETTINGS FROM SERVER ==========
        async function loadCompanySettingsFromServer() {
            try {
                const response = await fetch(API_URL + '?action=getCompanySettings');
                const data = await response.json();
                
                if (data.success && data.settings) {
                    // Server se settings apply karo
                    if (data.settings.name) companySettings.name = data.settings.name;
                    if (data.settings.address) companySettings.address = data.settings.address;
                    if (data.settings.phone) companySettings.phone = data.settings.phone;
                    if (data.settings.email) companySettings.email = data.settings.email;
                    if (data.settings.footer) companySettings.footer = data.settings.footer;
                    if (data.settings.logo) companySettings.logo = data.settings.logo;
                    
                    localStorage.setItem('companySettings', JSON.stringify(companySettings));
                    updateCompanyDisplay();
                    return true;
                }
            } catch(e) {
                console.log('Using local company settings');
            }
            
            // Agar server se nahi mila to localStorage se lo
            const saved = localStorage.getItem('companySettings');
            if (saved) {
                companySettings = JSON.parse(saved);
                updateCompanyDisplay();
            }
            return false;
        }

        // ========== COMPANY FUNCTIONS ==========

        // Load companies from localStorage
        function loadCompanies() {
            const saved = localStorage.getItem('companies');
            if (saved) {
                companies = JSON.parse(saved);
            } else {
                companies = [
                    { id: 1, name: 'Seastone Pipe Industry', address: 'Main Office', phone: '', email: '' }
                ];
                localStorage.setItem('companies', JSON.stringify(companies));
            }
            loadCompanyListTable();
        }

        // Load company list table
        function loadCompanyListTable() {
            let html = '';
            companies.forEach(company => {
                const isCurrent = (company.name === companySettings.name && 
                                  company.address === companySettings.address &&
                                  company.phone === companySettings.phone &&
                                  company.email === companySettings.email);
                
                html += `<tr style="${isCurrent ? 'background: #e8f4fd; border-left: 4px solid #2E5C8A;' : ''}">
                    <td style="padding: 12px; font-weight: ${isCurrent ? 'bold' : 'normal'}; color: ${isCurrent ? '#2E5C8A' : '#333'};">${company.name} ${isCurrent ? '✓' : ''}</td>
                    <td style="padding: 12px;">${company.address || '-'}</td>
                    <td style="padding: 12px;">${company.phone || '-'}</td>
                    <td style="padding: 12px;">${company.email || '-'}</td>
                    <td style="padding: 12px; text-align: center;">
                        <button onclick="editCompany(${company.id})" class="edit-btn" style="padding: 6px 12px; margin: 2px; background: #ffc107; color: #333; border: none; border-radius: 4px;">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="applyCompany(${company.id})" class="btn-success" style="padding: 6px 12px; margin: 2px; background: #28a745; border: none; border-radius: 4px;">
                            <i class="fas fa-check"></i> Apply
                        </button>
                        <button onclick="deleteCompany(${company.id})" class="delete-btn" style="padding: 6px 12px; margin: 2px; background: #dc3545; border: none; border-radius: 4px;">
                            <i class="fas fa-trash"></i> Del
                        </button>
                    </td>
                </tr>`;
            });
            document.getElementById('companyListTable').innerHTML = html;
        }

        // Add new company
        function addCompany() {
            const name = document.getElementById('newCompanyName').value.trim();
            if (!name) {
                alert('Company name is required!');
                return;
            }
            
            const newId = companies.length > 0 ? Math.max(...companies.map(c => c.id)) + 1 : 1;
            
            companies.push({
                id: newId,
                name: name,
                address: document.getElementById('newCompanyAddress').value.trim(),
                phone: document.getElementById('newCompanyPhone').value.trim(),
                email: document.getElementById('newCompanyEmail').value.trim()
            });
            
            localStorage.setItem('companies', JSON.stringify(companies));
            
            // Clear form
            document.getElementById('newCompanyName').value = '';
            document.getElementById('newCompanyAddress').value = '';
            document.getElementById('newCompanyPhone').value = '';
            document.getElementById('newCompanyEmail').value = '';
            
            loadCompanyListTable();
            alert('Company added successfully!');
        }

        // Edit company
        function editCompany(id) {
            const company = companies.find(c => c.id === id);
            if (company) {
                // Fill the add form with company data
                document.getElementById('newCompanyName').value = company.name;
                document.getElementById('newCompanyAddress').value = company.address || '';
                document.getElementById('newCompanyPhone').value = company.phone || '';
                document.getElementById('newCompanyEmail').value = company.email || '';
                
                // Remove old and add updated version
                companies = companies.filter(c => c.id !== id);
                localStorage.setItem('companies', JSON.stringify(companies));
                
                alert('Now edit the details and click "Add Company" to update');
                loadCompanyListTable();
            }
        }

        // Apply company (set as current)
        function applyCompany(id) {
            const company = companies.find(c => c.id === id);
            if (company) {
                companySettings.name = company.name;
                companySettings.address = company.address || '';
                companySettings.phone = company.phone || '';
                companySettings.email = company.email || '';
                
                localStorage.setItem('companySettings', JSON.stringify(companySettings));
                localStorage.setItem('sync_trigger', Date.now().toString());
                
                updateCompanyDisplay();
                loadCompanyListTable();
                alert(`"${company.name}" is now the active company!`);
            }
        }

        // Delete company
        function deleteCompany(id) {
            if (confirm('Are you sure you want to delete this company?')) {
                companies = companies.filter(c => c.id !== id);
                localStorage.setItem('companies', JSON.stringify(companies));
                loadCompanyListTable();
            }
        }

        // Preview logo before upload
        function previewLogo(input) {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('companyLogoPreview').src = e.target.result;
                };
                reader.readAsDataURL(input.files[0]);
            }
        }

        // Save company settings
        async function saveCompanySettings() {
            const settingsData = {
                name: document.getElementById('companyName').value,
                address: document.getElementById('companyAddress').value,
                phone: document.getElementById('companyPhone').value,
                email: document.getElementById('companyEmail').value,
                footer: document.getElementById('companyFooter').value
            };
            
            // Pehle settings save karo
            const result = await saveToServer('saveCompanySettings', settingsData);
            
            // Logo upload karo agar select kiya hai
            const logoFile = document.getElementById('companyLogoUpload').files[0];
            if (logoFile) {
                const formData = new FormData();
                formData.append('action', 'saveCompanyLogo');
                formData.append('logo', logoFile);
                
                try {
                    const response = await fetch(API_URL, { method: 'POST', body: formData });
                    const logoResult = await response.json();
                    if (logoResult.success && logoResult.logo_url) {
                        companySettings.logo = logoResult.logo_url;
                    }
                } catch(e) {
                    console.error('Logo upload error:', e);
                }
            }
            
            // Local storage mein bhi save karo
            companySettings.name = settingsData.name;
            companySettings.address = settingsData.address;
            companySettings.phone = settingsData.phone;
            companySettings.email = settingsData.email;
            companySettings.footer = settingsData.footer;
            
            const logoPreview = document.getElementById('companyLogoPreview').src;
            if (logoPreview && logoPreview !== '' && logoPreview !== 'null' && !logoFile) {
                companySettings.logo = logoPreview;
            }
            
            localStorage.setItem('companySettings', JSON.stringify(companySettings));
            localStorage.setItem('sync_trigger', Date.now().toString());
            
            updateCompanyDisplay();
            closeModal('companySettingsModal');
            alert('Company settings saved to server successfully!');
        }

        // Update company display
        function updateCompanyDisplay() {
            document.title = companySettings.name + ' - Complete System';
            document.getElementById('loginCompanyName').textContent = companySettings.name;
            document.getElementById('headerCompanyName').textContent = companySettings.name;
            
            // Header details
            let headerDetails = [];
            if (companySettings.address) headerDetails.push(companySettings.address);
            if (companySettings.phone) headerDetails.push(companySettings.phone);
            if (companySettings.email) headerDetails.push(companySettings.email);
            document.getElementById('headerCompanyDetails').textContent = '';
            
            // Header logo
            const headerLogo = document.getElementById('headerLogo');
            if (companySettings.logo && companySettings.logo !== '' && companySettings.logo !== 'null') {
                headerLogo.src = companySettings.logo;
                headerLogo.style.display = 'block';
            } else {
                headerLogo.style.display = 'none';
            }
            
            // Company display in company tab
            const logoDisplay = document.getElementById('companyLogoDisplay');
            if (companySettings.logo && companySettings.logo !== '' && companySettings.logo !== 'null') {
                logoDisplay.src = companySettings.logo;
                logoDisplay.style.display = 'block';
            } else {
                logoDisplay.style.display = 'none';
            }
            
            document.getElementById('companyNameDisplay').textContent = companySettings.name;
            document.getElementById('companyAddressDisplay').textContent = companySettings.address || '';
            document.getElementById('companyPhoneDisplay').textContent = companySettings.phone || '';
            document.getElementById('companyEmailDisplay').textContent = companySettings.email || '';
            document.getElementById('companyFooterDisplay').textContent = companySettings.footer || '';
            
            // Settings modal fields
            document.getElementById('companyName').value = companySettings.name;
            document.getElementById('companyAddress').value = companySettings.address;
            document.getElementById('companyPhone').value = companySettings.phone;
            document.getElementById('companyEmail').value = companySettings.email;
            document.getElementById('companyFooter').value = companySettings.footer;
            document.getElementById('companyLogoPreview').src = companySettings.logo || '';
            
            loadCompanies();
        }

        // Show company list modal
        function showCompanyListModal() {
            loadCompanies();
            document.getElementById('companyListModal').style.display = 'block';
        }

        // Show company settings modal
        function showCompanySettingsModal() {
            document.getElementById('companyName').value = companySettings.name;
            document.getElementById('companyAddress').value = companySettings.address;
            document.getElementById('companyPhone').value = companySettings.phone;
            document.getElementById('companyEmail').value = companySettings.email;
            document.getElementById('companyFooter').value = companySettings.footer;
            document.getElementById('companyLogoPreview').src = companySettings.logo || '';
            document.getElementById('companySettingsModal').style.display = 'block';
        }

        // Load company settings on startup
        function loadCompanySettings() {
            const saved = localStorage.getItem('companySettings');
            if (saved) {
                companySettings = JSON.parse(saved);
            }
            loadCompanies();
            updateCompanyDisplay();
        }

        // ========== LOAD FROM SERVER ==========
        async function loadAllData() {
            try {
                showSyncing();
                
                const [catRes, userRes, assignRes, histRes, rangesRes] = await Promise.all([
                    fetch(API_URL + '?action=getCategories'),
                    fetch(API_URL + '?action=getUsers'),
                    fetch(API_URL + '?action=getAssignments'),
                    fetch(API_URL + '?action=getHistory'),
                    fetch(API_URL + '?action=getTaskDateRanges')
                ]);
                
                const catData = await catRes.json();
                if (catData.success) {
                    categories = catData.categories;
                    localStorage.setItem('taskCategories', JSON.stringify(categories));
                }
                
                const userData = await userRes.json();
                if (userData.success) {
                    users = userData.users;
                    localStorage.setItem('users', JSON.stringify(users));
                }
                
                const assignData = await assignRes.json();
                if (assignData.success) {
                    assignments = assignData.assignments;
                    localStorage.setItem('assignments', JSON.stringify(assignments));
                }
                
                const histData = await histRes.json();
                if (histData.success) {
                    userHistory = histData.history;
                    localStorage.setItem('userHistory', JSON.stringify(userHistory));
                }
                
                const rangesData = await rangesRes.json();
                if (rangesData.success) {
                    taskDateRanges = rangesData.ranges || {};
                    localStorage.setItem('taskDateRanges', JSON.stringify(taskDateRanges));
                }
                
                hideSyncing();
                showSyncMessage('Data loaded from server');
                
                if (currentUser && currentUser.type === 'admin') {
                    populateDropdowns();
                }
                
                return true;
            } catch(e) {
                console.error('Load error:', e);
                if (localStorage.getItem('taskCategories')) categories = JSON.parse(localStorage.getItem('taskCategories'));
                if (localStorage.getItem('users')) users = JSON.parse(localStorage.getItem('users'));
                if (localStorage.getItem('userHistory')) userHistory = JSON.parse(localStorage.getItem('userHistory'));
                if (localStorage.getItem('assignments')) assignments = JSON.parse(localStorage.getItem('assignments'));
                if (localStorage.getItem('taskDateRanges')) taskDateRanges = JSON.parse(localStorage.getItem('taskDateRanges'));
                hideSyncing();
                showSyncMessage('Using offline data');
                return false;
            }
        }

        // ========== SAVE TO SERVER ==========
        async function saveToServer(action, data) {
            try {
                showSyncing();
                const formData = new FormData();
                formData.append('action', action);
                formData.append('data', JSON.stringify(data));
                
                const response = await fetch(API_URL, { 
                    method: 'POST', 
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                
                if (result.success) {
                    localStorage.setItem('sync_trigger', Date.now().toString());
                }
                
                hideSyncing();
                return result;
            } catch(e) {
                console.error('Save error:', e);
                hideSyncing();
                return { success: false, message: e.message, error: e.message };
            }
        }

        // ========== AUTO REFRESH ==========
        function startAutoRefresh() {
            if (autoRefreshTimer) clearInterval(autoRefreshTimer);
            // Auto refresh completely disabled as per user request
            // autoRefreshTimer = setInterval(() => {
            //     if (currentUser) loadAllData().then(() => refreshCurrentView());
            // }, 300000);
        }

        // ========== MANUAL REFRESH ==========
        function manualRefresh() {
            if (currentUser) {
                const syncIcon = document.getElementById('syncIcon');
                if (syncIcon) {
                    syncIcon.className = 'fas fa-sync-alt fa-spin';
                }
                loadAllData().then(() => {
                    refreshCurrentView();
                    if (syncIcon) syncIcon.className = 'fas fa-wifi';
                });
            }
        }

        // ========== MIDNIGHT RESET ==========
        function scheduleMidnightReset() {
            if (midnightTimer) clearTimeout(midnightTimer);
            
            let now = new Date();
            let midnight = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() + 1,
                0, 0, 0
            );
            
            let msToMidnight = midnight.getTime() - now.getTime();
            
            midnightTimer = setTimeout(function() {
                if (currentUser && currentUser.type === 'admin') {
                    loadAdminDashboard();
                }
                scheduleMidnightReset();
            }, msToMidnight);
        }

        // ========== SYNC ACROSS TABS ==========
        window.addEventListener('storage', function(e) {
            if (e.key === 'sync_trigger') {
                loadAllData().then(() => refreshCurrentView());
                const saved = localStorage.getItem('companySettings');
                if (saved) {
                    companySettings = JSON.parse(saved);
                    updateCompanyDisplay();
                }
            }
        });

        // ========== SYNC INDICATORS ==========
        function showSyncing() {
            const spinner = document.getElementById('syncSpinner');
            const icon = document.getElementById('syncIcon');
            const text = document.getElementById('syncText');
            if (spinner && icon && text) {
                spinner.style.display = 'inline-block';
                icon.style.display = 'none';
                text.textContent = 'Syncing...';
            }
        }

        function hideSyncing() {
            const spinner = document.getElementById('syncSpinner');
            const icon = document.getElementById('syncIcon');
            const text = document.getElementById('syncText');
            if (spinner && icon && text) {
                spinner.style.display = 'none';
                icon.style.display = 'inline-block';
                text.textContent = 'Connected';
            }
        }

        function showSyncMessage(msg) {
            const text = document.getElementById('syncText');
            const icon = document.getElementById('syncIcon');
            if (text && icon) {
                text.textContent = msg;
                icon.className = 'fas fa-check-circle';
                setTimeout(() => {
                    icon.className = 'fas fa-wifi';
                    text.textContent = 'Connected';
                }, 2000);
            }
        }

        // ========== REFRESH CURRENT VIEW ==========
        function refreshCurrentView() {
            if (!currentUser) return;
            if (currentUser.type === 'admin') {
                const activeTab = document.querySelector('#adminTabs .tab.active');
                if (activeTab) {
                    const tabText = activeTab.textContent.toLowerCase();
                    if (tabText.includes('dashboard')) loadAdminDashboard();
                    else if (tabText.includes('daily')) loadAdminDailyReport();
                    else if (tabText.includes('monthly')) loadAdminMonthlyReport();
                    else if (tabText.includes('yearly')) loadAdminYearlyReport();
                    else if (tabText.includes('users')) loadUsersTable();
                    else if (tabText.includes('tasks')) loadHierarchy();
                    else if (tabText.includes('assign')) loadAssignGrid();
                    else if (tabText.includes('company')) updateCompanyDisplay();
                }
            } else {
                const activeTab = document.querySelector('#userTabs .tab.active');
                if (activeTab) {
                    const tabText = activeTab.textContent.toLowerCase();
                    if (tabText.includes('daily')) loadUserDailyReport();
                    else if (tabText.includes('monthly')) loadUserMonthlyReport();
                    else if (tabText.includes('tasks')) loadUserTasks();
                }
            }
        }

        // ========== INITIAL LOAD ==========
        document.addEventListener('DOMContentLoaded', function() {
            // Pehle server se settings lao
            loadCompanySettingsFromServer().then(() => {
                // Phir companies load karo
                loadCompanies();
                // Phir baaki data load karo
                loadAllData();
            });
            
            const savedUser = localStorage.getItem('seastone_currentUser');
            if (savedUser) { 
                currentUser = JSON.parse(savedUser); 
                validateSession(); 
            }
            
            const today = new Date().toISOString().split('T')[0];
            if (document.getElementById('adminDailyDate')) document.getElementById('adminDailyDate').value = today;
            if (document.getElementById('userDailyDate')) document.getElementById('userDailyDate').value = today;
            document.getElementById('password').addEventListener('keypress', function(e) { if (e.key === 'Enter') login(); });
        });

        function validateSession() {
            if (!currentUser) return;
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            document.getElementById('userName').textContent = currentUser.name;
            if (currentUser.type === 'admin') {
                document.getElementById('adminTabs').style.display = 'flex';
                document.getElementById('userTabs').style.display = 'none';
                populateDropdowns();
                showAdminTab('dashboard', document.querySelector('#adminTabs .tab'));
                startAutoRefresh();
                scheduleMidnightReset();
            } else {
                document.getElementById('adminTabs').style.display = 'none';
                document.getElementById('userTabs').style.display = 'flex';
                showUserTab('daily', document.querySelector('#userTabs .tab'));
            }
        }

        // ========== GOOGLE TRANSLATE ==========
        function googleTranslateElementInit() {}
        async function translateWithGoogle() {
            const englishText = document.getElementById('taskNameEn').value.trim();
            if (!englishText) { alert('Please enter English text first'); return; }
            try {
                const translateBtn = document.querySelector('.translate-btn');
                translateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Translating...';
                translateBtn.disabled = true;
                const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ur&dt=t&q=${encodeURIComponent(englishText)}`);
                const data = await response.json();
                if (data && data[0] && data[0][0] && data[0][0][0]) document.getElementById('taskNameUr').value = data[0][0][0];
                else alert('Translation failed');
            } catch (error) { alert('Translation error'); }
            finally {
                const translateBtn = document.querySelector('.translate-btn');
                translateBtn.innerHTML = '<i class="fas fa-language"></i> Translate';
                translateBtn.disabled = false;
            }
        }

        // ========== PASSWORD TOGGLE ==========
        function togglePassword() {
            const password = document.getElementById('password');
            const toggleIcon = document.getElementById('togglePassword');
            password.type = password.type === 'password' ? 'text' : 'password';
            toggleIcon.classList.toggle('fa-eye');
            toggleIcon.classList.toggle('fa-eye-slash');
        }

        function toggleFieldPassword(fieldId, element) {
            const field = document.getElementById(fieldId);
            if (field) {
                field.type = field.type === 'password' ? 'text' : 'password';
                element.classList.toggle('fa-eye');
                element.classList.toggle('fa-eye-slash');
            }
        }

        // ========== LOGIN FUNCTION ==========
        async function login() {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            if (!username || !password) { alert('Please enter username/email and password'); return; }
            
            try {
                const formData = new FormData();
                formData.append('action', 'login');
                formData.append('data', JSON.stringify({ username: username, password: password }));
                
                const response = await fetch(API_URL, { method: 'POST', body: formData });
                const data = await response.json();
                
                if (data.success) {
                    currentUser = data.user;
                } else {
                    let user = users.find(u => (u.username === username || u.email === username) && u.password === password);
                    if (user) {
                        currentUser = user;
                    } else {
                        alert('Invalid credentials');
                        return;
                    }
                }
            } catch(e) {
                let user = users.find(u => (u.username === username || u.email === username) && u.password === password);
                if (user) {
                    currentUser = user;
                } else {
                    alert('Invalid credentials');
                    return;
                }
            }
            
            localStorage.setItem('seastone_currentUser', JSON.stringify(currentUser));
            validateSession();
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
        }

        // ========== LOGOUT ==========
        function logout() {
            if (autoRefreshTimer) clearInterval(autoRefreshTimer);
            if (midnightTimer) clearTimeout(midnightTimer);
            currentUser = null;
            localStorage.removeItem('seastone_currentUser');
            document.getElementById('loginPage').style.display = 'block';
            document.getElementById('dashboard').style.display = 'none';
        }

        // ========== TAB SWITCHING ==========
        function showAdminTab(tab, element) {
            lastAdminTab = tab; localStorage.setItem('seastone_lastAdminTab', tab);
            document.querySelectorAll('#adminTabs .tab').forEach(t => t.classList.remove('active'));
            if (element) element.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            
            if (tab === 'dashboard') { 
                document.getElementById('adminDashboard').classList.add('active'); 
                loadAdminDashboard(); 
            }
            else if (tab === 'daily') { 
                document.getElementById('adminDailyReport').classList.add('active'); 
                loadAdminDailyReport(); 
            }
            else if (tab === 'monthly') { 
                document.getElementById('adminMonthlyReport').classList.add('active'); 
                document.getElementById('adminMonth').value = new Date().getMonth() + 1; 
                loadAdminMonthlyReport(); 
            }
            else if (tab === 'yearly') { 
                document.getElementById('adminYearlyReport').classList.add('active'); 
                loadAdminYearlyReport(); 
            }
            else if (tab === 'users') { 
                document.getElementById('adminUsers').classList.add('active'); 
                loadUsersTable(); 
            }
            else if (tab === 'tasks') { 
                document.getElementById('adminTasks').classList.add('active'); 
                loadHierarchy(); 
            }
            else if (tab === 'assign') { 
                document.getElementById('adminAssign').classList.add('active'); 
                loadAssignGrid(); 
            }
            else if (tab === 'company') { 
                document.getElementById('adminCompany').classList.add('active'); 
                updateCompanyDisplay(); 
            }
            else if (tab === 'backup') { 
                document.getElementById('adminBackup').classList.add('active'); 
                const lastBackup = localStorage.getItem('seastone_lastBackup'); 
                document.getElementById('lastBackupDate').textContent = lastBackup ? new Date(lastBackup).toLocaleString() : 'Never'; 
            }
        }

        function showUserTab(tab, element) {
            lastUserTab = tab; localStorage.setItem('seastone_lastUserTab', tab);
            document.querySelectorAll('#userTabs .tab').forEach(t => t.classList.remove('active'));
            if (element) element.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            
            if (tab === 'daily') { 
                document.getElementById('userDailyReport').classList.add('active'); 
                loadUserDailyReport(); 
            }
            else if (tab === 'monthly') { 
                document.getElementById('userMonthlyReport').classList.add('active'); 
                document.getElementById('userMonth').value = new Date().getMonth() + 1; 
                loadUserMonthlyReport(); 
            }
            else if (tab === 'tasks') { 
                document.getElementById('userTasks').classList.add('active'); 
                loadUserTasks(); 
            }
        }

        // ========== POPULATE DROPDOWNS ==========
        function populateDropdowns() {
            let normalUsers = users.filter(u => u.type === 'user');
            ['adminDailyUser', 'adminMonthlyUser', 'yearlyUser'].forEach(id => {
                const select = document.getElementById(id);
                if (select) {
                    select.innerHTML = '<option value="all">All Users</option>';
                    normalUsers.forEach(u => select.innerHTML += `<option value="${u.id}">${u.name} (${u.designation})</option>`);
                }
            });
        }

        // ========== GET DESIGNATION BADGE ==========
        function getDesignationBadgeClass(designation) {
            const map = { 'operator': 'designation-operator', 'supervisor': 'designation-supervisor', 'manager': 'designation-manager', 'admin': 'designation-admin' };
            if (designation && designation.toLowerCase) {
                const lower = designation.toLowerCase();
                for (let [key, value] of Object.entries(map)) if (lower.includes(key)) return value;
            }
            return 'designation-operator';
        }

        // ========== FIND TASK BY ID ==========
        function findTaskById(taskId) {
            for (let cat of categories) {
                for (let sub of cat.subcategories) {
                    for (let item of sub.items) {
                        if (item.id === taskId) return item;
                    }
                }
            }
            return null;
        }

        // ========== ADMIN DASHBOARD ==========
        function loadAdminDashboard() {
            document.getElementById('totalUsers').textContent = users.length;
            document.getElementById('totalActiveUsers').textContent = users.filter(u => u.type === 'user').length;
            
            let totalTasks = 0;
            categories.forEach(cat => cat.subcategories.forEach(sub => totalTasks += sub.items.length));
            document.getElementById('totalTasks').textContent = totalTasks;
            
            let today = new Date();
            let todayStr = today.toISOString().split('T')[0];
            let todayTotal = 0;
            
            Object.keys(userHistory).forEach(key => { 
                if (key.includes(todayStr)) {
                    todayTotal += Object.keys(userHistory[key]).filter(k => k !== '_note').length;
                }
            });
            document.getElementById('todayCompleted').textContent = todayTotal;

            let normalUsers = users.filter(u => u.type === 'user');
            let userHtml = '';
            
            normalUsers.forEach(user => {
                let userTasks = assignments[user.id] || [];
                let todayDueTasks = [];
                
                userTasks.forEach(taskId => {
                    let task = findTaskById(taskId);
                    if (!task || task.inactive) return;
                    
                    let showTask = false;
                    
                    if (task.type === 'daily') {
                        showTask = true;
                    }
                    else if (task.type === 'weekly') {
                        if (task.dueDate) {
                            let dueDate = new Date(task.dueDate);
                            dueDate.setHours(0,0,0,0);
                            let todayDate = new Date(todayStr);
                            todayDate.setHours(0,0,0,0);
                            
                            let daysDiff = Math.floor((dueDate - todayDate) / (1000 * 60 * 60 * 24));
                            
                            if (daysDiff >= 0 && daysDiff <= 1) {
                                showTask = true;
                            }
                            
                            if (!showTask && dueDate < todayDate) {
                                let daysPassed = Math.floor((todayDate - dueDate) / (1000 * 60 * 60 * 24));
                                let dayInWeek = daysPassed % 7;
                                
                                if (dayInWeek >= 5 || dayInWeek <= 0) {
                                    showTask = true;
                                }
                            }
                        }
                    }
                    else if (task.type === 'monthly') {
                        let range = taskDateRanges[`${user.id}_${task.id}`];
                        if (range && range.start && range.end) {
                            let startDay = parseInt(range.start);
                            let endDay = parseInt(range.end);
                            let currentDay = today.getDate();
                            
                            if (currentDay >= startDay && currentDay <= endDay) {
                                showTask = true;
                            }
                        } else if (task.dueDate) {
                            let dueDate = new Date(task.dueDate);
                            dueDate.setHours(0,0,0,0);
                            let todayDate = new Date(todayStr);
                            todayDate.setHours(0,0,0,0);
                            
                            let diffTime = dueDate.getTime() - todayDate.getTime();
                            let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            
                            if (diffDays >= 0 && diffDays <= 5) {
                                showTask = true;
                            }
                        }
                    }
                    else if (task.type === 'annual') {
                        if (task.dueDate) {
                            let taskMonth = new Date(task.dueDate).getMonth() + 1;
                            let todayMonth = today.getMonth() + 1;
                            if (todayMonth === taskMonth) {
                                showTask = true;
                            }
                        }
                    }
                    
                    if (showTask) {
                        todayDueTasks.push(taskId);
                    }
                });
                
                let totalAssigned = todayDueTasks.length;
                
                let todayKey = `${user.id}_${todayStr}`;
                let todayCompleted = userHistory[todayKey] ? Object.keys(userHistory[todayKey]).filter(k => k !== '_note').length : 0;
                
                let dailyProgress = totalAssigned > 0 ? Math.round((todayCompleted / totalAssigned) * 100) : 0;
                let pending = totalAssigned - todayCompleted;
                
                userHtml += `<div class="user-card">
                    <div class="user-header">👤 ${user.name} - ${user.designation}</div>
                    <div class="user-stats">
                        <div><div class="user-stat-value">${totalAssigned}</div><div>Due Today</div></div>
                        <div><div class="user-stat-value" style="color:#059669;">${todayCompleted}</div><div>Completed Today</div></div>
                        <div><div class="user-stat-value" style="color:#f47722;">${pending}</div><div>Pending Today</div></div>
                    </div>
                    <div class="progress-section">
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span>Today's Progress</span>
                            <span>${todayCompleted}/${totalAssigned} (${dailyProgress}%)</span>
                        </div>
                        <div class="progress-bg"><div class="progress-fill" style="width: ${dailyProgress}%;"></div></div>
                    </div>
                </div>`;
            });
            
            document.getElementById('userPerformanceSection').innerHTML = userHtml || '<p>No users</p>';

            let tableHtml = '<table><thead><tr><th>ID</th><th>Task</th><th>Urdu</th><th>Category</th><th>Sub</th><th>Type</th><th>Status</th><th>User</th><th>Time</th></tr></thead><tbody>';
            
            let allTasks = [];
            categories.forEach(cat => cat.subcategories.forEach(sub => sub.items.forEach(item => allTasks.push({...item, categoryName: cat.name, subcategoryName: sub.name}))));
            
            allTasks.forEach(task => {
                let isCompleted = false;
                let completedBy = [];
                let completedTime = '-';
                
                Object.keys(userHistory).forEach(key => {
                    if (key.includes(todayStr) && userHistory[key][task.id]) {
                        isCompleted = true;
                        let userId = key.split('_')[0];
                        let user = users.find(u => u.id == userId);
                        if (user) {
                            completedBy.push(user.name);
                        }
                        completedTime = userHistory[key][task.id].time || '-';
                    }
                });
                
                let assignedUsers = [];
                Object.keys(assignments).forEach(uid => { 
                    if (assignments[uid] && assignments[uid].includes(task.id)) { 
                        let user = users.find(u => u.id == uid); 
                        if (user) assignedUsers.push(user.name); 
                    } 
                });
                
                let priorityIcon = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';
                let typeClass = task.type === 'daily' ? 'cat-daily' : task.type === 'weekly' ? 'cat-weekly' : task.type === 'monthly' ? 'cat-monthly' : 'cat-annual';
                let typeName = task.type === 'daily' ? 'Daily' : task.type === 'weekly' ? 'Weekly' : task.type === 'monthly' ? 'Monthly' : 'Annual';
                
                tableHtml += `<tr>
                    <td><span style="color:#7c3aed;background:#f3e8ff;padding:3px8px;border-radius:4px;">${task.id}</span></td>
                    <td class="task-name-cell">${priorityIcon} ${task.name}</td>
                    <td class="urdu-text">${task.description || '-'}</td>
                    <td>${task.categoryName}</td>
                    <td>${task.subcategoryName}</td>
                    <td><span class="category-badge ${typeClass}">${typeName}</span></td>
                    <td><span class="status-badge ${isCompleted ? 'status-completed' : 'status-pending'}">${isCompleted ? '✓' : '✗'}</span></td>
                    <td>${isCompleted ? completedBy.join(', ') : (assignedUsers.join(', ') || '-')}</td>
                    <td>${completedTime}</td>
                </tr>`;
            });
            
            tableHtml += '</tbody></table>';
            document.getElementById('adminTodayTable').innerHTML = tableHtml;
        }

        // ========== USERS TABLE ==========
        function loadUsersTable() {
            let html = '<table><thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Name</th><th>Designation</th><th>Type</th><th>Actions</th></tr></thead><tbody>';
            users.forEach(u => {
                let desigClass = getDesignationBadgeClass(u.designation);
                let typeDisplay = u.type === 'admin' ? 'Admin' : 'User';
                html += `<tr><td>${u.id}</td><td>${u.username}</td><td>${u.email || '-'}</td><td>${u.name}</td><td><span class="designation-badge ${desigClass}">${u.designation}</span></td><td><span class="user-type-badge ${u.type === 'admin' ? 'user-type-admin' : 'user-type-user'}">${typeDisplay}</span></td><td><button onclick="editUser(${u.id})" class="edit-btn" style="padding:5px10px;">Edit</button>${u.id !== 1 ? `<button onclick="deleteUser(${u.id})" class="delete-btn" style="padding:5px10px;">Del</button>` : ''}</td></tr>`;
            });
            html += '</tbody></table>';
            document.getElementById('userTable').innerHTML = html;
        }

        // ========== USER MODAL ==========
        function showAddUserModal() {
            editingId = null;
            document.getElementById('userModalTitle').textContent = 'Add User';
            document.getElementById('userFullName').value = '';
            document.getElementById('userUsername').value = '';
            document.getElementById('userEmail').value = '';
            document.getElementById('userPassword').value = '';
            document.getElementById('userDesignation').value = 'operator';
            document.getElementById('userType').value = 'user';
            document.getElementById('userModal').style.display = 'block';
        }

        function editUser(id) {
            let user = users.find(u => u.id === id);
            if (user) {
                editingId = id;
                document.getElementById('userModalTitle').textContent = 'Edit User';
                document.getElementById('userFullName').value = user.name;
                document.getElementById('userUsername').value = user.username;
                document.getElementById('userEmail').value = user.email || '';
                document.getElementById('userPassword').value = user.password;
                document.getElementById('userDesignation').value = user.designation || 'operator';
                document.getElementById('userType').value = user.type;
                document.getElementById('userModal').style.display = 'block';
            }
        }

        async function saveUser() {
            if (!document.getElementById('userFullName').value || !document.getElementById('userUsername').value || !document.getElementById('userPassword').value) {
                alert('Please fill all fields');
                return;
            }
            
            let userData = {
                id: editingId || null,
                name: document.getElementById('userFullName').value,
                username: document.getElementById('userUsername').value,
                email: document.getElementById('userEmail').value,
                password: document.getElementById('userPassword').value,
                designation: document.getElementById('userDesignation').value,
                type: document.getElementById('userType').value
            };
            
            try {
                const result = await saveToServer('saveUser', userData);
                
                if (result && result.success && result.user) {
                    if (editingId) {
                        let index = users.findIndex(u => u.id === editingId);
                        users[index] = result.user;
                    } else {
                        users.push(result.user);
                        if (result.user.type === 'user') {
                            assignments[result.user.id] = [];
                        }
                    }
                    users.sort((a,b) => a.id - b.id);
                    localStorage.setItem('users', JSON.stringify(users));
                    localStorage.setItem('assignments', JSON.stringify(assignments));
                    closeModal('userModal');
                    loadUsersTable();
                    populateDropdowns();
                    alert('User saved successfully!');
                } else {
                    alert('Error saving user: ' + (result?.message || 'Unknown error'));
                }
            } catch(error) {
                console.error('Save user error:', error);
                alert('Error saving user: ' + error.message);
            }
        }

        // ========== DELETE USER ==========
        async function deleteUser(id) {
            if (id === 1) { 
                alert('Cannot delete admin'); 
                return; 
            }
            if (!confirm('Delete user?')) return;
            
            try {
                const result = await saveToServer('deleteUser', { id: id });
                
                if (result.success) {
                    users = users.filter(u => u.id !== id);
                    delete assignments[id];
                    
                    Object.keys(userHistory).forEach(key => {
                        if (key.startsWith(id + '_')) {
                            delete userHistory[key];
                        }
                    });
                    
                    Object.keys(taskDateRanges).forEach(key => {
                        if (key.startsWith(id + '_')) {
                            delete taskDateRanges[key];
                        }
                    });
                    
                    localStorage.setItem('users', JSON.stringify(users));
                    localStorage.setItem('assignments', JSON.stringify(assignments));
                    localStorage.setItem('userHistory', JSON.stringify(userHistory));
                    localStorage.setItem('taskDateRanges', JSON.stringify(taskDateRanges));
                    
                    loadUsersTable();
                    populateDropdowns();
                    alert('User deleted successfully!');
                } else {
                    alert('Error deleting user: ' + (result.message || 'Unknown error'));
                }
            } catch(error) {
                console.error('Delete user error:', error);
                alert('Error deleting user: ' + error.message);
            }
        }

        // ========== HIERARCHY FUNCTIONS ==========
        function loadHierarchy() {
            let html = '<ul class="category-list" style="list-style:none;">';
            
            categories.forEach(cat => {
                let subCount = cat.subcategories.length;
                let itemCount = cat.subcategories.reduce((sum, sub) => sum + sub.items.length, 0);
                
                let isCatExpanded = expandedCategories[cat.id] || false;
                
                html += `<li class="category-item" style="margin-bottom:10px;border:1px solid #f1f5f9;border-radius:12px;overflow:hidden;">
                    <div class="category-header" style="background:#2E5C8A; color:white; padding:15px 20px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" 
                         onclick="toggleCategory('${cat.id}')">
                        <div style="display:flex; align-items:center; gap:15px; flex:1;">
                            <span style="font-weight:700; color:#f47722; background:white; padding:4px 12px; border-radius:20px; font-size:14px; border:1px solid #f47722; min-width:100px; text-align:center;">${cat.id}</span>
                            <span style="font-weight:600; color:white;">${cat.name}</span>
                            <span style="color:rgba(255,255,255,0.8); font-size:13px; background:rgba(255,255,255,0.2); padding:4px 12px; border-radius:20px;">${subCount} sub, ${itemCount} tasks</span>
                        </div>
                        <div style="display:flex; gap:8px;" onclick="event.stopPropagation()">
                            <button class="icon-btn add" style="padding:6px 12px; border:1px solid #059669; color:#059669; background:white; border-radius:8px;" 
                                    onclick="showAddSubcategoryModal('${cat.id}','${cat.name}')">+ Sub</button>
                            <button class="icon-btn edit" style="padding:6px 12px; border:1px solid #3b82f6; color:#3b82f6; background:white; border-radius:8px;" 
                                    onclick="showEditCategoryModal('${cat.id}')">Edit</button>
                            <button class="icon-btn delete" style="padding:6px 12px; border:1px solid #dc2626; color:#dc2626; background:white; border-radius:8px;" 
                                    onclick="deleteCategory('${cat.id}')">Del</button>
                        </div>
                    </div>
                    <div id="cat-${cat.id}" class="category-body" style="display: ${isCatExpanded ? 'block' : 'none'}; padding:10px 20px 20px 50px; background:white;">`;
                
                cat.subcategories.forEach(sub => {
                    let isSubExpanded = expandedSubcategories[`${cat.id}_${sub.id}`] || false;
                    
                    html += `<li class="subcategory-item" style="margin-bottom:8px; border:1px solid #c8e6c9; border-radius:10px; overflow:hidden;">
                        <div class="subcategory-header" style="background:#e8f5e9; color:#1b5e20; padding:12px 15px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" 
                             onclick="toggleSubcategory('${cat.id}','${sub.id}')">
                            <div style="display:flex; align-items:center; gap:15px; flex:1;">
                                <span style="font-weight:600; color:#1b5e20; background:white; padding:3px 10px; border-radius:16px; font-size:13px; border:1px solid #1b5e20; min-width:90px; text-align:center;">${sub.id}</span>
                                <span style="font-weight:500; color:#1b5e20;">${sub.name}</span>
                                <span style="color:#1b5e20; font-size:12px; background:rgba(27,94,32,0.1); padding:2px 8px; border-radius:12px;">${sub.items.length} tasks</span>
                            </div>
                            <div style="display:flex; gap:5px;" onclick="event.stopPropagation()">
                                <button class="icon-btn add" style="padding:4px 8px; border:1px solid #059669; color:#059669; background:white; border-radius:6px;" 
                                        onclick="showAddItemModal('${cat.id}','${sub.id}','${cat.name}','${sub.name}')">+ Task</button>
                                <button class="icon-btn edit" style="padding:4px 8px; border:1px solid #3b82f6; color:#3b82f6; background:white; border-radius:6px;" 
                                        onclick="showEditSubcategoryModal('${cat.id}','${sub.id}')">Edit</button>
                                <button class="icon-btn delete" style="padding:4px 8px; border:1px solid #dc2626; color:#dc2626; background:white; border-radius:6px;" 
                                        onclick="deleteSubcategory('${cat.id}','${sub.id}')">Del</button>
                            </div>
                        </div>
                        <div id="sub-${cat.id}-${sub.id}" class="subcategory-tasks" style="display: ${isSubExpanded ? 'block' : 'none'}; padding:10px 15px 15px 40px; background:white;">`;
                    
                    sub.items.forEach(item => {
                        let priorityIcon = item.priority === 'high' ? '🔴' : item.priority === 'medium' ? '🟡' : '🟢';
                        let typeClass = item.type === 'daily' ? 'daily' : item.type === 'weekly' ? 'weekly' : item.type === 'monthly' ? 'monthly' : 'annual';
                        let typeName = item.type === 'daily' ? 'Daily' : item.type === 'weekly' ? 'Weekly' : item.type === 'monthly' ? 'Monthly' : 'Annual';
                        html += `<div class="task-item">
                            <div class="task-left-section">
                                <span class="task-code">${item.id}</span>
                                <span class="task-english-name">${priorityIcon} ${item.name}</span>
                                <span class="task-type-badge ${typeClass}">${typeName}</span>
                            </div>
                            <div class="task-right-section">
                                <span class="task-urdu-name">${item.description || ''}</span>
                                ${item.estimatedTime ? `<span class="task-time-badge"><i class="far fa-clock"></i> ${item.estimatedTime}</span>` : ''}
                                <div class="task-actions">
                                    <button class="task-action-btn edit" onclick="showEditItemModal('${cat.id}','${sub.id}','${item.id}')">Edit</button>
                                    <button class="task-action-btn delete" onclick="deleteItem('${cat.id}','${sub.id}','${item.id}')">Del</button>
                                    <button class="task-action-btn view" onclick="showTaskDetails('${cat.id}','${sub.id}','${item.id}')">👁️</button>
                                </div>
                            </div>
                        </div>`;
                    });
                    
                    if (sub.items.length === 0) html += `<div style="padding:15px; text-align:center; color:#94a3b8;">No tasks</div>`;
                    html += `</div></li>`;
                });
                
                if (cat.subcategories.length === 0) html += `<div style="padding:15px; text-align:center; color:#94a3b8;">No subcategories</div>`;
                html += `</div></li>`;
            });
            
            html += '</ul>';
            
            if (categories.length === 0) html = '<div style="padding:40px; text-align:center; color:#64748b;">No categories yet</div>';
            document.getElementById('hierarchyContainer').innerHTML = html;
        }

        function toggleCategory(catId) {
            let el = document.getElementById(`cat-${catId}`);
            if (el) {
                if (el.style.display === 'none' || el.style.display === '') {
                    el.style.display = 'block';
                    expandedCategories[catId] = true;
                } else {
                    el.style.display = 'none';
                    expandedCategories[catId] = false;
                }
            }
        }

        function toggleSubcategory(catId, subId) {
            let el = document.getElementById(`sub-${catId}-${subId}`);
            if (el) {
                if (el.style.display === 'none' || el.style.display === '') {
                    el.style.display = 'block';
                    expandedSubcategories[`${catId}_${subId}`] = true;
                } else {
                    el.style.display = 'none';
                    expandedSubcategories[`${catId}_${subId}`] = false;
                }
            }
        }

        function expandAll() {
            categories.forEach(cat => {
                expandedCategories[cat.id] = true;
                cat.subcategories.forEach(sub => {
                    expandedSubcategories[`${cat.id}_${sub.id}`] = true;
                });
            });
            loadHierarchy();
        }

        function collapseAll() {
            categories.forEach(cat => {
                expandedCategories[cat.id] = false;
                cat.subcategories.forEach(sub => {
                    expandedSubcategories[`${cat.id}_${sub.id}`] = false;
                });
            });
            loadHierarchy();
        }

        function showAddCategoryModal() {
            editCategoryId = null;
            document.getElementById('categoryModalTitle').textContent = 'Add Category';
            document.getElementById('categoryId').value = '';
            document.getElementById('categoryId').style.background = '#f1f5f9';
            document.getElementById('categoryId').readOnly = false;
            document.getElementById('categoryName').value = '';
            document.getElementById('categoryDescription').value = '';
            document.getElementById('categoryModal').style.display = 'block';
        }

        function showEditCategoryModal(catId) {
            let cat = categories.find(c => c.id === catId);
            if (cat) {
                editCategoryId = catId;
                document.getElementById('categoryModalTitle').textContent = 'Edit Category';
                document.getElementById('categoryId').value = cat.id;
                document.getElementById('categoryId').style.background = '#e2e8f0';
                document.getElementById('categoryId').readOnly = true;
                document.getElementById('categoryName').value = cat.name;
                document.getElementById('categoryDescription').value = cat.description || '';
                document.getElementById('categoryModal').style.display = 'block';
            }
        }

        async function saveCategory() {
            let id = document.getElementById('categoryId').value.trim();
            let name = document.getElementById('categoryName').value.trim();
            let desc = document.getElementById('categoryDescription').value.trim();
            
            if (!id || !name) {
                alert('Category ID and Name are required');
                return;
            }
            
            if (!editCategoryId && categories.find(c => c.id === id)) {
                alert('Category ID already exists');
                return;
            }
            
            try {
                if (editCategoryId) {
                    let cat = categories.find(c => c.id === editCategoryId);
                    if (cat) {
                        cat.name = name;
                        cat.description = desc;
                    }
                    
                    const result = await saveToServer('updateCategory', { 
                        id: editCategoryId, 
                        name: name, 
                        description: desc 
                    });
                    
                    if (!result.success) {
                        alert('Error updating category: ' + (result.message || 'Unknown error'));
                        return;
                    }
                    
                } else {
                    categories.push({
                        id: id,
                        name: name,
                        description: desc,
                        subcategories: []
                    });
                    
                    const result = await saveToServer('saveCategory', { 
                        id: id, 
                        name: name, 
                        description: desc 
                    });
                    
                    if (!result.success) {
                        alert('Error saving category: ' + (result.message || 'Unknown error'));
                        return;
                    }
                    
                    expandedCategories[id] = true;
                }
                
                localStorage.setItem('taskCategories', JSON.stringify(categories));
                closeModal('categoryModal');
                loadHierarchy();
                populateDropdowns();
                alert('Category saved successfully!');
                
            } catch(error) {
                console.error('Save category error:', error);
                alert('Error saving category: ' + error.message);
            }
        }

        async function deleteCategory(catId) {
            let cat = categories.find(c => c.id === catId);
            if (cat && cat.subcategories.length > 0) { alert('Delete subcategories first'); return; }
            if (confirm('Delete category?')) {
                categories = categories.filter(c => c.id !== catId);
                delete expandedCategories[catId];
                await saveToServer('deleteCategory', { id: catId });
                localStorage.setItem('taskCategories', JSON.stringify(categories));
                loadHierarchy();
                populateDropdowns();
            }
        }

        function showAddSubcategoryModal(catId, catName) {
            currentCategoryId = catId;
            editSubcategoryPath = null;
            document.getElementById('subcategoryModalTitle').textContent = 'Add Subcategory';
            document.getElementById('parentCategoryName').textContent = catName;
            document.getElementById('parentCategoryId').textContent = catId;
            document.getElementById('subcategoryName').value = '';
            document.getElementById('subcategoryDescription').value = '';
            document.getElementById('subcategoryModal').style.display = 'block';
        }

        function showEditSubcategoryModal(catId, subId) {
            let cat = categories.find(c => c.id === catId);
            if (cat) {
                let sub = cat.subcategories.find(s => s.id === subId);
                if (sub) {
                    currentCategoryId = catId;
                    editSubcategoryPath = { categoryId: catId, subcategoryId: subId };
                    document.getElementById('subcategoryModalTitle').textContent = 'Edit Subcategory';
                    document.getElementById('parentCategoryName').textContent = cat.name;
                    document.getElementById('parentCategoryId').textContent = catId;
                    document.getElementById('subcategoryName').value = sub.name;
                    document.getElementById('subcategoryDescription').value = sub.description || '';
                    document.getElementById('subcategoryModal').style.display = 'block';
                }
            }
        }

        async function saveSubcategory() {
            if (!currentCategoryId) {
                alert('No category selected');
                return;
            }
            
            let name = document.getElementById('subcategoryName').value.trim();
            let desc = document.getElementById('subcategoryDescription').value.trim();
            
            if (!name) { 
                alert('Subcategory name required'); 
                return; 
            }
            
            let cat = categories.find(c => c.id === currentCategoryId);
            if (!cat) {
                alert('Category not found');
                return;
            }

            try {
                if (editSubcategoryPath) {
                    let sub = cat.subcategories.find(s => s.id === editSubcategoryPath.subcategoryId);
                    if (sub) { 
                        sub.name = name; 
                        sub.description = desc; 
                    }
                    
                    const result = await saveToServer('updateSubcategory', { 
                        id: editSubcategoryPath.subcategoryId,
                        name: name, 
                        description: desc
                    });
                    
                    if (!result.success) {
                        alert('Error updating subcategory: ' + (result.message || 'Unknown error'));
                        return;
                    }
                    
                } else {
                    let baseId = cat.id;
                    let usedNumbers = [];
                    
                    cat.subcategories.forEach(sub => {
                        if (sub.id.startsWith(baseId)) { 
                            let numStr = sub.id.substring(baseId.length);
                            let num = parseInt(numStr);
                            if (!isNaN(num)) usedNumbers.push(num);
                        }
                    });
                    
                    usedNumbers.sort((a,b) => a - b);
                    
                    let newNum = 1;
                    for (let i = 0; i < usedNumbers.length; i++) {
                        if (usedNumbers[i] > newNum) break;
                        if (usedNumbers[i] === newNum) newNum++;
                    }
                    
                    let newId = baseId + newNum.toString().padStart(2, '0');
                    
                    cat.subcategories.push({ 
                        id: newId, 
                        name: name, 
                        description: desc, 
                        type: 'daily',
                        items: [] 
                    });
                    
                    const result = await saveToServer('saveSubcategory', { 
                        category_id: currentCategoryId, 
                        name: name, 
                        description: desc,
                        type: 'daily'
                    });
                    
                    if (!result.success) {
                        alert('Error saving subcategory: ' + (result.message || 'Unknown error'));
                        return;
                    }
                    
                    expandedCategories[currentCategoryId] = true;
                    expandedSubcategories[`${currentCategoryId}_${newId}`] = true;
                }
                
                localStorage.setItem('taskCategories', JSON.stringify(categories));
                closeModal('subcategoryModal');
                loadHierarchy();
                alert('Subcategory saved successfully!');
                
            } catch(error) {
                console.error('Save subcategory error:', error);
                alert('Error saving subcategory: ' + error.message);
            }
        }

        async function deleteSubcategory(catId, subId) {
            let cat = categories.find(c => c.id === catId);
            if (cat) {
                let sub = cat.subcategories.find(s => s.id === subId);
                if (sub && sub.items.length > 0) { alert('Delete tasks first'); return; }
            }
            if (confirm('Delete subcategory?')) {
                let cat = categories.find(c => c.id === catId);
                if (cat) {
                    cat.subcategories = cat.subcategories.filter(s => s.id !== subId);
                    delete expandedSubcategories[`${catId}_${subId}`];
                    await saveToServer('deleteSubcategory', { id: subId });
                    localStorage.setItem('taskCategories', JSON.stringify(categories));
                    loadHierarchy();
                }
            }
        }

        function showAddItemModal(catId, subId, catName, subName) {
            currentCategoryId = catId; currentSubcategoryId = subId; editItemPath = null;
            document.getElementById('itemModalTitle').textContent = 'Add Task';
            document.getElementById('itemParentCategoryName').textContent = catName;
            document.getElementById('itemParentSubcategoryName').textContent = subName;
            document.getElementById('taskNameEn').value = '';
            document.getElementById('taskNameUr').value = '';
            document.getElementById('taskType').value = 'daily';
            document.getElementById('itemDescription').value = '';
            document.getElementById('itemEstimatedTime').value = '';
            document.getElementById('itemPriority').value = 'medium';
            document.getElementById('itemInactive').checked = false;
            document.getElementById('taskDueDate').value = '';
            document.getElementById('dueDateContainer').style.display = 'none';
            document.getElementById('itemModal').style.display = 'block';
        }

        function showEditItemModal(catId, subId, itemId) {
            let cat = categories.find(c => c.id === catId);
            if (cat) {
                let sub = cat.subcategories.find(s => s.id === subId);
                if (sub) {
                    let item = sub.items.find(i => i.id === itemId);
                    if (item) {
                        currentCategoryId = catId; currentSubcategoryId = subId; editItemPath = { categoryId: catId, subcategoryId: subId, itemId: itemId };
                        document.getElementById('itemModalTitle').textContent = 'Edit Task';
                        document.getElementById('itemParentCategoryName').textContent = cat.name;
                        document.getElementById('itemParentSubcategoryName').textContent = sub.name;
                        document.getElementById('taskNameEn').value = item.name || '';
                        document.getElementById('taskNameUr').value = item.description || '';
                        document.getElementById('taskType').value = item.type || 'daily';
                        document.getElementById('itemDescription').value = item.description || '';
                        document.getElementById('itemEstimatedTime').value = item.estimatedTime || '';
                        document.getElementById('itemPriority').value = item.priority || 'medium';
                        document.getElementById('itemInactive').checked = item.inactive || false;
                        document.getElementById('taskDueDate').value = item.dueDate || '';
                        document.getElementById('dueDateContainer').style.display = (item.type === 'weekly' || item.type === 'annual') ? 'block' : 'none';
                        document.getElementById('itemModal').style.display = 'block';
                    }
                }
            }
        }

        document.addEventListener('change', function(e) {
            if (e.target && e.target.id === 'taskType') {
                const type = e.target.value;
                document.getElementById('dueDateContainer').style.display = (type === 'weekly' || type === 'annual') ? 'block' : 'none';
            }
        });

        function getNextTaskNumber(sub) {
            let usedNumbers = [];
            
            sub.items.forEach(item => {
                let num = parseInt(item.id.slice(-4));
                if (!isNaN(num)) usedNumbers.push(num);
            });
            
            usedNumbers.sort((a, b) => a - b);
            
            let nextNum = 1;
            for (let i = 0; i < usedNumbers.length; i++) {
                if (usedNumbers[i] > nextNum) break;
                if (usedNumbers[i] === nextNum) nextNum++;
            }
            
            return nextNum;
        }

        async function saveItem() {
            if (!currentCategoryId || !currentSubcategoryId) {
                alert('Category or Subcategory not selected');
                return;
            }
            
            let name = document.getElementById('taskNameEn').value.trim();
            let urduName = document.getElementById('taskNameUr').value.trim();
            let type = document.getElementById('taskType').value;
            let dueDate = document.getElementById('taskDueDate').value;
            let estimatedTime = document.getElementById('itemEstimatedTime').value.trim();
            let priority = document.getElementById('itemPriority').value;
            let inactive = document.getElementById('itemInactive').checked;

            if (!name) { 
                alert('Task name required'); 
                return; 
            }
            
            if (!urduName) { 
                alert('Urdu translation required'); 
                return; 
            }

            let cat = categories.find(c => c.id === currentCategoryId);
            if (!cat) {
                alert('Category not found');
                return;
            }
            
            let sub = cat.subcategories.find(s => s.id === currentSubcategoryId);
            if (!sub) {
                alert('Subcategory not found');
                return;
            }

            let itemData = { 
                name: name, 
                description: urduName, 
                type: type, 
                dueDate: dueDate || null, 
                estimatedTime: estimatedTime,
                priority: priority,
                inactive: inactive
            };
            
            try {
                if (editItemPath) {
                    let item = sub.items.find(i => i.id === editItemPath.itemId);
                    if (item) { 
                        Object.assign(item, itemData); 
                        const result = await saveToServer('updateTask', { id: item.id, ...itemData });
                        if (!result.success) {
                            alert('Error updating task: ' + (result.message || 'Unknown error'));
                            return;
                        }
                    }
                } else {
                    let baseId = sub.id;
                    let nextNum = getNextTaskNumber(sub);
                    let newId = baseId + nextNum.toString().padStart(4, '0');
                    
                    itemData.id = newId;
                    sub.items.push(itemData);
                    
                    const result = await saveToServer('saveTask', { 
                        subcategory_id: currentSubcategoryId, 
                        ...itemData 
                    });
                    
                    if (!result.success) {
                        alert('Error saving task: ' + (result.message || 'Unknown error'));
                        return;
                    }
                    
                    expandedCategories[currentCategoryId] = true;
                    expandedSubcategories[`${currentCategoryId}_${currentSubcategoryId}`] = true;
                }
                
                sub.items.sort((a, b) => parseInt(a.id.slice(-4)) - parseInt(b.id.slice(-4)));
                localStorage.setItem('taskCategories', JSON.stringify(categories));
                closeModal('itemModal');
                loadHierarchy();
                alert('Task saved successfully!');
                
            } catch(error) {
                console.error('Save task error:', error);
                alert('Error saving task: ' + error.message);
            }
        }

        async function deleteItem(catId, subId, itemId) {
            if (confirm('Delete task?')) {
                let cat = categories.find(c => c.id === catId);
                if (cat) {
                    let sub = cat.subcategories.find(s => s.id === subId);
                    if (sub) {
                        sub.items = sub.items.filter(i => i.id !== itemId);
                        Object.keys(assignments).forEach(uid => { if (assignments[uid]) assignments[uid] = assignments[uid].filter(id => id !== itemId); });
                        await saveToServer('deleteTask', { id: itemId });
                        localStorage.setItem('taskCategories', JSON.stringify(categories));
                        localStorage.setItem('assignments', JSON.stringify(assignments));
                        loadHierarchy();
                    }
                }
            }
        }

        function showTaskDetails(catId, subId, itemId) {
            let cat = categories.find(c => c.id === catId);
            if (cat) {
                let sub = cat.subcategories.find(s => s.id === subId);
                if (sub) {
                    let item = sub.items.find(i => i.id === itemId);
                    if (item) {
                        let priorityText = item.priority === 'high' ? 'High 🔴' : item.priority === 'medium' ? 'Medium 🟡' : 'Low 🟢';
                        let typeText = item.type === 'daily' ? 'Daily' : item.type === 'weekly' ? 'Weekly' : item.type === 'monthly' ? 'Monthly' : 'Annual';
                        let html = `<div><span style="font-size:13px;color:#64748b;">Task ID</span><br><span style="font-size:16px;padding:10px;background:white;border-radius:8px;border:1px solid #f1f5f9;background:#fff5f0;border-color:#f47722;color:#f47722;font-weight:600;">${item.id}</span></div>
                            <div><span style="font-size:13px;color:#64748b;">Name (English)</span><br><span style="font-size:16px;padding:10px;background:white;border-radius:8px;border:1px solid #f1f5f9;">${item.name}</span></div>
                            <div><span style="font-size:13px;color:#64748b;">Name (Urdu)</span><br><span style="font-size:18px;font-family:'Jameel Noori Nastaleeq';font-weight:bold;color:#333;padding:10px;background:white;border-radius:8px;border:1px solid #f1f5f9;direction:rtl;text-align:right;">${item.description || ''}</span></div>
                            <div><span style="font-size:13px;color:#64748b;">Type</span><br><span style="font-size:16px;padding:10px;background:white;border-radius:8px;border:1px solid #f1f5f9;">${typeText}</span></div>
                            ${item.dueDate ? `<div><span style="font-size:13px;color:#64748b;">Due Date</span><br><span style="font-size:16px;padding:10px;background:white;border-radius:8px;border:1px solid #f1f5f9;">${item.dueDate}</span></div>` : ''}
                            <div><span style="font-size:13px;color:#64748b;">Category</span><br><span style="font-size:16px;padding:10px;background:white;border-radius:8px;border:1px solid #f1f5f9;">${cat.name} (${cat.id})</span></div>
                            <div><span style="font-size:13px;color:#64748b;">Subcategory</span><br><span style="font-size:16px;padding:10px;background:white;border-radius:8px;border:1px solid #f1f5f9;">${sub.name} (${sub.id})</span></div>
                            <div><span style="font-size:13px;color:#64748b;">Est. Time</span><br><span style="font-size:16px;padding:10px;background:white;border-radius:8px;border:1px solid #f1f5f9;">${item.estimatedTime || '-'}</span></div>
                            <div><span style="font-size:13px;color:#64748b;">Priority</span><br><span style="font-size:16px;padding:10px;background:white;border-radius:8px;border:1px solid #f1f5f9;">${priorityText}</span></div>
                            <div><span style="font-size:13px;color:#64748b;">Status</span><br><span style="font-size:16px;padding:10px;background:white;border-radius:8px;border:1px solid #f1f5f9;">${item.inactive ? 'Inactive' : 'Active'}</span></div>`;
                        document.getElementById('taskDetailsContent').innerHTML = html;
                        document.getElementById('taskDetailsPanel').style.display = 'block';
                    }
                }
            }
        }

        // ========== ASSIGN GRID ==========
        function loadAssignGrid() {
            let normalUsers = users.filter(u => u.type === 'user');
            let allTasks = [];
            categories.forEach(cat => cat.subcategories.forEach(sub => sub.items.forEach(item => { if (!item.inactive) allTasks.push({...item, categoryName: cat.name, categoryId: cat.id, subcategoryName: sub.name}); })));
            
            let tasksByCategory = {};
            allTasks.forEach(task => { 
                if (!tasksByCategory[task.categoryName]) {
                    tasksByCategory[task.categoryName] = {
                        id: task.categoryId,
                        tasks: []
                    };
                }
                tasksByCategory[task.categoryName].tasks.push(task); 
            });
            
            let html = '';
            
            normalUsers.forEach(user => {
                html += `<div class="assignment-card">
                    <div class="assignment-header">👤 ${user.name} <span class="designation-badge ${getDesignationBadgeClass(user.designation)}" style="margin-left:10px;">${user.designation}</span></div>
                    <div class="assignment-tasks">`;
                
                Object.keys(tasksByCategory).sort().forEach(catName => {
                    let categoryData = tasksByCategory[catName];
                    let categoryTasks = categoryData.tasks;
                    
                    let stateKey = `assign_${user.id}_${categoryData.id}`;
                    let isExpanded = assignmentExpandedState[stateKey] || false;
                    
                    html += `<div class="assignment-category-group">
                        <div class="assignment-category-header ${!isExpanded ? 'collapsed' : ''}" 
                             onclick="toggleAssignmentCategory('${user.id}', '${categoryData.id}', this)">
                            <span><i class="fas fa-chevron-down"></i> ${catName} (${categoryTasks.length})</span>
                        </div>
                        <div class="assignment-category-tasks ${!isExpanded ? 'collapsed' : ''}" 
                             id="assign_cat_${user.id}_${categoryData.id}">`;
                    
                    categoryTasks.forEach(task => {
                        let checked = (assignments[user.id] && assignments[user.id].includes(task.id)) ? 'checked' : '';
                        let priorityIcon = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';
                        let typeClass = task.type === 'daily' ? 'daily' : task.type === 'weekly' ? 'weekly' : task.type === 'monthly' ? 'monthly' : 'annual';
                        let typeName = task.type === 'daily' ? 'Daily' : task.type === 'weekly' ? 'Weekly' : task.type === 'monthly' ? 'Monthly' : 'Annual';
                        
                        html += `<div class="task-row" id="taskrow_${user.id}_${task.id}">
                            <div style="display:flex;width:100%;align-items:center;gap:8px;">
                                <input type="checkbox" class="task-checkbox" 
                                       id="assign_${user.id}_${task.id}" ${checked} 
                                       onchange="onCheckboxChange(${user.id}, '${task.id}', this.checked, '${task.type}', event)">
                                <span class="task-text">
                                    <span style="color:#7c3aed;background:#f3e8ff;padding:2px6px;border-radius:4px;margin-right:8px;">${task.id}</span>
                                    ${priorityIcon} ${task.name}
                                    <span style="color:#64748b;font-size:11px;margin-left:8px;">${task.subcategoryName}</span>
                                    <span class="task-badge ${typeClass}" style="margin-left:8px;">${typeName}</span>
                                    ${task.estimatedTime ? `<span style="color:#64748b;font-size:11px;margin-left:8px;">⏱️ ${task.estimatedTime}</span>` : ''}
                                </span>
                            </div>`;
                        
                        // Monthly tasks
                        if (task.type === 'monthly') {
                            let range = taskDateRanges[`${user.id}_${task.id}`];
                            if (range && range.start && range.end) {
                                html += `<div class="due-info monthly" id="dueinfo_${user.id}_${task.id}">
                                    <i class="fas fa-calendar"></i> Days: ${range.start} to ${range.end} of every month
                                </div>`;
                            } else {
                                html += `<div class="date-range-container" id="rangecontainer_${user.id}_${task.id}" style="${checked ? 'display:flex' : 'display:none'}">
                                    <input type="number" min="1" max="31" class="date-input" id="rangestart_${user.id}_${task.id}" placeholder="Start Day (1-31)" value="" style="width: 120px;">
                                    <input type="number" min="1" max="31" class="date-input" id="rangeend_${user.id}_${task.id}" placeholder="End Day (1-31)" value="" style="width: 120px;">
                                    <button class="save-range-btn" onclick="saveDateRange(${user.id}, '${task.id}')">Save</button>
                                </div>`;
                            }
                        }
                        
                        // Weekly tasks
                        if (task.type === 'weekly') {
                            if (task.dueDate) {
                                html += `<div class="due-info weekly" id="dueinfo_${user.id}_${task.id}">
                                    <i class="fas fa-calendar"></i> Due: ${task.dueDate}
                                </div>`;
                            } else {
                                html += `<div class="date-input-container" id="dateinput_${user.id}_${task.id}" style="${checked ? 'display:flex' : 'display:none'}">
                                    <input type="date" class="date-input" id="duedate_${user.id}_${task.id}" value="${getDefaultDueDate(task.type)}">
                                    <button class="save-date-btn" onclick="saveDueDate(${user.id}, '${task.id}', '${task.type}')">Save</button>
                                </div>`;
                            }
                        }
                        
                        // Annual tasks
                        if (task.type === 'annual') {
                            if (task.dueDate) {
                                let monthName = new Date(task.dueDate).toLocaleString('default', { month: 'long' });
                                html += `<div class="due-info annual" id="dueinfo_${user.id}_${task.id}">
                                    <i class="fas fa-calendar"></i> Due: ${monthName}
                                </div>`;
                            } else {
                                html += `<select class="month-select" id="duedate_${user.id}_${task.id}" style="${checked ? 'display:block' : 'display:none'}" onchange="saveAnnualMonth(${user.id}, '${task.id}', this.value)">
                                    <option value="">Select Month</option>
                                    <option value="${new Date().getFullYear()}-01-01">January</option>
                                    <option value="${new Date().getFullYear()}-02-01">February</option>
                                    <option value="${new Date().getFullYear()}-03-01">March</option>
                                    <option value="${new Date().getFullYear()}-04-01">April</option>
                                    <option value="${new Date().getFullYear()}-05-01">May</option>
                                    <option value="${new Date().getFullYear()}-06-01">June</option>
                                    <option value="${new Date().getFullYear()}-07-01">July</option>
                                    <option value="${new Date().getFullYear()}-08-01">August</option>
                                    <option value="${new Date().getFullYear()}-09-01">September</option>
                                    <option value="${new Date().getFullYear()}-10-01">October</option>
                                    <option value="${new Date().getFullYear()}-11-01">November</option>
                                    <option value="${new Date().getFullYear()}-12-01">December</option>
                                </select>`;
                            }
                        }
                        
                        html += `</div>`;
                    });
                    
                    html += `</div></div>`;
                });
                
                if (allTasks.length === 0) html += `<div style="padding:20px;text-align:center;color:#94a3b8;">No tasks</div>`;
                html += `</div></div>`;
            });
            
            document.getElementById('assignmentGrid').innerHTML = html;
        }

        function toggleAssignmentCategory(userId, categoryId, element) {
            let tasksDiv = document.getElementById(`assign_cat_${userId}_${categoryId}`);
            let stateKey = `assign_${userId}_${categoryId}`;
            
            if (tasksDiv) {
                if (tasksDiv.classList.contains('collapsed')) {
                    tasksDiv.classList.remove('collapsed');
                    element.classList.remove('collapsed');
                    assignmentExpandedState[stateKey] = true;
                } else {
                    tasksDiv.classList.add('collapsed');
                    element.classList.add('collapsed');
                    assignmentExpandedState[stateKey] = false;
                }
            }
        }

        function getDefaultDueDate(taskType) {
            if (taskType === 'weekly') {
                const date = new Date();
                date.setDate(date.getDate() + 7);
                return date.toISOString().split('T')[0];
            }
            return '';
        }

        // ========== FIXED: onCheckboxChange with complete date cleanup ==========
        function onCheckboxChange(userId, taskId, checked, taskType, event) {
            if (event) {
                event.stopPropagation();
            }
            
            let task = findTaskById(taskId);
            
            if (!checked) {
                // Assignment remove karo
                updateAssignment(userId, taskId, false, taskType);
                
                // Monthly task ki date range delete karo
                if (taskType === 'monthly') {
                    // Local storage se delete
                    if (taskDateRanges[`${userId}_${taskId}`]) {
                        delete taskDateRanges[`${userId}_${taskId}`];
                        localStorage.setItem('taskDateRanges', JSON.stringify(taskDateRanges));
                    }
                    
                    // Server se delete karo
                    saveToServer('saveDateRange', { 
                        user_id: userId, 
                        task_id: taskId, 
                        start_date: null, 
                        end_date: null 
                    });
                    
                    // UI se due info hatado
                    const dueInfo = document.getElementById(`dueinfo_${userId}_${taskId}`);
                    if (dueInfo) {
                        dueInfo.remove();
                    }
                }
                
                // Weekly/Annual task ki due date delete karo
                if ((taskType === 'weekly' || taskType === 'annual') && task) {
                    task.dueDate = null;
                    localStorage.setItem('taskCategories', JSON.stringify(categories));
                    
                    // Server par bhi update karo
                    saveToServer('updateTask', { 
                        id: task.id, 
                        name: task.name,
                        description: task.description,
                        type: task.type,
                        dueDate: null 
                    });
                    
                    // UI se due info hatado
                    const dueInfo = document.getElementById(`dueinfo_${userId}_${taskId}`);
                    if (dueInfo) {
                        dueInfo.remove();
                    }
                }
                
                return;
            }
            
            // Agar checkbox checked hai to dates check karo
            if (taskType === 'monthly') {
                const range = taskDateRanges[`${userId}_${taskId}`];
                if (range && range.start && range.end) {
                    // Pehle se dates saved hain to direct assign karo
                    updateAssignment(userId, taskId, true, taskType);
                } else {
                    // Show date range inputs
                    const rangeContainer = document.getElementById(`rangecontainer_${userId}_${taskId}`);
                    if (rangeContainer) {
                        rangeContainer.style.display = 'flex';
                    }
                }
            }
            else if (taskType === 'weekly') {
                if (task && task.dueDate) {
                    // Pehle se due date saved hai to direct assign karo
                    updateAssignment(userId, taskId, true, taskType);
                } else {
                    // Show date input
                    const dateInput = document.getElementById(`dateinput_${userId}_${taskId}`);
                    if (dateInput) {
                        dateInput.style.display = 'flex';
                    }
                }
            }
            else if (taskType === 'annual') {
                if (task && task.dueDate) {
                    // Pehle se due date saved hai to direct assign karo
                    updateAssignment(userId, taskId, true, taskType);
                } else {
                    // Show month select
                    const monthSelect = document.getElementById(`duedate_${userId}_${taskId}`);
                    if (monthSelect) {
                        monthSelect.style.display = 'block';
                    }
                }
            }
            else {
                // Daily tasks direct assign
                updateAssignment(userId, taskId, true, taskType);
            }
        }

        // ========== FIXED: updateAssignment with complete date cleanup ==========
        async function updateAssignment(userId, taskId, checked, taskType, dueDate = null) {
            if (!assignments[userId]) assignments[userId] = [];
            
            if (checked) {
                if (!assignments[userId].includes(taskId)) {
                    assignments[userId].push(taskId);
                }
                // Agar dueDate di gayi hai to task mein save karo
                if (dueDate) {
                    let task = findTaskById(taskId);
                    if (task) {
                        task.dueDate = dueDate;
                        localStorage.setItem('taskCategories', JSON.stringify(categories));
                    }
                }
            } else {
                // Assignment remove karo
                assignments[userId] = assignments[userId].filter(id => id !== taskId);
                
                // Task ki due date bhi remove karo
                let task = findTaskById(taskId);
                if (task) {
                    task.dueDate = null;
                    localStorage.setItem('taskCategories', JSON.stringify(categories));
                    
                    // Server par bhi update karo
                    await saveToServer('updateTask', { 
                        id: task.id, 
                        name: task.name,
                        description: task.description,
                        type: task.type,
                        dueDate: null 
                    });
                }
                
                // Monthly task ki date range remove karo
                if (taskType === 'monthly' && taskDateRanges[`${userId}_${taskId}`]) {
                    delete taskDateRanges[`${userId}_${taskId}`];
                    localStorage.setItem('taskDateRanges', JSON.stringify(taskDateRanges));
                    
                    // Server se bhi delete karo
                    await saveToServer('saveDateRange', { 
                        user_id: userId, 
                        task_id: taskId, 
                        start_date: null, 
                        end_date: null 
                    });
                }
            }
            
            await saveToServer('saveAssignment', { 
                user_id: userId, 
                task_id: taskId, 
                checked: checked,
                due_date: dueDate
            });
            
            localStorage.setItem('assignments', JSON.stringify(assignments));
            
            // Update checkbox
            const checkbox = document.getElementById(`assign_${userId}_${taskId}`);
            if (checkbox) {
                checkbox.checked = checked;
            }
            
            // Hide/show date containers
            if (taskType === 'monthly') {
                const rangeContainer = document.getElementById(`rangecontainer_${userId}_${taskId}`);
                const dueInfo = document.getElementById(`dueinfo_${userId}_${taskId}`);
                
                if (rangeContainer) {
                    rangeContainer.style.display = checked ? 'flex' : 'none';
                }
                if (dueInfo) {
                    if (checked && taskDateRanges[`${userId}_${taskId}`]) {
                        dueInfo.style.display = 'block';
                    } else {
                        dueInfo.remove();
                    }
                }
            }
            
            if (taskType === 'weekly') {
                const dateInput = document.getElementById(`dateinput_${userId}_${taskId}`);
                const dueInfo = document.getElementById(`dueinfo_${userId}_${taskId}`);
                
                if (dateInput) {
                    dateInput.style.display = checked ? 'flex' : 'none';
                }
                if (dueInfo) {
                    let task = findTaskById(taskId);
                    if (checked && task && task.dueDate) {
                        dueInfo.style.display = 'block';
                    } else {
                        dueInfo.remove();
                    }
                }
            }
            
            if (taskType === 'annual') {
                const monthSelect = document.getElementById(`duedate_${userId}_${taskId}`);
                const dueInfo = document.getElementById(`dueinfo_${userId}_${taskId}`);
                
                if (monthSelect) {
                    monthSelect.style.display = checked ? 'block' : 'none';
                }
                if (dueInfo) {
                    let task = findTaskById(taskId);
                    if (checked && task && task.dueDate) {
                        dueInfo.style.display = 'block';
                    } else {
                        dueInfo.remove();
                    }
                }
            }
        }

        function saveAnnualMonth(userId, taskId, dueDate) {
            if (!dueDate) {
                alert('Please select a month');
                return;
            }
            
            saveToServer('saveAssignment', { 
                user_id: userId, 
                task_id: taskId, 
                checked: true,
                due_date: dueDate
            }).then(result => {
                if (result.success) {
                    if (!assignments[userId]) assignments[userId] = [];
                    if (!assignments[userId].includes(taskId)) {
                        assignments[userId].push(taskId);
                    }
                    localStorage.setItem('assignments', JSON.stringify(assignments));
                    
                    let task = findTaskById(taskId);
                    if (task) {
                        task.dueDate = dueDate;
                        localStorage.setItem('taskCategories', JSON.stringify(categories));
                    }
                    
                    const checkbox = document.getElementById(`assign_${userId}_${taskId}`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                    
                    const monthSelect = document.getElementById(`duedate_${userId}_${taskId}`);
                    if (monthSelect) {
                        monthSelect.style.display = 'none';
                    }
                    
                    const taskRow = document.getElementById(`taskrow_${userId}_${taskId}`);
                    if (taskRow) {
                        const existingDueInfo = document.getElementById(`dueinfo_${userId}_${taskId}`);
                        if (existingDueInfo) {
                            existingDueInfo.remove();
                        }
                        
                        const monthName = new Date(dueDate).toLocaleString('default', { month: 'long' });
                        const dueInfo = document.createElement('div');
                        dueInfo.className = 'due-info annual';
                        dueInfo.id = `dueinfo_${userId}_${taskId}`;
                        dueInfo.innerHTML = `<i class="fas fa-calendar"></i> Due: ${monthName}`;
                        taskRow.appendChild(dueInfo);
                    }
                    
                    localStorage.setItem('sync_trigger', Date.now().toString());
                    alert('Month saved successfully!');
                } else {
                    alert('Error saving month: ' + (result.message || 'Unknown error'));
                }
            });
        }

        function saveDueDate(userId, taskId, taskType) {
            const dateInput = document.getElementById(`duedate_${userId}_${taskId}`);
            const dueDate = dateInput.value;
            
            if (!dueDate) {
                alert('Please select a due date');
                return;
            }
            
            saveToServer('saveAssignment', { 
                user_id: userId, 
                task_id: taskId, 
                checked: true,
                due_date: dueDate
            }).then(result => {
                if (result.success) {
                    if (!assignments[userId]) assignments[userId] = [];
                    if (!assignments[userId].includes(taskId)) {
                        assignments[userId].push(taskId);
                    }
                    localStorage.setItem('assignments', JSON.stringify(assignments));
                    
                    let task = findTaskById(taskId);
                    if (task) {
                        task.dueDate = dueDate;
                        localStorage.setItem('taskCategories', JSON.stringify(categories));
                    }
                    
                    const checkbox = document.getElementById(`assign_${userId}_${taskId}`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                    
                    const dateInputContainer = document.getElementById(`dateinput_${userId}_${taskId}`);
                    if (dateInputContainer) {
                        dateInputContainer.style.display = 'none';
                    }
                    
                    const taskRow = document.getElementById(`taskrow_${userId}_${taskId}`);
                    if (taskRow) {
                        const existingDueInfo = document.getElementById(`dueinfo_${userId}_${taskId}`);
                        if (existingDueInfo) {
                            existingDueInfo.remove();
                        }
                        
                        const dueInfo = document.createElement('div');
                        dueInfo.className = 'due-info weekly';
                        dueInfo.id = `dueinfo_${userId}_${taskId}`;
                        dueInfo.innerHTML = `<i class="fas fa-calendar"></i> Due: ${dueDate}`;
                        taskRow.appendChild(dueInfo);
                    }
                    
                    localStorage.setItem('sync_trigger', Date.now().toString());
                    alert('Due date saved successfully!');
                } else {
                    alert('Error saving due date: ' + (result.message || 'Unknown error'));
                }
            });
        }

        function saveDateRange(userId, taskId) {
            const startDate = document.getElementById(`rangestart_${userId}_${taskId}`).value;
            const endDate = document.getElementById(`rangeend_${userId}_${taskId}`).value;
            
            if (!startDate || !endDate) {
                alert('Please select both start and end days (1-31)');
                return;
            }
            
            if (parseInt(startDate) > parseInt(endDate)) {
                alert('Start day must be less than or equal to end day');
                return;
            }
            
            saveToServer('saveDateRange', { 
                user_id: userId, 
                task_id: taskId, 
                start_date: startDate, 
                end_date: endDate 
            }).then(result => {
                if (result.success) {
                    if (!taskDateRanges) taskDateRanges = {};
                    taskDateRanges[`${userId}_${taskId}`] = { start: startDate, end: endDate };
                    localStorage.setItem('taskDateRanges', JSON.stringify(taskDateRanges));
                    
                    if (!assignments[userId]) assignments[userId] = [];
                    if (!assignments[userId].includes(taskId)) {
                        assignments[userId].push(taskId);
                    }
                    localStorage.setItem('assignments', JSON.stringify(assignments));
                    
                    const checkbox = document.getElementById(`assign_${userId}_${taskId}`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                    
                    const rangeContainer = document.getElementById(`rangecontainer_${userId}_${taskId}`);
                    if (rangeContainer) {
                        rangeContainer.style.display = 'none';
                    }
                    
                    const taskRow = document.getElementById(`taskrow_${userId}_${taskId}`);
                    if (taskRow) {
                        const existingDueInfo = document.getElementById(`dueinfo_${userId}_${taskId}`);
                        if (existingDueInfo) {
                            existingDueInfo.remove();
                        }
                        
                        const dueInfo = document.createElement('div');
                        dueInfo.className = 'due-info monthly';
                        dueInfo.id = `dueinfo_${userId}_${taskId}`;
                        dueInfo.innerHTML = `<i class="fas fa-calendar"></i> Days: ${startDate} to ${endDate} of every month`;
                        taskRow.appendChild(dueInfo);
                    }
                    
                    localStorage.setItem('sync_trigger', Date.now().toString());
                    alert('Date range saved successfully!');
                } else {
                    alert('Error saving date range: ' + (result.message || 'Unknown error'));
                }
            });
        }

        async function saveAssignments() {
            const saveBtn = document.querySelector('.save-all-btn');
            const originalHTML = saveBtn ? saveBtn.innerHTML : '<i class="fas fa-save"></i> Save All Assignments';
            if(saveBtn) {
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                saveBtn.disabled = true;
            }

            try {
                const result = await saveToServer('saveAllAssignments', assignments);
                if (result.success) {
                    localStorage.setItem('assignments', JSON.stringify(assignments));
                    alert('✅ Assignments saved successfully!');
                } else {
                    alert('❌ Error saving assignments: ' + (result.message || 'Unknown error'));
                }
            } catch (error) {
                console.error(error);
                alert('❌ Error saving assignments!');
            } finally {
                if(saveBtn) {
                    saveBtn.innerHTML = originalHTML;
                    saveBtn.disabled = false;
                }
            }
        }

        // ========== USER TASKS ==========
        function loadUserTasks() {
            if (!currentUser) return;
            
            let today = new Date();
            let todayStr = today.toISOString().split('T')[0];
            let todayDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            document.getElementById('todayDate').textContent = todayDate;
            
            let myTaskIds = assignments[currentUser.id] || [];
            
            let allAssignedTasks = [];
            categories.forEach(cat => {
                cat.subcategories.forEach(sub => {
                    sub.items.forEach(item => {
                        if (myTaskIds.includes(item.id) && !item.inactive) {
                            allAssignedTasks.push({
                                ...item,
                                categoryName: cat.name,
                                subcategoryName: sub.name
                            });
                        }
                    });
                });
            });
            
            let todayTasks = [];
            
            // Get all task IDs completed by this user in the current month
            let completedThisMonth = [];
            let monthPrefix = `${currentUser.id}_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
            Object.keys(userHistory).forEach(key => {
                if (key.startsWith(monthPrefix)) {
                    Object.keys(userHistory[key]).forEach(tid => {
                        if (tid !== '_note') completedThisMonth.push(String(tid));
                    });
                }
            });
            
            allAssignedTasks.forEach(task => {
                let showTask = false;
                let todayTime = today.getTime();
                let todayMonth = today.getMonth() + 1;
                
                if (task.type === 'daily') {
                    showTask = true;
                }
                else if (task.type === 'weekly') {
                    if (task.dueDate) {
                        let dueDate = new Date(task.dueDate);
                        dueDate.setHours(0,0,0,0);
                        let todayDate = new Date(todayStr);
                        todayDate.setHours(0,0,0,0);
                        
                        let daysDiff = Math.floor((dueDate - todayDate) / (1000 * 60 * 60 * 24));
                        
                        if (daysDiff >= 0 && daysDiff <= 1) {
                            showTask = true;
                        }
                        
                        if (!showTask && dueDate < todayDate) {
                            let daysPassed = Math.floor((todayDate - dueDate) / (1000 * 60 * 60 * 24));
                            let dayInWeek = daysPassed % 7;
                            
                            if (dayInWeek >= 5 || dayInWeek <= 0) {
                                showTask = true;
                            }
                        }
                    }
                }
                else if (task.type === 'monthly') {
                    let range = taskDateRanges[`${currentUser.id}_${task.id}`];
                    if (range && range.start && range.end) {
                        let startDay = parseInt(range.start);
                        let endDay = parseInt(range.end);
                        let currentDay = today.getDate();
                        
                        if (currentDay >= startDay && currentDay <= endDay) {
                            // Only show if not already completed this month
                            if (!completedThisMonth.includes(String(task.id))) {
                                showTask = true;
                            }
                        }
                    }
                }
                else if (task.type === 'annual') {
                    if (task.dueDate) {
                        let taskMonth = new Date(task.dueDate).getMonth() + 1;
                        if (todayMonth === taskMonth) {
                            // Only show if not already completed this month
                            if (!completedThisMonth.includes(String(task.id))) {
                                showTask = true;
                            }
                        }
                    }
                }
                
                if (showTask) {
                    todayTasks.push(task);
                }
            });
            
            let todayKey = `${currentUser.id}_${todayStr}`;
            let todayData = userHistory[todayKey] || {};
            
            if (todayTasks.length === 0) {
                document.getElementById('userTasksList').innerHTML = '<div style="padding:40px;text-align:center;color:#64748b;">No tasks for today</div>';
                return;
            }
            
            let html = '<table><thead><tr><th>Done?</th><th>Task</th><th>Urdu</th><th>Type</th><th>Priority</th><th>Due</th><th>Status</th></tr></thead><tbody>';
            
            todayTasks.forEach(task => {
                let done = todayData[task.id] ? true : false;
                let priorityIcon = task.priority === 'high' ? '🔴 High' : task.priority === 'medium' ? '🟡 Medium' : '🟢 Low';
                let typeClass = task.type === 'daily' ? 'cat-daily' : task.type === 'weekly' ? 'cat-weekly' : task.type === 'monthly' ? 'cat-monthly' : 'cat-annual';
                let typeName = task.type === 'daily' ? 'Daily' : task.type === 'weekly' ? 'Weekly' : task.type === 'monthly' ? 'Monthly' : 'Annual';
                
                let dueDisplay = '-';
                if (task.type === 'weekly' && task.dueDate) {
                    dueDisplay = task.dueDate;
                } else if (task.type === 'annual' && task.dueDate) {
                    dueDisplay = new Date(task.dueDate).toLocaleString('default', { month: 'long' });
                } else if (task.type === 'monthly') {
                    let range = taskDateRanges[`${currentUser.id}_${task.id}`];
                    if (range && range.start && range.end) {
                        dueDisplay = `${range.start} to ${range.end}`;
                    }
                }
                
                html += `<tr>
                    <td><input type="checkbox" id="chk_${task.id}" ${done ? 'checked' : ''} onchange="updateTaskStatus('${task.id}')" style="width:20px;height:20px;"></td>
                    <td class="task-name-cell">${task.name}</td>
                    <td class="urdu-text">${task.description || '-'}</td>
                    <td><span class="category-badge ${typeClass}">${typeName}</span></td>
                    <td>${priorityIcon}</td>
                    <td>${dueDisplay}</td>
                    <td><span class="status-badge ${done ? 'status-completed' : 'status-pending'}">${done ? 'Completed' : 'Pending'}</span></td>
                </tr>`;
            });
            html += '</tbody></table>';
            document.getElementById('userTasksList').innerHTML = html;
        }

        async function updateTaskStatus(taskId) {
            let chk = document.getElementById(`chk_${taskId}`).checked;
            let today = new Date().toISOString().split('T')[0];
            let key = `${currentUser.id}_${today}`;
            
            if (!userHistory[key]) userHistory[key] = {};
            
            if (chk) {
                userHistory[key][taskId] = { time: new Date().toLocaleTimeString() };
            } else {
                delete userHistory[key][taskId];
            }
            
            if (Object.keys(userHistory[key]).length === 0) {
                delete userHistory[key];
            }
            
            await saveToServer('saveHistory', { 
                user_id: currentUser.id, 
                date: today, 
                tasks: userHistory[key] || {} 
            });
            
            localStorage.setItem('userHistory', JSON.stringify(userHistory));
            loadUserTasks();
        }

        async function saveUserTasks() {
            let today = new Date().toISOString().split('T')[0];
            let key = `${currentUser.id}_${today}`;
            
            if (!userHistory[key]) userHistory[key] = {};
            
            let myTaskIds = assignments[currentUser.id] || [];
            let completed = 0;
            
            myTaskIds.forEach(taskId => {
                let chk = document.getElementById(`chk_${taskId}`)?.checked || false;
                if (chk) {
                    userHistory[key][taskId] = { time: new Date().toLocaleTimeString() };
                    completed++;
                } else {
                    delete userHistory[key][taskId];
                }
            });
            
            if (Object.keys(userHistory[key]).length === 0) {
                delete userHistory[key];
            }
            
            await saveToServer('saveHistory', { 
                user_id: currentUser.id, 
                date: today, 
                tasks: userHistory[key] || {} 
            });
            
            localStorage.setItem('userHistory', JSON.stringify(userHistory));
            
            alert(`✅ ${completed} tasks saved!`);
            loadUserTasks();
        }

        // ========== ADMIN REPORTS ==========
        function loadAdminDailyReport() {
            let date = document.getElementById('adminDailyDate').value;
            let userId = document.getElementById('adminDailyUser').value;
            
            const userHeader = document.getElementById('adminDailyUserHeader');
            if (userId !== 'all') {
                const user = users.find(u => u.id == userId);
                if (user) {
                    userHeader.style.display = 'block';
                    userHeader.textContent = `User: ${user.name} (${user.designation})`;
                }
            } else {
                userHeader.style.display = 'none';
            }
            
            let allTasks = [];
            categories.forEach(cat => cat.subcategories.forEach(sub => sub.items.forEach(item => allTasks.push({...item, categoryName: cat.name, subcategoryName: sub.name}))));
            
            let filteredTasks = allTasks;
            
            if (userId !== 'all') { 
                let userTasks = assignments[userId] || []; 
                filteredTasks = allTasks.filter(task => userTasks.includes(task.id)); 
            }
            
            document.getElementById('adminDailyTitle').textContent = `Daily Report - ${date}`;
            
            let html = '';
            
            filteredTasks.forEach(task => {
                let isCompleted = false;
                let completedBy = [];
                let completedTime = '-';
                
                Object.keys(userHistory).forEach(key => {
                    if (key.includes(date) && userHistory[key][task.id]) {
                        isCompleted = true;
                        let uid = key.split('_')[0];
                        let user = users.find(u => u.id == uid);
                        if (user) completedBy.push(user.name);
                        completedTime = userHistory[key][task.id].time || '-';
                    }
                });
                
                let priorityIcon = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';
                let typeClass = task.type === 'daily' ? 'cat-daily' : task.type === 'weekly' ? 'cat-weekly' : task.type === 'monthly' ? 'cat-monthly' : 'cat-annual';
                let typeName = task.type === 'daily' ? 'Daily' : task.type === 'weekly' ? 'Weekly' : task.type === 'monthly' ? 'Monthly' : 'Annual';
                
                html += `<tr>
                    <td><span style="color:#7c3aed;background:#f3e8ff;padding:2px6px;border-radius:4px;">${task.id}</span></td>
                    <td class="task-name-cell">${priorityIcon} ${task.name}</td>
                    <td class="urdu-text">${task.description || '-'}</td>
                    <td>${task.categoryName}</td>
                    <td>${task.subcategoryName}</td>
                    <td><span class="category-badge ${typeClass}">${typeName}</span></td>
                    <td><span class="status-badge ${isCompleted ? 'status-completed' : 'status-pending'}">${isCompleted ? '✓' : '✗'}</span></td>
                    <td>${isCompleted ? completedBy.join(', ') : '-'}</td>
                    <td>${completedTime}</td>
                </tr>`;
            });
            
            document.getElementById('adminDailyTableBody').innerHTML = html;
        }

        function loadUserDailyReport() {
            if (!currentUser) return;
            
            const date = document.getElementById('userDailyDate').value;
            const userId = currentUser.id;
            
            let allTasks = [];
            categories.forEach(cat => cat.subcategories.forEach(sub => sub.items.forEach(item => allTasks.push({...item, categoryName: cat.name, subcategoryName: sub.name}))));
            
            let userTasks = assignments[userId] || [];
            let filteredTasks = allTasks.filter(task => userTasks.includes(task.id));
            
            document.getElementById('userDailyTitle').textContent = `Daily Report - ${date}`;
            
            let html = '';
            
            filteredTasks.forEach(task => {
                let isCompleted = false, completedTime = '-';
                
                Object.keys(userHistory).forEach(key => { 
                    if (key.includes(date) && userHistory[key][task.id]) { 
                        isCompleted = true; 
                        completedTime = userHistory[key][task.id].time || '-'; 
                    } 
                });
                
                let priorityIcon = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';
                let typeClass = task.type === 'daily' ? 'cat-daily' : task.type === 'weekly' ? 'cat-weekly' : task.type === 'monthly' ? 'cat-monthly' : 'cat-annual';
                let typeName = task.type === 'daily' ? 'Daily' : task.type === 'weekly' ? 'Weekly' : task.type === 'monthly' ? 'Monthly' : 'Annual';
                
                html += `<tr>
                    <td class="task-name-cell">${priorityIcon} ${task.name}</td>
                    <td class="urdu-text">${task.description || '-'}</td>
                    <td><span class="category-badge ${typeClass}">${typeName}</span></td>
                    <td><span class="status-badge ${isCompleted ? 'status-completed' : 'status-pending'}">${isCompleted ? '✓' : '✗'}</span></td>
                    <td>${completedTime}</td>
                </tr>`;
            });
            
            document.getElementById('userDailyTableBody').innerHTML = html;
        }

        function loadAdminMonthlyReport() {
            const month = document.getElementById('adminMonth').value;
            const year = document.getElementById('adminYear').value;
            const userId = document.getElementById('adminMonthlyUser').value;
            const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            document.getElementById('adminMonthlyTitle').textContent = `Monthly Report - ${monthNames[month-1]} ${year}`;
            
            const userHeader = document.getElementById('monthlyPrintUserName');
            if (userId !== 'all') {
                const user = users.find(u => u.id == userId);
                if (user) {
                    userHeader.style.display = 'block';
                    userHeader.textContent = `User: ${user.name} (${user.designation})`;
                }
            } else {
                userHeader.style.display = 'none';
            }
            
            let days = new Date(year, month, 0).getDate();
            
            let users_list = [];
            if (userId === 'all') {
                users_list = users.filter(u => u.type === 'user');
            } else {
                let selectedUser = users.find(u => u.id == userId);
                if (selectedUser) {
                    users_list = [selectedUser];
                }
            }
            
            let assignedTasks = new Set();
            users_list.forEach(u => {
                if (assignments[u.id]) {
                    assignments[u.id].forEach(taskId => assignedTasks.add(taskId));
                }
            });
            
            let sundays = [];
            for (let d=1; d<=days; d++) if (new Date(year, month-1, d).getDay() === 0) sundays.push(d);
            
            let headerHtml = '<tr><th>Task</th>';
            for (let d=1; d<=days; d++) {
                headerHtml += `<th ${sundays.includes(d) ? 'class="sunday-header"' : ''}>${d}</th>`;
            }
            headerHtml += '</tr>';
            document.getElementById('adminMonthlyHeader').innerHTML = headerHtml;
            
            let allTasks = [];
            categories.forEach(cat => {
                cat.subcategories.forEach(sub => {
                    sub.items.forEach(item => {
                        if (assignedTasks.has(item.id)) {
                            allTasks.push({
                                ...item,
                                categoryName: cat.name,
                                subcategoryName: sub.name
                            });
                        }
                    });
                });
            });
            
            let detailedHtml = '';
            let totalCompleted = 0;
            
            allTasks.forEach(task => {
                let taskRow = `<tr><td style="text-align:left;font-weight:bold;">${task.name}</td>`;
                let taskCompletedCount = 0;
                
                for (let d=1; d<=days; d++) {
                    const date = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                    
                    let completed = false;
                    users_list.forEach(u => { 
                        let key = `${u.id}_${date}`; 
                        if (userHistory[key] && userHistory[key][task.id]) {
                            completed = true;
                        }
                    });
                    
                    let isSunday = sundays.includes(d);
                    if (completed) { 
                        taskCompletedCount++; 
                        taskRow += `<td ${isSunday ? 'class="sunday-cell"' : ''} style="text-align:center;"><span class="tick-mark">✓</span></td>`; 
                    }
                    else { 
                        taskRow += `<td ${isSunday ? 'class="sunday-cell"' : ''} style="text-align:center;"><span class="cross-mark">✗</span></td>`; 
                    }
                }
                
                taskRow += '</tr>';
                detailedHtml += taskRow;
                totalCompleted += taskCompletedCount;
            });
            
            document.getElementById('adminMonthlyDetailedTable').innerHTML = detailedHtml;
            
            const totalTasksCount = allTasks.length * days;
            document.getElementById('monthTotal').textContent = totalTasksCount;
            document.getElementById('monthCompleted').textContent = totalCompleted;
            document.getElementById('monthPending').textContent = totalTasksCount - totalCompleted;
            document.getElementById('monthPercent').textContent = totalTasksCount > 0 ? Math.round((totalCompleted / totalTasksCount) * 100) + '%' : '0%';
        }

        function loadUserMonthlyReport() {
            if (!currentUser) return;
            
            const month = document.getElementById('userMonth').value;
            const year = document.getElementById('userYear').value;
            const userId = currentUser.id;
            const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            document.getElementById('userMonthlyTitle').textContent = `Monthly Report - ${monthNames[month-1]} ${year}`;
            
            let days = new Date(year, month, 0).getDate();
            let userTasks = assignments[userId] || [];
            
            let sundays = [];
            for (let d=1; d<=days; d++) if (new Date(year, month-1, d).getDay() === 0) sundays.push(d);
            
            let allTasks = [];
            categories.forEach(cat => cat.subcategories.forEach(sub => sub.items.forEach(item => { 
                if (userTasks.includes(item.id)) allTasks.push({...item, categoryName: cat.name, subcategoryName: sub.name}); 
            })));
            
            let headerHtml = '<tr><th>Task</th>';
            for (let d=1; d<=days; d++) {
                headerHtml += `<th ${sundays.includes(d) ? 'class="sunday-header"' : ''}>${d}</th>`;
            }
            headerHtml += '</tr>';
            document.getElementById('userMonthlyHeader').innerHTML = headerHtml;
            
            let detailedHtml = '';
            
            allTasks.forEach(task => {
                let taskRow = `<tr><td style="text-align:left;font-weight:bold;">${task.name}</td>`;
                
                for (let d=1; d<=days; d++) {
                    const date = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                    let key = `${userId}_${date}`;
                    let isSunday = sundays.includes(d);
                    
                    if (userHistory[key] && userHistory[key][task.id]) {
                        taskRow += `<td ${isSunday ? 'class="sunday-cell"' : ''} style="text-align:center;"><span class="tick-mark">✓</span></td>`;
                    } else {
                        taskRow += `<td ${isSunday ? 'class="sunday-cell"' : ''} style="text-align:center;"><span class="cross-mark">✗</span></td>`;
                    }
                }
                
                taskRow += '</tr>';
                detailedHtml += taskRow;
            });
            
            document.getElementById('userMonthlyDetailedTable').innerHTML = detailedHtml;
        }

        function loadAdminYearlyReport() {
            const year = document.getElementById('yearlyYear').value;
            const userId = document.getElementById('yearlyUser').value;
            const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            
            const userHeader = document.getElementById('yearlyPrintUserName');
            if (userId !== 'all') {
                const user = users.find(u => u.id == userId);
                if (user) {
                    userHeader.style.display = 'block';
                    userHeader.textContent = `User: ${user.name} (${user.designation})`;
                }
            } else {
                userHeader.style.display = 'none';
            }
            
            let users_list = userId === 'all' ? users.filter(u => u.type === 'user') : [users.find(u => u.id == userId)];
            users_list = users_list.filter(w => w);
            
            let allTasks = [];
            categories.forEach(cat => cat.subcategories.forEach(sub => sub.items.forEach(item => allTasks.push(item.id))));
            let totalTasksCount = allTasks.length;
            
            let html = '';
            let yearlyTotal = 0, yearlyCompleted = 0;
            
            for (let month=1; month<=12; month++) {
                let days = new Date(year, month, 0).getDate();
                let monthTotal = totalTasksCount * days;
                let monthCompleted = 0;
                
                for (let d=1; d<=days; d++) {
                    const date = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                    users_list.forEach(u => { 
                        let key = `${u.id}_${date}`; 
                        if (userHistory[key]) monthCompleted += Object.keys(userHistory[key]).filter(k => k !== '_note').length; 
                    });
                }
                
                let monthPending = monthTotal - monthCompleted;
                let percentage = monthTotal > 0 ? Math.round((monthCompleted / monthTotal) * 100) : 0;
                
                html += `<tr><td>${monthNames[month-1]}</td><td>${monthTotal}</td><td class="${monthCompleted > 0 ? 'green' : ''}">${monthCompleted}</td><td class="${monthPending > 0 ? 'red' : ''}">${monthPending}</td><td>${percentage}%</td></tr>`;
                yearlyTotal += monthTotal; yearlyCompleted += monthCompleted;
            }
            
            html += `<tr style="font-weight:bold;background:#2E5C8A;color:white;"><td>TOTAL</td><td>${yearlyTotal}</td><td class="green">${yearlyCompleted}</td><td class="red">${yearlyTotal - yearlyCompleted}</td><td>${yearlyTotal > 0 ? Math.round((yearlyCompleted / yearlyTotal) * 100) : 0}%</td></tr>`;
            document.getElementById('adminYearlyTable').innerHTML = html;
        }

        // ========== DAILY NOTE ==========
        function showDailyNoteModal() {
            if (!currentUser) return;
            let todayKey = `${currentUser.id}_${new Date().toISOString().split('T')[0]}`;
            let note = userHistory[todayKey]?._note || '';
            document.getElementById('dailyNoteText').value = note;
            document.getElementById('dailyNoteModal').style.display = 'block';
        }

        async function saveDailyNote() {
            const note = document.getElementById('dailyNoteText').value.trim();
            let todayKey = `${currentUser.id}_${new Date().toISOString().split('T')[0]}`;
            if (note) { if (!userHistory[todayKey]) userHistory[todayKey] = {}; userHistory[todayKey]._note = note; }
            else { if (userHistory[todayKey]) delete userHistory[todayKey]._note; }
            await saveToServer('saveHistory', { user_id: currentUser.id, date: new Date().toISOString().split('T')[0], tasks: userHistory[todayKey] || {} });
            localStorage.setItem('userHistory', JSON.stringify(userHistory));
            closeModal('dailyNoteModal');
            if (currentUser.type === 'admin') loadAdminDashboard(); else loadUserTasks();
        }

        function clearDailyNote() { document.getElementById('dailyNoteText').value = ''; saveDailyNote(); }

        // ========== FORGOT PASSWORD ==========
        function showForgotPasswordModal() {
            document.getElementById('forgotPasswordModal').style.display = 'block';
            document.getElementById('forgotStep1').style.display = 'block';
            document.getElementById('forgotStep2').style.display = 'none';
            document.getElementById('forgotStep3').style.display = 'none';
            document.getElementById('forgotEmail').value = '';
        }

        async function sendOTP() {
            const email = document.getElementById('forgotEmail').value;
            if (!email) { alert('Enter email'); return; }
            
            const result = await saveToServer('sendOTP', { email: email });
            
            if (result.success) {
                document.getElementById('forgotStep1').style.display = 'none';
                document.getElementById('forgotStep2').style.display = 'block';
                document.getElementById('otpEmail').textContent = email;
                startOTPTimer(600);
            } else {
                alert(result.message || 'Failed to send OTP');
            }
        }

        function startOTPTimer(seconds) {
            const timerDisplay = document.getElementById('timer');
            let timeLeft = seconds;
            if (otpTimer) clearInterval(otpTimer);
            otpTimer = setInterval(() => { timerDisplay.textContent = `${String(Math.floor(timeLeft/60)).padStart(2,'0')}:${String(timeLeft%60).padStart(2,'0')}`; if (timeLeft <= 0) clearInterval(otpTimer); timeLeft--; }, 1000);
        }

        function moveToNext(input, nextId) { if (input.value.length === 1) { const nextInput = document.getElementById(`otp${nextId + 1}`); if (nextInput) nextInput.focus(); } }

        async function verifyOTP() {
            const email = document.getElementById('otpEmail').textContent;
            const otp = Array.from({length:6}, (_,i) => document.getElementById(`otp${i+1}`).value).join('');
            
            const result = await saveToServer('verifyOTP', { email: email, otp: otp });
            
            if (result.success) {
                document.getElementById('forgotStep2').style.display = 'none';
                document.getElementById('forgotStep3').style.display = 'block';
                if (otpTimer) clearInterval(otpTimer);
            } else {
                alert('Invalid or expired OTP');
            }
        }

        function resendOTP() { sendOTP(); }

        async function resetPassword() {
            const email = document.getElementById('otpEmail').textContent;
            const newPass = document.getElementById('newPassword').value;
            const confirmPass = document.getElementById('confirmPassword').value;
            if (!newPass || !confirmPass) { alert('Enter password'); return; }
            if (newPass !== confirmPass) { alert('Passwords do not match'); return; }
            let user = users.find(u => u.email === email);
            if (user) {
                user.password = newPass;
                await saveToServer('saveUser', user);
                localStorage.setItem('users', JSON.stringify(users));
                alert('Password reset!');
                closeModal('forgotPasswordModal');
            } else alert('Email not found');
        }

        // ========== BACKUP & RESTORE ==========
        function createBackup() {
            const backup = { 
                categories: categories, 
                users: users, 
                userHistory: userHistory, 
                assignments: assignments,
                taskDateRanges: taskDateRanges,
                companySettings: companySettings,
                companies: companies,
                backup_date: new Date().toISOString() 
            };
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `seastone_backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            document.getElementById('lastBackupDate').textContent = new Date().toLocaleString();
            localStorage.setItem('seastone_lastBackup', new Date().toISOString());
            showBackupMessage('Backup created!', 'success');
        }

        async function restoreBackup(file) {
            const reader = new FileReader();
            reader.onload = async function(e) {
                try {
                    const backup = JSON.parse(e.target.result);
                    
                    if (backup.users) {
                        backup.users = backup.users.map(user => {
                            if (!user.password) {
                                const defaultPasswords = {
                                    'admin': 'admin123',
                                    'faisal': 'faisal123',
                                    'zaib': 'zaib123',
                                    'hamza': 'hamza123',
                                    'irfan': 'irfan123',
                                    'ibrar': 'ibrar123',
                                    'saqib': 'saqib123',
                                    'suhail': 'suhail123'
                                };
                                user.password = defaultPasswords[user.username] || user.username + '123';
                            }
                            return user;
                        });
                    }
                    
                    if (backup.categories) {
                        categories = backup.categories;
                        await saveToServer('restoreCategories', { categories: categories });
                    }
                    if (backup.users) {
                        users = backup.users;
                        await saveToServer('restoreUsers', { users: users });
                    }
                    if (backup.userHistory) {
                        userHistory = backup.userHistory;
                        await saveToServer('restoreHistory', { history: userHistory });
                    }
                    if (backup.assignments) {
                        assignments = backup.assignments;
                        await saveToServer('restoreAssignments', { 
                            assignments: assignments,
                            taskDateRanges: backup.taskDateRanges || {}
                        });
                    }
                    if (backup.taskDateRanges) {
                        taskDateRanges = backup.taskDateRanges;
                        await saveToServer('restoreDateRanges', { ranges: taskDateRanges });
                    }
                    
                    // Company settings restore karo
                    if (backup.companySettings) {
                        companySettings = backup.companySettings;
                        await saveToServer('saveCompanySettings', companySettings);
                        localStorage.setItem('companySettings', JSON.stringify(companySettings));
                    }
                    if (backup.companies) {
                        companies = backup.companies;
                        localStorage.setItem('companies', JSON.stringify(companies));
                    }
                    
                    localStorage.setItem('taskCategories', JSON.stringify(categories));
                    localStorage.setItem('users', JSON.stringify(users));
                    localStorage.setItem('userHistory', JSON.stringify(userHistory));
                    localStorage.setItem('assignments', JSON.stringify(assignments));
                    localStorage.setItem('taskDateRanges', JSON.stringify(taskDateRanges));
                    
                    updateCompanyDisplay();
                    populateDropdowns();
                    
                    showBackupMessage('Restored successfully!', 'success');
                    setTimeout(() => location.reload(), 2000);
                } catch (error) { 
                    showBackupMessage('Error: ' + error.message, 'error'); 
                }
            };
            reader.readAsText(file);
        }

        function showBackupMessage(msg, type) {
            const div = document.getElementById('backupMessage');
            div.style.display = 'block';
            div.textContent = msg;
            div.style.background = type === 'success' ? '#d4edda' : '#f8d7da';
            div.style.color = type === 'success' ? '#155724' : '#721c24';
            setTimeout(() => div.style.display = 'none', 3000);
        }

        // ========== PRINT ==========
        function printReport(elementId) {
            const content = document.getElementById(elementId).innerHTML;
            if (!content) {
                alert('Report content not found!');
                return;
            }
            const printWin = window.open('', '_blank');
            
            const logoHtml = companySettings.logo ? 
                `<img src="${companySettings.logo}" class="print-logo">` : '';
            
            // Company details alag alag lines mein
            const companyInfoHtml = `
                <div class="print-company-info">
                    <div class="print-company-name">${companySettings.name}</div>
                    <div class="print-company-address">${companySettings.address || ''}</div>
                    <div class="print-company-email">${companySettings.email || ''}</div>
                    <div class="print-company-phone">${companySettings.phone || ''}</div>
                </div>
            `;
            
            printWin.document.write(`
                <html>
                <head>
                    <title>${companySettings.name} Report</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            padding: 0; 
                            margin: 0;
                        }
                        .print-header {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            margin: 0 0 15px 0;
                            padding: 0 0 10px 0;
                            border-bottom: 2px solid #2E5C8A;
                        }
                        .print-logo { 
                            max-width: 80px; 
                            max-height: 80px; 
                            object-fit: contain; 
                        }
                        .print-company-info { 
                            text-align: left; 
                        }
                        .print-company-name { 
                            font-size: 20px; 
                            font-weight: bold; 
                            color: #2E5C8A; 
                            margin: 0 0 3px 0; 
                        }
                        .print-company-address { 
                            color: #666; 
                            margin: 2px 0; 
                            font-size: 11px;
                        }
                        .print-company-email { 
                            color: #666; 
                            margin: 2px 0; 
                            font-size: 11px;
                        }
                        .print-company-phone { 
                            color: #666; 
                            margin: 2px 0; 
                            font-size: 11px;
                        }
                        .print-footer { 
                            margin-top: 10px; 
                            text-align: center; 
                            color: #666; 
                            font-size: 10px; 
                            border-top: 1px solid #ddd; 
                            padding-top: 5px; 
                        }
                        table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin-bottom: 20px; 
                        }
                        th { 
                            background: #2E5C8A; 
                            color: white; 
                            padding: 8px; 
                            font-size: 12px; 
                        }
                        th.sunday-header { 
                            background: #f47722 !important; 
                        }
                        td { 
                            border: 1px solid #ddd; 
                            padding: 5px; 
                            font-size: 11px; 
                        }
                        td.sunday-cell { 
                            background-color: #fff3cd !important; 
                        }
                        td.task-name-cell { 
                            text-align: left !important; 
                        }
                        .tick-mark { 
                            color: green; 
                            font-size: 14px; 
                        }
                        .cross-mark { 
                            color: red; 
                            font-size: 14px; 
                        }
                        .print-user-header { 
                            text-align: center; 
                            margin: 10px 0 15px; 
                            padding: 8px; 
                            background: #f0f0f0; 
                            border-radius: 5px; 
                            font-size: 16px; 
                            font-weight: bold; 
                            color: #2E5C8A; 
                            border: 1px solid #2E5C8A; 
                        }
                        .green { 
                            color: green; 
                            font-weight: bold; 
                        }
                        .red { 
                            color: red; 
                            font-weight: bold; 
                        }
                        .signature-section { 
                            margin-top: 20px; 
                        }
                        .signature-box { 
                            width: 200px; 
                        }
                        .signature-line { 
                            border-bottom: 1px solid #000; 
                            margin-top: 3px; 
                            margin-bottom: 3px; 
                            width: 100%; 
                        }
                        .urdu-text { 
                            font-family: 'Jameel Noori Nastaleeq', 'Urdu Typesetting', serif; 
                            font-size: 14px; 
                            font-weight: bold; 
                            line-height: 1.5; 
                        }
                    </style>
                </head>
                <body>
                    <div class="print-header">
                        ${logoHtml}
                        ${companyInfoHtml}
                    </div>
                    ${content}
                    <div class="signature-section">
                        <div class="signature-box">
                            <p><strong>Administration</strong></p>
                            <div class="signature-line"></div>
                            <p>Authorized Signature</p>
                        </div>
                    </div>
                    <div class="print-footer">${companySettings.footer || ''}</div>
                </body>
                </html>
            `);
            printWin.document.close();
            printWin.print();
        }

        function exportToPDF(elementId, filename) {
            html2canvas(document.getElementById(elementId)).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jspdf.jsPDF('l', 'mm', 'a4');
                pdf.addImage(imgData, 'PNG', 10, 10, 280, (canvas.height * 280) / canvas.width);
                pdf.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
            });
        }

        function exportToExcel(tableId, filename) {
            const table = document.getElementById(tableId).closest('table');
            const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
            XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
        }

        function closeModal(id) { document.getElementById(id).style.display = 'none'; }

        window.onclick = e => { if (e.target.classList.contains('modal')) e.target.style.display = 'none'; };
