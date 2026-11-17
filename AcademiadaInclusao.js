let VariacaoPontos = 0;
let PontosTotais = 0;
let HeroiSelecionado = "";
let acaoAoFecharBalao = null;

const personagens = ["Caua", "Osana", "Ramirez"];
const personagensRespondidos = {
    Caua: false,
    Osana: false,
    Ramirez: false
};

/* =========================================
   SISTEMA DE BALÃO NA PÁGINA (SUBSTITUI ALERT)
   ========================================= */
function MostrarBalaoAviso(titulo, mensagem, textoBotao = "ENTENDI", callback = null, mostrarCancelar = false) {
    const overlay = document.getElementById("balaoAvisoOverlay");
    const tituloEl = document.getElementById("tituloBalaoAviso");
    const textoEl = document.getElementById("textoBalaoAviso");
    const acoesEl = document.getElementById("acoesBalaoAviso");
    const botaoEl = document.getElementById("botaoBalaoAviso");

    if (!overlay || !tituloEl || !textoEl) return;

    tituloEl.textContent = titulo;
    textoEl.innerHTML = mensagem;
    acaoAoFecharBalao = callback;

    if (acoesEl) {
        if (mostrarCancelar) {
            acoesEl.innerHTML = `
                <button type="button" class="BotaoBalaoAviso secundario" onclick="FecharBalaoAviso(false)">VOLTAR</button>
                <button type="button" class="BotaoBalaoAviso" onclick="FecharBalaoAviso(true)">${textoBotao}</button>
            `;
        } else {
            acoesEl.innerHTML = `
                <button type="button" id="botaoBalaoAviso" class="BotaoBalaoAviso" onclick="FecharBalaoAviso(true)">${textoBotao}</button>
            `;
        }
    } else if (botaoEl) {
        botaoEl.textContent = textoBotao;
    }

    overlay.classList.add("ativo");
}

function FecharBalaoAviso(confirmado = true) {
    const overlay = document.getElementById("balaoAvisoOverlay");
    if (overlay) {
        overlay.classList.remove("ativo");
    }

    if (confirmado && typeof acaoAoFecharBalao === "function") {
        const executar = acaoAoFecharBalao;
        acaoAoFecharBalao = null;
        executar();
    } else {
        acaoAoFecharBalao = null;
    }
}

/* =========================================
   TELAS INTERMEDIÁRIAS DE CARREGAMENTO
   ========================================= */
function ControlarCarregamentoPagina(idTela, idBarra, imagensExtras = []) {
    const tela = document.getElementById(idTela);
    const barra = document.getElementById(idBarra);
    if (!tela) return;

    const imgsDOM = Array.from(document.querySelectorAll("img"));
    const totalRecursos = imgsDOM.length + imagensExtras.length + 1; // +1 para fontes
    let carregados = 0;
    let finalizado = false;

    function atualizarProgresso() {
        carregados++;
        const pct = Math.min(100, Math.round((carregados / totalRecursos) * 100));
        if (barra) {
            barra.style.width = pct + "%";
        }
        if (carregados >= totalRecursos) {
            concluirCarregamento();
        }
    }

    function concluirCarregamento() {
        if (finalizado) return;
        finalizado = true;
        if (barra) barra.style.width = "100%";
        setTimeout(() => {
            tela.classList.add("oculta");
        }, 350);
    }

    // Monitora imagens no HTML
    imgsDOM.forEach((img) => {
        if (img.complete) {
            atualizarProgresso();
        } else {
            img.addEventListener("load", atualizarProgresso, { once: true });
            img.addEventListener("error", atualizarProgresso, { once: true });
        }
    });

    // Monitora imagens de fundo/extras (como saladeAula.png)
    imagensExtras.forEach((src) => {
        const preImg = new Image();
        preImg.onload = atualizarProgresso;
        preImg.onerror = atualizarProgresso;
        preImg.src = src;
    });

    // Monitora fontes
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(atualizarProgresso).catch(atualizarProgresso);
    } else {
        atualizarProgresso();
    }

    // Garantia máxima de 3.5s para nunca travar o totem
    setTimeout(concluirCarregamento, 3500);
}

/* =========================================
   INICIALIZAÇÃO AUTOMÁTICA DAS PÁGINAS
   ========================================= */
document.addEventListener("DOMContentLoaded", () => {
    // 1. Tela Inicial (index.html)
    if (document.getElementById("telaCarregamentoInicial")) {
        ControlarCarregamentoPagina("telaCarregamentoInicial", "barraProgressoInicial");
    }

    if (document.getElementById("top1")) {
        CarregarRanking();
    }

    // 2. Sala de Aula (AcademiadaInclusao.html)
    if (document.getElementById("telaCarregamentoSala")) {
        ControlarCarregamentoPagina("telaCarregamentoSala", "barraProgressoSala", ["saladeAula.png"]);
    }

    const hudJogador = document.getElementById("hudJogador");
    if (hudJogador) {
        const nome = localStorage.getItem("jogadorNome") || "Visitante";
        const curso = localStorage.getItem("jogadorCurso") || "---";
        const heroi = localStorage.getItem("jogadorHeroi") || "Milly";
        hudJogador.textContent = `${nome} (${curso}) • Herói: ${heroi}`;
        AtualizarHUD();
        PreencherFalasPersonagens(heroi);
    }
});

/* =========================================
   FUNÇÕES DA TELA INICIAL (index.html)
   ========================================= */
function SelecionarHeroi(nomeHeroi) {
    HeroiSelecionado = nomeHeroi;

    const btnMilly = document.getElementById("Milly");
    const btnLucas = document.getElementById("Lucas");
    const inputHeroi = document.getElementById("heroiEscolhido");

    if (btnMilly) btnMilly.classList.remove("selecionado");
    if (btnLucas) btnLucas.classList.remove("selecionado");

    const escolhido = document.getElementById(nomeHeroi);
    if (escolhido) {
        escolhido.classList.add("selecionado");
    }

    if (inputHeroi) {
        inputHeroi.value = nomeHeroi;
    }
}

function PrepararInicio(event) {
    event.preventDefault();

    if (!HeroiSelecionado) {
        MostrarBalaoAviso(
            "Escolha seu Herói!",
            "Toque na <strong>Milly</strong> ou no <strong>Lucas</strong> lá em cima antes de começar!"
        );
        return;
    }

    const cursoSelecionado = document.querySelector('input[name="curso"]:checked');
    if (!cursoSelecionado) {
        MostrarBalaoAviso(
            "Informe seu Curso!",
            "Selecione uma das opções de curso (<strong>INFO</strong>, <strong>PRO</strong> ou <strong>DES</strong>) para continuar."
        );
        return;
    }

    const nome = document.getElementById("nomeCompleto").value.trim();
    if (!nome) {
        MostrarBalaoAviso(
            "Informe seu Nome!",
            "Toque no campo de texto e digite seu nome completo para entrar no ranking."
        );
        return;
    }

    const curso = cursoSelecionado.value;

    localStorage.setItem("jogadorNome", nome);
    localStorage.setItem("jogadorCurso", curso);
    localStorage.setItem("jogadorHeroi", HeroiSelecionado);

    // Exibe a tela intermediária entre o Index e o Jogo enquanto pré-carrega a sala
    IniciarTransicaoParaSala(nome, HeroiSelecionado);
}

function IniciarTransicaoParaSala(nomeJogador, heroi) {
    const telaTransicao = document.getElementById("telaTransicaoJogo");
    const tituloEl = document.getElementById("tituloTransicaoJogo");
    const textoEl = document.getElementById("textoTransicaoJogo");
    const barraEl = document.getElementById("barraProgressoJogo");

    if (!telaTransicao) {
        window.location.href = "AcademiadaInclusao.html";
        return;
    }

    if (tituloEl) {
        tituloEl.textContent = `VAMOS LÁ, ${heroi.toUpperCase()}!`;
    }
    if (textoEl) {
        textoEl.textContent = `Preparando a Sala de Aula Nº 8 para ${nomeJogador}...`;
    }

    telaTransicao.classList.remove("oculta");

    // Pré-carrega os arquivos pesados da fase antes de mudar de página
    const assetsSala = ["saladeAula.png", "CauaInicial.png", "Osana.png", "Ramirez.png"];
    let carregados = 0;
    let redirecionado = false;

    function avancarParaJogo() {
        if (redirecionado) return;
        redirecionado = true;
        if (barraEl) barraEl.style.width = "100%";
        setTimeout(() => {
            window.location.href = "AcademiadaInclusao.html";
        }, 450);
    }

    assetsSala.forEach((arquivo) => {
        const img = new Image();
        img.onload = img.onerror = () => {
            carregados++;
            if (barraEl) {
                barraEl.style.width = Math.round((carregados / assetsSala.length) * 100) + "%";
            }
            if (carregados >= assetsSala.length) {
                avancarParaJogo();
            }
        };
        img.src = arquivo;
    });

    // Fallback de segurança
    setTimeout(avancarParaJogo, 2500);
}

function CarregarRanking() {
    const rankingSalvo = JSON.parse(localStorage.getItem("rankingAcademia")) || [];

    for (let i = 0; i < 3; i++) {
        const item = document.getElementById("top" + (i + 1));
        if (!item) continue;

        const dadosSpan = item.querySelector(".DadosAluno");
        const pontosSpan = item.querySelector(".PontosAluno");

        if (rankingSalvo[i]) {
            dadosSpan.textContent = `${rankingSalvo[i].nome} (${rankingSalvo[i].curso})`;
            pontosSpan.textContent = `${rankingSalvo[i].pontos} pts`;
        }
    }
}

/* =========================================
   DIÁLOGOS E FUNÇÕES DA SALA DE AULA
   ========================================= */
function PreencherFalasPersonagens(heroi) {
    const falaCaua = document.getElementById("falaCaua");
    const falaOsana = document.getElementById("falaOsana");
    const falaRamirez = document.getElementById("falaRamirez");

    if (falaCaua) {
        falaCaua.innerHTML = `"E aí, <span class="DestaqueHeroi">${heroi}</span>! Tudo tranquilo? O sinal do recreio já bateu, mas estou com receio de esbarrar nas carteiras. Pode me dar uma ajuda por favor?"`;
    }

    if (falaOsana) {
        falaOsana.innerHTML = `"Oi, <span class="DestaqueHeroi">${heroi}</span>! Que bom que você ainda está aí! Deixaram uma carteira bem na passagem e minha cadeira não passa. Dá uma mãozinha aqui?"`;
    }

    if (falaRamirez) {
        falaRamirez.innerHTML = `"Hmm... parece que todo mundo já saiu e eu nem ouvi o sinal bater! Ei, <span class="DestaqueHeroi">${heroi}</span>, você ainda está na sala?"`;
    }
}

function ObterReacaoPersonagem(nomePersonagem, pontos, heroi) {
    const reacoes = {
        Caua: {
            10: `<strong>Cauã:</strong> "Valeu mesmo, <span class="DestaqueHeroi">${heroi}</span>! Perguntar antes e me guiar com calma faz toda a diferença!" (+10 pts)`,
            "-5": `<strong>Cauã:</strong> "Ah, tudo bem, <span class="DestaqueHeroi">${heroi}</span>... vou tentar ir bem devagar com a minha bengala." (-5 pts)`,
            "-10": `<strong>Cauã:</strong> "Poxa, <span class="DestaqueHeroi">${heroi}</span>... não precisava responder assim, eu só pedi uma ajuda." (-10 pts)`
        },
        Osana: {
            10: `<strong>Osana:</strong> "Muito obrigada, <span class="DestaqueHeroi">${heroi}</span>! Perguntar antes e liberar o caminho respeita minha autonomia!" (+10 pts)`,
            "-5": `<strong>Osana:</strong> "Ei, <span class="DestaqueHeroi">${heroi}</span>! Nunca empurre a cadeira de rodas sem pedir antes, isso pode me desequilibrar!" (-5 pts)`,
            "-10": `<strong>Osana:</strong> "Que chato ouvir isso, <span class="DestaqueHeroi">${heroi}</span>... eu tenho tanto direito de ir ao recreio quanto qualquer colega." (-10 pts)`
        },
        Ramirez: {
            10: `<strong>Ramirez:</strong> "Obrigado por tocar no meu ombro e falar de frente, <span class="DestaqueHeroi">${heroi}</span>! Assim consigo ler seus lábios perfeitamente!" (+10 pts)`,
            "-5": `<strong>Ramirez:</strong> "Ai! Gritar de costas não ajuda a me fazer ouvir, <span class="DestaqueHeroi">${heroi}</span>... o ideal é falar de frente!" (-5 pts)`,
            "-10": `<strong>Ramirez:</strong> "Que pena, <span class="DestaqueHeroi">${heroi}</span>... incluir é justamente buscar formas de conversar com todos." (-10 pts)`
        }
    };

    return reacoes[nomePersonagem]?.[String(pontos)] || `Obrigado pela interação, ${heroi}!`;
}

function AbrirDialogo(nomePersonagem) {
    if (personagensRespondidos[nomePersonagem]) {
        MostrarBalaoAviso(
            "Colega já atendido!",
            "Você já conversou com este colega. Toque nos outros colegas da sala para continuar!"
        );
        return;
    }

    FecharDialogo();

    const heroi = localStorage.getItem("jogadorHeroi") || "Milly";
    PreencherFalasPersonagens(heroi);

    const overlay = document.getElementById("overlayFoco");
    const setor = document.getElementById("setor" + nomePersonagem);
    const menu = document.getElementById("menu" + nomePersonagem);

    if (overlay && setor && menu) {
        overlay.style.display = "block";
        setor.classList.add("em-destaque");
        menu.style.display = "flex";
    }
}

function FecharDialogo() {
    const overlay = document.getElementById("overlayFoco");
    if (overlay) {
        overlay.style.display = "none";
    }

    personagens.forEach((nome) => {
        const setor = document.getElementById("setor" + nome);
        const menu = document.getElementById("menu" + nome);

        if (setor) setor.classList.remove("em-destaque");
        if (menu) menu.style.display = "none";
    });
}

function Responder(nomePersonagem, pontos) {
    if (personagensRespondidos[nomePersonagem]) return;

    personagensRespondidos[nomePersonagem] = true;
    const botaoPersonagem = document.getElementById(nomePersonagem);
    if (botaoPersonagem) {
        botaoPersonagem.classList.add("respondido");
    }

    VariacaoPontos = pontos;
    AtualizarPontos();
    FecharDialogo();

    const heroi = localStorage.getItem("jogadorHeroi") || "Milly";
    const mensagemReacao = ObterReacaoPersonagem(nomePersonagem, pontos, heroi);
    const todosRespondidos = personagens.every((nome) => personagensRespondidos[nome]);

    MostrarBalaoAviso(
        pontos > 0 ? "Ótima atitude!" : "Atenção na inclusão!",
        mensagemReacao,
        todosRespondidos ? "VER RESULTADO FINAL" : "CONTINUAR",
        () => {
            if (todosRespondidos) {
                MostrarBalaoAviso(
                    "Rodada Concluída!",
                    `Parabéns, <strong>${heroi}</strong>! Você conversou com todos os colegas da sala.<br><br>Pontuação final: <strong>${PontosTotais} pts</strong>.`,
                    "SALVAR NO RANKING",
                    () => FinalizarJogo()
                );
            }
        }
    );
}

function AtualizarPontos() {
    PontosTotais = Number(PontosTotais) + VariacaoPontos;
    VariacaoPontos = 0;
    AtualizarHUD();
}

function AtualizarHUD() {
    const hudPontos = document.getElementById("hudPontos");
    if (hudPontos) {
        hudPontos.textContent = `Pontos: ${PontosTotais}`;
    }
}

function ConfirmarFinalizacao() {
    MostrarBalaoAviso(
        "Finalizar Rodada?",
        `Sua pontuação atual é de <strong>${PontosTotais} pts</strong>. Deseja encerrar agora e salvar no ranking?`,
        "FINALIZAR",
        () => FinalizarJogo(),
        true
    );
}

function FinalizarJogo() {
    const nome = localStorage.getItem("jogadorNome") || "Visitante";
    const curso = localStorage.getItem("jogadorCurso") || "GERAL";

    const rankingSalvo = JSON.parse(localStorage.getItem("rankingAcademia")) || [];
    rankingSalvo.push({
        nome: nome,
        curso: curso,
        pontos: PontosTotais
    });

    // Ordena do maior para o menor e mantém os 3 melhores
    rankingSalvo.sort((a, b) => b.pontos - a.pontos);
    localStorage.setItem("rankingAcademia", JSON.stringify(rankingSalvo.slice(0, 3)));

    // Volta para a tela inicial para o próximo participante do totem
    window.location.href = "index.html";
}
