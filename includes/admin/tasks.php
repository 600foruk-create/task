            <!-- Admin Tasks Management -->
            <div id="adminTasks" class="tab-content">
                <div class="action-bar no-print">
                    <h2>Category & Task Management</h2>
                    <div class="button-group">
                        <button onclick="showAddCategoryModal()" class="btn-success"><i class="fas fa-folder-plus"></i> Add Category</button>
                        <button onclick="expandAll()" class="btn-info"><i class="fas fa-expand"></i> Expand All</button>
                        <button onclick="collapseAll()" class="btn-warning"><i class="fas fa-compress"></i> Collapse All</button>
                    </div>
                </div>
                <div id="hierarchyContainer" class="hierarchy-container"><div style="padding:40px;text-align:center;color:#64748b;">Loading categories...</div></div>
                <div id="taskDetailsPanel" class="item-details-panel" style="display:none;margin-top:20px;padding:20px;background:#f8fafc;border-radius:16px;"><div class="panel-title" style="font-size:18px;font-weight:700;color:#1e293b;margin-bottom:15px;">📋 Task Details</div><div id="taskDetailsContent" class="details-grid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:15px;"></div></div>
            </div>

