// Admin Dashboard with user management
(function () {
    const API_BASE = 'http://localhost:4000/api/v1';
    const DASHBOARD_SECTIONS = ['admin-users', 'admin-inventory', 'admin-orders'];

    function showDashboardSection(sectionId) {
        DASHBOARD_SECTIONS.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = id === sectionId ? 'block' : 'none';
            }
        });
    }

    function updateDashboardViewFromHash() {
        const hash = window.location.hash.replace('#', '');
        const target = hash === 'inventory' ? 'admin-inventory' : hash === 'orders' ? 'admin-orders' : 'admin-users';
        showDashboardSection(target);
    }

    function init() {
        User.initSession();

        // Check if user is logged in and is admin
        if (!User.isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        const currentUser = User.profile();
        if (currentUser.role !== 'admin') {
            alert('Access denied. Admin role required.');
            window.location.href = 'home.html';
            return;
        }

        window.addEventListener('hashchange', updateDashboardViewFromHash);
        loadUsers();
        Inventory.init();
        loadItems();
    }

    function loadUsers() {
        const token = User.getToken();
        
        $.ajax({
            url: `${API_BASE}/users`,
            type: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .done(function(response) {
            renderUsersTable(response.users);
        })
        .fail(function(xhr) {
            alert('Failed to load users: ' + (xhr.responseJSON?.message || 'Unknown error'));
            console.error(xhr);
        });
    }

    function renderUsersTable(users) {
        const html = `
            <section id="admin-users" class="card admin-section">
                <h2>User Management</h2>
                <table id="usersTable" class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td>${user.id}</td>
                                <td>${user.name}</td>
                                <td>${user.email}</td>
                                <td>
                                    <select class="role-select" data-user-id="${user.id}" data-current-role="${user.role}">
                                        <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                                    </select>
                                </td>
                                <td>
                                    <span class="status-badge ${user.active ? 'active' : 'inactive'}">
                                        ${user.active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    ${user.active ? `<button class="btn-deactivate" data-email="${user.email}">Deactivate</button>` : ''}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </section>
        `;

        $('#dashboardRoot').html(html);

        // Initialize DataTable if available
        if ($.fn.DataTable) {
            $('#usersTable').DataTable({
                "destroy": true,
                "paging": true,
                "pageLength": 10,
                "searching": true,
                "ordering": true
            });
        }

        attachEventHandlers();
        updateDashboardViewFromHash();
    }


    function loadItems() {
        const token = User.getToken();

        $.ajax({
            url: `${API_BASE}/items`,
            type: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .done(function(response) {
            // response may be { rows: [...] } from storefront or { parts } from admin; normalize
            const items = response.rows || response.items || [];
            renderItemsSection(items);
        })
        .fail(function(xhr) {
            console.error('Failed to load items:', xhr.responseJSON || xhr.responseText || xhr.statusText);
        });
    }

    function renderItemsSection(items) {
        const html = `
            <section id="admin-orders" class="card admin-section" style="display:none;">
                <h2>Orders Management</h2>
                <p class="muted">Review and manage storefront catalog items here. Actual order records can be added later.</p>
                <form id="itemForm" class="part-form">
                    <input type="hidden" id="itemId" value="">
                    <div class="form-row">
                        <label>Name<span class="required">*</span><input id="itemName" type="text" required></label>
                        <label>Description<input id="itemDescription" type="text"></label>
                        <label>Price<span class="required">*</span><input id="itemPrice" type="number" step="0.01" required></label>
                        <label>Quantity<input id="itemQuantity" type="number" min="0"></label>
                        <label>Image<input id="itemImage" type="file" accept="image/*"></label>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn">Save Item</button>
                        <button type="button" class="btn secondary" id="cancelItemBtn">Cancel</button>
                    </div>
                    <div id="existingItemImageInfo" class="muted"></div>
                </form>
                <table id="itemsTable" class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Image</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr>
                                <td>${item.item_id || item.id}</td>
                                <td>${item.description || item.name}</td>
                                <td>$${Number(item.sell_price || item.price || 0).toFixed(2)}</td>
                                <td>${item.quantity || 0}</td>
                                <td>${item.img_path ? `<img src="${item.img_path}" style="max-width:60px;max-height:40px;"/>` : ''}</td>
                                <td>
                                    <button class="btn-edit-item" data-item-id="${item.item_id || item.id}">Edit</button>
                                    <button class="btn-delete-item" data-item-id="${item.item_id || item.id}">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </section>
        `;

        $('#dashboardRoot').append(html);

        if ($.fn.DataTable) {
            $('#itemsTable').DataTable({
                destroy: true,
                paging: true,
                pageLength: 10,
                searching: true,
                ordering: true
            });
        }

        attachItemHandlers();
        updateDashboardViewFromHash();
    }

    function attachItemHandlers() {
        $('#itemForm').off('submit').on('submit', function(event) {
            event.preventDefault();
            const token = User.getToken();
            const itemId = $('#itemId').val();
            const formData = new FormData(this);
            const method = itemId ? 'PUT' : 'POST';
            const url = itemId ? `${API_BASE}/items/${itemId}` : `${API_BASE}/items`;

            $.ajax({
                url,
                type: method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                data: formData,
                processData: false,
                contentType: false
            })
            .done(function() {
                alert('Item saved successfully.');
                resetItemForm();
                loadItems();
            })
            .fail(function(xhr) {
                alert('Failed to save item: ' + (xhr.responseJSON?.message || 'Unknown error'));
            });
        });

        $('#cancelItemBtn').off('click').on('click', function(){
            $('#itemId').val(''); $('#itemName').val(''); $('#itemDescription').val(''); $('#itemPrice').val(''); $('#itemQuantity').val(''); $('#itemImage').val(''); $('#existingItemImageInfo').text('');
        });

        $('.btn-edit-item').off('click').on('click', function() {
            const itemId = $(this).data('item-id');
            // fetch item detail
            const token = User.getToken();
            $.ajax({ url: `${API_BASE}/items/${itemId}`, type: 'GET', headers: { 'Authorization': `Bearer ${token}` } })
            .done(function(item) {
                $('#itemId').val(item.id);
                $('#itemName').val(item.name);
                $('#itemDescription').val(item.description || '');
                $('#itemPrice').val(item.sell_price || item.price || 0);
                $('#itemQuantity').val(item.quantity || 0);
                $('#existingItemImageInfo').text(item.img_path ? `Current image: ${item.img_path}` : 'No image');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            })
            .fail(function() { alert('Unable to fetch item details.'); });
        });

        $('.btn-delete-item').off('click').on('click', function() {
            const itemId = $(this).data('item-id');
            if (!confirm('Delete this item?')) return;
            const token = User.getToken();
            $.ajax({ url: `${API_BASE}/items/${itemId}`, type: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
            .done(function() { alert('Item deleted.'); loadItems(); })
            .fail(function(xhr) { alert('Failed to delete item: ' + (xhr.responseJSON?.message || 'Unknown error')); });
        });
    }


    function attachEventHandlers() {
        // Handle role change
        $('.role-select').on('change', function() {
            const userId = $(this).data('user-id');
            const newRole = $(this).val();
            const currentRole = $(this).data('current-role');

            if (newRole === currentRole) return;

            updateUserRole(userId, newRole);
        });

        // Handle deactivate
        $('.btn-deactivate').on('click', function() {
            const email = $(this).data('email');
            if (confirm('Are you sure you want to deactivate this user?')) {
                deactivateUser(email);
            }
        });
    }

    function updateUserRole(userId, newRole) {
        const token = User.getToken();

        $.ajax({
            url: `${API_BASE}/users/${userId}/role`,
            type: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({ role: newRole })
        })
        .done(function(response) {
            alert('User role updated successfully.');
            loadUsers();
        })
        .fail(function(xhr) {
            alert('Failed to update role: ' + (xhr.responseJSON?.message || 'Unknown error'));
            loadUsers();
        });
    }

    function deactivateUser(email) {
        const token = User.getToken();

        $.ajax({
            url: `${API_BASE}/deactivate`,
            type: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({ email })
        })
        .done(function(response) {
            alert('User deactivated successfully.');
            loadUsers();
        })
        .fail(function(xhr) {
            alert('Failed to deactivate user: ' + (xhr.responseJSON?.message || 'Unknown error'));
        });
    }

    window.Dashboard = { init };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
