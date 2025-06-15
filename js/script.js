const htmlElement = document.documentElement;
const themeToggleBtn = document.getElementById('theme-toggle');
const mobileThemeToggleBtn = document.getElementById('mobile-theme-toggle');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

// Function to set the theme based on preference
function setTheme(isLightMode) {
    if (isLightMode) {
        htmlElement.classList.add('light');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun text-xl"></i>';
        mobileThemeToggleBtn.innerHTML = '<i class="fas fa-sun text-xl"></i>';
        localStorage.setItem('theme', 'light');
    } else {
        htmlElement.classList.remove('light');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon text-xl"></i>';
        mobileThemeToggleBtn.innerHTML = '<i class="fas fa-moon text-xl"></i>';
        localStorage.setItem('theme', 'dark');
    }
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        setTheme(true);
    } else {
        // Default to dark mode if no preference or if it's 'dark'
        setTheme(false);
    }
});

// Event listener for desktop theme toggle
themeToggleBtn.addEventListener('click', () => {
    const isLightMode = htmlElement.classList.contains('light');
    setTheme(!isLightMode);
});

// Event listener for mobile theme toggle
mobileThemeToggleBtn.addEventListener('click', () => {
    const isLightMode = htmlElement.classList.contains('light');
    setTheme(!isLightMode);
});


// JavaScript for mobile menu toggle
mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Close mobile menu when a link is clicked
mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
});

// Typing Effect Logic
const typingTextElement = document.getElementById('typing-text');
const phrases = [
    "A Computer Science Student",
    "A UX/UI Designer",
    "A Software Developer",
    "A Web Developer",
    "A Problem Solver"
];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingSpeed = 100; // milliseconds per character
const deletingSpeed = 50; // milliseconds per character
const pauseBeforeDelete = 1500; // milliseconds to pause before deleting
const pauseBeforeType = 500; // milliseconds to pause before typing next phrase

function typeWriter() {
    const currentPhrase = phrases[phraseIndex];
    if (isDeleting) {
        // Deleting text
        typingTextElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
    } else {
        // Typing text
        typingTextElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
    }

    let currentTypingSpeed = isDeleting ? deletingSpeed : typingSpeed;

    if (!isDeleting && charIndex === currentPhrase.length) {
        // Done typing, start deleting after a pause
        currentTypingSpeed = pauseBeforeDelete;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        // Done deleting, move to next phrase
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        currentTypingSpeed = pauseBeforeType;
    }

    setTimeout(typeWriter, currentTypingSpeed);
}

// Start the typing effect when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', typeWriter);


// Function to call Gemini API for project description elaboration
async function elaborateProjectDescription(projectTitle, projectDescription, targetElement, loaderElement) {
    targetElement.classList.add('hidden'); // Hide previous content
    loaderElement.classList.remove('hidden'); // Show loader

    const prompt = `Elaborate on the following computer science project, providing more technical details and highlighting key achievements:\n\nProject Title: ${projectTitle}\nExisting Description: ${projectDescription}\n\nFocus on the technologies used, challenges overcome, and the impact of the project.`;

    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    const payload = { contents: chatHistory };
    const apiKey = "YOUR_API_KEY_HERE"; // Replace with your Gemini API key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            targetElement.querySelector('p').innerText = text;
            targetElement.classList.remove('hidden'); // Show generated content
        } else {
            targetElement.querySelector('p').innerText = "Failed to generate description. Please try again.";
            targetElement.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        targetElement.querySelector('p').innerText = "An error occurred while fetching the description.";
        targetElement.classList.remove('hidden');
    } finally {
        loaderElement.classList.add('hidden'); // Hide loader
    }
}

// Add event listeners to all "Elaborate Description" buttons
document.querySelectorAll('.generate-description-btn').forEach(button => {
    button.addEventListener('click', (event) => {
        const projectCard = event.target.closest('.card-bg');
        const projectTitle = projectCard.querySelector('[data-project-title]').dataset.projectTitle;
        const projectDescription = projectCard.querySelector('[data-project-description]').dataset.projectDescription;
        const generatedDescriptionDiv = projectCard.querySelector('.generated-description');
        const loader = generatedDescriptionDiv.querySelector('.loader');

        // Toggle visibility and fetch/hide description
        if (generatedDescriptionDiv.classList.contains('hidden')) {
            // If currently hidden, show and fetch
            generatedDescriptionDiv.classList.remove('hidden');
            elaborateProjectDescription(projectTitle, projectDescription, generatedDescriptionDiv, loader);
        } else {
            // If currently visible, hide
            generatedDescriptionDiv.classList.add('hidden');
            generatedDescriptionDiv.querySelector('p').innerText = ''; // Clear content
        }
    });
});
