            <!-- User Daily Report -->
            <div id="userDailyReport" class="tab-content">
                <div class="report-controls no-print">
                    <h2>Daily Report</h2>
                    <div class="control-group">
                        <div class="control-item"><input type="date" id="userDailyDate" value=""></div>
                        <div class="action-buttons">
                            <button onclick="loadUserDailyReport()" class="btn-primary"><i class="fas fa-search"></i> View</button>
                            <button onclick="printReport('userDailyPrint')" class="btn-success"><i class="fas fa-print"></i> Print</button>
                            <button onclick="exportToPDF('userDailyPrint', 'Daily_Report')" class="btn-info"><i class="fas fa-file-pdf"></i> PDF</button>
                            <button onclick="exportToExcel('userDailyTable', 'Daily_Report')" class="btn-info"><i class="fas fa-file-excel"></i> Excel</button>
                        </div>
                    </div>
                </div>
                <div id="userDailyPrint">
                    <h3 style="text-align: center;" id="userDailyTitle">Daily Report</h3>
                    <div class="table-container"><table id="userDailyTable"><thead><tr><th>Task ID</th><th>Task Name</th><th>Urdu</th><th>Category</th><th>Subcategory</th><th>Type</th><th>Status</th><th>Time</th></tr></thead><tbody id="userDailyTableBody"></tbody></table></div>
                </div>
            </div>

