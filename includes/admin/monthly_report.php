            <!-- Admin Monthly Report -->
            <div id="adminMonthlyReport" class="tab-content">
                <div class="report-controls no-print">
                    <h2>Monthly Report</h2>
                    <div class="control-group">
                        <div class="control-item"><select id="adminMonth"><option value="1">January</option><option value="2">February</option><option value="3">March</option><option value="4">April</option><option value="5">May</option><option value="6">June</option><option value="7">July</option><option value="8">August</option><option value="9">September</option><option value="10">October</option><option value="11">November</option><option value="12">December</option></select></div>
                        <div class="control-item"><input type="number" id="adminYear" value="2026" min="2020" max="2030" style="width:100px;"></div>
                        <div class="control-item"><select id="adminMonthlyUser"><option value="all">All Users</option></select></div>
                        <div class="action-buttons">
                            <button onclick="loadAdminMonthlyReport()" class="btn-primary"><i class="fas fa-search"></i> View</button>
                            <button onclick="printReport('adminMonthlyPrint')" class="btn-success"><i class="fas fa-print"></i> Print</button>
                            <button onclick="exportToPDF('adminMonthlyPrint', 'Monthly_Report')" class="btn-info"><i class="fas fa-file-pdf"></i> PDF</button>
                            <button onclick="exportToExcel('adminMonthlyTable', 'Monthly_Report')" class="btn-info"><i class="fas fa-file-excel"></i> Excel</button>
                        </div>
                    </div>
                </div>
                <div class="stats no-print">
                    <div class="stat-card"><div class="number" id="monthTotal">0</div><div>Total</div></div>
                    <div class="stat-card"><div class="number" id="monthCompleted">0</div><div>Completed</div></div>
                    <div class="stat-card"><div class="number" id="monthPending">0</div><div>Pending</div></div>
                    <div class="stat-card"><div class="number" id="monthPercent">0%</div><div>Progress</div></div>
                </div>
                <div id="adminMonthlyPrint">
                    <h3 style="text-align: center;" id="adminMonthlyTitle">Monthly Report</h3>
                    <div id="monthlyPrintUserName" class="print-user-header" style="display:none;"></div>
                    <div class="table-container"><table id="adminMonthlyTable"><thead id="adminMonthlyHeader"></thead><tbody id="adminMonthlyDetailedTable"></tbody></table></div>
                </div>
            </div>

