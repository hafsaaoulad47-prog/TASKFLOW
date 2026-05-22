 const API = "/api";
let currentUser = null;

// Tabs
function showTab(tab) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  document.querySelectorAll(".tab")[tab === "login" ? 0 : 1].classList.add("active");

  document.getElementById("login-form").style.display = tab === "login" ? "" : "none";
  document.getElementById("register-form").style.display = tab === "register" ? "" : "none";

  document.getElementById("auth-error").textContent = "";
}

// LOGIN
async function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const { data } = await axios.post(`${API}/auth/login`, { email, password });

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    initApp(data.user);
  } catch (err) {
    document.getElementById("auth-error").textContent =
      err.response?.data?.message || "Erreur de connexion";
  }
}

// REGISTER
async function register() {
  const fullName = document.getElementById("reg-name").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;

  try {
    const { data } = await axios.post(`${API}/auth/register`, {
      fullName,
      email,
      password,
    });

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    initApp(data.user);
  } catch (err) {
    document.getElementById("auth-error").textContent =
      err.response?.data?.message || "Erreur d'inscription";
  }
}

// LOGOUT
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  currentUser = null;

  document.getElementById("app-section").style.display = "none";
  document.getElementById("auth-section").style.display = "";
}

// INIT APP
function initApp(user) {
  currentUser = user;

  document.getElementById("auth-section").style.display = "none";
  document.getElementById("app-section").style.display = "";

  document.getElementById("user-name").textContent = user.fullName;

  showPage("projects");
}

// AUTO LOGIN
window.addEventListener("load", () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (token && user) {
    initApp(JSON.parse(user));
  }
});
let allProjects = [];
let projectPage = 1;

// LOAD PROJECTS
async function loadProjects() {
  const { data } = await axios.get(
    `${API}/projects?page=${projectPage}&limit=9`
  );

  allProjects = data.data;

  const list = document.getElementById("projects-list");

  if (!data.data.length) {
    list.innerHTML = "Aucun projet.";
  } else {
    list.innerHTML = data.data.map(renderProjectCard).join("");
  }
}

// RENDER CARD
function renderProjectCard(project) {
  return `
    <div class="project-card">
      <h3>${project.title}</h3>
      <p>${project.description || ""}</p>

      <button onclick="openProjectModal('${project._id}')">
        Modifier
      </button>

      <button onclick="deleteProject('${project._id}')">
        Supprimer
      </button>
    </div>
  `;
}

// CREATE / UPDATE
async function saveProject() {
  const id = document.getElementById("project-id").value;

  const payload = {
    title: document.getElementById("project-title").value,
    description: document.getElementById("project-desc").value,
  };

  if (id) {
    await axios.put(`${API}/projects/${id}`, payload);
  } else {
    await axios.post(`${API}/projects`, payload);
  }

  closeModal("project-modal");
  loadProjects();
}

// DELETE
async function deleteProject(id) {
  if (!confirm("Supprimer ce projet ?")) return;

  await axios.delete(`${API}/projects/${id}`);

  loadProjects();
}

// OPEN MODAL
function openProjectModal(id = null) {
  document.getElementById("project-id").value = id || "";

  if (id) {
    const project = allProjects.find((p) => p._id === id);

    if (project) {
      document.getElementById("project-title").value = project.title;
      document.getElementById("project-desc").value = project.description;
    }
  }

  document.getElementById("project-modal").style.display = "";
}