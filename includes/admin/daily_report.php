            <!-- Admin Daily Report -->
            <div id="adminDailyReport" class="tab-content">
                <div class="report-controls no-print">
                    <h2>Daily Task Report</h2>
                    <div class="control-group">
                        <div class="control-item"><input type="date" id="adminDailyDate" value=""></div>
                        <div class="control-item"><select id="adminDailyUser"><option value="all">All Users</option></select></div>
                        <div class="action-buttons">
                            <button onclick="loadAdminDailyReport()" class="btn-primary"><i class="fas fa-search"></i> View</button>
                            <button onclick="printReport('adminDailyPrint')" class="btn-success"><i class="fas fa-print"></i> Print</button>
                            <button onclick="exportToPDF('adminDailyPrint', 'Daily_Report')" class="btn-info"><i class="fas fa-file-pdf"></i> PDF</button>
                            <button onclick="exportToExcel('adminDailyTable', 'Daily_Report')" class="btn-info"><i class="fas fa-file-excel"></i> Excel</button>
                        </div>
                    </div>
                </div>
                <div id="adminDailyPrint">
                    <h3 style="text-align: center;" id="adminDailyTitle">Daily Report</h3>
                    <div id="adminDailyUserHeader" class="print-user-header" style="display:none;"></div>
                    <div class="table-container"><table id="adminDailyTable"><thead><tr><th>Task ID</th><th>Task Name</th><th>Urdu</th><th>Category</th><th>Subcategory</th><th>Type</th><th>Status</th><th>User</th><th>Time</th></tr></thead><tbody id="adminDailyTableBody"></tbody></table></div>
                </div>
            </div>

