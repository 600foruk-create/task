            <!-- Admin Backup & Restore -->
            <div id="adminBackup" class="tab-content">
                <h2><i class="fas fa-database"></i> Backup & Restore</h2>
                <div class="backup-section">
                    <h3 style="color:white;">System Data Backup</h3>
                    <p style="margin-bottom:15px;">Create a complete backup of all users, tasks, assignments, and history</p>
                    <div class="backup-buttons">
                        <button onclick="createBackup()" class="backup-btn"><i class="fas fa-download"></i> Download Backup</button>
                        <button onclick="document.getElementById('restoreFile').click()" class="restore-btn"><i class="fas fa-upload"></i> Restore from Backup</button>
                        <input type="file" id="restoreFile" accept=".json" style="display:none;" onchange="restoreBackup(this.files[0])">
                    </div>
                    <div id="backupMessage" style="margin-top:15px;padding:10px;border-radius:5px;display:none;"></div>
                </div>
                <div style="margin-top:20px;padding:15px;background:#f8f9fa;border-radius:8px;"><h4>Backup Information</h4><p>• Last backup date: <span id="lastBackupDate">Never</span></p></div>
            </div>

