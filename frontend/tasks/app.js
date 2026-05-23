// ========================
// PROJECTS (FIXED ONLY)
// ========================

async function loadProjects() {
  try {
    const { data } = await axios.get(`${API}/projects?page=${projectPage}&limit=9`);

    allProjects = data.data;

    const list = document.getElementById("projects-list");

    if (!data.data.length) {
      list.innerHTML = '<p style="color:var(--text-muted)">Aucun projet. Créez le premier !</p>';
    } else {
      list.innerHTML = data.data.map(renderProjectCard).join("");
    }

    renderPagination("projects-pagination", data.page, data.totalPages, (p) => {
      projectPage = p;
      loadProjects();
    });

  } catch (err) {
    console.error(err);
  }
}

function renderProjectCard(project) {
  const isOwner =
    project.owner?._id === currentUser?.id ||
    project.owner === currentUser?.id;

  const statusClass = (project.status || "").replace(" ", "-");

  return `
    <div class="project-card" onclick="openProjectDetail('${project._id}')">
      <h3>${escHtml(project.title)}</h3>
      <p>${escHtml(project.description || "Aucune description")}</p>

      <div class="project-card-footer">
        <span class="badge-status badge-${statusClass}">${project.status}</span>

        <div class="card-actions" onclick="event.stopPropagation()">
          ${isOwner ? `
            <button class="btn-sm btn-primary" onclick="openProjectModal('${project._id}')">Éditer</button>
            <button class="btn-sm btn-danger" onclick="deleteProject('${project._id}')">Supprimer</button>
          ` : ""}
        </div>
      </div>
    </div>
  `;
}

function openProjectModal(id = null) {
  document.getElementById("project-id").value = id || "";
  document.getElementById("project-modal-title").textContent =
    id ? "Modifier le projet" : "Nouveau projet";

  document.getElementById("project-title").value = "";
  document.getElementById("project-desc").value = "";
  document.getElementById("project-deadline").value = "";
  document.getElementById("project-status").value = "actif";

  document.getElementById("members-section").style.display = id ? "" : "none";

  if (id) {
    const project = allProjects.find(p => p._id === id);

    if (project) {
      document.getElementById("project-title").value = project.title;
      document.getElementById("project-desc").value = project.description || "";
      document.getElementById("project-deadline").value =
        project.deadline ? project.deadline.split("T")[0] : "";
      document.getElementById("project-status").value = project.status;

      renderMembersList(project);
    }
  }

  document.getElementById("project-modal").style.display = "flex";
}

async function saveProject() {
  const id = document.getElementById("project-id").value;

  const payload = {
    title: document.getElementById("project-title").value,
    description: document.getElementById("project-desc").value,
    deadline: document.getElementById("project-deadline").value || undefined,
    status: document.getElementById("project-status").value,
  };

  try {
    if (id) {
      await axios.put(`${API}/projects/${id}`, payload);
    } else {
      await axios.post(`${API}/projects`, payload);
    }

    closeModal("project-modal");
    loadProjects();
  } catch (err) {
    alert(err.response?.data?.message || "Erreur");
  }
}

async function deleteProject(id) {
  if (!confirm("Supprimer ce projet ?")) return;

  try {
    await axios.delete(`${API}/projects/${id}`);
    loadProjects();
  } catch (err) {
    alert(err.response?.data?.message || "Erreur");
  }
}

function renderMembersList(project) {
  const list = document.getElementById("members-list");

  if (!project.members || !project.members.length) {
    list.innerHTML = '<p style="color:var(--text-muted)">Aucun membre.</p>';
    return;
  }

  list.innerHTML = project.members.map(m => `
    <div class="member-item">
      <span>${escHtml(m.fullName || "")} - ${escHtml(m.email || "")}</span>
    </div>
  `).join("");
}
const taskRoutes = require("./routes/taskRoutes");
app.use("/api/tasks", taskRoutes);
// test