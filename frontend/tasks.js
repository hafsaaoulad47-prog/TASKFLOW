let currentPage = 1;

async function loadTasks(page = 1) {

  const search =
    document.getElementById("searchInput").value;

  const status =
    document.getElementById("statusFilter").value;

  const priority =
    document.getElementById("priorityFilter").value;

  const response = await axios.get(
    `http://localhost:5000/api/tasks?page=${page}&search=${search}&status=${status}&priority=${priority}`
  );

  const tasks = response.data.data;

  const tasksList =
    document.getElementById("tasksList");

  tasksList.innerHTML = "";

  tasks.forEach(task => {

    tasksList.innerHTML += `
      <div class="card">
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <p>Status: ${task.status}</p>
        <p>Priority: ${task.priority}</p>
      </div>
    `;
  });

  document.getElementById("pageInfo").textContent =
    `Page ${response.data.page}`;

  currentPage = response.data.page;
}

document.getElementById("filterBtn")
  .addEventListener("click", () => {
    loadTasks(1);
  });

document.getElementById("nextBtn")
  .addEventListener("click", () => {
    loadTasks(currentPage + 1);
  });

document.getElementById("prevBtn")
  .addEventListener("click", () => {

    if (currentPage > 1) {
      loadTasks(currentPage - 1);
    }

  });

loadTasks();