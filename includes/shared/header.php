            <div class="header no-print">
                <div class="header-left">
                    <img id="headerLogo" class="company-logo" src="" alt="Logo" style="display:none;">
                    <div class="company-info">
                        <h1 class="company-name" id="headerCompanyName">SEASTONE</h1>
                        <p class="company-details" id="headerCompanyDetails"></p>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
                    <span>Welcome, <span id="userName">Administrator</span></span>
                    <span class="sync-status online" id="syncStatus" onclick="manualRefresh()" style="cursor: pointer;" title="Manual Refresh">
                        <i class="fas fa-sync-alt fa-spin" style="display: none;" id="syncSpinner"></i>
                        <i class="fas fa-wifi" id="syncIcon"></i>
                        <span id="syncText">Connected</span>
                    </span>
                    <button class="logout-btn" onclick="logout()">Logout</button>
                </div>
            </div>
