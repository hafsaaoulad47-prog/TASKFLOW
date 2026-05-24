axios.get("http://localhost:5000/api/dashboard")
  .then(response => {

    const data = response.data;

    document.getElementById("activeProjects").textContent =
      data.activeProjects;

    document.getElementById("assignedTasks").textContent =
      data.assignedTasks;

    document.getElementById("completedTasks").textContent =
      data.completedTasks;

    document.getElementById("lateTasks").textContent =
      data.lateTasks;

  })
  .catch(error => console.log(error));