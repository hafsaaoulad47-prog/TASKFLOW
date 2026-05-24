const notificationCount = document.getElementById("notification-count");
const notificationList = document.getElementById("notification-list");
const activityFeed = document.getElementById("activity-feed");

// Données des notifications
const notifications = [
  { id: 1, message: "You were assigned to the task 'UI Design'", read: false },
  { id: 2, message: "Task status changed to Completed", read: false },
  { id: 3, message: "You were added to Project Alpha", read: true }
];

// Données des activités
const activities = [
  "Adil created a new task — 2 hours ago",
  "Yassine changed task status to Completed — 1 hour ago",
  "Sara added a new member to the project — 30 minutes ago",
  "Project details updated — 10 minutes ago"
];

// Afficher les notifications
function displayNotifications() {
  notificationList.innerHTML = "";
  let unreadCount = 0;

  notifications.forEach(notification => {
    if (!notification.read) unreadCount++;

    const div = document.createElement("div");
    div.classList.add("notif-item");
    if (!notification.read) div.classList.add("unread");

    div.innerHTML = `
      <div>${notification.message}</div>
      <button class="btn-sm" onclick="markAsRead(${notification.id})">Read</button>
    `;
    notificationList.appendChild(div);
  });

  notificationCount.innerText = unreadCount;
}

// Marquer comme lu
function markAsRead(id) {
  const notification = notifications.find(n => n.id === id);
  notification.read = true;
  displayNotifications();
  saveReadNotifications();
}

// Afficher les activités
function displayActivities() {
  activityFeed.innerHTML = "";
  activities.forEach(activity => {
    const div = document.createElement("div");
    div.classList.add("activity-item");
    div.innerHTML = activity;
    activityFeed.appendChild(div);
  });
}

// Sauvegarder dans localStorage
function saveReadNotifications() {
  const readNotifications = notifications.filter(n => n.read);
  localStorage.setItem("readNotifications", JSON.stringify(readNotifications));
}

// Polling toutes les 30 secondes
setInterval(() => {
  console.log("Checking for new notifications...");
  displayNotifications();
}, 30000);

// Initialisation
displayNotifications();
displayActivities();