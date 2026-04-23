async function SearchPizza() {
    const nome = document.getElementById("search").value;

    // Si el campo está vacío, podrías llamar a /pizze o no hacer nada
    if (!nome) return;

    try {
        // Llamamos al endpoint específico que definiste: /pizza/nome/{nome}
        const respuesta = await fetch(`https://localhost:7160/pizza/nome/${nome}`); 
        
        if (!respuesta.ok) {
            throw new Error("Pizza non trovata");
        }

        const pizza = await respuesta.json();
        
        // Aquí ya tienes la pizza con sus ingredientes
        console.log("Datos de la pizza:", pizza);
        renderPizza(pizza); // Función para mostrarla en el HTML

    } catch (error) {
        console.error("Error:", error.message);
        alert("La pizza non è stata trovata");
    }
}

// Ejemplo de cómo mostrar los datos
function renderPizza(pizza) {
    const container = document.getElementById("resultado"); // Asegúrate de tener este ID en tu HTML
    container.innerHTML = `
        <h3>${pizza.nome_pizza}</h3>
        <img src="${pizza.img_pizza}" alt="${pizza.nome_pizza}" width="200">
        <p><strong>Ingredienti:</strong> ${pizza.ingredienti.join(", ")}</p>
    `;
}
