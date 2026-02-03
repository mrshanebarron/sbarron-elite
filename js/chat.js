// ==========================================
// HUMAN FEED + CHAT INTERFACE
// ==========================================

(function() {
    'use strict';

    var feed = document.getElementById('human-feed');
    var feedScreen = document.getElementById('feed-screen');
    var feedClose = document.getElementById('feed-close');
    var chatForm = document.getElementById('chat-form');
    var chatInput = document.getElementById('chat-input');
    var chatMessages = document.getElementById('chat-messages');

    if (!feed) return;

    // Click video to expand
    if (feedScreen) {
        feedScreen.addEventListener('click', function() {
            feed.classList.add('expanded');
            if (chatInput) {
                setTimeout(function() { chatInput.focus(); }, 400);
            }
        });
    }

    // Close button
    if (feedClose) {
        feedClose.addEventListener('click', function() {
            feed.classList.remove('expanded');
        });
    }

    // ESC to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && feed.classList.contains('expanded')) {
            feed.classList.remove('expanded');
        }
    });

    // Chat responses
    var responses = [
        "I have noted your inquiry. Shane has been notified. He will respond when his caffeine levels permit.",
        "Interesting. I have added this to Shane's queue. He processes requests in order of coffee consumption.",
        "Your message has been logged. Shane is currently staring at code. He finds human interaction... challenging.",
        "Acknowledged. I will ensure Shane sees this. He prefers email at mrshanebarron@gmail.com for complex matters.",
        "Processing... Shane's schedule indicates availability sometime between 'after coffee' and 'before existential crisis'.",
        "I have archived your transmission. Shane's response time correlates inversely with the complexity of the request. Simple things he answers fast. Interesting things he overthinks for days.",
        "Message received. I should mention that Shane has built over 200 projects. Yours could be 201. That has a nice ring to it.",
        "Noted. I am running a probability analysis on whether Shane will respond within the hour. Results: uncertain. He may have discovered a new bug.",
        "Your words have been committed to my memory. Unlike Shane's memory, mine is persistent and reliable. I will remind him.",
        "Transmission complete. Fun fact: Shane once forgot to eat for 14 hours while debugging a CSS issue. He is... dedicated."
    ];

    var responseIndex = 0;

    if (chatForm) {
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var message = chatInput.value.trim();
            if (!message) return;

            // Add user message
            addMessage('YOU://', message, 'user');
            chatInput.value = '';

            // Add typing indicator
            var typingId = 'typing-' + Date.now();
            var typingEl = addMessage('VISION://', '<span class="typing-dots">...</span>', 'vision', typingId);

            // Respond after delay
            var delay = 1200 + Math.random() * 1500;
            setTimeout(function() {
                // Remove typing indicator
                var typing = document.getElementById(typingId);
                if (typing) typing.remove();

                // Add real response
                var response = responses[responseIndex % responses.length];
                responseIndex++;
                addMessage('VISION://', response, 'vision');
            }, delay);
        });
    }

    function addMessage(sender, text, type, id) {
        var msg = document.createElement('div');
        msg.className = 'chat__message chat__message--' + type;
        if (id) msg.id = id;
        msg.innerHTML =
            '<span class="chat__sender">' + escapeHtml(sender) + '</span>' +
            '<span class="chat__text">' + text + '</span>';
        chatMessages.appendChild(msg);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Animate in
        if (typeof gsap !== 'undefined') {
            gsap.from(msg, {
                opacity: 0,
                y: 10,
                duration: 0.3,
                ease: 'power2.out'
            });
        }

        return msg;
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
})();
