
document.addEventListener("DOMContentLoaded", () => {
    const tipsContainer = document.getElementById("tips-container");
    const getTipsButton = document.getElementById("get-tips-button"); // Assuming the button has this ID
  
    // Function to fetch tips
    const fetchTips = async () => {
      const response = await fetch('/tips');
      return await response.json();
    };
  
    // Function to fetch comments for a specific tip
    const fetchComments = async (tipId) => {
      const response = await fetch(`/tips/${tipId}/comments`);
      return await response.json();
    };
  
    // Function to display tips
    const displayTips = async () => {
      tipsContainer.innerHTML = ''; // Clear previous tips if any
      const tips = await fetchTips();
  
      tips.forEach(tip => {
        const tipElement = document.createElement('div');
        tipElement.classList.add('tip-card');
  
        tipElement.innerHTML = `
          <h3>${tip.title}</h3>
          <p>${tip.content}</p>
          <div class="tip-footer">
            <button class="comments-toggle" data-tip-id="${tip.tip_id}">
              ${tip.comment_count} Comments
            </button>
          </div>
          <div class="comments-section" id="comments-${tip.tip_id}" style="display: none;">
            <ul class="comments-list"></ul>
          </div>
        `;
  
        tipsContainer.appendChild(tipElement);
      });
  
      // Add event listeners to comment buttons
      const commentButtons = document.querySelectorAll('.comments-toggle');
      commentButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
          const tipId = event.target.dataset.tipId;
          const commentsSection = document.getElementById(`comments-${tipId}`);
          const commentsList = commentsSection.querySelector('.comments-list');
  
          if (commentsSection.style.display === 'none') {
            const comments = await fetchComments(tipId);
            commentsList.innerHTML = comments.map(comment =>
              `<li><strong>${comment.first_name} ${comment.last_name}:</strong> ${comment.comment}</li>`
            ).join('');
            commentsSection.style.display = 'block';
          } else {
            commentsSection.style.display = 'none';
          }
        });
      });
    };
  
    // Event listener for the "Get Tips" button
    getTipsButton.addEventListener('click', displayTips);
  });
  
  