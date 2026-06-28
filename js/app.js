// ============================================================
// Endurance Bolão - Lógica Principal
// ============================================================

const db = firebase.firestore();
const ADMIN_PASSWORD = "specckl2026"; // Senha do admin

// ---- NAVEGAÇÃO ----
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`page-${btn.dataset.page}`).classList.add('active');

        if (btn.dataset.page === 'ranking') loadRanking();
        if (btn.dataset.page === 'view-bet') loadParticipantsList();
        if (btn.dataset.page === 'bracket') loadBracketPage();
        if (btn.dataset.page === 'playoff') loadPlayoffPage();
    });
});

// ---- UTILITÁRIOS ----
function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    const array = new Uint8Array(6);
    crypto.getRandomValues(array);
    for (let i = 0; i < 6; i++) {
        code += chars[array[i] % chars.length];
    }
    return code;
}

function formatDate(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function isBeforeDeadline() {
    return new Date() < DEADLINE;
}

function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ---- SISTEMA DE PONTUAÇÃO ----
function calculatePoints(userScore1, userScore2, realScore1, realScore2) {
    if (realScore1 === null || realScore2 === null ||
        userScore1 === null || userScore2 === null ||
        realScore1 === undefined || realScore2 === undefined ||
        userScore1 === undefined || userScore2 === undefined) {
        return 0;
    }

    const u1 = parseInt(userScore1);
    const u2 = parseInt(userScore2);
    const r1 = parseInt(realScore1);
    const r2 = parseInt(realScore2);

    if (isNaN(u1) || isNaN(u2) || isNaN(r1) || isNaN(r2)) return 0;

    // Placar exato = 12 pontos (sem somas adicionais)
    if (u1 === r1 && u2 === r2) return 12;

    let points = 0;

    // Verificar se acertou o vencedor (ou empate)
    const realResult = r1 > r2 ? 'home' : r1 < r2 ? 'away' : 'draw';
    const userResult = u1 > u2 ? 'home' : u1 < u2 ? 'away' : 'draw';

    if (realResult === userResult) {
        points += 3;
    }

    // Verificar se acertou a quantidade de gols de algum time
    if (u1 === r1) points += 3;
    if (u2 === r2) points += 3;

    return points;
}

// ---- RENDERIZAR FORMULÁRIO DE JOGOS ----
function renderMatchesForm(containerId, existingBets = {}, editable = true, isAdmin = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const groups = {};
    MATCHES_DATA.forEach(m => {
        if (!groups[m.group]) groups[m.group] = [];
        groups[m.group].push(m);
    });

    Object.keys(groups).sort().forEach(groupKey => {
        const section = document.createElement('div');
        section.className = 'group-section';

        const header = document.createElement('div');
        header.className = 'group-header';
        header.textContent = `Grupo ${groupKey}`;
        section.appendChild(header);

        groups[groupKey].sort((a, b) => a.id - b.id).forEach(match => {
            const card = document.createElement('div');
            card.className = 'match-card';

            const bet = existingBets[match.id] || {};
            const defaultVal = isAdmin ? '' : 0;
            const val1 = bet.score1 !== undefined ? bet.score1 : defaultVal;
            const val2 = bet.score2 !== undefined ? bet.score2 : defaultVal;

            card.innerHTML = `
                <div class="match-date">📅 ${formatDate(match.date)} | Jogo #${match.id}</div>
                <div class="match-teams">
                    <span class="team-name team-left">${sanitize(match.team1)}</span>
                    ${getFlagImg(match.team1)}
                    <input type="number" class="score-input" data-match="${match.id}" data-team="1"
                           min="0" max="20" value="${val1}"
                           placeholder="-" ${!editable ? 'disabled' : ''}>
                    <span class="score-separator">×</span>
                    <input type="number" class="score-input" data-match="${match.id}" data-team="2"
                           min="0" max="20" value="${val2}"
                           placeholder="-" ${!editable ? 'disabled' : ''}>
                    ${getFlagImg(match.team2)}
                    <span class="team-name team-right">${sanitize(match.team2)}</span>
                </div>
            `;

            section.appendChild(card);
        });

        container.appendChild(section);
    });
}

function collectBets(containerId, onlyFilled = false) {
    const bets = {};
    const inputs = document.querySelectorAll(`#${containerId} .score-input`);
    inputs.forEach(input => {
        const matchId = input.dataset.match;
        const team = input.dataset.team;
        if (!bets[matchId]) bets[matchId] = {};
        const val = input.value.trim();
        if (val !== '') {
            bets[matchId][`score${team}`] = parseInt(val);
        } else if (!onlyFilled) {
            bets[matchId][`score${team}`] = 0;
        }
    });
    if (onlyFilled) {
        Object.keys(bets).forEach(id => {
            if (bets[id].score1 === undefined || bets[id].score2 === undefined) {
                delete bets[id];
            }
        });
    }
    return bets;
}


// ---- PÁGINA: VER RESULTADOS ----
async function loadParticipantsList() {
    const select = document.getElementById('access-code');
    const currentValue = select.value;

    try {
        const snapshot = await db.collection('users').orderBy('name').get();
        select.innerHTML = '<option value="">-- Escolha um participante --</option>';
        snapshot.forEach(doc => {
            const data = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = `${data.name} (${data.totalPoints || 0} pts)`;
            select.appendChild(option);
        });
        if (currentValue) select.value = currentValue;
    } catch (error) {
        console.error('Erro ao carregar participantes:', error);
        showToast('Erro ao carregar lista de participantes.', 'error');
    }
}

document.getElementById('access-code').addEventListener('change', async (e) => {
    const code = e.target.value;
    const editContainer = document.getElementById('edit-container');

    if (!code) {
        editContainer.classList.add('hidden');
        return;
    }

    try {
        const doc = await db.collection('users').doc(code).get();
        if (!doc.exists) {
            showToast('Participante não encontrado!', 'error');
            return;
        }

        const data = doc.data();
        editContainer.classList.remove('hidden');
        document.getElementById('edit-user-name').textContent = `👤 ${data.name}`;
        document.getElementById('edit-user-points').textContent = `⭐ ${data.totalPoints || 0} pontos`;

        const resultsDoc = await db.collection('config').doc('results').get();
        const realResults = resultsDoc.exists ? resultsDoc.data().matches || {} : {};

        renderBetsWithResults('edit-matches-container', data.bets || {}, realResults);

    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao carregar dados.', 'error');
    }
});

function renderBetsWithResults(containerId, userBets, realResults) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const groups = {};
    MATCHES_DATA.forEach(m => {
        if (!groups[m.group]) groups[m.group] = [];
        groups[m.group].push(m);
    });

    Object.keys(groups).sort().forEach(groupKey => {
        const section = document.createElement('div');
        section.className = 'group-section';

        const header = document.createElement('div');
        header.className = 'group-header';
        header.textContent = `Grupo ${groupKey}`;
        section.appendChild(header);

        groups[groupKey].sort((a, b) => a.id - b.id).forEach(match => {
            const card = document.createElement('div');
            card.className = 'match-card';

            const bet = userBets[match.id] || {};
            const real = realResults[match.id] || {};
            const hasReal = real.score1 !== undefined && real.score2 !== undefined;
            const hasBet = bet.score1 !== undefined && bet.score2 !== undefined;
            const pts = hasReal && hasBet ? calculatePoints(bet.score1, bet.score2, real.score1, real.score2) : null;

            let ptsClass = 'pts-0';
            if (pts === 12) ptsClass = 'pts-12';
            else if (pts >= 6) ptsClass = 'pts-6';
            else if (pts === 3) ptsClass = 'pts-3';

            const betDisplay1 = hasBet ? bet.score1 : '-';
            const betDisplay2 = hasBet ? bet.score2 : '-';
            const ptsDisplay = pts !== null ? `${pts} pts` : '';
            const realDisplay = hasReal ? `Resultado real: ${real.score1} × ${real.score2}` : '';

            card.innerHTML = `
                <div class="match-date">📅 ${formatDate(match.date)} | Jogo #${match.id}</div>
                <div class="match-teams">
                    <span class="team-name team-left">${sanitize(match.team1)}</span>
                    ${getFlagImg(match.team1)}
                    <span class="score-display">${betDisplay1} × ${betDisplay2}</span>
                    ${getFlagImg(match.team2)}
                    <span class="team-name team-right">${sanitize(match.team2)}</span>
                    ${pts !== null ? `<span class="match-points ${ptsClass}">${ptsDisplay}</span>` : ''}
                </div>
                ${realDisplay ? `<div class="real-result">✅ ${realDisplay}</div>` : ''}
            `;

            section.appendChild(card);
        });

        container.appendChild(section);
    });
}

// ---- PÁGINA: CLASSIFICAÇÃO ----
async function loadRanking() {
    const container = document.getElementById('ranking-container');
    container.innerHTML = '<p class="loading">Carregando...</p>';

    try {
        const [usersSnap, resultsDoc] = await Promise.all([
            db.collection('users').get(),
            db.collection('config').doc('results').get()
        ]);

        if (usersSnap.empty) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="emoji">🏟️</div>
                    <p>Nenhum participante ainda.</p>
                </div>
            `;
            return;
        }

        const realResults = resultsDoc.exists ? (resultsDoc.data().matches || {}) : {};
        const users = [];
        usersSnap.forEach(doc => {
            const d = doc.data();
            const stats = computeUserGroupStats({ bets: d.bets }, realResults);
            users.push({ name: d.name || '?', ...stats });
        });
        users.sort(compareForRanking);

        let html = `
            <table class="ranking-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Participante</th>
                        <th>Pontos</th>
                        <th title="Placares exatos">🎯</th>
                        <th title="Vencedores/empates">✅</th>
                    </tr>
                </thead>
                <tbody>
        `;

        users.forEach((u, i) => {
            const rank = i + 1;
            let badgeClass = 'normal';
            if (rank === 1) badgeClass = 'gold';
            else if (rank === 2) badgeClass = 'silver';
            else if (rank === 3) badgeClass = 'bronze';

            html += `
                <tr>
                    <td><span class="rank-badge ${badgeClass}">${rank}</span></td>
                    <td>${sanitize(u.name)}</td>
                    <td class="points-cell">${u.total}</td>
                    <td class="tiebreak-cell">${u.exact}</td>
                    <td class="tiebreak-cell">${u.winner}</td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;

    } catch (error) {
        console.error('Erro ao carregar ranking:', error);
        container.innerHTML = '<p class="loading">Erro ao carregar. Verifique sua conexão.</p>';
    }
}

// ---- PÁGINA: ADMIN ----
document.getElementById('btn-admin-login').addEventListener('click', () => {
    const pass = document.getElementById('admin-pass').value;
    if (pass === ADMIN_PASSWORD) {
        document.getElementById('admin-login').classList.add('hidden');
        document.getElementById('admin-panel').classList.remove('hidden');
        loadAdminPanel();
    } else {
        showToast('Senha incorreta!', 'error');
    }
});

async function loadAdminPanel() {
    // Carregar resultados existentes
    const resultsDoc = await db.collection('config').doc('results').get();
    const existingResults = resultsDoc.exists ? resultsDoc.data().matches || {} : {};
    renderMatchesForm('admin-matches-container', existingResults, true, true);
}

document.getElementById('btn-save-results').addEventListener('click', async () => {
    const results = collectBets('admin-matches-container', true);
    
    if (Object.keys(results).length === 0) {
        showToast('Preencha pelo menos um resultado!', 'error');
        return;
    }

    try {
        // Salvar resultados
        await db.collection('config').doc('results').set({ matches: results });
        console.log('✓ Resultados salvos:', results);

        // Recalcular pontos de todos os usuários
        const usersSnapshot = await db.collection('users').get();
        const batch = db.batch();
        let updateCount = 0;

        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            const userBets = userData.bets || {};
            let totalPoints = 0;

            MATCHES_DATA.forEach(match => {
                const bet = userBets[match.id];
                const real = results[match.id];
                
                if (bet && real && bet.score1 !== undefined && bet.score2 !== undefined &&
                    real.score1 !== undefined && real.score2 !== undefined) {
                    const points = calculatePoints(bet.score1, bet.score2, real.score1, real.score2);
                    totalPoints += points;
                }
            });

            batch.update(doc.ref, { totalPoints: totalPoints });
            updateCount++;
            console.log(`✓ ${userData.name}: ${totalPoints} pontos`);
        });

        await batch.commit();
        console.log(`✓ ${updateCount} usuários atualizados`);
        showToast(`Resultados salvos! ${updateCount} usuários recalculados!`, 'success');

    } catch (error) {
        console.error('❌ Erro completo:', error);
        showToast(`Erro: ${error.message}`, 'error');
    }
});

// ---- ADMIN: SUB-NAVEGAÇÃO ----
document.querySelectorAll('.admin-subnav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.subview;
        document.querySelectorAll('.admin-subnav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`admin-view-${target}`).classList.add('active');
        if (target === 'optout') loadAdminOptOutPanel();
        if (target === 'knockout') loadAdminKnockoutPanel();
    });
});

// ---- ADMIN: RESULTADOS DO MATA-MATA DA COPA ----
async function loadAdminKnockoutPanel() {
    const container = document.getElementById('admin-knockout-container');
    container.innerHTML = '<p class="loading">Carregando jogos...</p>';

    try {
        const resultsDoc = await db.collection('config').doc('results').get();
        const existingResults = resultsDoc.exists ? (resultsDoc.data().matches || {}) : {};
        const standings = computeAllStandings(existingResults);

        container.innerHTML = '';

        const rounds = [
            { round: 'r32',   label: '🎯 16-avos (Round of 32)' },
            { round: 'r16',   label: '🏅 Oitavas' },
            { round: 'qf',    label: '🥉 Quartas' },
            { round: 'sf',    label: '🥈 Semifinais' },
            { round: 'final', label: '🏆 Final' }
        ];

        rounds.forEach(({ round, label }) => {
            const matches = getKnockoutMatchesByRound(round);
            if (matches.length === 0) return;

            const section = document.createElement('div');
            section.className = 'admin-knockout-section';

            const header = document.createElement('h4');
            header.className = 'admin-knockout-header';
            header.textContent = label;
            section.appendChild(header);

            matches.forEach(match => {
                const slot1 = resolveKnockoutSlot(match.slot1, standings, existingResults, match.id);
                const slot2 = resolveKnockoutSlot(match.slot2, standings, existingResults, match.id);
                const existing = existingResults[match.id] || {};

                const row = document.createElement('div');
                row.className = 'admin-knockout-row';

                const t1Label = slot1.team || slot1.label;
                const t2Label = slot2.team || slot2.label;
                const t1Flag = slot1.team ? getFlagImg(slot1.team) : '';
                const t2Flag = slot2.team ? getFlagImg(slot2.team) : '';

                const s1 = existing.score1;
                const s2 = existing.score2;
                const isTie = s1 !== undefined && s1 !== null && s1 === s2;
                const winner = existing.winner;

                row.innerHTML = `
                    <div class="admin-knockout-id">Jogo ${match.id}</div>
                    <div class="admin-knockout-teams">
                        <span class="t-name">${t1Label}</span>
                        ${t1Flag}
                        <input type="number" min="0" max="20" class="admin-knockout-input"
                               data-match-id="${match.id}" data-side="1"
                               value="${s1 !== undefined && s1 !== null ? s1 : ''}">
                        <span class="vs-x">×</span>
                        <input type="number" min="0" max="20" class="admin-knockout-input"
                               data-match-id="${match.id}" data-side="2"
                               value="${s2 !== undefined && s2 !== null ? s2 : ''}">
                        ${t2Flag}
                        <span class="t-name">${t2Label}</span>
                    </div>
                    <div class="admin-knockout-pen ${isTie ? '' : 'hidden'}" data-match-id="${match.id}">
                        <span class="pen-label">🏆 Pênaltis:</span>
                        <button type="button" class="pen-btn ${winner === 1 ? 'active' : ''}"
                                data-match-id="${match.id}" data-winner="1">${t1Label}</button>
                        <button type="button" class="pen-btn ${winner === 2 ? 'active' : ''}"
                                data-match-id="${match.id}" data-winner="2">${t2Label}</button>
                    </div>
                `;
                section.appendChild(row);
            });

            container.appendChild(section);
        });

        // Listeners: mostrar/esconder seletor de pênaltis conforme placar
        container.querySelectorAll('.admin-knockout-input').forEach(inp => {
            inp.addEventListener('input', () => {
                const mid = inp.dataset.matchId;
                const inputs = container.querySelectorAll(`.admin-knockout-input[data-match-id="${mid}"]`);
                const v1 = inputs[0].value.trim();
                const v2 = inputs[1].value.trim();
                const penBox = container.querySelector(`.admin-knockout-pen[data-match-id="${mid}"]`);
                if (!penBox) return;
                const isTie = v1 !== '' && v2 !== '' && parseInt(v1) === parseInt(v2);
                if (isTie) {
                    penBox.classList.remove('hidden');
                } else {
                    penBox.classList.add('hidden');
                    // Limpar seleção quando não é mais empate
                    penBox.querySelectorAll('.pen-btn').forEach(b => b.classList.remove('active'));
                }
            });
        });

        // Listeners: clique nos botões de pênaltis
        container.querySelectorAll('.pen-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mid = btn.dataset.matchId;
                container.querySelectorAll(`.pen-btn[data-match-id="${mid}"]`)
                    .forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    } catch (error) {
        console.error('Erro ao carregar mata-mata admin:', error);
        container.innerHTML = '<p class="loading">Erro ao carregar.</p>';
    }
}

document.getElementById('btn-save-knockout-results').addEventListener('click', async () => {
    const container = document.getElementById('admin-knockout-container');
    const inputs = container.querySelectorAll('.admin-knockout-input');
    const newKnockout = {};

    inputs.forEach(inp => {
        const matchId = inp.dataset.matchId;
        const side = inp.dataset.side;
        const val = inp.value.trim();
        if (val === '') return;
        if (!newKnockout[matchId]) newKnockout[matchId] = {};
        newKnockout[matchId][`score${side}`] = parseInt(val);
    });

    // Pegar vencedor por pênaltis quando aplicável
    container.querySelectorAll('.pen-btn.active').forEach(btn => {
        const mid = btn.dataset.matchId;
        const w = parseInt(btn.dataset.winner);
        if (newKnockout[mid]) newKnockout[mid].winner = w;
    });

    // Só persiste matches com ambos placares preenchidos.
    // Se empate, exige vencedor por pênaltis selecionado.
    const finalKnockout = {};
    const tiedWithoutWinner = [];
    Object.keys(newKnockout).forEach(mid => {
        const b = newKnockout[mid];
        if (b.score1 === undefined || b.score2 === undefined) return;
        if (b.score1 === b.score2 && !b.winner) {
            tiedWithoutWinner.push(mid);
            return;
        }
        // Se não é empate, garante que winner não fique salvo de uma edição anterior
        if (b.score1 !== b.score2) delete b.winner;
        finalKnockout[mid] = b;
    });

    if (tiedWithoutWinner.length > 0) {
        showToast(`Jogo(s) ${tiedWithoutWinner.join(', ')} empatado(s) — selecione o vencedor nos pênaltis.`, 'error');
        return;
    }

    if (Object.keys(finalKnockout).length === 0) {
        showToast('Preencha pelo menos um placar completo.', 'error');
        return;
    }

    try {
        const doc = await db.collection('config').doc('results').get();
        const existing = doc.exists ? (doc.data().matches || {}) : {};
        const merged = { ...existing, ...finalKnockout };

        await db.collection('config').doc('results').set({ matches: merged });
        showToast(`${Object.keys(finalKnockout).length} resultado(s) salvo(s)!`, 'success');
        loadAdminKnockoutPanel();
    } catch (error) {
        console.error('Erro ao salvar mata-mata:', error);
        showToast(`Erro: ${error.message}`, 'error');
    }
});

// ---- ADMIN: OPT-OUT (esconder/exibir do mata-mata) ----
async function loadAdminOptOutPanel() {
    const container = document.getElementById('admin-optout-container');
    container.innerHTML = '<p class="loading">Carregando participantes...</p>';

    try {
        const [usersSnap, playoffDoc] = await Promise.all([
            db.collection('users').orderBy('totalPoints', 'desc').get(),
            db.collection('config').doc('playoff').get()
        ]);

        const hidden = new Set(playoffDoc.exists ? (playoffDoc.data().hiddenUsers || []) : []);
        const users = [];
        usersSnap.forEach(doc => {
            const d = doc.data();
            users.push({ code: doc.id, name: d.name || '?', points: d.totalPoints || 0 });
        });

        container.innerHTML = '';
        const list = document.createElement('div');
        list.className = 'admin-optout-list';

        const visibleUsers = users.filter(u => !hidden.has(u.code));

        users.forEach((u) => {
            const isHidden = hidden.has(u.code);
            const visiblePos = visibleUsers.findIndex(v => v.code === u.code) + 1;
            const inTop16 = !isHidden && visiblePos > 0 && visiblePos <= 16;

            const row = document.createElement('div');
            row.className = `admin-optout-row ${isHidden ? 'hidden-user' : ''}`;
            row.innerHTML = `
                <div class="admin-optout-info">
                    <span class="admin-optout-pos">${isHidden ? '—' : visiblePos + 'º'}</span>
                    <span class="admin-optout-name">${u.name}</span>
                    <span class="admin-optout-pts">${u.points} pts</span>
                    ${inTop16 ? '<span class="admin-optout-badge top16">TOP 16</span>' : ''}
                    ${isHidden ? '<span class="admin-optout-badge hidden">ESCONDIDO</span>' : ''}
                </div>
                <button class="admin-optout-toggle ${isHidden ? 'show' : 'hide'}" data-code="${u.code}">
                    ${isHidden ? '👁️ Exibir' : '🙈 Esconder'}
                </button>
            `;
            list.appendChild(row);
        });

        container.appendChild(list);

        container.querySelectorAll('.admin-optout-toggle').forEach(btn => {
            btn.addEventListener('click', async () => {
                const code = btn.dataset.code;
                const newHidden = new Set(hidden);
                if (newHidden.has(code)) newHidden.delete(code);
                else newHidden.add(code);

                try {
                    await db.collection('config').doc('playoff').set({
                        hiddenUsers: Array.from(newHidden)
                    });
                    showToast('Status atualizado!', 'success');
                    loadAdminOptOutPanel();
                } catch (err) {
                    console.error('Erro ao atualizar opt-out:', err);
                    showToast('Erro ao salvar.', 'error');
                }
            });
        });
    } catch (error) {
        console.error('Erro ao carregar opt-out:', error);
        container.innerHTML = '<p class="loading">Erro ao carregar participantes.</p>';
    }
}

// ---- INICIALIZAÇÃO ----
document.addEventListener('DOMContentLoaded', () => {
    loadRanking();
});
