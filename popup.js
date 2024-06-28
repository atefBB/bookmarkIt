document
  .getElementById("bookmarkForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("title").value;
    const statusElement = document.getElementById("status");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0].url;
      const bookmark = `- [${title}](${url})\n`;

      chrome.storage.sync.get(["token", "repo", "path", "owner"], (data) => {
        const { token, repo, path, owner } = data;

        fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
          {
            method: "GET",
            headers: {
              Authorization: `token ${token}`,
              Accept: "application/vnd.github.v3.raw",
            },
          }
        )
          .then((response) => response.text())
          .then((content) => {
            const updatedContent = content + bookmark;
            const sha = btoa(updatedContent);

            fetch(
              `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
              {
                method: "PUT",
                headers: {
                  Authorization: `token ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  message: `Added bookmark: ${title}`,
                  content: btoa(updatedContent),
                  sha: sha,
                }),
              }
            )
              .then((response) => response.json())
              .then((data) => {
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
    });
  });
