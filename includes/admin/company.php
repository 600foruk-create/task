            <!-- Admin Company Settings -->
            <div id="adminCompany" class="tab-content">
                <div class="action-bar no-print" style="margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
                    <button onclick="showCompanyListModal()" class="btn-success" style="background: #28a745;">
                        <i class="fas fa-list"></i> Manage Companies
                    </button>
                    <button onclick="showCompanySettingsModal()" class="btn-info" style="background: #17a2b8;">
                        <i class="fas fa-edit"></i> Edit Current Company
                    </button>
                </div>

                <!-- Current Company Display -->
                <div class="company-display" style="background: linear-gradient(135deg, #2E5C8A, #1a3a5a); color: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                    <div style="display: flex; align-items: center; gap: 25px; flex-wrap: wrap;">
                        <img id="companyLogoDisplay" class="company-logo-large" src="" alt="Logo" style="width: 100px; height: 100px; object-fit: contain; background: white; border-radius: 12px; padding: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: none;">
                        <div>
                            <h2 id="companyNameDisplay" style="font-size: 32px; font-weight: bold; margin: 0; color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">Seastone Pipe Industry</h2>
                            <p id="companyAddressDisplay" style="color: rgba(255,255,255,0.9); margin: 5px 0 0; font-size: 16px;"></p>
                            <p id="companyPhoneDisplay" style="color: rgba(255,255,255,0.9); margin: 5px 0 0; font-size: 16px;"></p>
                            <p id="companyEmailDisplay" style="color: rgba(255,255,255,0.9); margin: 5px 0 0; font-size: 16px;"></p>
                        </div>
                    </div>
                </div>

                <!-- Footer Display -->
                <div id="companyFooterDisplay" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center; border: 1px solid #dee2e6; color: #495057;"></div>
            </div>

