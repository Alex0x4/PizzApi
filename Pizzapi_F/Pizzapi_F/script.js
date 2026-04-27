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