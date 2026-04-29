document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', SearchPizza);
    }
    
    //enter buttom
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                SearchPizza();
            }
        });
    }
});

async function SearchPizza() {
    const nome = document.getElementById("search").value.trim(); 

    if (!nome) {
        alert("Per favore, inserisci il nome di una pizza");
        return;
    }

    try {
        // cercando.. (togliere commento dopo)
        //const resultsContainer = document.getElementById("results");
        //resultsContainer.innerHTML = "<p>🔍 Cercando pizza...</p>";
        
        // chiamata END POINT
        const respuesta = await fetch(`https://localhost:7160/pizza/nome/${encodeURIComponent(nome)}`); 
        
        if (!respuesta.ok) {
            if (respuesta.status === 404) {
                throw new Error("Pizza non trovata");
            }
            throw new Error(`Errore del server: ${respuesta.status}`);
        }

        const pizza = await respuesta.json();
        
        console.log("Dati della pizza:", pizza);
        renderPizza(pizza);

    } catch (error) {
        console.error("Error:", error.message);
        const resultsContainer = document.getElementById("results");
        resultsContainer.innerHTML = `<p class="error">❌ ${error.message}</p>`;
    }
}


function renderPizza(pizza) {
    const container = document.getElementById("results");
    
    let ingredientesHTML = "";
    if (pizza.ingredienti) {
        if (Array.isArray(pizza.ingredienti)) {
            ingredientesHTML = pizza.ingredienti.join(", ");
        } else {
            ingredientesHTML = pizza.ingredienti;
        }
    } else {
        ingredientesHTML = "Nessun ingrediente specificato";
    }
    
    container.innerHTML = `
        <div class="pizza-card">
            <h3>🍕 ${pizza.nome_pizza || pizza.nome || "Pizza"} 🍕</h3>
            ${pizza.img_pizza ? `<img src="${pizza.img_pizza}" alt="${pizza.nome_pizza || pizza.nome}" class="pizza-image">` : ''}
            <p><strong>📝 Ingredienti:</strong> ${ingredientesHTML}</p>
        </div>
    `;
}












// Configurazione API
const API_BASE_URL = 'http://localhost:5000'; // Cambia con la tua porta

// Helper per fetch con gestione errori
async function fetchAPI(url, method = 'GET', body = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(`${API_BASE_URL}${url}`, options);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Fetch error:', error);
        return { success: false, error: error.message };
    }
}

// ==================== FUNZIONI GET (READ) ====================

// Ottieni tutte le pizze
async function getAllPizze() {
    const result = await fetchAPI('/pizze');
    if (result.success) {
        return result.data;
    }
    throw new Error(result.error);
}

// Ottieni tutti gli ingredienti
async function getAllIngredienti() {
    const result = await fetchAPI('/ingredienti');
    if (result.success) {
        return result.data;
    }
    throw new Error(result.error);
}


// ==================== FUNZIONI POST (CREATE) ====================

// Aggiungi nuova pizza
async function addPizza(nome_pizza, img_pizza) {
    const nuovaPizza = {
        nome_pizza: nome_pizza,
        img_pizza: img_pizza || 'default.png'
    };
    
    const result = await fetchAPI('/pizze', 'POST', nuovaPizza);
    if (result.success) {
        return result.data;
    }
    throw new Error(result.error);
}

// Aggiungi nuovo ingrediente
async function addIngrediente(nome_ingrediente) {
    const nuovoIngrediente = {
        nome_ingrediente: nome_ingrediente
    };
    
    const result = await fetchAPI('/ingredienti', 'POST', nuovoIngrediente);
    if (result.success) {
        return result.data;
    }
    throw new Error(result.error);
}

// Aggiungi ingrediente a una pizza
async function addIngredienteToPizza(pizzaId, ingredienteId) {
    const result = await fetchAPI(`/pizza/${pizzaId}/ingrediente/${ingredienteId}`, 'POST');
    if (result.success) {
        return result.data;
    }
    throw new Error(result.error);
}

// ==================== FUNZIONI PUT (UPDATE) ====================

// Aggiorna pizza
async function updatePizza(id, nome_pizza, img_pizza) {
    const pizzaAggiornata = {
        nome_pizza: nome_pizza,
        img_pizza: img_pizza
    };
    
    const result = await fetchAPI(`/pizze/${id}`, 'PUT', pizzaAggiornata);
    if (result.success) {
        return result.data;
    }
    throw new Error(result.error);
}

// Aggiorna ingrediente
async function updateIngrediente(id, nome_ingrediente) {
    const ingredienteAggiornato = {
        nome_ingrediente: nome_ingrediente
    };
    
    const result = await fetchAPI(`/ingredienti/${id}`, 'PUT', ingredienteAggiornato);
    if (result.success) {
        return result.data;
    }
    throw new Error(result.error);
}

// ==================== FUNZIONI DELETE (DELETE) ====================

// Elimina pizza
async function deletePizza(id) {
    const result = await fetchAPI(`/pizze/${id}`, 'DELETE');
    if (result.success) {
        return result.data;
    }
    throw new Error(result.error);
}

// Elimina ingrediente
async function deleteIngrediente(id) {
    const result = await fetchAPI(`/ingredienti/${id}`, 'DELETE');
    if (result.success) {
        return result.data;
    }
    throw new Error(result.error);
}

// Rimuovi ingrediente da una pizza
async function removeIngredienteFromPizza(pizzaId, ingredienteId) {
    const result = await fetchAPI(`/pizza/${pizzaId}/ingrediente/${ingredienteId}`, 'DELETE');
    if (result.success) {
        return result.data;
    }
    throw new Error(result.error);
}

// ==================== ESEMPI DI UTILIZZO ====================

/*
// Esempio 1: Aggiungere una nuova pizza
async function esempioAggiungiPizza() {
    try {
        const nuovaPizza = await addPizza('Pizza Speciale', 'speciale.png');
        console.log('Pizza aggiunta:', nuovaPizza);
        alert(`Pizza "${nuovaPizza.nome_pizza}" aggiunta con successo!`);
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore: ' + error.message);
    }
}

// Esempio 2: Aggiungere un ingrediente a una pizza
async function esempioAggiungiIngredienteAPizza() {
    try {
        const result = await addIngredienteToPizza(1, 5);
        console.log('Result:', result);
        alert(result.message || 'Ingrediente aggiunto alla pizza!');
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore: ' + error.message);
    }
}

// Esempio 3: Modificare una pizza
async function esempioModificaPizza() {
    try {
        const pizzaModificata = await updatePizza(1, 'Margherita Deluxe', 'margherita_deluxe.png');
        console.log('Pizza modificata:', pizzaModificata);
        alert('Pizza modificata con successo!');
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore: ' + error.message);
    }
}

// Esempio 4: Eliminare una pizza
async function esempioEliminaPizza() {
    const conferma = confirm('Sei sicuro di voler eliminare questa pizza?');
    if (conferma) {
        try {
            const result = await deletePizza(21);
            console.log('Result:', result);
            alert(result.message || 'Pizza eliminata con successo!');
        } catch (error) {
            console.error('Errore:', error);
            alert('Errore: ' + error.message);
        }
    }
}

// Esempio 5: Visualizzare pizza con ingredienti
async function esempioMostraPizzaConIngredienti() {
    try {
        const pizza = await getPizzaWithIngredients(1);
        console.log('Pizza:', pizza.nome_pizza);
        console.log('Ingredienti:', pizza.ingredienti);
        
        let message = `🍕 ${pizza.nome_pizza}\n`;
        message += `Ingredienti:\n`;
        pizza.ingredienti.forEach(ing => {
            message += `- ${ing.nome_ingrediente}\n`;
        });
        alert(message);
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore: ' + error.message);
    }
}

// Esempio 6: Trovare pizze con un ingrediente specifico
async function esempioCercaPizzePerIngrediente() {
    try {
        const result = await getPizzeByIngrediente(2); // ID 2 = Mozzarella
        console.log(`Pizze con "${result.nome_ingrediente}":`, result.pizze);
        
        let message = `🧄 ${result.nome_ingrediente}\n`;
        message += `Trovato in ${result.pizze.length} pizze:\n`;
        result.pizze.forEach(pizza => {
            message += `- ${pizza.nome_pizza}\n`;
        });
        alert(message);
    } catch (error) {
        console.error('Errore:', error);
        alert('Errore: ' + error.message);
    }
}
*/

// ==================== FUNZIONI PER FORM HTML ====================

// Funzione per aggiungere pizza da form
async function onSubmitAggiungiPizza() {
    const nome = document.getElementById('nomePizza').value;
    const img = document.getElementById('imgPizza').value;
    
    if (!nome) {
        alert('Inserisci il nome della pizza');
        return;
    }
    
    try {
        const result = await addPizza(nome, img);
        alert(`✅ Pizza "${result.nome_pizza}" aggiunta con successo! (ID: ${result.id})`);
        document.getElementById('nomePizza').value = '';
        document.getElementById('imgPizza').value = '';
        // Ricarica le select se necessario
        await loadPizzeSelect('pizzaSelect');
        await loadPizzeSelect('pizzaSelectDelete');
        await loadPizzeSelect('pizzaSelectUpdate');
        await loadPizzeSelect('pizzaSelectAddIngrediente');
        await loadPizzeSelect('pizzaSelectRemoveIngrediente');
    } catch (error) {
        alert(`❌ Errore: ${error.message}`);
    }
}

// Funzione per aggiungere ingrediente da form
async function onSubmitAggiungiIngrediente() {
    const nome = document.getElementById('nomeIngrediente').value;
    
    if (!nome) {
        alert('Inserisci il nome dell\'ingrediente');
        return;
    }
    
    try {
        const result = await addIngrediente(nome);
        alert(`✅ Ingrediente "${result.nome_ingrediente}" aggiunto con successo! (ID: ${result.id})`);
        document.getElementById('nomeIngrediente').value = '';
        // Ricarica le select
        await loadIngredientiSelect('ingredienteSelect');
        await loadIngredientiSelect('ingredienteSelectDelete');
        await loadIngredientiSelect('ingredienteSelectUpdate');
        await loadIngredientiSelect('ingredienteSelectAdd');
        await loadIngredientiSelect('ingredienteSelectRemove');
    } catch (error) {
        alert(`❌ Errore: ${error.message}`);
    }
}

// Funzione per aggiungere ingrediente a pizza da form
async function onSubmitAggiungiIngredienteAPizza() {
    const pizzaId = document.getElementById('pizzaSelectAddIngrediente').value;
    const ingredienteId = document.getElementById('ingredienteSelectAdd').value;
    
    if (!pizzaId || !ingredienteId) {
        alert('Seleziona sia la pizza che l\'ingrediente');
        return;
    }
    
    try {
        const result = await addIngredienteToPizza(parseInt(pizzaId), parseInt(ingredienteId));
        alert(`✅ ${result.message}`);
    } catch (error) {
        alert(`❌ Errore: ${error.message}`);
    }
}

// Funzione per modificare pizza da form
async function onSubmitModificaPizza() {
    const pizzaId = document.getElementById('pizzaSelectUpdate').value;
    const nome = document.getElementById('updateNomePizza').value;
    const img = document.getElementById('updateImgPizza').value;
    
    if (!pizzaId) {
        alert('Seleziona una pizza da modificare');
        return;
    }
    
    if (!nome) {
        alert('Inserisci il nuovo nome della pizza');
        return;
    }
    
    try {
        const result = await updatePizza(parseInt(pizzaId), nome, img);
        alert(`✅ Pizza modificata con successo!`);
        document.getElementById('updateNomePizza').value = '';
        document.getElementById('updateImgPizza').value = '';
        // Ricarica le select
        await loadPizzeSelect('pizzaSelect');
        await loadPizzeSelect('pizzaSelectDelete');
        await loadPizzeSelect('pizzaSelectUpdate');
        await loadPizzeSelect('pizzaSelectAddIngrediente');
        await loadPizzeSelect('pizzaSelectRemoveIngrediente');
    } catch (error) {
        alert(`❌ Errore: ${error.message}`);
    }
}

// Funzione per modificare ingrediente da form
async function onSubmitModificaIngrediente() {
    const ingredienteId = document.getElementById('ingredienteSelectUpdate').value;
    const nome = document.getElementById('updateNomeIngrediente').value;
    
    if (!ingredienteId) {
        alert('Seleziona un ingrediente da modificare');
        return;
    }
    
    if (!nome) {
        alert('Inserisci il nuovo nome dell\'ingrediente');
        return;
    }
    
    try {
        const result = await updateIngrediente(parseInt(ingredienteId), nome);
        alert(`✅ Ingrediente modificato con successo!`);
        document.getElementById('updateNomeIngrediente').value = '';
        // Ricarica le select
        await loadIngredientiSelect('ingredienteSelect');
        await loadIngredientiSelect('ingredienteSelectDelete');
        await loadIngredientiSelect('ingredienteSelectUpdate');
        await loadIngredientiSelect('ingredienteSelectAdd');
        await loadIngredientiSelect('ingredienteSelectRemove');
    } catch (error) {
        alert(`❌ Errore: ${error.message}`);
    }
}

// Funzione per eliminare pizza
async function onDeletePizza() {
    const pizzaId = document.getElementById('pizzaSelectDelete').value;
    
    if (!pizzaId) {
        alert('Seleziona una pizza da eliminare');
        return;
    }
    
    const conferma = confirm('⚠️ Sei sicuro di voler eliminare questa pizza? Verranno eliminate anche tutte le relazioni.');
    if (conferma) {
        try {
            const result = await deletePizza(parseInt(pizzaId));
            alert(`✅ ${result.message}`);
            // Ricarica le select
            await loadPizzeSelect('pizzaSelect');
            await loadPizzeSelect('pizzaSelectDelete');
            await loadPizzeSelect('pizzaSelectUpdate');
            await loadPizzeSelect('pizzaSelectAddIngrediente');
            await loadPizzeSelect('pizzaSelectRemoveIngrediente');
        } catch (error) {
            alert(`❌ Errore: ${error.message}`);
        }
    }
}

// Funzione per eliminare ingrediente
async function onDeleteIngrediente() {
    const ingredienteId = document.getElementById('ingredienteSelectDelete').value;
    
    if (!ingredienteId) {
        alert('Seleziona un ingrediente da eliminare');
        return;
    }
    
    const conferma = confirm('⚠️ Sei sicuro di voler eliminare questo ingrediente? Verranno eliminate anche tutte le relazioni.');
    if (conferma) {
        try {
            const result = await deleteIngrediente(parseInt(ingredienteId));
            alert(`✅ ${result.message}`);
            // Ricarica le select
            await loadIngredientiSelect('ingredienteSelect');
            await loadIngredientiSelect('ingredienteSelectDelete');
            await loadIngredientiSelect('ingredienteSelectUpdate');
            await loadIngredientiSelect('ingredienteSelectAdd');
            await loadIngredientiSelect('ingredienteSelectRemove');
        } catch (error) {
            alert(`❌ Errore: ${error.message}`);
        }
    }
}

// Funzione per rimuovere ingrediente da pizza
async function onSubmitRimuoviIngredienteDaPizza() {
    const pizzaId = document.getElementById('pizzaSelectRemoveIngrediente').value;
    const ingredienteId = document.getElementById('ingredienteSelectRemove').value;
    
    if (!pizzaId || !ingredienteId) {
        alert('Seleziona sia la pizza che l\'ingrediente da rimuovere');
        return;
    }
    
    const conferma = confirm('⚠️ Sei sicuro di voler rimuovere questo ingrediente dalla pizza?');
    if (conferma) {
        try {
            const result = await removeIngredienteFromPizza(parseInt(pizzaId), parseInt(ingredienteId));
            alert(`✅ ${result.message}`);
        } catch (error) {
            alert(`❌ Errore: ${error.message}`);
        }
    }
}

// Funzione per visualizzare pizza con ingredienti
async function onVisualizzaPizza() {
    const pizzaId = document.getElementById('pizzaSelect').value;
    
    if (!pizzaId) {
        alert('Seleziona una pizza da visualizzare');
        return;
    }
    
    try {
        const pizza = await getPizzaWithIngredients(parseInt(pizzaId));
        let message = `🍕 ${pizza.nome_pizza}\n`;
        message += `📷 Immagine: ${pizza.img_pizza}\n`;
        message += `\n📋 Ingredienti:\n`;
        if (pizza.ingredienti.length === 0) {
            message += `- Nessun ingrediente\n`;
        } else {
            pizza.ingredienti.forEach(ing => {
                message += `- ${ing.nome_ingrediente}\n`;
            });
        }
        alert(message);
    } catch (error) {
        alert(`❌ Errore: ${error.message}`);
    }
}

// Funzione per cercare pizze per ingrediente
async function onCercaPizzePerIngrediente() {
    const ingredienteId = document.getElementById('ingredienteSelect').value;
    
    if (!ingredienteId) {
        alert('Seleziona un ingrediente');
        return;
    }
    
    try {
        const result = await getPizzeByIngrediente(parseInt(ingredienteId));
        let message = `🧄 ${result.nome_ingrediente}\n`;
        message += `📊 Trovato in ${result.pizze.length} pizze:\n\n`;
        
        if (result.pizze.length === 0) {
            message += `Nessuna pizza contiene questo ingrediente`;
        } else {
            result.pizze.forEach(pizza => {
                message += `🍕 ${pizza.nome_pizza}\n`;
            });
        }
        alert(message);
    } catch (error) {
        alert(`❌ Errore: ${error.message}`);
    }
}

// Inizializza le select quando la pagina carica
async function initializeSelects() {
    await loadPizzeSelect('pizzaSelect');
    await loadPizzeSelect('pizzaSelectDelete');
    await loadPizzeSelect('pizzaSelectUpdate');
    await loadPizzeSelect('pizzaSelectAddIngrediente');
    await loadPizzeSelect('pizzaSelectRemoveIngrediente');
    
    await loadIngredientiSelect('ingredienteSelect');
    await loadIngredientiSelect('ingredienteSelectDelete');
    await loadIngredientiSelect('ingredienteSelectUpdate');
    await loadIngredientiSelect('ingredienteSelectAdd');
    await loadIngredientiSelect('ingredienteSelectRemove');
}

// Test connessione API
async function testConnection() {
    try {
        await getAllPizze();
        console.log('✅ API connessa con successo!');
        return true;
    } catch (error) {
        console.error('❌ Errore di connessione API:', error);
        alert(`⚠️ Impossibile connettersi all'API su ${API_BASE_URL}. Assicurati che il server sia in esecuzione.`);
        return false;
    }
}

// Avvio quando la pagina è caricata
document.addEventListener('DOMContentLoaded', async () => {
    await testConnection();
    await initializeSelects();
});