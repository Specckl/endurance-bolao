// ============================================================
// Endurance Bolão - Oitavas de Final do Bolão
// ============================================================
// Mata-mata entre os 16 melhores colocados (chaveamento padrão).
// Cada confronto se decide pela pontuação nos jogos da Copa.
// ============================================================

const PLAYOFF_BRACKET = {
    r16: [
        { id: 'M1', seed1: 1,  seed2: 16 },
        { id: 'M2', seed1: 8,  seed2: 9  },
        { id: 'M3', seed1: 4,  seed2: 13 },
        { id: 'M4', seed1: 5,  seed2: 12 },
        { id: 'M5', seed1: 2,  seed2: 15 },
        { id: 'M6', seed1: 7,  seed2: 10 },
        { id: 'M7', seed1: 3,  seed2: 14 },
        { id: 'M8', seed1: 6,  seed2: 11 }
    ],
    qf: [
        { id: 'Q1', from1: 'M1', from2: 'M2' },
        { id: 'Q2', from1: 'M3', from2: 'M4' },
        { id: 'Q3', from1: 'M5', from2: 'M6' },
        { id: 'Q4', from1: 'M7', from2: 'M8' }
    ],
    sf: [
        { id: 'S1', from1: 'Q1', from2: 'Q2' },
        { id: 'S2', from1: 'Q3', from2: 'Q4' }
    ],
    final: [
        { id: 'F1', from1: 'S1', from2: 'S2' }
    ]
};

const PLAYOFF_ROUND_LABELS = {
    r16: 'Oitavas de Final',
    qf: 'Quartas de Final',
    sf: 'Semifinais',
    final: 'Final'
};

// ---- Estado (módulo) ----
let _playoffCache = {
    ranked: [],          // todos os usuarios ordenados (com codigo)
    top16: [],           // top 16 ja filtrado (sem escondidos)
    hidden: new Set(),   // codigos dos escondidos
    standings: {},       // standings por grupo da Copa
    realResults: {}      // resultados postados pelo admin
};

// ============================================================
// LOAD PRINCIPAL
// ============================================================
async function loadPlayoffPage() {
    const container = document.getElementById('playoff-container');
    container.innerHTML = '<p class="loading">Carregando chaveamento...</p>';

    try {
        const db = firebase.firestore();
        const [usersSnap, resultsDoc, playoffDoc] = await Promise.all([
            db.collection('users').get(),
            db.collection('config').doc('results').get(),
            db.collection('config').doc('playoff').get()
        ]);

        const realResults = resultsDoc.exists ? (resultsDoc.data().matches || {}) : {};

        const ranked = [];
        usersSnap.forEach(doc => {
            const d = doc.data();
            const stats = computeUserGroupStats({ bets: d.bets }, realResults);
            ranked.push({
                code: doc.id,
                name: d.name || '?',
                points: stats.total,
                exact: stats.exact,
                winner: stats.winner,
                playoffBets: d.playoffBets || {}
            });
        });

        // Ordena com os desempates: pontos -> exatos -> vencedores -> nome
        ranked.sort((a, b) => compareForRanking(
            { total: a.points, exact: a.exact, winner: a.winner, name: a.name },
            { total: b.points, exact: b.exact, winner: b.winner, name: b.name }
        ));

        const standings = (typeof computeAllStandings === 'function')
            ? computeAllStandings(realResults) : {};
        const hidden = new Set(playoffDoc.exists ? (playoffDoc.data().hiddenUsers || []) : []);

        const filtered = ranked.filter(u => !hidden.has(u.code));
        const top16 = filtered.slice(0, 16);

        const advancement = top16.length === 16
            ? determinePlayoffAdvancement(top16, realResults)
            : { r16: {}, qf: {}, sf: {}, final: {} };

        _playoffCache = { ranked, top16, hidden, standings, realResults, advancement };

        renderPlayoffBracket(container, top16, advancement);
    } catch (error) {
        console.error('Erro ao carregar oitavas do bolão:', error);
        container.innerHTML = '<p class="loading">Erro ao carregar dados.</p>';
    }
}

// ============================================================
// RENDER DO BRACKET (16 melhores)
// ============================================================
function renderPlayoffBracket(container, top16, advancement) {
    container.innerHTML = '';

    if (top16.length < 16) {
        const warn = document.createElement('div');
        warn.className = 'playoff-warning';
        warn.innerHTML = `<p>⚠️ Necessário pelo menos 16 participantes ativos (atual: ${top16.length}).</p>`;
        container.appendChild(warn);
        return;
    }

    const seedTeam = (seedNum) => top16[seedNum - 1];

    const bracket = document.createElement('div');
    bracket.className = 'knockout-bracket';

    // ---- Helpers ----
    const teamLine = (user, seedLabel, pts, isWinner) => `
        <div class="knockout-team defined playoff-team ${isWinner ? 'winner' : ''}">
            <span class="playoff-seed">${seedLabel}</span>
            <span class="playoff-name">${user.name}</span>
            <span class="playoff-pts">${pts !== undefined ? pts + ' pts' : ''}</span>
        </div>
    `;
    const pendingLine = (label) => `
        <div class="knockout-team pending">
            <span class="pending-label">${label}</span>
        </div>
    `;
    const seedOf = (user) => top16.findIndex(u => u.code === user.code) + 1;

    // ---- Oitavas ----
    const colR16 = document.createElement('div');
    colR16.className = 'knockout-column';
    const titleR16 = document.createElement('h3');
    titleR16.className = 'knockout-round-title';
    titleR16.textContent = PLAYOFF_ROUND_LABELS.r16;
    colR16.appendChild(titleR16);

    PLAYOFF_BRACKET.r16.forEach(match => {
        const t1 = seedTeam(match.seed1);
        const t2 = seedTeam(match.seed2);
        const adv = advancement.r16[match.id] || {};
        const w = adv.winner;
        const isWin1 = w && w.code === t1.code;
        const isWin2 = w && w.code === t2.code;
        const showPts = adv.p1 !== undefined && (adv.decided || adv.p1 > 0 || adv.p2 > 0);

        const matchEl = document.createElement('div');
        matchEl.className = 'knockout-match';
        matchEl.innerHTML = `
            <div class="knockout-match-id">${match.id} · ${match.seed1}º × ${match.seed2}º</div>
            ${teamLine(t1, match.seed1 + 'º', showPts ? adv.p1 : undefined, isWin1)}
            <div class="knockout-vs">×</div>
            ${teamLine(t2, match.seed2 + 'º', showPts ? adv.p2 : undefined, isWin2)}
        `;
        colR16.appendChild(matchEl);
    });
    bracket.appendChild(colR16);

    // ---- Quartas, Semis, Final ----
    const renderRound = (round) => {
        const col = document.createElement('div');
        col.className = `knockout-column knockout-${round}`;
        const title = document.createElement('h3');
        title.className = 'knockout-round-title';
        title.textContent = PLAYOFF_ROUND_LABELS[round];
        col.appendChild(title);

        PLAYOFF_BRACKET[round].forEach(match => {
            const adv = advancement[round][match.id] || {};
            const u1 = adv.u1;
            const u2 = adv.u2;
            const w = adv.winner;

            const matchEl = document.createElement('div');
            matchEl.className = 'knockout-match';

            const slot1HTML = u1
                ? teamLine(u1, seedOf(u1) + 'º', adv.p1, w && w.code === u1.code)
                : pendingLine(`Vencedor ${match.from1}`);
            const slot2HTML = u2
                ? teamLine(u2, seedOf(u2) + 'º', adv.p2, w && w.code === u2.code)
                : pendingLine(`Vencedor ${match.from2}`);

            matchEl.innerHTML = `
                <div class="knockout-match-id">${match.id}</div>
                ${slot1HTML}
                <div class="knockout-vs">×</div>
                ${slot2HTML}
            `;
            col.appendChild(matchEl);
        });
        bracket.appendChild(col);
    };

    renderRound('qf');
    renderRound('sf');
    renderRound('final');

    container.appendChild(bracket);

    const note = document.createElement('div');
    note.className = 'playoff-note';
    note.innerHTML = `
        <strong>Como funciona o chaveamento:</strong>
        <ul>
            <li>1º e 2º colocados só podem se enfrentar na <strong>Final</strong></li>
            <li>1º e 3º colocados só podem se enfrentar na <strong>Final</strong></li>
            <li>1º e 4º colocados só podem se enfrentar na <strong>Semifinal</strong></li>
            <li>2º e 3º colocados só podem se enfrentar na <strong>Semifinal</strong></li>
            <li>Empate de pontos numa fase: avança quem tem <strong>melhor seed</strong> (posição original na fase de grupos)</li>
        </ul>
    `;
    container.appendChild(note);
}

// ============================================================
// MODAL E AUTENTICAÇÃO
// ============================================================
function openPlayoffModal() {
    document.getElementById('playoff-modal').classList.remove('hidden');
    document.getElementById('playoff-modal-login').classList.remove('hidden');
    document.getElementById('playoff-modal-eliminated').classList.add('hidden');
    document.getElementById('playoff-modal-bets').classList.add('hidden');
    document.getElementById('playoff-code-input').value = '';
    setTimeout(() => document.getElementById('playoff-code-input').focus(), 100);
}

function closePlayoffModal() {
    document.getElementById('playoff-modal').classList.add('hidden');
}

const PHASE_LABELS = {
    r16: 'Oitavas',
    qf:  'Quartas',
    sf:  'Semis',
    final: 'Final'
};

// Determina onde o usuario esta na jornada do bolao.
// Retorna: { inTop16, eliminated?, eliminatedAt?, lostTo?, myPoints?, oppPoints?, alive?, currentPhase?, champion?, user? }
function getUserPlayoffStatus(userCode, top16, advancement) {
    const user = top16.find(u => u.code === userCode);
    if (!user) return { inTop16: false };

    const order = ['r16', 'qf', 'sf', 'final'];
    for (const phase of order) {
        const phaseMatches = advancement[phase] || {};
        let userMatch = null;
        for (const mid of Object.keys(phaseMatches)) {
            const m = phaseMatches[mid];
            if (m.u1?.code === userCode || m.u2?.code === userCode) {
                userMatch = m;
                break;
            }
        }

        if (!userMatch) {
            // Ainda nao apareceu neste bracket (fase futura sem times definidos).
            // Como chegamos aqui, ganhou as fases anteriores.
            return { inTop16: true, alive: true, currentPhase: phase, user };
        }

        if (!userMatch.decided) {
            return { inTop16: true, alive: true, currentPhase: phase, user, currentMatch: userMatch };
        }

        if (userMatch.winner?.code !== userCode) {
            const isU1 = userMatch.u1.code === userCode;
            return {
                inTop16: true,
                eliminated: true,
                eliminatedAt: phase,
                lostTo: isU1 ? userMatch.u2 : userMatch.u1,
                myPoints: isU1 ? userMatch.p1 : userMatch.p2,
                oppPoints: isU1 ? userMatch.p2 : userMatch.p1,
                user
            };
        }
        // Ganhou essa fase, segue pra proxima
    }
    return { inTop16: true, champion: true, user };
}

function showNotInTop16Message(user, code) {
    const elim = document.getElementById('playoff-modal-eliminated');
    document.getElementById('eliminated-icon').textContent = '😢';
    document.getElementById('eliminated-title').textContent = 'Lamento informar';
    document.getElementById('eliminated-message').innerHTML = 'Você está <strong>eliminado</strong> do mata-mata.';
    document.getElementById('eliminated-small').textContent = 'Apenas os 16 melhores colocados na fase de grupos se classificam.';
    const position = _playoffCache.ranked.findIndex(u => u.code === code) + 1;
    const hidden = _playoffCache.hidden.has(code);
    document.getElementById('eliminated-user-info').innerHTML = `
        <div class="eliminated-user-line">
            <strong>${user.name}</strong> — ${user.points} pts
            ${hidden ? '<br><span class="small">Você optou por não participar do mata-mata.</span>'
                     : `<br><span class="small">Posição atual: ${position}º (apenas top 16 avança)</span>`}
        </div>
    `;
    elim.classList.remove('hidden');
}

function showEliminatedInPhase(status) {
    const elim = document.getElementById('playoff-modal-eliminated');
    document.getElementById('eliminated-icon').textContent = '😢';
    document.getElementById('eliminated-title').textContent = 'Fim de jornada';
    document.getElementById('eliminated-message').innerHTML =
        `Você foi eliminado nas <strong>${PHASE_LABELS[status.eliminatedAt]} do Bolão</strong>.`;
    document.getElementById('eliminated-small').textContent =
        'Não é mais possível apostar. Obrigado por participar!';
    document.getElementById('eliminated-user-info').innerHTML = `
        <div class="eliminated-user-line">
            <strong>${status.user.name}</strong>: <strong>${status.myPoints} pts</strong>
            <br>
            <span class="small">Perdeu para <strong>${status.lostTo.name}</strong> (${status.oppPoints} pts)</span>
        </div>
    `;
    elim.classList.remove('hidden');
}

function showChampionMessage(status) {
    const elim = document.getElementById('playoff-modal-eliminated');
    document.getElementById('eliminated-icon').textContent = '🏆';
    document.getElementById('eliminated-title').textContent = 'CAMPEÃO!';
    document.getElementById('eliminated-message').innerHTML =
        `Parabéns, <strong>${status.user.name}</strong>! Você venceu o bolão!`;
    document.getElementById('eliminated-small').textContent = 'A vitória é sua. Aproveite.';
    document.getElementById('eliminated-user-info').innerHTML = '';
    elim.classList.remove('hidden');
}

async function handlePlayoffLogin() {
    const code = document.getElementById('playoff-code-input').value.trim().toUpperCase();
    if (code.length !== 6) {
        showToast('O código deve ter 6 caracteres.', 'error');
        return;
    }

    if (!_playoffCache.ranked.length) {
        await loadPlayoffPage();
    }

    const rawUser = _playoffCache.ranked.find(u => u.code === code);
    if (!rawUser) {
        showToast('Código não encontrado!', 'error');
        return;
    }

    document.getElementById('playoff-modal-login').classList.add('hidden');

    // Caso 1: fora do top 16 (eliminado antes mesmo do mata-mata)
    if (!_playoffCache.top16.some(u => u.code === code)) {
        showNotInTop16Message(rawUser, code);
        return;
    }

    // Caso 2/3/4: dentro do top 16 - verifica status na jornada
    const status = getUserPlayoffStatus(code, _playoffCache.top16, _playoffCache.advancement || {});

    if (status.eliminated) {
        showEliminatedInPhase(status);
        return;
    }
    if (status.champion) {
        showChampionMessage(status);
        return;
    }

    // Vivo — mostra form da fase atual
    renderPlayoffBetsForm(rawUser, status.currentPhase);
}

// ============================================================
// FORMULÁRIO DE PALPITES
// ============================================================
function renderPlayoffBetsForm(user, phaseKey) {
    const container = document.getElementById('playoff-modal-bets');
    container.classList.remove('hidden');

    const seedIdx = _playoffCache.top16.findIndex(u => u.code === user.code) + 1;

    const welcomeMap = {
        r16:   'Você está nas Oitavas! Faça seus palpites abaixo.',
        qf:    '🎉 Você avançou para as Quartas! Faça seus palpites abaixo.',
        sf:    '🎉 Você chegou às Semis! Faça seus palpites abaixo.',
        final: '🎉 Você chegou à FINAL! Faça seu palpite abaixo.'
    };
    const welcome = welcomeMap[phaseKey] || 'Faça seus palpites abaixo.';

    document.getElementById('playoff-user-card').innerHTML = `
        <div class="playoff-user-line">
            <span class="playoff-seed">${seedIdx}º</span>
            <strong>${user.name}</strong>
            <span class="playoff-pts">${user.points} pts</span>
        </div>
        <p class="small">${welcome}</p>
    `;

    const betsContainer = document.getElementById('playoff-bets-container');
    betsContainer.innerHTML = '';

    // Renderiza APENAS a fase corrente do usuario
    const allPhases = [
        { round: 'r16',   label: '🎯 Oitavas da Copa (decide bolão Oitavas)' },
        { round: 'qf',    label: '🏅 Quartas da Copa (decide bolão Quartas)' },
        { round: 'sf',    label: '🥈 Semifinais da Copa (decide bolão Semis)' },
        { round: 'final', label: '🏆 Final da Copa (decide bolão Final)' }
    ];
    const phases = phaseKey ? allPhases.filter(p => p.round === phaseKey) : allPhases;

    let anyOpen = false;

    phases.forEach(({ round, label }) => {
        const matches = getKnockoutMatchesByRound(round)
            .slice()
            .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
        const section = document.createElement('div');
        section.className = 'playoff-phase';

        const header = document.createElement('h4');
        header.className = 'playoff-phase-title';
        header.textContent = label;
        section.appendChild(header);

        matches.forEach(match => {
            const slot1 = resolveKnockoutSlot(match.slot1, _playoffCache.standings, _playoffCache.realResults, match.id);
            const slot2 = resolveKnockoutSlot(match.slot2, _playoffCache.standings, _playoffCache.realResults, match.id);
            const teamsDefined = !!slot1.team && !!slot2.team;
            const locked = isMatchLocked(match);
            const existingBet = user.playoffBets[match.id] || {};

            const matchEl = document.createElement('div');
            matchEl.className = 'playoff-bet-match';

            const dateStr = new Date(match.kickoff).toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
            });

            let body;
            if (!teamsDefined) {
                body = `<div class="playoff-bet-status pending">⏳ Aguardando definição dos times</div>`;
            } else if (locked) {
                const bet1 = existingBet.score1 !== undefined ? existingBet.score1 : '-';
                const bet2 = existingBet.score2 !== undefined ? existingBet.score2 : '-';
                body = `
                    <div class="playoff-bet-row">
                        <span class="team-name">${slot1.team}</span>
                        ${getFlagImg(slot1.team)}
                        <span class="score-locked">${bet1} × ${bet2}</span>
                        ${getFlagImg(slot2.team)}
                        <span class="team-name">${slot2.team}</span>
                    </div>
                    <div class="playoff-bet-status locked">🔒 Bloqueado</div>
                `;
            } else {
                anyOpen = true;
                body = `
                    <div class="playoff-bet-row">
                        <span class="team-name">${slot1.team}</span>
                        ${getFlagImg(slot1.team)}
                        <input type="number" min="0" max="20" class="playoff-bet-input"
                               data-match-id="${match.id}" data-side="1"
                               value="${existingBet.score1 !== undefined ? existingBet.score1 : ''}">
                        <span class="vs-x">×</span>
                        <input type="number" min="0" max="20" class="playoff-bet-input"
                               data-match-id="${match.id}" data-side="2"
                               value="${existingBet.score2 !== undefined ? existingBet.score2 : ''}">
                        ${getFlagImg(slot2.team)}
                        <span class="team-name">${slot2.team}</span>
                    </div>
                    <div class="playoff-bet-status open">📅 ${dateStr} · Bloqueia 1h antes</div>
                `;
            }

            matchEl.innerHTML = `
                <div class="playoff-bet-id">Jogo ${match.id}</div>
                ${body}
            `;
            section.appendChild(matchEl);
        });

        betsContainer.appendChild(section);
    });

    let saveBtn = document.getElementById('btn-save-playoff-bets');
    if (!saveBtn) {
        saveBtn = document.createElement('button');
        saveBtn.id = 'btn-save-playoff-bets';
        saveBtn.className = 'btn-primary playoff-save-btn';
        saveBtn.textContent = '💾 Salvar Palpites';
        betsContainer.appendChild(saveBtn);
    }
    saveBtn.onclick = () => savePlayoffBets(user);

    if (!anyOpen) {
        saveBtn.disabled = true;
        saveBtn.textContent = '⏳ Nenhum palpite liberado no momento';
    }
}

async function savePlayoffBets(user) {
    const inputs = document.querySelectorAll('.playoff-bet-input');
    const newBets = { ...(user.playoffBets || {}) };
    const updated = {};

    inputs.forEach(inp => {
        const matchId = inp.dataset.matchId;
        const side = inp.dataset.side;
        const val = inp.value.trim();
        if (val === '') return;
        if (!updated[matchId]) updated[matchId] = {};
        updated[matchId][`score${side}`] = parseInt(val);
    });

    // Só persiste os palpites com ambos os scores preenchidos
    let countSaved = 0;
    Object.keys(updated).forEach(mid => {
        const b = updated[mid];
        if (b.score1 !== undefined && b.score2 !== undefined) {
            newBets[mid] = { score1: b.score1, score2: b.score2 };
            countSaved++;
        }
    });

    if (countSaved === 0) {
        showToast('Preencha pelo menos um placar completo.', 'error');
        return;
    }

    try {
        await firebase.firestore().collection('users').doc(user.code).update({
            playoffBets: newBets
        });
        // Atualiza cache local
        user.playoffBets = newBets;
        showToast(`${countSaved} palpite(s) salvo(s)!`, 'success');
    } catch (err) {
        console.error('Erro ao salvar palpites do mata-mata:', err);
        showToast('Erro ao salvar. Verifique sua conexão.', 'error');
    }
}

// ============================================================
// Hooks UI
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('btn-open-playoff-bets');
    if (openBtn) openBtn.addEventListener('click', openPlayoffModal);

    const closeBtn = document.getElementById('btn-close-playoff-modal');
    if (closeBtn) closeBtn.addEventListener('click', closePlayoffModal);

    const overlay = document.querySelector('#playoff-modal .modal-overlay');
    if (overlay) overlay.addEventListener('click', closePlayoffModal);

    const loginBtn = document.getElementById('btn-playoff-login');
    if (loginBtn) loginBtn.addEventListener('click', handlePlayoffLogin);

    const codeInput = document.getElementById('playoff-code-input');
    if (codeInput) {
        codeInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') handlePlayoffLogin();
        });
    }
});
