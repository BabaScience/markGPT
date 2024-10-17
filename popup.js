document.getElementById('saveConversation').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Inject the content script to get conversation data
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: getConversationData,
    }, (injectionResults) => {
      if (injectionResults && injectionResults[0] && injectionResults[0].result) {
        console.log('Conversation data:', injectionResults[0].result);
        saveBookmark(tab.url, injectionResults[0].result.title, injectionResults[0].result.snippet);
      } else {
        throw new Error('Failed to inject script or no messages found.');
      }
    });
  } catch (error) {
    chrome.runtime.sendMessage({
      type: 'logError',
      message: error.message,
    });
  }
});

// Save the bookmark to local storage
function saveBookmark(url, title, snippet) {
  const bookmark = { url, title, snippet, date: new Date().toLocaleString() };

  chrome.storage.local.get({ bookmarks: [] }, (result) => {
    const bookmarks = result.bookmarks;
    bookmarks.push(bookmark);

    chrome.storage.local.set({ bookmarks }, () => {
      displayBookmarks();
    });
  });
}

// Display bookmarks on the popup
function displayBookmarks() {
  chrome.storage.local.get({ bookmarks: [] }, (result) => {
    const bookmarksList = document.getElementById('bookmarksList');
    bookmarksList.innerHTML = ''; // Clear the list

    result.bookmarks.forEach((bookmark, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${bookmark.title}</strong><br>
        <a href="${bookmark.url}" target="_blank">${bookmark.url}</a><br>
        <span>${bookmark.snippet}</span><br>
        <button onclick="deleteBookmark(${index})">Delete</button>
      `;
      bookmarksList.appendChild(li);
    });
  });
}

// Delete bookmark
function deleteBookmark(index) {
  chrome.storage.local.get({ bookmarks: [] }, (result) => {
    const bookmarks = result.bookmarks;
    bookmarks.splice(index, 1); // Remove the selected bookmark

    chrome.storage.local.set({ bookmarks }, () => {
      displayBookmarks(); // Refresh the list after deletion
    });
  });
}


function getConversationData() {
  const messageDivs = Array.from(document.querySelectorAll('[data-message-author-role="user"]'));
  
  if (messageDivs.length === 0) {
    throw new Error('No messages found on the page.');
  }

  // Extract the title (first few words of the message) and snippet
  const title = messageDivs[0].querySelector('.whitespace-pre-wrap').innerText.slice(0, 50) + '...';
  const snippet = messageDivs[0].querySelector('.whitespace-pre-wrap').innerText.slice(0, 150) + '...';

  return { title, snippet };
}

// Display bookmarks when popup opens
displayBookmarks();
