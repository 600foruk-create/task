            <!-- User Tasks -->
            <div id="userTasks" class="tab-content">
                <h2>Today's Tasks - <span id="todayDate"></span></h2>
                <div class="daily-note-section no-print">
                    <button onclick="showDailyNoteModal()" class="btn-info" style="margin-right:10px;" id="dailyNoteButton"><i class="fas fa-pen"></i> <span id="noteButtonText">Add Note for Today</span></button>
                </div>
                <div id="dailyNoteDisplay" class="daily-note-display" style="display:none;"></div>
                <div id="userTasksList" class="table-container"></div>
                <button onclick="saveUserTasks()" class="btn-success" style="margin-top:20px;" id="saveTasksButton">Save Completed Tasks</button>
                <div id="saveMessage" style="color:green;display:none;margin-top:10px;">Tasks saved successfully!</div>
            </div>
        </div>
    </div>

    <!-- User Modal -->
    <div id="userModal" class="modal">
        <div class="modal-content">
            <h3 id="userModalTitle">Add User</h3>
            <input type="text" id="userFullName" placeholder="Full Name">
            <input type="text" id="userUsername" placeholder="Username">
            <input type="email" id="userEmail" placeholder="Email Address">
            <div class="password-field" style="margin-bottom: 10px;">
                <input type="password" id="userPassword" placeholder="Password">
                <i class="fas fa-eye password-toggle" onclick="toggleFieldPassword('userPassword', this)"></i>
            </div>
            <input type="text" id="userDesignation" placeholder="Designation" value="operator">
            <select id="userType"><option value="user">User</option><option value="admin">Admin</option></select>
            <div class="flex"><button onclick="saveUser()" class="btn-success"><i class="fas fa-save"></i> Save</button><button onclick="closeModal('userModal')" class="close-btn"><i class="fas fa-times"></i> Cancel</button></div>
        </div>
    </div>

    <!-- Category Modal -->
    <div id="categoryModal" class="modal">
        <div class="modal-content">
            <h3 id="categoryModalTitle">Add Category</h3>
            <input type="text" id="categoryId" placeholder="Category ID" style="background:#f1f5f9;">
            <input type="text" id="categoryName" placeholder="Category Name">
            <textarea id="categoryDescription" placeholder="Description" rows="3"></textarea>
            <div class="flex"><button onclick="saveCategory()" class="btn-success"><i class="fas fa-save"></i> Save</button><button onclick="closeModal('categoryModal')" class="close-btn"><i class="fas fa-times"></i> Cancel</button></div>
        </div>
    </div>

    <!-- Subcategory Modal -->
    <div id="subcategoryModal" class="modal">
        <div class="modal-content">
            <h3 id="subcategoryModalTitle">Add Subcategory</h3>
            <p style="color:#64748b;margin-bottom:10px;">Category: <span id="parentCategoryName"></span> (<span id="parentCategoryId"></span>)</p>
            <input type="text" id="subcategoryName" placeholder="Subcategory Name">
            <textarea id="subcategoryDescription" placeholder="Description" rows="3"></textarea>
            <div class="flex"><button onclick="saveSubcategory()" class="btn-success"><i class="fas fa-save"></i> Save</button><button onclick="closeModal('subcategoryModal')" class="close-btn"><i class="fas fa-times"></i> Cancel</button></div>
        </div>
    </div>

    <!-- Task Modal -->
    <div id="itemModal" class="modal">
        <div class="modal-content">
            <h3 id="itemModalTitle">Add Task</h3>
            <p style="color:#64748b;margin-bottom:10px;">Category: <span id="itemParentCategoryName"></span> → Subcategory: <span id="itemParentSubcategoryName"></span></p>
            <div style="display:flex;gap:10px;align-items:center;margin:10px 0;">
                <input type="text" id="taskNameEn" placeholder="Task Name (English)" style="flex:2;" value="">
                <button type="button" class="translate-btn" onclick="translateWithGoogle()" style="width:auto;padding:12px 15px;"><i class="fas fa-language"></i> Translate</button>
            </div>
            <input type="text" id="taskNameUr" placeholder="Task Name (Urdu)" class="urdu-input" value="">
            <select id="taskType" required>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
            </select>
            <textarea id="itemDescription" placeholder="Description" rows="2"></textarea>
            <div style="margin-top:10px;"><input type="text" id="itemEstimatedTime" placeholder="Estimated Time"></div>
            <select id="itemPriority"><option value="high">High Priority</option><option value="medium" selected>Medium Priority</option><option value="low">Low Priority</option></select>
            <label style="display:flex;align-items:center;gap:10px;margin:10px 0;"><input type="checkbox" id="itemInactive"> Inactive Task</label>
            <div id="dueDateContainer" style="display:none;margin-top:10px;"><input type="date" id="taskDueDate" placeholder="Due Date"></div>
            <div class="flex"><button onclick="saveItem()" class="btn-success"><i class="fas fa-save"></i> Save</button><button onclick="closeModal('itemModal')" class="close-btn"><i class="fas fa-times"></i> Cancel</button></div>
        </div>
