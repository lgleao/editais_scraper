const input = document.getElementById("input");
const nomeDiv = document.getElementById("nome");
const partidoDiv = document.getElementById("partido");
const ufDiv = document.getElementById("uf");
const foto = document.getElementById("foto"); // <-- NOVO: Puxa a tag da imagem

async function api_broxa(nome) {
    if (nome === "vorcaro") { 
        nomeDiv.textContent = "Nome: Dani";
        partidoDiv.textContent = "Partido: Banco Master";
        ufDiv.textContent = "UF: Onde_Tiver_Loira";
        foto.src = "images.webp";
        foto.style.display = "block";
                
    } else {
        const url = `https://dadosabertos.camara.leg.br/api/v2/deputados?nome=${nome}&ordem=ASC&ordenarPor=nome`;
    
        try {
            const resposta = await fetch(url);
            if (!resposta.ok) {
                throw new Error(`Requisição deu erro! ${resposta.status}`);
            }

            const json = await resposta.json();
            
            if (json.dados.length === 0) {
                nomeDiv.textContent = "";
                partidoDiv.textContent = "Nenhum deputado encontrado.";
                ufDiv.textContent = "";
                foto.src = "";
                foto.style.display = "none";
                return;
            }

            const deputado = json.dados[0];

            nomeDiv.textContent = "Nome: " + deputado.nome
            partidoDiv.textContent = "Partido: " + deputado.siglaPartido;
            ufDiv.textContent = "UF: " + deputado.siglaUf;
            
            foto.src = deputado.urlFoto; 
            foto.alt = "Foto de " + deputado.nome;
            foto.style.display = "block";
            
            console.log("ID:", deputado.id);

        } catch (erro){
            console.error("Falha ao buscar", erro);
            nomeDiv.textContent = "";
            partidoDiv.textContent = "Erro ao buscar dados.";
            ufDiv.textContent = "";
            foto.src = "";
            foto.style.display = "none";
        }
    } 
}

input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        let valor = event.target.value.trim();
        
        if (valor !== "") {
            api_broxa(valor);
        }
        
        event.target.value = "";
    }
});