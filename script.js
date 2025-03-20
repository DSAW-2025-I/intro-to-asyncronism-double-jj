document.addEventListener("DOMContentLoaded", () => {
    const pokemonContainer = document.getElementById("pokemon-container");
    const searchNameInput = document.getElementById("search-name");
    const searchNumberInput = document.getElementById("search-number");
    const searchTypeInput = document.getElementById("search-type");
    const closeModalButton = document.querySelector(".close-modal");
    const pokemonModal = document.getElementById("pokemon-modal");
    const searchNameBtn = document.querySelector("#search-name + button");
    const searchNumberBtn = document.querySelector("#search-number + button");
    const searchTypeBtn = document.querySelector("#search-type + button");
    const chatbotBubble = document.getElementById("chatbot-bubble");
    const chatbotContainer = document.getElementById("chatbot-container");
    const closeChatbot = document.getElementById("close-chatbot");
    const chatbotMessages = document.getElementById("chatbot-messages");
    const chatbotInput = document.getElementById("chatbot-input");
    const chatbotSend = document.getElementById("chatbot-send");
    const loadMoreButton = document.getElementById("load-more");
    const volverInicioButton = document.getElementById("volver-inicio");

    
    chatbotBubble.addEventListener("click", () => {
        chatbotContainer.style.display = "flex";
    });

  
    closeChatbot.addEventListener("click", () => {
        chatbotContainer.style.display = "none";
    });

    chatbotSend.addEventListener("click", async () => {
        const pregunta = chatbotInput.value.trim();
        if (!pregunta) return;
    
        
        chatbotMessages.innerHTML += `<div class="user-message"><strong>Tú:</strong> ${pregunta}</div>`;
    
        
        chatbotMessages.innerHTML += `<div class="bot-message"><em>Cargando...</em></div>`;
    
        chatbotInput.value = ""; 
    
        
        const respuesta = await obtenerRespuestaGemini(pregunta);
    
        
        chatbotMessages.lastChild.outerHTML = `<div class="bot-message"><strong>IA:</strong> ${respuesta}</div>`;
    
        
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    });

    
    async function obtenerRespuestaGemini(pregunta) {
        const API_KEY = "AIzaSyDxx9AlebKYhXRfWspVXWR766x0sNeHd4k"; 
        const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    
        
        const prompt = `Eres un experto en Pokémon. Responde de manera clara y detallada a la siguiente pregunta: ${pregunta}`;
        
        const requestBody = {
            contents: [{ parts: [{ text: prompt }] }]
        };
    
        try {
            const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });
    
            const data = await response.json();
            if (data.candidates && data.candidates.length > 0) {
                return data.candidates[0].content.parts?.map(part => part.text).join(" ") || "No se obtuvo una respuesta válida.";
            } else {
                return "No se obtuvo una respuesta válida.";
            }
        } catch (error) {
            console.error("Error al llamar a Gemini:", error);
            return "Hubo un error al obtener la respuesta.";
        }
    }

    // Validar que los elementos existan antes de asignar eventos

    if (closeModalButton) {
        closeModalButton.addEventListener("click", cerrarModal);
    } else {
        console.error("El botón de cierre del modal no se encontró en el DOM.");
    }
    
    if (searchNameBtn) {
        searchNameBtn.addEventListener("click", buscarPorNombre);
    } else {
        console.error("El botón de búsqueda por nombre no se encontró en el DOM.");
    }

    if (searchNumberBtn) {
        searchNumberBtn.addEventListener("click", buscarPorNumero);
    } else {
        console.error("El botón de búsqueda por número no se encontró en el DOM.");
    }

    if (searchTypeBtn) {
        searchTypeBtn.addEventListener("click", buscarPorTipo);
    } else {
        console.error("El botón de búsqueda por tipo no se encontró en el DOM.");
    }

    if (loadMoreButton) {
        loadMoreButton.addEventListener("click", cargarMas);
    } else {
        console.error("El botón 'Cargar más' no se encontró en el DOM.");
    }

    if (volverInicioButton) {
        volverInicioButton.addEventListener("click", volverAlInicio);
    } else {
        console.error("El botón 'Volver al inicio' no se encontró en el DOM.");
    }

    if (closeModalButton) {
        closeModalButton.addEventListener("click", cerrarModal);
    } else {
        console.error("El botón 'Cerrar modal' no se encontró en el DOM.");
    }



    const typeImages = {
        normal: "img/types/normal.svg",
        fire: "img/types/fire.svg",
        water: "img/types/water.svg",
        electric: "img/types/electric.svg",
        grass: "img/types/grass.svg",
        ice: "img/types/ice.svg",
        fighting: "img/types/fighting.svg",
        poison: "img/types/poison.svg",
        ground: "img/types/ground.svg",
        flying: "img/types/flying.svg",
        psychic: "img/types/psychic.svg",
        bug: "img/types/bug.svg",
        rock: "img/types/rock.svg",
        ghost: "img/types/ghost.svg",
        dragon: "img/types/dragon.svg",
        dark: "img/types/dark.svg",
        steel: "img/types/steel.svg",
        fairy: "img/types/fairy.svg"
    };

    let offset = 0;
    const limit = 150;
    let pokemons = [];
    let currentIndex = 0;


    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && pokemonModal.style.display === "flex") {
            cerrarModal();
        }
    });

    async function cargarTipos() {
        const response = await fetch("https://pokeapi.co/api/v2/type");
        const data = await response.json();
        data.results.forEach(type => {
            const option = document.createElement("option");
            option.value = type.name;
            option.textContent = type.name;
            searchTypeInput.appendChild(option);
        });
    }

    async function iniciar() {
        offset = 0;
        limpiarContenedor();
        mostrarBotonVolver(true);
        await cargarPokemon();
        cargarTipos();
    }

    async function cargarPokemon() {
        const loader = document.getElementById("loader");
        loader.style.display = "block";
        pokemonContainer.style.display = "none";
    
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
            const data = await response.json();
            const promises = data.results.map(pokemon => fetch(pokemon.url).then(res => res.json()));
            const nuevosPokemons = await Promise.all(promises);
    
            // Agregar los nuevos Pokémon a la lista existente
            pokemons = [...pokemons, ...nuevosPokemons];
    
            nuevosPokemons.forEach(mostrarPokemon);
        } catch (error) {
            console.error("Error al cargar Pokémon:", error);
        } finally {
            loader.style.display = "none";
            pokemonContainer.style.display = "flex";
        }
    }
    function mostrarPokemon(pokemon) {
        const card = document.createElement("div");
        card.className = "pokemon-card";

        const types = pokemon.types.map(t => `<img src="${typeImages[t.type.name]}" class="type-icon">`).join("");

        card.innerHTML = `
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <div class="name">#${pokemon.id} ${pokemon.name.toUpperCase()}</div>
            <div class="type-container">${types}</div>
        `;
        card.addEventListener("click", () => abrirModal(pokemon));
        pokemonContainer.appendChild(card);
    }

    async function buscarPorNombre() {
        const nombre = searchNameInput.value.trim().toLowerCase();
        if (!nombre) return;

        limpiarContenedor();
        manejarBusqueda(() => fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`));
    }

    async function buscarPorNumero() {
        const numero = parseInt(searchNumberInput.value.trim(), 10);
        if (isNaN(numero) || numero < 1) return;

        limpiarContenedor();
        manejarBusqueda(() => fetch(`https://pokeapi.co/api/v2/pokemon/${numero}`));
    }

    async function buscarPorTipo() {
        const tipo = searchTypeInput.value;
        if (!tipo) return;

        limpiarContenedor();
        manejarBusqueda(async () => {
            const response = await fetch(`https://pokeapi.co/api/v2/type/${tipo}`);
            const data = await response.json();
            const promises = data.pokemon.slice(0, 100).map(p => fetch(p.pokemon.url).then(res => res.json()));
            return Promise.all(promises);
        });
    }

    async function manejarBusqueda(fetchFunction) {
        try {
            const data = await fetchFunction();
            const result = Array.isArray(data) ? data : [await data.json()];
            if (result.length === 0) throw new Error("No se encontraron Pokémon.");
            result.forEach(mostrarPokemon);
            mostrarBotonVolver(true);
            loadMoreButton.style.display = "none";
        } catch {
            alert("Pokémon no encontrado.");
        }
    }

    async function abrirModal(pokemon) {
        currentIndex = pokemons.findIndex(p => p.id === pokemon.id);
        const speciesRes = await fetch(pokemon.species.url);
        const speciesData = await speciesRes.json();
        const description = speciesData.flavor_text_entries.find(entry => entry.language.name === "es")?.flavor_text || "Sin descripción disponible.";

        const details = `
            <h2>#${pokemon.id} ${pokemon.name.toUpperCase()}</h2>
            
            <img src="${pokemon.sprites.other["official-artwork"].front_default}" alt="${pokemon.name}" class="pokemon-img">

            <div class="type-container">
                ${pokemon.types.map(t => `<img src="${typeImages[t.type.name]}" class="type-icon">`).join("")}
            </div>

            <div class="stats">
                <div>HP: ${pokemon.stats[0].base_stat}</div>
                <div>Peso: ${pokemon.weight / 10} kg</div>
                <div>Altura: ${pokemon.height / 10} m</div>
            </div>
  <p>${description}</p>

        <div class="modal-navigation">
            <button id="anterior-btn" ${currentIndex === 0 ? "disabled" : ""}>Anterior</button>
            <button id="siguiente-btn" ${currentIndex === pokemons.length - 1 ? "disabled" : ""}>Siguiente</button>
        </div>
    `;

        document.getElementById("pokemon-details").innerHTML = details;
        document.getElementById("pokemon-modal").style.display = "flex";

        // Asignar eventos a los botones de navegación
        const anteriorBtn = document.getElementById("anterior-btn");
        const siguienteBtn = document.getElementById("siguiente-btn");

        if (anteriorBtn) {
            anteriorBtn.addEventListener("click", () => cambiarPokemon(-1));
        }

        if (siguienteBtn) {
            siguienteBtn.addEventListener("click", () => cambiarPokemon(1));
        }


    }

    // Función para cambiar de Pokémon en el modal
    function cambiarPokemon(direction) {
        const newIndex = currentIndex + direction;

        // Verificar que el nuevo índice esté dentro de los límites
        if (newIndex >= 0 && newIndex < pokemons.length) {
            currentIndex = newIndex;
            abrirModal(pokemons[currentIndex]); // Actualizar el modal con el nuevo Pokémon
        }
    }

    // Función para cerrar el modal
    function cerrarModal() {
        document.getElementById("pokemon-modal").style.display = "none";
    }

    function limpiarContenedor() {
        pokemonContainer.innerHTML = "";
    }

    function mostrarBotonVolver(visible) {
        volverInicioButton.style.display = visible ? "block" : "none";
    }

    async function cargarMas() {
        try {
            offset += limit;
            await cargarPokemon();
        } catch (error) {
            console.error("Error al cargar más Pokémon:", error);
        }
    }
    function volverAlInicio() {
        searchNameInput.value = "";
        searchNumberInput.value = "";
        searchTypeInput.value = "";
        
        window.scrollTo({ top: 0, behavior: "smooth" });

        iniciar();
    }

    iniciar();
});


