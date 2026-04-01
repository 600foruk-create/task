        <!-- Daily Note Modal -->
        <div id="dailyNoteModal" class="modal">
            <div class="modal-content reason-modal">
                <h3><i class="fas fa-pen"></i> Today's Note / Reason</h3>
                <p style="color: #666; margin-bottom: 10px;">If you are unavailable today or have any reason, please write below:</p>
                <textarea id="dailyNoteText" class="reason-textarea" placeholder="Enter reason for not completing tasks today..."></textarea>
                <div class="flex">
                    <button onclick="saveDailyNote()" class="btn-success"><i class="fas fa-save"></i> Save Note</button>
                    <button onclick="clearDailyNote()" class="btn-info"><i class="fas fa-trash"></i> Clear Note</button>
                    <button onclick="closeModal('dailyNoteModal')" class="close-btn"><i class="fas fa-times"></i> Cancel</button>
                </div>
            </div>
        </div>

