        <!-- Company List Modal -->
        <div id="companyListModal" class="modal">
            <div class="modal-content" style="max-width: 800px; background: white; border-radius: 15px;">
                <h3 style="color: #2E5C8A; font-size: 24px; margin-bottom: 20px; text-align: center;">
                    <i class="fas fa-building" style="margin-right: 10px;"></i>Company List
                </h3>
                
                <!-- Add Company Form -->
                <div style="margin-bottom: 25px; padding: 20px; background: #f8f9fa; border-radius: 10px; border: 1px solid #e9ecef;">
                    <h4 style="color: #2E5C8A; margin-bottom: 15px; font-size: 18px;">Add New Company</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                        <input type="text" id="newCompanyName" placeholder="Company Name *" style="border: 2px solid #ced4da; border-radius: 6px; padding: 10px;">
                        <input type="text" id="newCompanyAddress" placeholder="Address" style="border: 2px solid #ced4da; border-radius: 6px; padding: 10px;">
                        <input type="text" id="newCompanyPhone" placeholder="Phone" style="border: 2px solid #ced4da; border-radius: 6px; padding: 10px;">
                        <input type="email" id="newCompanyEmail" placeholder="Email" style="border: 2px solid #ced4da; border-radius: 6px; padding: 10px;">
                    </div>
                    <button onclick="addCompany()" class="btn-success" style="margin-top: 15px; background: #28a745; padding: 10px 25px;">
                        <i class="fas fa-plus"></i> Add Company
                    </button>
                </div>

                <!-- Companies List -->
                <div class="table-container" style="max-height: 350px; overflow-y: auto; border: 1px solid #dee2e6; border-radius: 8px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background: #2E5C8A; color: white; position: sticky; top: 0;">
                            <tr>
                                <th style="padding: 12px; text-align: left;">Company Name</th>
                                <th style="padding: 12px; text-align: left;">Address</th>
                                <th style="padding: 12px; text-align: left;">Phone</th>
                                <th style="padding: 12px; text-align: left;">Email</th>
                                <th style="padding: 12px; text-align: center;">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="companyListTable" style="background: white;"></tbody>
                    </table>
                </div>

                <!-- Modal Footer -->
                <div class="flex" style="margin-top: 25px; justify-content: flex-end;">
                    <button onclick="closeModal('companyListModal')" class="close-btn" style="background: #6c757d; padding: 10px 25px;">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
            </div>
        </div>
