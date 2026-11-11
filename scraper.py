import cloudscraper
from bs4 import BeautifulSoup
import json
import os
import re

def classificar_concurso(texto):
    texto = texto.lower()
    categorias = []
    
    regras = {
        "saude": [r"\bmedic[oa]s?\b", r"\benfermeir[oa]s?\b", "sus", "hospital", "saude", "odontologia"],
        "tecnologia": [r"\bti\b", "desenvolvedor", "sistemas", "computacao", r"\bdados\b", "software"],
        "educacao": [r"\bprofessor\b", "ufal", "ifal", "docente", "pedagogo", "escola"],
        "seguranca": ["policia", "militar", "bombeiro", "guarda", "seguranca"]
    }
    
    for categoria, padroes in regras.items():
        if any(re.search(padrao, texto) for padrao in padroes):
            categorias.append(categoria)
            
    return categorias if categorias else ["geral"]

def extrair_metadados(texto):
    texto = " ".join(texto.split()) 
    salario_match = re.search(r'R\$\s*[\d\.,]+', texto)
    salario = salario_match.group(0) if salario_match else "Nao informado"
    
    vagas_match = re.search(r'(\d+)\s*vagas?', texto, re.IGNORECASE)
    vagas = vagas_match.group(1) if vagas_match else "CR"
    
    return salario, vagas

def extrair_uf(bloco, titulo):
    ufs = ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO']
    
    for tag in bloco.find_all(['div', 'span']):
        if tag.text.strip() in ufs:
            return tag.text.strip()
            
    match = re.search(r'\b(AC|AL|AM|AP|BA|CE|DF|ES|GO|MA|MG|MS|MT|PA|PB|PE|PI|PR|RJ|RN|RO|RR|RS|SC|SE|SP|TO)\b', titulo)
    if match:
        return match.group(1)
        
    return "Nacional/Geral"

def gerar_json_editais():
    # Lista com todas as divisões do site
    urls = [
        "https://www.pciconcursos.com.br/concursos/nacional/",
        "https://www.pciconcursos.com.br/concursos/sudeste/",
        "https://www.pciconcursos.com.br/concursos/sul/",
        "https://www.pciconcursos.com.br/concursos/nordeste/",
        "https://www.pciconcursos.com.br/concursos/norte/",
        "https://www.pciconcursos.com.br/concursos/centrooeste/"
    ]
    
    print("1. Inicializando scraper para rodar em todo o Brasil...")
    scraper = cloudscraper.create_scraper(browser={'browser': 'chrome', 'platform': 'windows', 'mobile': False})
    
    concursos = []
    
    for url in urls:
        print(f"-> Raspando: {url}")
        try:
            resposta = scraper.get(url)
            
            if resposta.status_code != 200:
                print(f"Falha ao carregar {url} (Status: {resposta.status_code})")
                continue
                
            soup = BeautifulSoup(resposta.text, 'html.parser')
            blocos = soup.find_all('div', class_=['ca', 'na']) 
            
            for bloco in blocos:
                link_tag = bloco.find('a')
                if not link_tag: continue
                    
                titulo = link_tag.text.strip()
                uf = extrair_uf(bloco, titulo)
                
                link = link_tag.get('href', '')
                descricao_bruta = bloco.get_text(separator=" ").replace(titulo, '').strip()
                
                categorias = classificar_concurso(titulo + " " + descricao_bruta)
                salario, vagas = extrair_metadados(descricao_bruta)
                
                concursos.append({
                    "titulo": titulo,
                    "descricao": descricao_bruta[:150] + ("..." if len(descricao_bruta) > 150 else ""),
                    "salario": salario,
                    "vagas": vagas,
                    "link": link,
                    "categorias": categorias,
                    "uf": uf
                })
                
        except Exception as e:
            print(f"Erro ao processar {url}: {e}")

    print(f"\n2. Finalizado! {len(concursos)} editais encontrados no Brasil todo.")
    
    if len(concursos) > 0:
        caminho_arquivo = os.path.join(os.path.dirname(__file__), 'editais.json')
        with open(caminho_arquivo, 'w', encoding='utf-8') as f:
            json.dump(concursos, f, ensure_ascii=False, indent=4)
        print(f"✅ Arquivo editais.json atualizado com sucesso.")

if __name__ == '__main__':
    gerar_json_editais()