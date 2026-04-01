        <!-- Company Settings Modal -->
        <div id="companySettingsModal" class="modal">
            <div class="modal-content" style="max-width: 500px;">
                <h3 style="color: #2E5C8A; font-size: 24px; margin-bottom: 20px; text-align: center;">
                    <i class="fas fa-edit"></i> Edit Company Details
                </h3>
                
                <div class="company-settings">
                    <!-- Logo Preview -->
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div class="logo-preview" style="width: 150px; height: 150px; border: 3px dashed #2E5C8A; border-radius: 12px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #f8f9fa;">
                            <img id="companyLogoPreview" src="" alt="Company Logo" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                        </div>
                        <input type="file" id="companyLogoUpload" accept="image/*" style="display:none;" onchange="previewLogo(this)">
                        <button onclick="document.getElementById('companyLogoUpload').click()" class="btn-info" style="background: #17a2b8;">
                            <i class="fas fa-upload"></i> Upload Logo
                        </button>
                    </div>
                    
                    <!-- Company Details Form -->
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                        <input type="text" id="companyName" placeholder="Company Name" value="Seastone Pipe Industry" style="border: 2px solid #ced4da; border-radius: 6px; padding: 12px; margin-bottom: 10px;">
                        <input type="text" id="companyAddress" placeholder="Address" style="border: 2px solid #ced4da; border-radius: 6px; padding: 12px; margin-bottom: 10px;">
                        <input type="text" id="companyPhone" placeholder="Phone Number" style="border: 2px solid #ced4da; border-radius: 6px; padding: 12px; margin-bottom: 10px;">
                        <input type="text" id="companyEmail" placeholder="Email" style="border: 2px solid #ced4da; border-radius: 6px; padding: 12px; margin-bottom: 10px;">
                        <textarea id="companyFooter" placeholder="Footer Text" rows="3" style="border: 2px solid #ced4da; border-radius: 6px; padding: 12px; margin-bottom: 10px;"></textarea>
                    </div>
                    
                    <!-- Form Buttons -->
                    <div class="flex" style="margin-top: 25px; gap: 10px;">
                        <button onclick="saveCompanySettings()" class="btn-success" style="background: #28a745; flex: 1; padding: 12px;">
                            <i class="fas fa-save"></i> Save Changes
                        </button>
                        <button onclick="closeModal('companySettingsModal')" class="close-btn" style="background: #6c757d; flex: 1; padding: 12px;">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>

