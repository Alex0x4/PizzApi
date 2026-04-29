const URL_API = 'https://localhost:7160';
let pizzaCorrente = null;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('searchButton').onclick = cercaPizza;
    document.getElementById('search').onkeypress = (e) => { if (e.key === 'Enter') cercaPizza(); };

    document.getElementById('saveEdit').onclick = salvaModificaPizza;
    document.getElementById('addIng').onclick = aggiungiIngrediente;
    document.getElementById('confirmDelete').onclick = eliminaPizza;

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.onclick = () => {
            document.getElementById('editModal').style.display = 'none';
            document.getElementById('ingModal').style.display = 'none';
            document.getElementById('deleteModal').style.display = 'none';
        };
    });

    window.onclick = (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    };
});

async function cercaPizza() {
    const nome = document.getElementById('search').value.trim();
    if (!nome) return;

    try {
        const risposta = await fetch(`${URL_API}/pizza/nome/${encodeURIComponent(nome)}`);
        if (!risposta.ok) throw new Error('Pizza non trovata');

        pizzaCorrente = await risposta.json();
        mostraPizza(pizzaCorrente);
    } catch (errore) {
        document.getElementById('results').innerHTML = `<div class="pizza-card"><p>❌ ${errore.message}</p></div>`;
        pizzaCorrente = null;
    }
}

function mostraPizza(pizza) {
    const listaIngredienti = pizza.ingredienti?.join(', ') || 'Nessun ingrediente';

    document.getElementById('results').innerHTML = `
        <div class="pizza-card">
            <h3> ${pizza.nome_pizza}</h3>
            ${pizza.img_pizza ? `<img src="${pizza.img_pizza}">` : ''}
            <p><strong>Ingredienti:</strong> ${listaIngredienti}</p>
            <div class="pizza-actions">
                <button class="edit-btn" onclick="apriModaleModifica()">Modifica</button>
                <button class="ingredients-btn" onclick="apriModaleIngredienti()">Ingredienti</button>
                <button class="delete-btn" onclick="apriModaleElimina()">Elimina</button>
            </div>
        </div>
    `;
}

function apriModaleModifica() {
    document.getElementById('editNome').value = pizzaCorrente.nome_pizza;
    document.getElementById('editImg').value = pizzaCorrente.img_pizza || '';
    document.getElementById('editModal').style.display = 'block';
}

async function salvaModificaPizza() {
    const nuovoNome = document.getElementById('editNome').value.trim();
    const nuovaImg = document.getElementById('editImg').value.trim();
    if (!nuovoNome) return;

    await fetch(`${URL_API}/pizze/${pizzaCorrente.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome_pizza: nuovoNome, img_pizza: nuovaImg })
    });

    document.getElementById('editModal').style.display = 'none';
    pizzaCorrente.nome_pizza = nuovoNome;
    pizzaCorrente.img_pizza = nuovaImg;
    mostraPizza(pizzaCorrente);
}

async function apriModaleIngredienti() {
    const listaIng = document.getElementById('ingList');
    if (pizzaCorrente.ingredienti?.length) {
        listaIng.innerHTML = pizzaCorrente.ingredienti.map(ing => `
            <div class="ing-item">
                <span>🧄 ${ing}</span>
                <button onclick="rimuoviIngrediente('${ing}')">✖</button>
            </div>
        `).join('');
    } else {
        listaIng.innerHTML = '<p>Nessun ingrediente</p>';
    }

    document.getElementById('newIng').value = '';
    document.getElementById('ingModal').style.display = 'block';
}

async function aggiungiIngrediente() {
    const nomeIng = document.getElementById('newIng').value.trim();
    if (!nomeIng) return;

    // aggiunge ingrediente
    const risposta1 = await fetch(`${URL_API}/ingredienti`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome_ingrediente: nomeIng })
    });
    const nuovoIng = await risposta1.json();

    // Associa alla pizza
    await fetch(`${URL_API}/pizza/${pizzaCorrente.id}/ingrediente/${nuovoIng.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });

    // Ricarica la pizza
    const risposta2 = await fetch(`${URL_API}/pizza/nome/${encodeURIComponent(pizzaCorrente.nome_pizza)}`);
    pizzaCorrente = await risposta2.json();
    mostraPizza(pizzaCorrente);
    apriModaleIngredienti(); // Ricarica la lista
}

async function rimuoviIngrediente(nome) {
    // Tro ID ingrediente
    const risposta = await fetch(`${URL_API}/ingredienti`);
    const ingredienti = await risposta.json();
    const ing = ingredienti.find(i => i.nome_ingrediente === nome);

    if (ing) {
        await fetch(`${URL_API}/pizza/${pizzaCorrente.id}/ingrediente/${ing.id}`, { method: 'DELETE' });

        const risposta2 = await fetch(`${URL_API}/pizza/nome/${encodeURIComponent(pizzaCorrente.nome_pizza)}`);
        pizzaCorrente = await risposta2.json();
        mostraPizza(pizzaCorrente);
        apriModaleIngredienti();
    }
}

function apriModaleElimina() {
    document.getElementById('deleteModal').style.display = 'block';
}

async function eliminaPizza() {
    await fetch(`${URL_API}/pizze/${pizzaCorrente.id}`, { method: 'DELETE' });
    document.getElementById('deleteModal').style.display = 'none';
    document.getElementById('results').innerHTML = '';
    document.getElementById('search').value = '';
    pizzaCorrente = null;
}