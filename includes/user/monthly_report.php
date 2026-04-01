            <!-- User Monthly Report -->
            <div id="userMonthlyReport" class="tab-content">
                <div class="report-controls no-print">
                    <h2>Monthly Report</h2>
                    <div class="control-group">
                        <div class="control-item"><select id="userMonth"><option value="1">January</option><option value="2">February</option><option value="3">March</option><option value="4">April</option><option value="5">May</option><option value="6">June</option><option value="7">July</option><option value="8">August</option><option value="9">September</option><option value="10">October</option><option value="11">November</option><option value="12">December</option></select></div>
                        <div class="control-item"><input type="number" id="userYear" value="2026" min="2020" max="2030" style="width:100px;"></div>
                        <div class="action-buttons">
                            <button onclick="loadUserMonthlyReport()" class="btn-primary"><i class="fas fa-search"></i> View</button>
                            <button onclick="printReport('userMonthlyPrint')" class="btn-success"><i class="fas fa-print"></i> Print</button>
                            <button onclick="exportToPDF('userMonthlyPrint', 'Monthly_Report')" class="btn-info"><i class="fas fa-file-pdf"></i> PDF</button>
                            <button onclick="exportToExcel('userMonthlyTable', 'Monthly_Report')" class="btn-info"><i class="fas fa-file-excel"></i> Excel</button>
                        </div>
                    </div>
                </div>
                <div id="userMonthlyPrint">
                    <h3 style="text-align: center;" id="userMonthlyTitle">Monthly Report</h3>
                    <div class="table-container"><table id="userMonthlyTable"><thead id="userMonthlyHeader"></thead><tbody id="userMonthlyDetailedTable"></tbody></table></div>
                </div>
            </div>

