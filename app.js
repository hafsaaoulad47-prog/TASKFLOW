// ========================
// CONFIG & STATE (TaskFlow - Mes Tâches)
// ========================
const API = "/api";
let taskPage = 1;

// ========================
// INITIALISATION DE LA PAGE
// ========================
window.addEventListener("load", () => {
  // Afficher la page des tâches par défaut
  document.getElementById("page-tasks").style.display = "block";
  loadTasks();
});

// ========================
// FONCTIONNALITÉS: TÂCHES (Tâche 3)
// ========================

// 📌 Charger la liste des tâches (avec filtres)
async function loadTasks() {
  const project = document.getElementById("filter-project")?.value || "";
  const status = document.getElementById("filter-status")?.value || "";
  const priority = document.getElementById("filter-priority")?.value || "";
  const search = document.getElementById("filter-search")?.value || "";
  
  const params = new URLSearchParams({ page: taskPage, limit: 10 });
  if (project) params.append("project", project);
  if (status) params.append("status", status);
  if (priority) params.append("priority", priority);
  if (search) params.append("search", search);

  try {
    // Si l'API est connectée, on décommente cette ligne :
    // const { data } = await axios.get(`${API}/tasks?${params}`);
    
    // Simulation pour l'affichage (à supprimer si API connectée)
    const data = { data: [], page: 1, totalPages: 1 }; 
    
    const list = document.getElementById("tasks-list");
    if (!data.data.length) {
      list.innerHTML = '<p style="color:var(--text-muted)">Aucune tâche trouvée (ou API non connectée).</p>';
    } else {
      list.innerHTML = data.data.map(renderTaskItem).join("");
    }
  } catch (err) {
    console.error("Erreur lors du chargement des tâches :", err);
  }
}

// 📌 Afficher une tâche dans la liste
function renderTaskItem(task) {
  const priorityClass = `badge-${task.priority}`;
  return `
    <div class="task-item">
      <div class="task-item-info">
        <h4>${escHtml(task.title)}</h4>
        <small>
          <span class="badge-status ${priorityClass}">${task.priority}</span>
          &nbsp;${task.status}
          ${task.assignedTo ? `&nbsp;· Assigné à: ${escHtml(task.assignedTo.fullName || "")}` : ""}
          ${task.deadline ? `&nbsp;· 📅 ${new Date(task.deadline).toLocaleDateString("fr-FR")}` : ""}
        </small>
      </div>
      <div class="task-actions">
        <select class="btn-sm" onchange="changeTaskStatus('${task._id}', this.value)" style="border:1px solid var(--border);padding:0.3rem">
          <option ${task.status === "à faire" ? "selected" : ""} value="à faire">À faire</option>
          <option ${task.status === "en cours" ? "selected" : ""} value="en cours">En cours</option>
          <option ${task.status === "terminé" ? "selected" : ""} value="terminé">Terminé</option>
        </select>
        <button class="btn-sm btn-primary" onclick="openTaskModal('${task._id}')">Éditer</button>
        <button class="btn-sm btn-danger" onclick="deleteTask('${task._id}')">✕</button>
      </div>
    </div>
  `;
}

// 📌 Changer le statut d'une tâche (Tâche 3)
async function changeTaskStatus(id, status) {
  try {
    await axios.patch(`${API}/tasks/${id}/status`, { status });
    loadTasks();
  } catch (err) {
    alert(err.response?.data?.message || "Erreur de changement de statut");
  }
}

// 📌 Ouvrir le formulaire de tâche (Création/Modification)
async function openTaskModal(id = null) {
  document.getElementById("task-id").value = id || "";
  document.getElementById("task-modal-title").textContent = id ? "Modifier la tâche" : "Nouvelle tâche";
  document.getElementById("task-title").value = "";
  document.getElementById("task-desc").value = "";
  document.getElementById("task-status").value = "à faire"; // Tâche 3
  document.getElementById("task-assignedTo").innerHTML = '<option value="">Non assigné</option>'; // Tâche 4
  
  document.getElementById("task-modal").style.display = "flex";
}

// 📌 Enregistrer une tâche (Tâche 3 & 4)
async function saveTask() {
  const id = document.getElementById("task-id").value;
  const payload = {
    title: document.getElementById("task-title").value,
    description: document.getElementById("task-desc").value,
    status: document.getElementById("task-status").value, // Tâche 3
    assignedTo: document.getElementById("task-assignedTo").value || null, // Tâche 4
  };
  
  try {
    if (id) {
      await axios.put(`${API}/tasks/${id}`, payload);
    } else {
      await axios.post(`${API}/tasks`, payload);
    }
    closeModal("task-modal");
    loadTasks();
  } catch (err) {
    alert(err.response?.data?.message || "Erreur lors de l'enregistrement");
  }
}

// 📌 Supprimer une tâche (Tâche 3)
async function deleteTask(id) {
  if (!confirm("Supprimer cette tâche ?")) return;
  try {
    await axios.delete(`${API}/tasks/${id}`);
    loadTasks();
  } catch (err) {
    alert(err.response?.data?.message || "Erreur lors de la suppression");
  }
}

// ========================
// UTILS
// ========================
function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}