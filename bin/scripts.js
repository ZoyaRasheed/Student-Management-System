// Global variables
let students = [];
let marks = [];
let darkMode = localStorage.getItem('darkMode') === 'true';

// DOM Elements
const navigationItems = document.querySelectorAll('.sidebar-nav li');
console.log("hello");

const contentSections = document.querySelectorAll('.content-section');
const themeToggle = document.getElementById('theme-toggle');
const searchInput = document.getElementById('search-input');

// Modals
const studentModal = document.getElementById('student-modal');
const marksModal = document.getElementById('marks-modal');
const confirmModal = document.getElementById('confirm-modal');

// API Endpoint
const API_BASE_URL = 'http://127.0.0.1:5000';

// Application Initialization
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Initialize UI components
    setupEventListeners();
    setupTheme();
    loadDashboardData();
    
    // Load initial data
    fetchStudents();
    fetchMarks();
}

// Event Listeners Setup
function setupEventListeners() {
    // Navigation
    navigationItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.getAttribute('data-section');
            changeActiveSection(section);
        });
    });

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Global search
    searchInput.addEventListener('input', handleGlobalSearch);

    // Student management
    document.getElementById('add-student-btn').addEventListener('click', openAddStudentModal);
    document.getElementById('student-form').addEventListener('submit', handleStudentFormSubmit);
    document.getElementById('cancel-student-btn').addEventListener('click', () => closeModal(studentModal));
    document.getElementById('student-search').addEventListener('input', filterStudentsTable);
    document.getElementById('class-filter').addEventListener('change', filterStudentsTable);

    // Marks management
    document.getElementById('add-marks-btn').addEventListener('click', openAddMarksModal);
    document.getElementById('marks-form').addEventListener('submit', handleMarksFormSubmit);
    document.getElementById('cancel-marks-btn').addEventListener('click', () => closeModal(marksModal));
    document.getElementById('marks-search').addEventListener('input', filterMarksTable);
    document.getElementById('student-filter').addEventListener('change', filterMarksTable);
    document.getElementById('exam-filter').addEventListener('change', filterMarksTable);

    // Confirmation modal
    document.getElementById('cancel-confirm-btn').addEventListener('click', () => closeModal(confirmModal));
    
    // Close buttons for all modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(studentModal);
            closeModal(marksModal);
            closeModal(confirmModal);
        });
    });
}

// Navigation Functions
function changeActiveSection(sectionId) {
    // Update navigation highlighting
    navigationItems.forEach(item => {
        if(item.getAttribute('data-section') === sectionId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Show selected section, hide others
    contentSections.forEach(section => {
        if(section.id === sectionId) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });
}

// Theme Functions
function setupTheme() {
    if(darkMode) {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

function toggleTheme() {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    setupTheme();
}

// API Functions
async function fetchData(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${endpoint}:`, error);
        showToast(`Error: ${error.message}`, 'error');
        return null;
    }
}

// Students Management
async function fetchStudents() {
    const response = await fetchData('/users');
    if (response) {
        students = response.users || [];
        updateStudentsTable();
        updateStudentDropdowns();
        updateDashboardStats();
    }
}

function updateStudentsTable() {
    const tbody = document.querySelector('#students-table tbody');
    const classFilter = document.getElementById('class-filter');
    const classOptions = new Set();
    
    // Clear loading state
    tbody.innerHTML = '';
    
    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No students found</td></tr>';
        return;
    }

    // Populate the table
    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.phone}</td>
            <td>${student.student_class}</td>
            <td class="action-buttons">
                <button class="icon-btn edit-btn" data-id="${student.id}"><i class="fas fa-edit"></i></button>
                <button class="icon-btn delete-btn" data-id="${student.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
        
        // Collect class options for filter
        if (student.student_class) {
            classOptions.add(student.student_class);
        }
    });
    
    // Update class filter options
    if (classFilter.options.length <= 1) {
        classOptions.forEach(className => {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            classFilter.appendChild(option);
        });
    }
    
    // Add event listeners to edit and delete buttons
    attachStudentActionListeners();
}

function attachStudentActionListeners() {
    document.querySelectorAll('#students-table .edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditStudentModal(btn.getAttribute('data-id')));
    });
    
    document.querySelectorAll('#students-table .delete-btn').forEach(btn => {
        btn.addEventListener('click', () => openDeleteStudentConfirmation(btn.getAttribute('data-id')));
    });
}

function updateStudentDropdowns() {
    const marksStudentSelect = document.getElementById('marks-student');
    const studentFilter = document.getElementById('student-filter');
    
    // Clear existing options except the first one
    while (marksStudentSelect.options.length > 1) {
        marksStudentSelect.remove(1);
    }
    
    while (studentFilter.options.length > 1) {
        studentFilter.remove(1);
    }
    
    // Add student options
    students.forEach(student => {
        // For marks form
        const option1 = document.createElement('option');
        option1.value = student.id;
        option1.textContent = student.name;
        marksStudentSelect.appendChild(option1);
        
        // For marks filter
        const option2 = document.createElement('option');
        option2.value = student.id;
        option2.textContent = student.name;
        studentFilter.appendChild(option2);
    });
}

function filterStudentsTable() {
    const searchTerm = document.getElementById('student-search').value.toLowerCase();
    const classFilter = document.getElementById('class-filter').value;
    const rows = document.querySelectorAll('#students-table tbody tr');
    
    rows.forEach(row => {
        const id = row.cells[0]?.textContent || '';
        const name = row.cells[1]?.textContent || '';
        const email = row.cells[2]?.textContent || '';
        const phone = row.cells[3]?.textContent || '';
        const studentClass = row.cells[4]?.textContent || '';
        
        const matchesSearch = 
            id.toLowerCase().includes(searchTerm) ||
            name.toLowerCase().includes(searchTerm) ||
            email.toLowerCase().includes(searchTerm) ||
            phone.toLowerCase().includes(searchTerm) ||
            studentClass.toLowerCase().includes(searchTerm);
            
        const matchesClass = !classFilter || studentClass === classFilter;
        
        if (matchesSearch && matchesClass) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function openAddStudentModal() {
    document.getElementById('student-modal-title').textContent = 'Add New Student';
    document.getElementById('student-form').reset();
    document.getElementById('student-id').value = '';
    openModal(studentModal);
}

function openEditStudentModal(studentId) {
    const student = students.find(s => s.id.toString() === studentId.toString());
    if (!student) return;
    
    document.getElementById('student-modal-title').textContent = 'Edit Student';
    document.getElementById('student-id').value = student.id;
    document.getElementById('student-name').value = student.name;
    document.getElementById('student-email').value = student.email;
    document.getElementById('student-phone').value = student.phone;
    document.getElementById('student-class').value = student.student_class;
    
    openModal(studentModal);
}

function openDeleteStudentConfirmation(studentId) {
    const student = students.find(s => s.id.toString() === studentId.toString());
    if (!student) return;
    
    document.getElementById('confirm-title').textContent = 'Delete Student';
    document.getElementById('confirm-message').textContent = `Are you sure you want to delete ${student.name}?`;
    
    const confirmBtn = document.getElementById('confirm-action-btn');
    confirmBtn.onclick = () => deleteStudent(studentId);
    
    openModal(confirmModal);
}

async function handleStudentFormSubmit(event) {
    event.preventDefault();
    
    const studentId = document.getElementById('student-id').value;
    const studentData = {
        name: document.getElementById('student-name').value,
        email: document.getElementById('student-email').value,
        phone: document.getElementById('student-phone').value,
        student_class: document.getElementById('student-class').value
    };
    
    let response;
    if (studentId) {
        // Update existing student
        response = await fetchData(`/users/${studentId}`, 'PUT', studentData);
        if (response) {
            showToast('Student updated successfully', 'success');
        }
    } else {
        // Add new student
        response = await fetchData('/users', 'POST', studentData);
        if (response) {
            showToast('Student added successfully', 'success');
        }
    }
    
    if (response) {
        closeModal(studentModal);
        fetchStudents();
    }
}

async function deleteStudent(studentId) {
    const response = await fetchData(`/users/${studentId}`, 'DELETE');
    if (response) {
        showToast('Student deleted successfully', 'success');
        closeModal(confirmModal);
        fetchStudents();
        
        // Also refresh marks as they might reference this student
        fetchMarks();
    }
}

// Marks Management
async function fetchMarks() {
    const response = await fetchData('/all_marks');
    if (response) {
        marks = response.marks || [];
        updateMarksTable();
        updateExamFilter();
        updateDashboardStats();
    }
}

function updateMarksTable() {
    const tbody = document.querySelector('#marks-table tbody');
    
    // Clear loading state
    tbody.innerHTML = '';
    
    if (marks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">No marks found</td></tr>';
        return;
    }

    // Populate the table
    marks.forEach(mark => {
        const student = students.find(s => s.id === mark.user_id) || { name: 'Unknown' };
        const mathPercentage = (mark.subjects_marks.Math / mark.total_marks.Math * 100).toFixed(1);
        const sciencePercentage = (mark.subjects_marks.Science / mark.total_marks.Science * 100).toFixed(1);
        const englishPercentage = (mark.subjects_marks.English / mark.total_marks.English * 100).toFixed(1);
        
        const totalObtained = mark.subjects_marks.Math + mark.subjects_marks.Science + mark.subjects_marks.English;
        const totalMaximum = mark.total_marks.Math + mark.total_marks.Science + mark.total_marks.English;
        const averagePercentage = (totalObtained / totalMaximum * 100).toFixed(1);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${mark.id}</td>
            <td>${student.name}</td>
            <td>${mark.exam_name}</td>
            <td>${formatDate(mark.date)}</td>
            <td>${mark.subjects_marks.Math}/${mark.total_marks.Math} (${mathPercentage}%)</td>
            <td>${mark.subjects_marks.Science}/${mark.total_marks.Science} (${sciencePercentage}%)</td>
            <td>${mark.subjects_marks.English}/${mark.total_marks.English} (${englishPercentage}%)</td>
            <td>${averagePercentage}%</td>
            <td class="action-buttons">
                <button class="icon-btn edit-btn" data-id="${mark.id}"><i class="fas fa-edit"></i></button>
                <button class="icon-btn delete-btn" data-id="${mark.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    attachMarksActionListeners();
}

function attachMarksActionListeners() {
    document.querySelectorAll('#marks-table .edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditMarksModal(btn.getAttribute('data-id')));
    });
    
    document.querySelectorAll('#marks-table .delete-btn').forEach(btn => {
        btn.addEventListener('click', () => openDeleteMarksConfirmation(btn.getAttribute('data-id')));
    });
}

function updateExamFilter() {
    const examFilter = document.getElementById('exam-filter');
    const examOptions = new Set();
    
    // Clear existing options except the first one
    while (examFilter.options.length > 1) {
        examFilter.remove(1);
    }
    
    // Collect unique exam names
    marks.forEach(mark => {
        if (mark.exam_name) {
            examOptions.add(mark.exam_name);
        }
    });
    
    // Add exam options to filter
    examOptions.forEach(examName => {
        const option = document.createElement('option');
        option.value = examName;
        option.textContent = examName;
        examFilter.appendChild(option);
    });
}

function filterMarksTable() {
    const searchTerm = document.getElementById('marks-search').value.toLowerCase();
    const studentFilter = document.getElementById('student-filter').value;
    const examFilter = document.getElementById('exam-filter').value;
    const rows = document.querySelectorAll('#marks-table tbody tr');
    
    rows.forEach(row => {
        if (row.cells.length < 3) return; // Skip empty rows
        
        const id = row.cells[0]?.textContent || '';
        const studentName = row.cells[1]?.textContent || '';
        const examName = row.cells[2]?.textContent || '';
        
        const matchesSearch = 
            id.toLowerCase().includes(searchTerm) ||
            studentName.toLowerCase().includes(searchTerm) ||
            examName.toLowerCase().includes(searchTerm);
        
        const matchesStudent = !studentFilter || 
            (studentFilter && students.find(s => 
                s.id.toString() === studentFilter && 
                s.name === studentName
            ));
            
        const matchesExam = !examFilter || examName === examFilter;
        
        if (matchesSearch && matchesStudent && matchesExam) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function openAddMarksModal() {
    document.getElementById('marks-modal-title').textContent = 'Add New Marks';
    document.getElementById('marks-form').reset();
    document.getElementById('marks-id').value = '';
    document.getElementById('marks-date').valueAsDate = new Date();
    openModal(marksModal);
}

function openEditMarksModal(markId) {
    const mark = marks.find(m => m.id.toString() === markId.toString());
    if (!mark) return;
    
    document.getElementById('marks-modal-title').textContent = 'Edit Marks';
    document.getElementById('marks-id').value = mark.id;
    document.getElementById('marks-student').value = mark.user_id;
    document.getElementById('marks-exam').value = mark.exam_name;
    document.getElementById('marks-date').value = mark.date;
    
    document.getElementById('marks-math').value = mark.subjects_marks.Math;
    document.getElementById('total-math').value = mark.total_marks.Math;
    document.getElementById('marks-science').value = mark.subjects_marks.Science;
    document.getElementById('total-science').value = mark.total_marks.Science;
    document.getElementById('marks-english').value = mark.subjects_marks.English;
    document.getElementById('total-english').value = mark.total_marks.English;
    
    openModal(marksModal);
}

function openDeleteMarksConfirmation(markId) {
    const mark = marks.find(m => m.id.toString() === markId.toString());
    if (!mark) return;
    
    const student = students.find(s => s.id === mark.user_id) || { name: 'Unknown' };
    
    document.getElementById('confirm-title').textContent = 'Delete Marks';
    document.getElementById('confirm-message').textContent = 
        `Are you sure you want to delete ${mark.exam_name} marks for ${student.name}?`;
    
    const confirmBtn = document.getElementById('confirm-action-btn');
    confirmBtn.onclick = () => deleteMarks(markId);
    
    openModal(confirmModal);
}

async function handleMarksFormSubmit(event) {
    event.preventDefault();
    
    const markId = document.getElementById('marks-id').value;
    const marksData = {
        user_id: parseInt(document.getElementById('marks-student').value),
        exam_name: document.getElementById('marks-exam').value,
        date: document.getElementById('marks-date').value,
        subjects_marks: {
            Math: parseInt(document.getElementById('marks-math').value),
            Science: parseInt(document.getElementById('marks-science').value),
            English: parseInt(document.getElementById('marks-english').value)
        },
        total_marks: {
            Math: parseInt(document.getElementById('total-math').value),
            Science: parseInt(document.getElementById('total-science').value),
            English: parseInt(document.getElementById('total-english').value)
        }
    };
    
    let response;
    if (markId) {
        // Update existing marks
        const { user_id, ...updateData } = marksData; // Remove user_id for update
        response = await fetchData(`/marks/${markId}`, 'PUT', updateData);
        if (response) {
            showToast('Marks updated successfully', 'success');
        }
    } else {
        // Add new marks
        response = await fetchData('/marks', 'POST', marksData);
        if (response) {
            showToast('Marks added successfully', 'success');
        }
    }
    
    if (response) {
        closeModal(marksModal);
        fetchMarks();
    }
}

async function deleteMarks(markId) {
    const response = await fetchData(`/marks/${markId}`, 'DELETE');
    if (response) {
        showToast('Marks deleted successfully', 'success');
        closeModal(confirmModal);
        fetchMarks();
    }
}

// Dashboard Functions
function loadDashboardData() {
    updateDashboardStats();
    initializePerformanceChart();
    loadRecentActivity();
}

function updateDashboardStats() {
    const totalStudentsEl = document.getElementById('total-students');
    const totalExamsEl = document.getElementById('total-exams');
    const averageScoreEl = document.getElementById('average-score');
    
    // Update total students
    totalStudentsEl.textContent = students.length;
    
    // Calculate unique exams
    const uniqueExams = new Set();
    marks.forEach(mark => uniqueExams.add(mark.exam_name));
    totalExamsEl.textContent = uniqueExams.size;
    
    // Calculate average score
    if (marks.length > 0) {
        let totalPercentage = 0;
        marks.forEach(mark => {
            const totalObtained = mark.subjects_marks.Math + mark.subjects_marks.Science + mark.subjects_marks.English;
            const totalMaximum = mark.total_marks.Math + mark.total_marks.Science + mark.total_marks.English;
            totalPercentage += (totalObtained / totalMaximum * 100);
        });
        const avgScore = (totalPercentage / marks.length).toFixed(1);
        averageScoreEl.textContent = `${avgScore}%`;
    } else {
        averageScoreEl.textContent = 'N/A';
    }
    
    // Update the performance chart if it exists
    updatePerformanceChart();
}

function initializePerformanceChart() {
    const ctx = document.getElementById('performance-chart').getContext('2d');
    window.performanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mathematics', 'Science', 'English'],
            datasets: [{
                label: 'Average Score (%)',
                data: [0, 0, 0],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(75, 192, 192, 0.7)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

function updatePerformanceChart() {
    if (!window.performanceChart || marks.length === 0) return;
    
    // Calculate average for each subject
    let mathTotal = 0, scienceTotal = 0, englishTotal = 0;
    marks.forEach(mark => {
        mathTotal += (mark.subjects_marks.Math / mark.total_marks.Math * 100);
        scienceTotal += (mark.subjects_marks.Science / mark.total_marks.Science * 100);
        englishTotal += (mark.subjects_marks.English / mark.total_marks.English * 100);
    });
    
    const mathAvg = (mathTotal / marks.length).toFixed(1);
    const scienceAvg = (scienceTotal / marks.length).toFixed(1);
    const englishAvg = (englishTotal / marks.length).toFixed(1);
    
    // Update chart data
    window.performanceChart.data.datasets[0].data = [mathAvg, scienceAvg, englishAvg];
    window.performanceChart.update();
}

function loadRecentActivity() {
    const activityList = document.getElementById('recent-activity');
    
    // Clear loading state
    activityList.innerHTML = '';
    
    // Create mock activities based on the data we have
    const activities = [];
    
    // Add the most recent marks
    const recentMarks = [...marks].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    recentMarks.forEach(mark => {
        const student = students.find(s => s.id === mark.user_id) || { name: 'Unknown' };
        activities.push({
            type: 'mark',
            title: `${student.name} - ${mark.exam_name}`,
            description: `Average: ${calculateAverage(mark)}%`,
            icon: 'fa-chart-bar',
            date: mark.date
        });
    });
    
    // Add the most recent students
    const recentStudents = [...students].sort((a, b) => b.id - a.id).slice(0, 3);
    recentStudents.forEach(student => {
        activities.push({
            type: 'student',
            title: `New Student: ${student.name}`,
            description: `Class: ${student.student_class}`,
            icon: 'fa-user-graduate',
            date: new Date().toISOString().split('T')[0] // Use current date as we don't have creation date
        });
    });
    
    // Sort all activities by date (newest first)
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Display activities
    if (activities.length === 0) {
        activityList.innerHTML = '<div class="empty-state">No recent activities</div>';
        return;
    }
    
    activities.slice(0, 5).forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div class="activity-icon">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
                <small>${formatDate(activity.date)}</small>
            </div>
        `;
        activityList.appendChild(item);
    });
}

// Utility Functions
function calculateAverage(mark) {
    const totalObtained = mark.subjects_marks.Math + mark.subjects_marks.Science + mark.subjects_marks.English;
    const totalMaximum = mark.total_marks.Math + mark.total_marks.Science + mark.total_marks.English;
    return (totalObtained / totalMaximum * 100).toFixed(1);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function openModal(modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

function handleGlobalSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    if (!searchTerm) return;
    
    // Find matches in students
    const foundStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm)
    );
    
    // Find matches in marks
    const foundMarks = marks.filter(mark => 
        mark.exam_name.toLowerCase().includes(searchTerm)
    );
    
    // Show results by switching to appropriate section
    if (foundStudents.length > 0) {
        changeActiveSection('students');
        document.getElementById('student-search').value = searchTerm;
        filterStudentsTable();
    } else if (foundMarks.length > 0) {
        changeActiveSection('marks');
        document.getElementById('marks-search').value = searchTerm;
        filterMarksTable();
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');
    const toastIcon = document.getElementById('toast-icon');
    
    // Set content
    toastText.textContent = message;
    
    // Set appropriate icon and color
    if (type === 'success') {
        toastIcon.className = 'fas fa-check-circle';
        toast.className = 'toast success';
    } else if (type === 'error') {
        toastIcon.className = 'fas fa-times-circle';
        toast.className = 'toast error';
    } else if (type === 'warning') {
        toastIcon.className = 'fas fa-exclamation-circle';
        toast.className = 'toast warning';
    } else {
        toastIcon.className = 'fas fa-info-circle';
        toast.className = 'toast info';
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}