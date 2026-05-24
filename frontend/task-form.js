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

  // Afficher l'indicateur de sauvegarde
  function showSaveIndicator() {
    saveIndicator.classList.add('show');
    setTimeout(() => saveIndicator.classList.remove('show'), 1500);
  }

  // Sauvegarder le brouillon dans localStorage
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

  // Restaurer le brouillon depuis localStorage
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

  // Supprimer le brouillon
  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
  }

  // Vérifier si un brouillon existe au chargement
  function checkForDraft() {
    const draftJson = localStorage.getItem(DRAFT_KEY);
    if (draftJson && !taskId) {
      document.getElementById('restore-modal').classList.add('show');
    }
  }

  // Auto-save à chaque modification
  const inputs = [titleInput, descriptionInput, prioritySelect, statusSelect, deadlineInput, assignedToSelect];
  inputs.forEach(input => input.addEventListener('input', () => saveDraft()));

  // Soumission du formulaire
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

  // Boutons de la modal
  document.getElementById('btn-restore').addEventListener('click', () => {
    restoreDraft();
    document.getElementById('restore-modal').classList.remove('show');
  });

  document.getElementById('btn-new').addEventListener('click', () => {
    clearDraft();
    document.getElementById('restore-modal').classList.remove('show');
  });

  // Charger les membres du projet
  async function loadProjectMembers() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/projects/${projectId}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      document.getElementById('project-info').innerHTML = `📁 Projet ID: ${projectId}`;

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

  // Charger les données d'une tâche existante
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

  // Initialisation
  if (projectId) {
    loadProjectMembers();
  } else {
    document.getElementById('project-info').innerHTML = '❌ Projet non spécifié';
  }
});