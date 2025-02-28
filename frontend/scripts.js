// Base URL for API requests
// const baseUrl = 'http://127.0.0.1:5000';
const baseUrl = 'https://manishdashsharma.pythonanywhere.com';

// DOM Elements - Tabs
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// DOM Elements - Users
const usersTable = document.getElementById('users-table');
const usersTbody = document.getElementById('users-tbody');
const addUserBtn = document.getElementById('add-user-btn');
const userModal = document.getElementById('user-modal');
const userForm = document.getElementById('user-form');
const userModalTitle = document.getElementById('user-modal-title');
const cancelUserBtn = document.getElementById('cancel-user-btn');
const userCloseBtn = userModal.querySelector('.close');

// DOM Elements - Marks
const marksTable = document.getElementById('marks-table');
const marksTbody = document.getElementById('marks-tbody');
const addMarksBtn = document.getElementById('add-marks-btn');
const marksModal = document.getElementById('marks-modal');
const marksForm = document.getElementById('marks-form');
const marksModalTitle = document.getElementById('marks-modal-title');
const cancelMarksBtn = document.getElementById('cancel-marks-btn');
const marksCloseBtn = marksModal.querySelector('.close');
const userSelect = document.getElementById('user-select');
const studentFilter = document.getElementById('student-filter');
const examSearch = document.getElementById('exam-search');
const searchMarksBtn = document.getElementById('search-marks-btn');

// DOM Elements - Confirmation Dialog
const confirmModal = document.getElementById('confirm-modal');
const confirmMessage = document.getElementById('confirm-message');
const confirmBtn = document.getElementById('confirm-btn');
const cancelConfirmBtn = document.getElementById('cancel-confirm-btn');

// State variables
let allUsers = [];
let allMarks = [];
let currentDeleteData = null;
let isEditing = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadUsers();
    loadAllMarks();
    
    // Set current date for exam date input
    document.getElementById('exam-date').valueAsDate = new Date();
}

// Setup event listeners for UI interaction
function setupEventListeners() {
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(`${button.dataset.tab}-content`).classList.add('active');
        });
    });
    
    // User modal events
    addUserBtn.addEventListener('click', () => openUserModal());
    cancelUserBtn.addEventListener('click', () => closeUserModal());
    userCloseBtn.addEventListener('click', () => closeUserModal());
    userForm.addEventListener('submit', handleUserSubmit);
    
    // Marks modal events
    addMarksBtn.addEventListener('click', () => openMarksModal());
    cancelMarksBtn.addEventListener('click', () => closeMarksModal());
    marksCloseBtn.addEventListener('click', () => closeMarksModal());
    marksForm.addEventListener('submit', handleMarksSubmit);
    
    // Confirmation dialog events
    confirmBtn.addEventListener('click', handleConfirmation);
    cancelConfirmBtn.addEventListener('click', () => closeConfirmModal());
    
    // Search functionality
    searchMarksBtn.addEventListener('click', filterMarks);
    studentFilter.addEventListener('change', filterMarks);
    examSearch.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') filterMarks();
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === userModal) closeUserModal();
        if (e.target === marksModal) closeMarksModal();
        if (e.target === confirmModal) closeConfirmModal();
    });
}

// ---------- API Functions ----------

// Fetch all users from the API
async function loadUsers() {
    try {
        showLoading(usersTbody);
        const response = await fetch(`${baseUrl}/users`);
        if (!response.ok) throw new Error('Failed to fetch users');
        
        const data = await response.json();
        allUsers = data;
        renderUsers(data);
        populateUserSelects();
    } catch (error) {
        showToast('Error loading users: ' + error.message, 'error');
        console.error('Error loading users:', error);
        usersTbody.innerHTML = '<tr><td colspan="6" class="text-center">Error loading users</td></tr>';
    }
}

// Fetch all marks from the API
async function loadAllMarks() {
    try {
        showLoading(marksTbody);
        const response = await fetch(`${baseUrl}/all_marks`);
        if (!response.ok) throw new Error('Failed to fetch marks');
        
        const data = await response.json();
        allMarks = data;
        renderMarks(data);
    } catch (error) {
        showToast('Error loading marks: ' + error.message, 'error');
        console.error('Error loading marks:', error);
        marksTbody.innerHTML = '<tr><td colspan="9" class="text-center">Error loading marks</td></tr>';
    }
}

// Create a new user
async function createUser(userData) {
    try {
        const response = await fetch(`${baseUrl}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) throw new Error('Failed to create user');
        
        showToast('User created successfully', 'success');
        loadUsers();
        closeUserModal();
    } catch (error) {
        showToast('Error creating user: ' + error.message, 'error');
        console.error('Error creating user:', error);
    }
}

// Update an existing user
async function updateUser(id, userData) {
    try {
        const response = await fetch(`${baseUrl}/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) throw new Error('Failed to update user');
        
        showToast('User updated successfully', 'success');
        loadUsers();
        closeUserModal();
    } catch (error) {
        showToast('Error updating user: ' + error.message, 'error');
        console.error('Error updating user:', error);
    }
}

// Delete a user
async function deleteUser(id) {
    try {
        const response = await fetch(`${baseUrl}/users/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete user');
        
        showToast('User deleted successfully', 'success');
        loadUsers();
    } catch (error) {
        showToast('Error deleting user: ' + error.message, 'error');
        console.error('Error deleting user:', error);
    }
}

// Create new student marks
async function createMarks(marksData) {
    try {
        const response = await fetch(`${baseUrl}/marks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(marksData)
        });
        
        if (!response.ok) throw new Error('Failed to create marks');
        
        showToast('Marks added successfully', 'success');
        loadAllMarks();
        closeMarksModal();
    } catch (error) {
        showToast('Error adding marks: ' + error.message, 'error');
        console.error('Error adding marks:', error);
    }
}

// Update existing student marks
async function updateMarks(id, marksData) {
    try {
        const response = await fetch(`${baseUrl}/marks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(marksData)
        });
        
        if (!response.ok) throw new Error('Failed to update marks');
        
        showToast('Marks updated successfully', 'success');
        loadAllMarks();
        closeMarksModal();
    } catch (error) {
        showToast('Error updating marks: ' + error.message, 'error');
        console.error('Error updating marks:', error);
    }
}

// Delete student marks
async function deleteMarks(id) {
    try {
        const response = await fetch(`${baseUrl}/marks/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete marks');
        
        showToast('Marks deleted successfully', 'success');
        loadAllMarks();
    } catch (error) {
        showToast('Error deleting marks: ' + error.message, 'error');
        console.error('Error deleting marks:', error);
    }
}

// ---------- UI Functions ----------

// Render users in the table
function renderUsers(users) {
    if (users.length === 0) {
        usersTbody.innerHTML = '<tr><td colspan="6" class="text-center">No users found</td></tr>';
        return;
    }
    
    usersTbody.innerHTML = '';
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.student_class}</td>
            <td>
                <i class="fas fa-edit action-icon edit-icon" data-id="${user.id}" title="Edit"></i>
                <i class="fas fa-trash action-icon delete-icon" data-id="${user.id}" title="Delete"></i>
            </td>
        `;
        
        // Add event listeners to action icons
        row.querySelector('.edit-icon').addEventListener('click', () => editUser(user));
        row.querySelector('.delete-icon').addEventListener('click', () => confirmDelete('user', user.id, user.name));
        
        usersTbody.appendChild(row);
    });
}

// Render marks in the table
function renderMarks(marks) {
    if (marks.length === 0) {
        marksTbody.innerHTML = '<tr><td colspan="9" class="text-center">No marks found</td></tr>';
        return;
    }
    
    marksTbody.innerHTML = '';
    marks.forEach(mark => {
        // Find the user's name by ID
        const user = allUsers.find(u => u.id === mark.user_id) || { name: 'Unknown' };
        
        // Calculate percentage
        const totalObtained = Object.values(mark.subjects_marks).reduce((sum, val) => sum + val, 0);
        const totalMax = Object.values(mark.total_marks).reduce((sum, val) => sum + val, 0);
        const percentage = totalMax ? (totalObtained / totalMax * 100).toFixed(1) : 0;
        
        // Determine percentage class
        let percentageClass = '';
        if (percentage >= 80) percentageClass = 'excellent';
        else if (percentage >= 65) percentageClass = 'good';
        else if (percentage >= 40) percentageClass = 'average';
        else percentageClass = 'poor';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${mark.id}</td>
            <td>${user.name}</td>
            <td>${mark.exam_name}</td>
            <td>${mark.subjects_marks.Math}/${mark.total_marks.Math}</td>
            <td>${mark.subjects_marks.Science}/${mark.total_marks.Science}</td>
            <td>${mark.subjects_marks.English}/${mark.total_marks.English}</td>
            <td><span class="percentage ${percentageClass}">${percentage}%</span></td>
            <td>${formatDate(mark.date)}</td>
            <td>
                <i class="fas fa-edit action-icon edit-icon" data-id="${mark.id}" title="Edit"></i>
                <i class="fas fa-trash action-icon delete-icon" data-id="${mark.id}" title="Delete"></i>
            </td>
        `;
        
        // Add event listeners to action icons
        row.querySelector('.edit-icon').addEventListener('click', () => editMarks(mark));
        row.querySelector('.delete-icon').addEventListener('click', () => confirmDelete('marks', mark.id, `${user.name}'s ${mark.exam_name}`));
        
        marksTbody.appendChild(row);
    });
}

// Populate user dropdowns
function populateUserSelects() {
    // Clear existing options except the placeholder
    while (userSelect.options.length > 1) {
        userSelect.remove(1);
    }
    
    while (studentFilter.options.length > 1) {
        studentFilter.remove(1);
    }
    
    // Add user options
    allUsers.forEach(user => {
        // Add to marks form select
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        userSelect.appendChild(option);
        
        // Add to filter select
        const filterOption = document.createElement('option');
        filterOption.value = user.id;
        filterOption.textContent = user.name;
        studentFilter.appendChild(filterOption);
    });
}

// Filter marks based on selections
function filterMarks() {
    const studentId = studentFilter.value ? parseInt(studentFilter.value) : null;
    const examText = examSearch.value.toLowerCase().trim();
    
    let filteredMarks = [...allMarks];
    
    // Filter by student
    if (studentId) {
        filteredMarks = filteredMarks.filter(mark => mark.user_id === studentId);
    }
    
    // Filter by exam name
    if (examText) {
        filteredMarks = filteredMarks.filter(mark => 
            mark.exam_name.toLowerCase().includes(examText)
        );
    }
    
    renderMarks(filteredMarks);
}

// ---------- Modal Functions ----------

// Open user modal for adding
function openUserModal() {
    userModalTitle.textContent = 'Add New Student';
    userForm.reset();
    document.getElementById('user-id').value = '';
    isEditing = false;
    userModal.style.display = 'flex';
}

// Open user modal for editing
function editUser(user) {
    userModalTitle.textContent = 'Edit Student';
    document.getElementById('user-id').value = user.id;
    document.getElementById('name').value = user.name;
    document.getElementById('email').value = user.email;
    document.getElementById('phone').value = user.phone;
    document.getElementById('student-class').value = user.student_class;
    isEditing = true;
    userModal.style.display = 'flex';
}

// Close user modal
function closeUserModal() {
    userModal.style.display = 'none';
    userForm.reset();
}

// Open marks modal for adding
function openMarksModal() {
    marksModalTitle.textContent = 'Add Student Marks';
    marksForm.reset();
    document.getElementById('marks-id').value = '';
    document.getElementById('exam-date').valueAsDate = new Date();
    document.getElementById('math-total').value = 100;
    document.getElementById('science-total').value = 100;
    document.getElementById('english-total').value = 100;
    isEditing = false;
    marksModal.style.display = 'flex';
}

// Open marks modal for editing
function editMarks(mark) {
    marksModalTitle.textContent = 'Edit Student Marks';
    document.getElementById('marks-id').value = mark.id;
    document.getElementById('user-select').value = mark.user_id;
    document.getElementById('exam-name').value = mark.exam_name;
    document.getElementById('math-marks').value = mark.subjects_marks.Math;
    document.getElementById('science-marks').value = mark.subjects_marks.Science;
    document.getElementById('english-marks').value = mark.subjects_marks.English;
    document.getElementById('math-total').value = mark.total_marks.Math;
    document.getElementById('science-total').value = mark.total_marks.Science;
    document.getElementById('english-total').value = mark.total_marks.English;
    document.getElementById('exam-date').value = formatDateForInput(mark.date);
    isEditing = true;
    marksModal.style.display = 'flex';
}

// Close marks modal
function closeMarksModal() {
    marksModal.style.display = 'none';
    marksForm.reset();
}

// Open confirmation dialog
function confirmDelete(type, id, name) {
    currentDeleteData = { type, id };
    confirmMessage.textContent = `Are you sure you want to delete ${type === 'user' ? 'student' : 'marks'}: ${name}?`;
    confirmModal.style.display = 'flex';
}

// Close confirmation dialog
function closeConfirmModal() {
    confirmModal.style.display = 'none';
    currentDeleteData = null;
}

// ---------- Form Handlers ----------

// Handle user form submission
function handleUserSubmit(e) {
    e.preventDefault();
    
    const userData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        student_class: document.getElementById('student-class').value
    };
    
    const userId = document.getElementById('user-id').value;
    
    if (isEditing && userId) {
        updateUser(userId, userData);
    } else {
        createUser(userData);
    }
}

// Handle marks form submission
function handleMarksSubmit(e) {
    e.preventDefault();
    
    const marksData = {
        user_id: parseInt(document.getElementById('user-select').value),
        exam_name: document.getElementById('exam-name').value,
        subjects_marks: {
            Math: parseInt(document.getElementById('math-marks').value),
            Science: parseInt(document.getElementById('science-marks').value),
            English: parseInt(document.getElementById('english-marks').value)
        },
        total_marks: {
            Math: parseInt(document.getElementById('math-total').value),
            Science: parseInt(document.getElementById('science-total').value),
            English: parseInt(document.getElementById('english-total').value)
        },
        date: document.getElementById('exam-date').value
    };
    
    const marksId = document.getElementById('marks-id').value;
    
    if (isEditing && marksId) {
        updateMarks(marksId, marksData);
    } else {
        createMarks(marksData);
    }
}

// Handle confirmation dialog action
function handleConfirmation() {
    if (!currentDeleteData) return;
    
    const { type, id } = currentDeleteData;
    
    if (type === 'user') {
        deleteUser(id);
    } else if (type === 'marks') {
        deleteMarks(id);
    }
    
    closeConfirmModal();
}

// ---------- Utility Functions ----------

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Format date for input field
function formatDateForInput(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

// Show loading indicator
function showLoading(element) {
    element.innerHTML = `
        <tr>
            <td colspan="${element === usersTbody ? 6 : 9}" class="text-center">
                <div class="loader"></div> Loading...
            </td>
        </tr>
    `;
}

// Show toast notification
function showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create the toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Set icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    toast.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
    toastContainer.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}