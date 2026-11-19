let VariacaoPontos = 0;
let PontosTotais = 0;
let HeroiSelecionado = "";
let TempoInicioResposta = 0;
let acaoAoFecharBalao = null;

const personagens = ["Caua", "Osana", "Ramirez", "Miqueias", "Maya"];
const personagensPontuaveis = ["Caua", "Osana", "Ramirez"];

const personagensRespondidos = {
    Caua: false,
    Osana: false,
    Ramirez: false,
    Miqueias: false,
    Maya: false
};

const bonusVelocidadePorPersonagem = {
    Caua: 0,
    Osana: 0,
    Ramirez: 0
};

const etapaDialogoSimples = {
    Miqueias: 1,
    Maya: 1
};

function MostrarBalaoAviso(titulo, mensagem, textoBotao = "BORA!", callback = null, mostrarCancelar = false) {
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

function ControlarCarregamentoPagina(idTela, idBarra, imagensExtras = [], duracaoMinimaMs = 450, idPorcentagem = null) {
    const tela = document.getElementById(idTela);
    const barra = document.getElementById(idBarra);
    const textoPct = idPorcentagem ? document.getElementById(idPorcentagem) : null;
    if (!tela) return;

    const imgsDOM = Array.from(document.querySelectorAll("img"));
    const totalRecursos = imgsDOM.length + imagensExtras.length + 1;
    const inicioCarregamento = Date.now();
    let carregados = 0;
    let finalizado = false;
    let progressoVisual = 0;

    function atualizarInterface(pct) {
        if (barra) barra.style.width = pct + "%";
        if (textoPct) textoPct.textContent = pct + "%";
    }

    const intervaloAnimacao = setInterval(() => {
        const pctReal = Math.min(100, Math.round((carregados / totalRecursos) * 100));
        const tempoPassado = Date.now() - inicioCarregamento;
        const pctTempo = Math.min(100, Math.round((tempoPassado / duracaoMinimaMs) * 100));
        const alvo = Math.min(pctReal, pctTempo);

        if (progressoVisual < alvo) {
            progressoVisual = Math.min(alvo, progressoVisual + 8);
            atualizarInterface(progressoVisual);
        }

        if (carregados >= totalRecursos && tempoPassado >= duracaoMinimaMs) {
            concluirCarregamento();
        }
    }, 50);

    function registrarRecursoCarregado() {
        carregados++;
    }

    function concluirCarregamento() {
        if (finalizado) return;
        finalizado = true;
        clearInterval(intervaloAnimacao);
        atualizarInterface(100);
        setTimeout(() => {
            tela.classList.add("oculta");
        }, 300);
    }

    imgsDOM.forEach((img) => {
        if (img.complete) {
            registrarRecursoCarregado();
        } else {
            img.addEventListener("load", registrarRecursoCarregado, { once: true });
            img.addEventListener("error", registrarRecursoCarregado, { once: true });
        }
    });

    imagensExtras.forEach((src) => {
        const preImg = new Image();
        preImg.onload = registrarRecursoCarregado;
        preImg.onerror = registrarRecursoCarregado;
        preImg.src = src;
    });

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(registrarRecursoCarregado).catch(registrarRecursoCarregado);
    } else {
        registrarRecursoCarregado();
    }

    setTimeout(concluirCarregamento, Math.max(3500, duracaoMinimaMs + 1500));
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("telaCarregamentoInicial")) {
        ControlarCarregamentoPagina(
            "telaCarregamentoInicial",
            "barraProgressoInicial",
            ["saladeAula.png", "CauaInicial.png", "Osana.png", "Ramirez.png", "Miqueias.png", "Maya.png"],
            1200,
            "porcentagemLoaderInicial"
        );
    }

    if (document.getElementById("top1")) {
        CarregarRanking();
    }

    if (document.getElementById("telaCarregamentoSala")) {
        ControlarCarregamentoPagina(
            "telaCarregamentoSala",
            "barraProgressoSala",
            ["saladeAula.png", "Miqueias.png", "Maya.png"],
            600
        );
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
        textoEl.textContent = `Preparando a Sala de Aula para ${nomeJogador}...`;
    }

    telaTransicao.classList.remove("oculta");

    const assetsSala = ["saladeAula.png", "CauaInicial.png", "Osana.png", "Ramirez.png", "Miqueias.png", "Maya.png"];
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
    const falaMiqueias = document.getElementById("falaMiqueias");
    const falaMaya = document.getElementById("falaMaya");

    if (falaCaua) {
        falaCaua.innerHTML = `"E aí, <span class="DestaqueHeroi">${heroi}</span>! Tá livre? O sinal do recreio já bateu, mas estou com receio de esbarrar nas carteiras porque minha bengala quebrou. Pode me guiar até a porta?"`;
    }

    if (falaOsana) {
        falaOsana.innerHTML = `"Opa, <span class="DestaqueHeroi">${heroi}</span>! Dá uma mãozinha aqui? Umas cordas enroscaram na roda da minha cadeira e ela travou!"`;
    }

    if (falaRamirez) {
        falaRamirez.innerHTML = `*Ramirez parece distraído, ele não notou sua presença*`;
    }

    if (falaMiqueias) {
        falaMiqueias.innerHTML = `"Fala, <span class="DestaqueHeroi">${heroi}</span>! Tô quase pegando 3 coroas no Clash aqui"`;
    }

    if (falaMaya) {
        falaMaya.innerHTML = `"Ah, oi <span class="DestaqueHeroi">${heroi}</span>! Esse romance está tão fofo, daqui a pouco eu saio"`;
    }
}

function MontarDialogoSimples(nomePersonagem, etapa) {
    const heroi = localStorage.getItem("jogadorHeroi") || "Milly";
    const falaEl = document.getElementById("fala" + nomePersonagem);
    const instrucaoEl = document.getElementById("instrucaoMenu" + nomePersonagem);
    const opcoesEl = document.getElementById("opcoes" + nomePersonagem);

    if (!falaEl || !instrucaoEl || !opcoesEl) return;

    etapaDialogoSimples[nomePersonagem] = etapa;

    const roteirosSimples = {
        Miqueias: {
            1: {
                fala: `"Fala, <span class="DestaqueHeroi">${heroi}</span>! Tô quase pegando 3 coroas no Clash aqui"`,
                instrucao: "O que você diz?",
                opcoes: [
                    "O sinal já bateu! Ganha logo isso e vai comer mano!",
                    "Vai ficar aí o recreio todo?"
                ]
            },
            2: {
                fala: `"Tô quase ganhando, calma ai"`,
                instrucao: "Despeça-se do colega:",
                opcoes: [
                    "Beleza então! Até mais tarde no intervalo, Miqueias!",
                    "Sem problemas! Bom descanso, a gente se vê depois!"
                ]
            }
        },
        Maya: {
            1: {
                fala: `"Ah, oi <span class="DestaqueHeroi">${heroi}</span>! Esse romance está tão fofo, daqui a pouco eu saio"`,
                instrucao: "O que você pergunta?",
                opcoes: [
                    "O sinal do recreio já tocou! Não dá pra ler isso lá fora?",
                    "Ei Maya, esse livro deve estar bom mesmo! Mas você não vai comer então?"
                ]
            },
            2: {
                fala: `"O clima já está acabando, daqui a pouco eu saio."`,
                instrucao: "Despeça-se da colega:",
                opcoes: [
                    "Combinado! Boa leitura e até mais, Maya!",
                    "Até daqui a pouco no intervalo, Maya! Tchau!"
                ]
            }
        }
    };

    const dadosEtapa = roteirosSimples[nomePersonagem]?.[etapa];
    if (!dadosEtapa) return;

    falaEl.innerHTML = dadosEtapa.fala;
    instrucaoEl.textContent = dadosEtapa.instrucao;
    opcoesEl.innerHTML = dadosEtapa.opcoes
        .map(
            (textoOpcao) => `
            <button type="button" onclick="AvancarDialogoSimples('${nomePersonagem}', ${etapa})" class="BalaodeFalaNormal">
                ${textoOpcao}
            </button>
        `
        )
        .join("");
}

function AvancarDialogoSimples(nomePersonagem, etapaAtual) {
    if (personagensRespondidos[nomePersonagem]) return;

    if (etapaAtual === 1) {
        MontarDialogoSimples(nomePersonagem, 2);
        return;
    }

    FecharDialogo();
    personagensRespondidos[nomePersonagem] = true;

    const botaoPersonagem = document.getElementById(nomePersonagem);
    if (botaoPersonagem) {
        botaoPersonagem.classList.add("respondido");
    }

    const heroi = localStorage.getItem("jogadorHeroi") || "Milly";
    const despedidas = {
        Miqueias: `<strong>Miqueias:</strong> "Obrigado por avisar, <span class="DestaqueHeroi">${heroi}</span>! Até logo!"`,
        Maya: `<strong>Maya:</strong> "Obrigada, <span class="DestaqueHeroi">${heroi}</span>! Até mais tarde!"`
    };

    MostrarBalaoAviso(
        "Até logo!",
        despedidas[nomePersonagem] || `Até mais, ${heroi}!`,
        "CONTINUAR"
    );
}

function CalcularBonusVelocidade(segundos) {
    if (segundos <= 4) return 10;
    if (segundos <= 8) return 7;
    if (segundos <= 12) return 4;
    if (segundos <= 18) return 2;
    return 0;
}

function ObterReacaoPersonagem(nomePersonagem, pontos, heroi, bonusVelocidade = 0) {
    const textoBonus =
        bonusVelocidade > 0
            ? ` (+20 pts + ${bonusVelocidade} pts bônus de velocidade!)<br><span class="DestaqueVelocidade">Que dedo veloz! +${bonusVelocidade} pts extras!</span>`
            : ` (+20 pts com bônus de ajuda!)`;

    const reacoes = {
        Caua: {
            10: `<strong>Cauã:</strong> "Valeu mesmo, <span class="DestaqueHeroi">${heroi}</span>! Me guiar desviando das carteiras com calma faz toda a diferença!"${textoBonus}`,
            "-5": `<strong>Cauã:</strong> "Ah, tudo bem, <span class="DestaqueHeroi">${heroi}</span>... vou tentar ir bem devagar com a minha bengala quebrada." (-5 pts)`,
            "-10": `<strong>Cauã:</strong> "Poxa, <span class="DestaqueHeroi">${heroi}</span>... não precisava responder assim, eu só pedi uma ajuda." (-10 pts)`
        },
        Osana: {
            10: `<strong>Osana:</strong> "Muito obrigada, <span class="DestaqueHeroi">${heroi}</span>! Perguntar antes e desenrolar as cordas da roda respeita minha autonomia!"${textoBonus}`,
            "-5": `<strong>Osana:</strong> "Ei, <span class="DestaqueHeroi">${heroi}</span>! Nunca empurre a cadeira de rodas sem pedir antes, isso pode me desequilibrar!" (-5 pts)`,
            "-10": `<strong>Osana:</strong> "Que chato ouvir isso, <span class="DestaqueHeroi">${heroi}</span>... eu tenho tanto direito de ir ao recreio quanto qualquer colega." (-10 pts)`
        },
        Ramirez: {
            10: `<strong>Ramirez:</strong> "Obrigado por tocar no meu ombro e fazer os sinais de frente, <span class="DestaqueHeroi">${heroi}</span>! Entendi direitinho que já é hora do recreio!"${textoBonus}`,
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
            "Você já conversou com este colega. Experimente bater papo com os outros alunos!"
        );
        return;
    }

    FecharDialogo();

    const heroi = localStorage.getItem("jogadorHeroi") || "Milly";
    PreencherFalasPersonagens(heroi);

    if (nomePersonagem === "Miqueias" || nomePersonagem === "Maya") {
        MontarDialogoSimples(nomePersonagem, 1);
    } else {
        TempoInicioResposta = Date.now();
    }

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

    const tempoDecorrido = (Date.now() - TempoInicioResposta) / 1000;
    FecharDialogo();

    if (pontos > 0) {
        const bonusVelocidade = CalcularBonusVelocidade(tempoDecorrido);
        bonusVelocidadePorPersonagem[nomePersonagem] = bonusVelocidade;
        VariacaoPontos = pontos + bonusVelocidade;
        AtualizarPontos();
        IniciarMiniGame(nomePersonagem);
        return;
    }

    personagensRespondidos[nomePersonagem] = true;
    const botaoPersonagem = document.getElementById(nomePersonagem);
    if (botaoPersonagem) {
        botaoPersonagem.classList.add("respondido");
    }

    VariacaoPontos = pontos;
    AtualizarPontos();
    ExibirConclusaoInteracao(nomePersonagem, pontos, 0);
}

function ExibirConclusaoInteracao(nomePersonagem, pontosBase, bonusVelocidade = 0) {
    const heroi = localStorage.getItem("jogadorHeroi") || "Milly";
    const mensagemReacao = ObterReacaoPersonagem(nomePersonagem, pontosBase, heroi, bonusVelocidade);
    const todosRespondidos = personagensPontuaveis.every((nome) => personagensRespondidos[nome]);

    MostrarBalaoAviso(
        pontosBase > 0 ? "Ajuda Concluída!" : "Atenção na inclusão!",
        mensagemReacao,
        todosRespondidos ? "VER RESULTADO FINAL" : "CONTINUAR",
        () => {
            if (todosRespondidos) {
                MostrarBalaoAviso(
                    "Rodada Concluída!",
                    `Parabéns, <strong>${heroi}</strong>! Você ajudou todos os colegas da sala.<br><br>Pontuação final: <strong>${PontosTotais} pts</strong>.`,
                    "SALVAR RESULTADO",
                    () => FinalizarJogo()
                );
            }
        }
    );
}


function IniciarMiniGame(nomePersonagem) {
    const overlay = document.getElementById("miniGameOverlay");
    const feedback = document.getElementById("feedbackMiniGame");
    const rodape = document.getElementById("rodapeMiniGame");

    if (!overlay) return;

    if (feedback) {
        feedback.textContent = "";
        feedback.className = "FeedbackMiniGame";
    }
    if (rodape) {
        rodape.innerHTML = "";
    }

    overlay.classList.add("ativo");

    if (nomePersonagem === "Caua") {
        MontarMiniGameCaua();
    } else if (nomePersonagem === "Osana") {
        MontarMiniGameOsana();
    } else if (nomePersonagem === "Ramirez") {
        MontarMiniGameRamirez();
    }
}

function ConcluirMiniGame(nomePersonagem) {
    const overlay = document.getElementById("miniGameOverlay");
    if (overlay) {
        overlay.classList.remove("ativo");
    }

    personagensRespondidos[nomePersonagem] = true;
    const botaoPersonagem = document.getElementById(nomePersonagem);
    if (botaoPersonagem) {
        botaoPersonagem.classList.add("respondido");
    }

    // Bônus de +10 pts por completar o mini-game de ajuda
    VariacaoPontos = 10;
    AtualizarPontos();

    const bonusVelocidade = bonusVelocidadePorPersonagem[nomePersonagem] || 0;
    ExibirConclusaoInteracao(nomePersonagem, 10, bonusVelocidade);
}


function MontarMiniGameCaua() {
    const titulo = document.getElementById("tituloMiniGame");
    const badge = document.getElementById("badgeProgressoMiniGame");
    const instrucao = document.getElementById("instrucaoMiniGame");
    const conteudo = document.getElementById("conteudoMiniGame");
    const feedback = document.getElementById("feedbackMiniGame");
    const rodape = document.getElementById("rodapeMiniGame");
    const heroi = localStorage.getItem("jogadorHeroi") || "Milly";

    titulo.textContent = "Guie o Cauã até a Porta";
    badge.textContent = "Trajeto";
    instrucao.innerHTML = `Desenhe com o dedo um caminho livre pelos corredores, levando o <strong>Cauã</strong> (verde) e <strong>${heroi}</strong> (amarelo) até a <strong>PORTA</strong> sem bater nas carteiras!`;

    conteudo.innerHTML = `<canvas id="canvasCaua" width="600" height="440" class="CanvasMiniGame"></canvas>`;
    rodape.innerHTML = `<button type="button" id="btnLimparTrajeto" class="BotaoAcaoMiniGame">LIMPAR TRAJETO</button>`;

    const canvas = document.getElementById("canvasCaua");
    const ctx = canvas.getContext("2d");

    const inicio = { x: 95, y: 375 };
    const porta = { x: 420, y: 0, w: 125, h: 42 };
    const carteiras = [
        { x: 65,  y: 105, w: 100, h: 68, erro: false },
        { x: 245, y: 105, w: 100, h: 68, erro: false },
        { x: 65,  y: 245, w: 100, h: 68, erro: false },
        { x: 245, y: 245, w: 100, h: 68, erro: false },
        { x: 425, y: 245, w: 100, h: 68, erro: false }
    ];

    let pontosTrajeto = [];
    let desenhando = false;
    let animando = false;
    let posCaua = { x: inicio.x, y: inicio.y };

    function desenharMapa() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#cbd5e1";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "rgba(15, 23, 42, 0.08)";
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 12;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#22c55e";
        ctx.fillRect(porta.x, porta.y, porta.w, porta.h);
        ctx.strokeStyle = "#14532d";
        ctx.lineWidth = 3;
        ctx.strokeRect(porta.x, porta.y, porta.w, porta.h);

        ctx.fillStyle = "#ffffff";
        ctx.font = "800 18px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("PORTA ▲", porta.x + porta.w / 2, 27);

        carteiras.forEach((c) => {
            ctx.fillStyle = c.erro ? "#991b1b" : "#78350f";
            ctx.fillRect(c.x + 14, c.y + c.h - 4, c.w - 28, 12);

            ctx.fillStyle = c.erro ? "#ef4444" : "#b45309";
            ctx.beginPath();
            ctx.roundRect(c.x, c.y, c.w, c.h, 8);
            ctx.fill();

            ctx.strokeStyle = c.erro ? "#fecaca" : "#451a03";
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = "#fef3c7";
            ctx.font = "700 13px Inter, sans-serif";
            ctx.fillText("Carteira", c.x + c.w / 2, c.y + c.h / 2 + 5);
        });

        if (pontosTrajeto.length > 1) {
            ctx.save();
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 10;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.setLineDash([14, 10]);
            ctx.beginPath();
            ctx.moveTo(pontosTrajeto[0].x, pontosTrajeto[0].y);
            for (let i = 1; i < pontosTrajeto.length; i++) {
                ctx.lineTo(pontosTrajeto[i].x, pontosTrajeto[i].y);
            }
            ctx.stroke();
            ctx.restore();
        }

        ctx.fillStyle = "#ffd166";
        ctx.beginPath();
        ctx.arc(posCaua.x + 34, posCaua.y + 6, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = "#111111";
        ctx.font = "800 12px Inter, sans-serif";
        ctx.fillText(heroi, posCaua.x + 34, posCaua.y + 36);

        ctx.fillStyle = "#16a34a";
        ctx.beginPath();
        ctx.arc(posCaua.x, posCaua.y, 19, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = "#0f172a";
        ctx.font = "800 13px Inter, sans-serif";
        ctx.fillText("Cauã", posCaua.x, posCaua.y + 34);
    }

    function obterPosicaoToque(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    function colidiuCarteira(pt) {
        const margem = 10;
        for (const c of carteiras) {
            if (
                pt.x >= c.x - margem &&
                pt.x <= c.x + c.w + margem &&
                pt.y >= c.y - margem &&
                pt.y <= c.y + c.h + margem
            ) {
                return c;
            }
        }
        return null;
    }

    function chegouNaPorta(pt) {
        return (
            pt.x >= porta.x - 10 &&
            pt.x <= porta.x + porta.w + 10 &&
            pt.y <= porta.h + 18
        );
    }

    function resetarTrajeto(mensagem = "", erro = false) {
        if (animando) return;
        pontosTrajeto = [];
        posCaua = { x: inicio.x, y: inicio.y };
        carteiras.forEach((c) => (c.erro = false));
        feedback.textContent = mensagem;
        feedback.className = erro ? "FeedbackMiniGame erro" : "FeedbackMiniGame";
        desenharMapa();
    }

    function animarCaminhada() {
        animando = true;
        badge.textContent = "Guiando...";
        feedback.textContent = "Caminho livre! Acompanhando o Cauã até a porta...";
        feedback.className = "FeedbackMiniGame sucesso";

        let indice = 0;
        function passo() {
            if (indice < pontosTrajeto.length) {
                posCaua = pontosTrajeto[indice];
                indice += 2;
                desenharMapa();
                requestAnimationFrame(passo);
            } else {
                posCaua = { x: porta.x + porta.w / 2 - 15, y: 26 };
                desenharMapa();
                badge.textContent = "Concluído!";
                setTimeout(() => ConcluirMiniGame("Caua"), 550);
            }
        }
        requestAnimationFrame(passo);
    }

    canvas.addEventListener("pointerdown", (e) => {
        if (animando) return;
        canvas.setPointerCapture(e.pointerId);
        const pt = obterPosicaoToque(e);
        const distInicio = Math.hypot(pt.x - inicio.x, pt.y - inicio.y);

        if (distInicio <= 75) {
            desenhando = true;
            carteiras.forEach((c) => (c.erro = false));
            pontosTrajeto = [{ x: inicio.x, y: inicio.y }, pt];
            feedback.textContent = "Continue arrastando até a PORTA lá em cima!";
            feedback.className = "FeedbackMiniGame";
            desenharMapa();
        } else {
            feedback.textContent = "Toque perto da bolinha do Cauã para começar a desenhar!";
            feedback.className = "FeedbackMiniGame erro";
        }
    });

    canvas.addEventListener("pointermove", (e) => {
        if (!desenhando || animando) return;
        const pt = obterPosicaoToque(e);

        const carteiraHit = colidiuCarteira(pt);
        if (carteiraHit) {
            desenhando = false;
            carteiraHit.erro = true;
            desenharMapa();
            feedback.textContent = "Ops! Encostou na carteira. Tente contornar pelo corredor!";
            feedback.className = "FeedbackMiniGame erro";
            setTimeout(() => resetarTrajeto("Desenhe novamente a partir do Cauã."), 900);
            return;
        }

        const ultimo = pontosTrajeto[pontosTrajeto.length - 1];
        if (!ultimo || Math.hypot(pt.x - ultimo.x, pt.y - ultimo.y) >= 6) {
            pontosTrajeto.push(pt);
            desenharMapa();
        }

        if (chegouNaPorta(pt)) {
            desenhando = false;
            animarCaminhada();
        }
    });

    canvas.addEventListener("pointerup", () => {
        if (!desenhando || animando) return;
        desenhando = false;
        const ultimo = pontosTrajeto[pontosTrajeto.length - 1];
        if (ultimo && !chegouNaPorta(ultimo)) {
            feedback.textContent = "O traço parou antes da porta! Tente levar até o retângulo verde.";
            feedback.className = "FeedbackMiniGame erro";
        }
    });

    document.getElementById("btnLimparTrajeto").addEventListener("click", () => {
        resetarTrajeto("Trajeto limpo! Comece a partir do Cauã.");
    });

    desenharMapa();
}

function MontarMiniGameOsana() {
    const titulo = document.getElementById("tituloMiniGame");
    const badge = document.getElementById("badgeProgressoMiniGame");
    const instrucao = document.getElementById("instrucaoMiniGame");
    const conteudo = document.getElementById("conteudoMiniGame");
    const feedback = document.getElementById("feedbackMiniGame");

    titulo.textContent = "Desenrole as Cordas da Roda";
    badge.textContent = "0 / 5 Cordas";
    instrucao.innerHTML = `Arraste cada corda para fora da roda (ou toque nos nós coloridos) para liberar a cadeira da <strong>Osana</strong>!`;

    conteudo.innerHTML = `<canvas id="canvasOsana" width="560" height="420" class="CanvasMiniGame"></canvas>`;

    const canvas = document.getElementById("canvasOsana");
    const ctx = canvas.getContext("2d");

    const centro = { x: 280, y: 215 };
    const raioRoda = 148;
    let anguloRoda = 0;
    let concluido = false;

    const cordas = [
        { id: 1, cor: "#ef4444", angulo: -0.6,  nx: 215, ny: 135, puxada: 0, removida: false },
        { id: 2, cor: "#f59e0b", angulo: 0.5,   nx: 355, ny: 145, puxada: 0, removida: false },
        { id: 3, cor: "#ec4899", angulo: 1.5,   nx: 375, ny: 265, puxada: 0, removida: false },
        { id: 4, cor: "#38bdf8", angulo: 2.5,   nx: 245, ny: 315, puxada: 0, removida: false },
        { id: 5, cor: "#a855f7", angulo: -2.1,  nx: 175, ny: 225, puxada: 0, removida: false }
    ];

    let cordaAtiva = null;
    let inicioArrasto = { x: 0, y: 0 };

    function desenharRoda() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(centro.x, centro.y);
        ctx.rotate(anguloRoda);

        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 22;
        ctx.beginPath();
        ctx.arc(0, 0, raioRoda, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "#2dd4bf";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(0, 0, raioRoda - 14, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 4;
        for (let i = 0; i < 12; i++) {
            const a = (i * Math.PI) / 6;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(a) * (raioRoda - 16), Math.sin(a) * (raioRoda - 16));
            ctx.stroke();
        }

        ctx.fillStyle = "#9333ea";
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();

        cordas.forEach((c) => {
            if (c.removida) return;

            const offsetX = Math.cos(c.angulo) * c.puxada;
            const offsetY = Math.sin(c.angulo) * c.puxada;
            const noAtualX = c.nx + offsetX;
            const noAtualY = c.ny + offsetY;

            ctx.save();
            ctx.strokeStyle = c.cor;
            ctx.lineWidth = 11;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(centro.x, centro.y);
            ctx.quadraticCurveTo(
                (centro.x + noAtualX) / 2 + 28,
                (centro.y + noAtualY) / 2 - 28,
                noAtualX,
                noAtualY
            );
            ctx.lineTo(noAtualX + Math.cos(c.angulo) * 42, noAtualY + Math.sin(c.angulo) * 42);
            ctx.stroke();

            ctx.fillStyle = c.cor;
            ctx.beginPath();
            ctx.arc(noAtualX, noAtualY, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = "#ffffff";
            ctx.font = "800 16px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(c.id, noAtualX, noAtualY + 6);
            ctx.restore();
        });
    }

    function obterPosicao(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (canvas.width / rect.width),
            y: (e.clientY - rect.top) * (canvas.height / rect.height)
        };
    }

    function removerCorda(c) {
        if (c.removida) return;
        c.removida = true;
        const removidas = cordas.filter((item) => item.removida).length;
        badge.textContent = `${removidas} / 5 Cordas`;
        feedback.textContent = `Corda ${c.id} desenrolada! (${removidas} de 5)`;
        feedback.className = "FeedbackMiniGame sucesso";
        desenharRoda();

        if (removidas === cordas.length && !concluido) {
            concluido = true;
            feedback.textContent = "Roda totalmente livre! A Osana já pode se mover!";
            let giros = 0;
            function girarRodaLivre() {
                anguloRoda += 0.14;
                giros++;
                desenharRoda();
                if (giros < 38) {
                    requestAnimationFrame(girarRodaLivre);
                } else {
                    ConcluirMiniGame("Osana");
                }
            }
            requestAnimationFrame(girarRodaLivre);
        }
    }

    canvas.addEventListener("pointerdown", (e) => {
        if (concluido) return;
        canvas.setPointerCapture(e.pointerId);
        const pt = obterPosicao(e);

        for (let i = cordas.length - 1; i >= 0; i--) {
            const c = cordas[i];
            if (c.removida) continue;
            if (Math.hypot(pt.x - c.nx, pt.y - c.ny) <= 42) {
                cordaAtiva = c;
                inicioArrasto = pt;
                break;
            }
        }
    });

    canvas.addEventListener("pointermove", (e) => {
        if (!cordaAtiva || concluido) return;
        const pt = obterPosicao(e);
        const dist = Math.hypot(pt.x - inicioArrasto.x, pt.y - inicioArrasto.y);
        cordaAtiva.puxada = Math.min(70, dist);
        desenharRoda();

        if (dist >= 55) {
            const alvo = cordaAtiva;
            cordaAtiva = null;
            removerCorda(alvo);
        }
    });

    canvas.addEventListener("pointerup", () => {
        if (!cordaAtiva || concluido) return;
        const alvo = cordaAtiva;
        cordaAtiva = null;
        removerCorda(alvo);
    });

    desenharRoda();
}

function MontarMiniGameRamirez() {
    const titulo = document.getElementById("tituloMiniGame");
    const badge = document.getElementById("badgeProgressoMiniGame");
    const instrucao = document.getElementById("instrucaoMiniGame");
    const conteudo = document.getElementById("conteudoMiniGame");
    const feedback = document.getElementById("feedbackMiniGame");

    titulo.textContent = "Comunique-se com Sinais";

    const etapas = [
        {
            progresso: "Etapa 1 / 2",
            pergunta: "Você tocou no ombro do Ramirez e ele olhou para você. Qual sinal de mão você faz primeiro para cumprimentá-lo?",
            opcoes: [
                {
                    texto: "Acenar com a mão aberta sorrindo (Oi / Tudo bem?)",
                    correta: true,
                    dica: "Perfeito! Um aceno claro e acolhedor inicia bem a conversa.",
                    svg: `<svg viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="52" fill="#dbeafe"/>
                            <path d="M42 78 V42 a6 6 0 0 1 12 0 v20 V34 a6 6 0 0 1 12 0 v28 V38 a6 6 0 0 1 12 0 v26 V48 a6 6 0 0 1 11 0 v28 c0 16-11 26-26 26 H52 c-10 0-17-7-19-16 l-5-16 a6 6 0 0 1 11-4 l3 12z" fill="#fbbf24" stroke="#1e293b" stroke-width="4" stroke-linejoin="round"/>
                            <path d="M22 36 Q16 48 22 60 M98 36 Q104 48 98 60" fill="none" stroke="#2563eb" stroke-width="4" stroke-linecap="round"/>
                          </svg>`
                },
                {
                    texto: "Apontar o dedo indicador na cara dele",
                    correta: false,
                    dica: "Apontar o dedo diretamente no rosto pode parecer agressivo. Tente outro sinal!",
                    svg: `<svg viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="52" fill="#fee2e2"/>
                            <path d="M52 65 V26 a7 7 0 0 1 14 0 v39 h14 a8 8 0 0 1 8 8 v14 c0 13-10 21-24 21 H52 c-12 0-20-8-20-20 V72 a8 8 0 0 1 8-8 z" fill="#f87171" stroke="#1e293b" stroke-width="4"/>
                          </svg>`
                },
                {
                    texto: "Fazer sinal de 'Pare' com a mão rígida",
                    correta: false,
                    dica: "Esse gesto indica para ele parar, não é um cumprimento. Tente novamente!",
                    svg: `<svg viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="52" fill="#fef3c7"/>
                            <rect x="38" y="34" width="44" height="54" rx="14" fill="#fb923c" stroke="#1e293b" stroke-width="4"/>
                            <line x1="30" y1="30" x2="90" y2="90" stroke="#dc2626" stroke-width="6" stroke-linecap="round"/>
                          </svg>`
                }
            ]
        },
        {
            progresso: "Etapa 2 / 2",
            pergunta: "Ótimo! Agora o Ramirez está atento. Qual gesto você faz para avisar que é hora do recreio e convidá-lo para sair?",
            opcoes: [
                {
                    texto: "Mãos juntas ao lado do rosto (Sinal de Dormir)",
                    correta: false,
                    dica: "Esse sinal significa dormir/descansar, não hora do recreio!",
                    svg: `<svg viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="52" fill="#e0e7ff"/>
                            <path d="M44 42 c10-8 24-4 30 8 l8 24 c3 9-3 18-12 20 l-16 3 c-9 2-18-4-20-13 l-6-22 c-2-9 5-16 16-20z" fill="#a5b4fc" stroke="#1e293b" stroke-width="4"/>
                            <text x="76" y="38" font-size="18" font-weight="800" fill="#312e81">Zzz</text>
                          </svg>`
                },
                {
                    texto: "Sinal de 'Vamos / Recreio' (chamar para frente e apontar a porta)",
                    correta: true,
                    dica: "Excelente! O Ramirez entendeu perfeitamente o convite para o recreio!",
                    svg: `<svg viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="52" fill="#dcfce7"/>
                            <path d="M32 72 c0-14 10-24 24-24 h22 l-8-10 a6 6 0 0 1 9-8 l20 22 a6 6 0 0 1 0 8 L79 82 a6 6 0 0 1-9-8 l8-10 H56 c-6 0-10 4-10 10 v14 a7 7 0 0 1-14 0 z" fill="#4ade80" stroke="#14532d" stroke-width="4" stroke-linejoin="round"/>
                          </svg>`
                },
                {
                    texto: "Polegar para baixo (Sinal de Negativo)",
                    correta: false,
                    dica: "Polegar para baixo significa 'não'. Escolha o sinal que convida para o recreio!",
                    svg: `<svg viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="52" fill="#fee2e2"/>
                            <path d="M54 56 v34 a7 7 0 0 0 14 0 V56 h12 a8 8 0 0 0 8-8 V34 c0-12-10-20-23-20 H52 c-11 0-19 8-19 19 v15 a8 8 0 0 0 8 8 z" fill="#f87171" stroke="#1e293b" stroke-width="4"/>
                          </svg>`
                }
            ]
        }
    ];

    let etapaAtual = 0;
    let bloqueado = false;

    function renderizarEtapa() {
        const dados = etapas[etapaAtual];
        bloqueado = false;
        badge.textContent = dados.progresso;
        instrucao.textContent = dados.pergunta;
        feedback.textContent = "";
        feedback.className = "FeedbackMiniGame";

        conteudo.innerHTML = `
            <div class="GradeSinais">
                ${dados.opcoes
                    .map(
                        (op, idx) => `
                    <button type="button" class="CardSinal" data-indice="${idx}">
                        ${op.svg}
                        <span class="TituloCardSinal">${op.texto}</span>
                    </button>
                `
                    )
                    .join("")}
            </div>
        `;

        conteudo.querySelectorAll(".CardSinal").forEach((card) => {
            card.addEventListener("click", () => {
                if (bloqueado) return;
                const idx = Number(card.getAttribute("data-indice"));
                const opcao = dados.opcoes[idx];

                if (opcao.correta) {
                    bloqueado = true;
                    card.classList.add("correto");
                    feedback.textContent = opcao.dica;
                    feedback.className = "FeedbackMiniGame sucesso";

                    setTimeout(() => {
                        etapaAtual++;
                        if (etapaAtual < etapas.length) {
                            renderizarEtapa();
                        } else {
                            ConcluirMiniGame("Ramirez");
                        }
                    }, 950);
                } else {
                    card.classList.remove("errado");
                    void card.offsetWidth;
                    card.classList.add("errado");
                    feedback.textContent = opcao.dica;
                    feedback.className = "FeedbackMiniGame erro";
                }
            });
        });
    }

    renderizarEtapa();
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

    rankingSalvo.sort((a, b) => b.pontos - a.pontos);
    localStorage.setItem("rankingAcademia", JSON.stringify(rankingSalvo.slice(0, 3)));

    window.location.href = "index.html";
}
