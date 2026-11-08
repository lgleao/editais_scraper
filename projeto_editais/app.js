let todosEditais = [];
let filtroCategoriaAtual = 'todos';

const container = document.getElementById('lista-concursos');
const inputBusca = document.getElementById('busca');
const selectEstado = document.getElementById('filtro-estado');
const containerFiltros = document.getElementById('botoes-filtro');

const todosEstados = [
    'Nacional/Geral', 'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 
    'RS', 'SC', 'SE', 'SP', 'TO'
];

const categoriasDisponiveis = ['todos', 'geral', 'tecnologia', 'saude', 'educacao', 'seguranca'];

async function carregarEditais() {
    try {
        const resposta = await fetch('./editais.json');
        todosEditais = await resposta.json();
        
        gerarOpcoesEstados();
        criarBotoesFiltro();
        processarExibicao();
    } catch (erro) {
        container.innerHTML = "Erro ao carregar editais. Execute o scraper.py primeiro.";
        console.error(erro);
    }
}

function gerarOpcoesEstados() {
    todosEstados.forEach(uf => {
        const option = document.createElement('option');
        option.value = uf;
        option.textContent = uf;
        selectEstado.appendChild(option);
    });
}

function criarBotoesFiltro() {
    containerFiltros.innerHTML = categoriasDisponiveis.map(cat => 
        `<button class="btn-filtro ${cat === 'todos' ? 'ativo' : ''}" 
                 onclick="aplicarFiltroCategoria('${cat}', this)">
            ${cat.charAt(0).toUpperCase() + cat.slice(1)}
        </button>`
    ).join('');
}

function aplicarFiltroCategoria(categoria, botaoClicado) {
    filtroCategoriaAtual = categoria;
    
    document.querySelectorAll('.btn-filtro').forEach(btn => btn.classList.remove('ativo'));
    botaoClicado.classList.add('ativo');
    
    processarExibicao();
}

// Filtra considerando as 3 dimensoes: Busca em texto + Categoria + UF
function processarExibicao() {
    const termoBusca = inputBusca.value.toLowerCase();
    const estadoSelecionado = selectEstado.value;
    
    const filtrados = todosEditais.filter(edital => {
        const passaCategoria = filtroCategoriaAtual === 'todos' || edital.categorias.includes(filtroCategoriaAtual);
        const passaBusca = edital.titulo.toLowerCase().includes(termoBusca) || 
                           edital.descricao.toLowerCase().includes(termoBusca);
        const passaEstado = estadoSelecionado === 'todos' || edital.uf === estadoSelecionado;
        
        return passaCategoria && passaBusca && passaEstado;
    });
    
    renderizar(filtrados);
}

function renderizar(lista) {
    container.innerHTML = '';
    
    if (lista.length === 0) {
        container.innerHTML = '<p style="text-align: center; font-size: 1.2em; padding: 40px 0;">Nenhum concurso disponível no estado.</p>';
        return;
    }

    lista.forEach(edital => {
        const tags = edital.categorias.map(cat => `<span class="tag">${cat}</span>`).join('');
        
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-header">
                <h3>${edital.titulo}</h3>
                <span class="badge-uf">${edital.uf}</span>
            </div>
            <div class="metadados">
                <span>Salario: ${edital.salario}</span>
                <span>Vagas: ${edital.vagas}</span>
            </div>
            <p>${edital.descricao.substring(0, 120)}...</p>
            <div class="tags">${tags}</div>
            <a href="${edital.link}" class="btn-link" target="_blank">Ler Edital</a>
        `;
        container.appendChild(card);
    });
}

// Adiciona os listeners para os inputs interativos
inputBusca.addEventListener('input', processarExibicao);
selectEstado.addEventListener('change', processarExibicao);

// Inicializa a aplicacao
carregarEditais();