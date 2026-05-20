function setupTaskDraftListeners() {
  ["task-title", "task-desc", "task-priority"].forEach((fieldId) => {
    document.getElementById(fieldId).addEventListener("input", saveDraft);
  });
}

function saveDraft() {
  const projectId = document.getElementById("task-project").value;
  if (!projectId) return;
  const draft = {
    title: document.getElementById("task-title").value,
    description: document.getElementById("task-desc").value,
    priority: document.getElementById("task-priority").value,
  };
  localStorage.setItem(`draft_task_${projectId}`, JSON.stringify(draft));
}
 // Check localStorage draft
  const draftKey = `draft_task_${document.getElementById("task-project").value}`;
  const draft = localStorage.getItem(draftKey);
  if (draft && !id) {
    if (confirm("Un brouillon a été trouvé. Voulez-vous le restaurer ?")) {
      const d = JSON.parse(draft);
      document.getElementById("task-title").value = d.title || "";
      document.getElementById("task-desc").value = d.description || "";
      document.getElementById("task-priority").value = d.priority || "moyenne";
    } else {
      localStorage.removeItem(draftKey);
    }
  }
  // Clear draft
    if (projectId) localStorage.removeItem(`draft_task_${projectId}`);
   