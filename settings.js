document.getElementById("settingsForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const token = document.getElementById("token").value;
  const owner = document.getElementById("owner").value;
  const repo = document.getElementById("repo").value;
  const path = document.getElementById("path").value;

  chrome.storage.sync.set({ token, owner, repo, path }, () => {
    document.getElementById("status").textContent = "Settings saved!";
  });
});
