// PARTIE 1: GESTION DES TÂCHES (Brouillons)
// ========================
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('projectId');
    const taskId = urlParams.get('taskId');

    const DRAFT_KEY = `task_draft_${projectId}`;

    const form = document.getElementById('task-form');
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const prioritySelect = document.getElementById('priority');
    const statusSelect = document.getElementById('status');
    const deadlineInput = document.getElementById('deadline');
    const assignedToSelect = document.getElementById('assignedTo');
    const saveIndicator = document.getElementById('save-indicator');

    function showSaveIndicator() {
        saveIndicator.classList.add('show');
        setTimeout(() => saveIndicator.classList.remove('show'), 1500);
    }

    function saveDraft() {
        const draft = {
            title: titleInput.value,
            description: descriptionInput.value,
            priority: prioritySelect.value,
            status: statusSelect.value,
            deadline: deadlineInput.value,
            assignedTo: assignedToSelect.value,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        showSaveIndicator();
    }

    function restoreDraft() {
        const draftJson = localStorage.getItem(DRAFT_KEY);
        if (draftJson) {
            const draft = JSON.parse(draftJson);
            titleInput.value = draft.title || '';
            descriptionInput.value = draft.description || '';
            prioritySelect.value = draft.priority || 'moyenne';
            statusSelect.value = draft.status || 'à faire';
            deadlineInput.value = draft.deadline || '';
            assignedToSelect.value = draft.assignedTo || '';
        }
    }

    function clearDraft() {
        localStorage.removeItem(DRAFT_KEY);
    }

    function checkForDraft() {
        const draftJson = localStorage.getItem(DRAFT_KEY);
        if (draftJson && !taskId) {
            const modal = document.getElementById('restore-modal');
            if (modal) modal.classList.add('show');
        }
    }

    const inputs = [titleInput, descriptionInput, prioritySelect, statusSelect, deadlineInput, assignedToSelect];
    inputs.forEach(input => {
        if (input) input.addEventListener('input', () => saveDraft());
    });

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const taskData = {
                title: titleInput.value,
                description: descriptionInput.value,
                priority: prioritySelect.value,
                status: statusSelect.value,
                deadline: deadlineInput.value,
                assignedTo: assignedToSelect.value || null,
                project: projectId
            };
            try {
                const token = localStorage.getItem('token');
                let response;
                if (taskId) {
                    response = await axios.put(`/api/tasks/${taskId}`, taskData, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } else {
                    response = await axios.post('/api/tasks', taskData, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }
                if (response.status === 200 || response.status === 201) {
                    clearDraft();
                    alert('✅ Tâche enregistrée avec succès !');
                    window.location.href = `/project-details.html?id=${projectId}`;
                }
            } catch (error) {
                console.error('Erreur:', error);
                alert('❌ Erreur lors de l\'enregistrement');
            }
        });
    }

    const btnRestore = document.getElementById('btn-restore');
    const btnNew = document.getElementById('btn-new');
    if (btnRestore) btnRestore.addEventListener('click', () => {
        restoreDraft();
        const modal = document.getElementById('restore-modal');
        if (modal) modal.classList.remove('show');
    });
    if (btnNew) btnNew.addEventListener('click', () => {
        clearDraft();
        const modal = document.getElementById('restore-modal');
        if (modal) modal.classList.remove('show');
    });

    async function loadProjectMembers() {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/projects/${projectId}/members`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const projectInfo = document.getElementById('project-info');
            if (projectInfo) projectInfo.innerHTML = `📁 Projet ID: ${projectId}`;
            
            const members = response.data.members || [];
            assignedToSelect.innerHTML = '<option value="">-- Sélectionner un membre --</option>';
            members.forEach(member => {
                const option = document.createElement('option');
                option.value = member._id;
                option.textContent = member.fullName;
                assignedToSelect.appendChild(option);
            });
            
            if (taskId) {
                await loadTaskData();
            } else {
                checkForDraft();
            }
        } catch (error) {
            console.error('Erreur chargement membres:', error);
        }
    }

    async function loadTaskData() {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const task = response.data;
            titleInput.value = task.title;
            descriptionInput.value = task.description || '';
            prioritySelect.value = task.priority;
            statusSelect.value = task.status;
            deadlineInput.value = task.deadline ? task.deadline.split('T')[0] : '';
            assignedToSelect.value = task.assignedTo?._id || '';
        } catch (error) {
            console.error('Erreur chargement tâche:', error);
        }
    }

    if (projectId) {
        loadProjectMembers();
    } else {
        const projectInfo = document.getElementById('project-info');
        if (projectInfo) projectInfo.innerHTML = '❌ Projet non spécifié';
    }
});

// ========================
// PARTIE 2: NOTIFICATIONS ET ACTIVITÉS (devlop)
// ========================
const notificationCount = document.getElementById("notification-count");
const notificationList = document.getElementById("notification-list");
const activityFeed = document.getElementById("activity-feed");

const notifications = [
    { id: 1, message: "You were assigned to the task 'UI Design'", read: false },
    { id: 2, message: "Task status changed to Completed", read: false },
    { id: 3, message: "You were added to Project Alpha", read: true }
];

const activities = [
    "Adil created a new task — 2 hours ago",
    "Yassine changed task status to Completed — 1 hour ago",
    "Sara added a new member to the project — 30 minutes ago",
    "Project details updated — 10 minutes ago"
];

function displayNotifications() {
    if (!notificationList) return;
    notificationList.innerHTML = "";
    let unreadCount = 0;
    notifications.forEach(notification => {
        if (!notification.read) unreadCount++;
        const div = document.createElement("div");
        div.classList.add("notif-item");
        if (!notification.read) div.classList.add("unread");
        div.innerHTML = `<div>${notification.message}</div><button class="btn-sm" onclick="markAsRead(${notification.id})">Read</button>`;
        notificationList.appendChild(div);
    });
    if (notificationCount) notificationCount.innerText = unreadCount;
}

function markAsRead(id) {
    const notification = notifications.find(n => n.id === id);
    if (notification) notification.read = true;
    displayNotifications();
    saveReadNotifications();
}

function displayActivities() {
    if (!activityFeed) return;
    activityFeed.innerHTML = "";
    activities.forEach(activity => {
        const div = document.createElement("div");
        div.classList.add("activity-item");
        div.innerHTML = activity;
        activityFeed.appendChild(div);
    });
}

function saveReadNotifications() {
    const readNotifications = notifications.filter(n => n.read);
    localStorage.setItem("readNotifications", JSON.stringify(readNotifications));
}

setInterval(() => {
    console.log("Checking for new notifications...");
    displayNotifications();
}, 30000);

displayNotifications();
displayActivities();