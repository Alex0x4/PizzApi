const API_URL = 'https://localhost:7160';
let currentPizza = null;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('searchButton').onclick = searchPizza;
    document.getElementById('search').onkeypress = (e) => { if(e.key === 'Enter') searchPizza(); };
    
    document.getElementById('saveEdit').onclick = saveEditPizza;
    document.getElementById('addIng').onclick = addIngrediente;
    document.getElementById('confirmDelete').onclick = deletePizza;
    
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.onclick = () => {
            document.getElementById('editModal').style.display = 'none';
            document.getElementById('ingModal').style.display = 'none';
            document.getElementById('deleteModal').style.display = 'none';
        };
    });
    
    window.onclick = (e) => {
        if(e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    };
});

async function searchPizza() {
    const nome = document.getElementById('search').value.trim();
    if(!nome) return;
    
    try {
        const res = await fetch(`${API_URL}/pizza/nome/${encodeURIComponent(nome)}`);
        if(!res.ok) throw new Error('Pizza non trovata');
        
        currentPizza = await res.json();
        displayPizza(currentPizza);
    } catch(err) {
        document.getElementById('results').innerHTML = `<div class="pizza-card"><p>❌ ${err.message}</p></div>`;
        currentPizza = null;
    }
}

function displayPizza(pizza) {
    const ingList = pizza.ingredienti?.join(', ') || 'Nessun ingrediente';
    
    document.getElementById('results').innerHTML = `
        <div class="pizza-card">
            <h3>🍕 ${pizza.nome_pizza}</h3>
            ${pizza.img_pizza ? `<img src="${pizza.img_pizza}">` : ''}
            <p><strong>Ingredienti:</strong> ${ingList}</p>
            <div class="pizza-actions">
                <button class="edit-btn" onclick="openEditModal()">Modifica</button>
                <button class="ingredients-btn" onclick="openIngModal()">Ingredienti</button>
                <button class="delete-btn" onclick="openDeleteModal()">Elimina</button>
            </div>
        </div>
    `;
}

function openEditModal() {
    document.getElementById('editNome').value = currentPizza.nome_pizza;
    document.getElementById('editImg').value = currentPizza.img_pizza || '';
    document.getElementById('editModal').style.display = 'block';
}

async function saveEditPizza() {
    const newNome = document.getElementById('editNome').value.trim();
    const newImg = document.getElementById('editImg').value.trim();
    if(!newNome) return;
    
    await fetch(`${API_URL}/pizze/${currentPizza.id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({nome_pizza: newNome, img_pizza: newImg})
    });
    
    document.getElementById('editModal').style.display = 'none';
    currentPizza.nome_pizza = newNome;
    currentPizza.img_pizza = newImg;
    displayPizza(currentPizza);
}

async function openIngModal() {
    const ingList = document.getElementById('ingList');
    if(currentPizza.ingredienti?.length) {
        ingList.innerHTML = currentPizza.ingredienti.map(ing => `
            <div class="ing-item">
                <span>🧄 ${ing}</span>
                <button onclick="removeIngrediente('${ing}')">✖</button>
            </div>
        `).join('');
    } else {
        ingList.innerHTML = '<p>Nessun ingrediente</p>';
    }
    
    document.getElementById('newIng').value = '';
    document.getElementById('ingModal').style.display = 'block';
}

async function addIngrediente() {
    const nomeIng = document.getElementById('newIng').value.trim();
    if(!nomeIng) return;
    
    // Crea ingrediente
    const res1 = await fetch(`${API_URL}/ingredienti`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({nome_ingrediente: nomeIng})
    });
    const newIng = await res1.json();
    
    // Associa alla pizza
    await fetch(`${API_URL}/pizza/${currentPizza.id}/ingrediente/${newIng.id}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
    });
    
    // Ricarica la pizza
    const res2 = await fetch(`${API_URL}/pizza/nome/${encodeURIComponent(currentPizza.nome_pizza)}`);
    currentPizza = await res2.json();
    displayPizza(currentPizza);
    openIngModal(); // Ricarica la lista
}

async function removeIngrediente(nome) {
    // Trova ID ingrediente
    const res = await fetch(`${API_URL}/ingredienti`);
    const ingredienti = await res.json();
    const ing = ingredienti.find(i => i.nome_ingrediente === nome);
    
    if(ing) {
        await fetch(`${API_URL}/pizza/${currentPizza.id}/ingrediente/${ing.id}`, {method: 'DELETE'});
        
        const res2 = await fetch(`${API_URL}/pizza/nome/${encodeURIComponent(currentPizza.nome_pizza)}`);
        currentPizza = await res2.json();
        displayPizza(currentPizza);
        openIngModal();
    }
}

function openDeleteModal() {
    document.getElementById('deleteModal').style.display = 'block';
}

async function deletePizza() {
    await fetch(`${API_URL}/pizze/${currentPizza.id}`, {method: 'DELETE'});
    document.getElementById('deleteModal').style.display = 'none';
    document.getElementById('results').innerHTML = '';
    document.getElementById('search').value = '';
    currentPizza = null;
}