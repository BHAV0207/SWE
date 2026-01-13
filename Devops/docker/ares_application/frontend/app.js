const API_URL = 'http://localhost:8000/api';

const namesList = document.getElementById('names-list');
const loadingState = document.getElementById('loading');
const errorState = document.getElementById('error-message');
const emptyState = document.getElementById('empty-state');
const refreshBtn = document.getElementById('refresh-btn');

async function fetchNames() {
    // Reset states
    namesList.classList.add('hidden');
    errorState.classList.add('hidden');
    emptyState.classList.add('hidden');
    loadingState.classList.remove('hidden');

    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        const data = result.data;

        if (!data || data.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            renderNames(data);
            namesList.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Fetch error:', error);
        errorState.classList.remove('hidden');
    } finally {
        loadingState.classList.add('hidden');
    }
}

function renderNames(names) {
    namesList.innerHTML = '';
    
    names.forEach(name => {
        const li = document.createElement('li');
        li.className = 'name-item';
        
        const firstLetter = name[0];
        
        li.innerHTML = `
            <div class="avatar">${firstLetter}</div>
            <div class="name">${name}</div>
        `;
        
        namesList.appendChild(li);
    });
}

// Initial fetch
fetchNames();

// Refresh button listener
refreshBtn.addEventListener('click', fetchNames);
