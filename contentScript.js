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
