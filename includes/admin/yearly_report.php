            <!-- Admin Yearly Report -->
            <div id="adminYearlyReport" class="tab-content">
                <div class="report-controls no-print">
                    <h2>Yearly Report</h2>
                    <div class="control-group">
                        <div class="control-item"><select id="yearlyYear"><option value="2026">2026</option><option value="2025">2025</option></select></div>
                        <div class="control-item"><select id="yearlyUser"><option value="all">All Users</option></select></div>
                        <div class="action-buttons">
                            <button onclick="loadAdminYearlyReport()" class="btn-primary"><i class="fas fa-search"></i> View</button>
                            <button onclick="printReport('adminYearlyPrint')" class="btn-success"><i class="fas fa-print"></i> Print</button>
                            <button onclick="exportToPDF('adminYearlyPrint', 'Yearly_Report')" class="btn-info"><i class="fas fa-file-pdf"></i> PDF</button>
                            <button onclick="exportToExcel('adminYearlyTable', 'Yearly_Report')" class="btn-info"><i class="fas fa-file-excel"></i> Excel</button>
                        </div>
                    </div>
                </div>
                <div id="adminYearlyPrint">
                    <h3 style="text-align: center;">Yearly Performance</h3>
                    <div id="yearlyPrintUserName" class="print-user-header" style="display:none;"></div>
                    <div class="table-container"><table><thead><tr><th>Month</th><th>Total</th><th>Completed</th><th>Pending</th><th>Progress</th></tr></thead><tbody id="adminYearlyTable"></tbody></table></div>
                </div>
            </div>

