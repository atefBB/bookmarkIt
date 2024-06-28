document.addEventListener("DOMContentLoaded", function (event) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    document.getElementById("title").value = tabs[0].title;
  });
});

document
  .getElementById("bookmarkForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("title").value;
    const statusElement = document.getElementById("status");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      try {
        const url = tabs[0].url;
        const bookmark = `- [ ] [${title}](${url})\n`;

        chrome.storage.sync.get(["token", "repo", "path", "owner"], (data) => {
          const { token, repo, path, owner } = data;

          fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
              },
            }
          )
            .then((response) => response.json())
            .then((content) => {
              const fileContent = atob(content.content);
              const updatedContent = fileContent + bookmark;
              const sha = content.sha;

              fetch(
                `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
                {
                  method: "PUT",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "X-GitHub-Api-Version": "2022-11-28",
                  },
                  body: JSON.stringify({
                    message: "feat: add bookmark",
                    content: btoa(updatedContent),
                    sha,
                  }),
                }
              )
                .then((response) => response.json())
                .then((_) => {
                  statusElement.textContent = "Bookmark added successfully!";
                  document.getElementById("title").value = "";
                })
                .catch((error) => {
                  statusElement.textContent = "Error adding bookmark.";
                  console.error("Error:", error);
                });
            })
            .catch((error) => {
              statusElement.textContent = "Error fetching file.";
              console.error("Error:", error);
            });
        });
      } catch (error) {
        console.log(`BookmarkIt | Error: ${error.message}`);
      }
    });
  });
