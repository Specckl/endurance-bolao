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
        if (btn.dataset.page === 'new-bet') renderNewBetForm();
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
function renderMatchesForm(containerId, existingBets = {}, editable = true) {
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
            const flag1 = TEAM_FLAGS[match.team1] || '🏳️';
            const flag2 = TEAM_FLAGS[match.team2] || '🏳️';

            card.innerHTML = `
                <div class="match-date">📅 ${formatDate(match.date)} | Jogo #${match.id}</div>
                <div class="match-teams">
                    <span class="team-name team-left">${sanitize(match.team1)}</span>
                    <span class="flag">${flag1}</span>
                    <input type="number" class="score-input" data-match="${match.id}" data-team="1"
                           min="0" max="20" value="${bet.score1 !== undefined ? bet.score1 : 0}"
                           ${!editable ? 'disabled' : ''}>
                    <span class="score-separator">×</span>
                    <input type="number" class="score-input" data-match="${match.id}" data-team="2"
                           min="0" max="20" value="${bet.score2 !== undefined ? bet.score2 : 0}"
                           ${!editable ? 'disabled' : ''}>
                    <span class="flag">${flag2}</span>
                    <span class="team-name team-right">${sanitize(match.team2)}</span>
                </div>
            `;

            section.appendChild(card);
        });

        container.appendChild(section);
    });
}

function collectBets(containerId) {
    const bets = {};
    const inputs = document.querySelectorAll(`#${containerId} .score-input`);
    inputs.forEach(input => {
        const matchId = input.dataset.match;
        const team = input.dataset.team;
        if (!bets[matchId]) bets[matchId] = {};
        const val = input.value.trim();
        bets[matchId][`score${team}`] = val !== '' ? parseInt(val) : 0;
    });
    return bets;
}

// ---- PÁGINA: CRIAR PALPITES ----
function renderNewBetForm() {
    if (!isBeforeDeadline()) {
        document.getElementById('deadline-warning').classList.remove('hidden');
        document.getElementById('new-bet-form').classList.add('hidden');
        return;
    }
    document.getElementById('deadline-warning').classList.add('hidden');
    document.getElementById('new-bet-form').classList.remove('hidden');
    document.getElementById('code-result').classList.add('hidden');
    renderMatchesForm('matches-container', {}, true);
}

document.getElementById('btn-save-bets').addEventListener('click', async () => {
    const name = document.getElementById('player-name').value.trim();
    if (!name) {
        showToast('Digite seu nome!', 'error');
        return;
    }
    if (name.length < 2 || name.length > 50) {
        showToast('Nome deve ter entre 2 e 50 caracteres.', 'error');
        return;
    }

    if (!isBeforeDeadline()) {
        showToast('Prazo encerrado!', 'error');
        return;
    }

    const bets = collectBets('matches-container');

    const code = generateCode();

    try {
        // Verificar se o código já existe
        const existing = await db.collection('users').doc(code).get();
        if (existing.exists) {
            showToast('Erro raro: código duplicado. Tente novamente.', 'error');
            return;
        }

        await db.collection('users').doc(code).set({
            name: sanitize(name),
            code: code,
            bets: bets,
            totalPoints: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        document.getElementById('new-bet-form').classList.add('hidden');
        document.getElementById('code-result').classList.remove('hidden');
        document.getElementById('user-code').textContent = code;

        showToast('Palpites salvos com sucesso!', 'success');
        alert('⚠️ ATENÇÃO: Você poderá alterar seus palpites somente até 10/06/2026. Após essa data, os palpites serão bloqueados.');
    } catch (error) {
        console.error('Erro ao salvar:', error);
        showToast('Erro ao salvar. Tente novamente.', 'error');
    }
});

// ---- PÁGINA: VER/EDITAR PALPITES ----
document.getElementById('btn-load-bets').addEventListener('click', async () => {
    const code = document.getElementById('access-code').value.trim().toUpperCase();
    if (code.length !== 6) {
        showToast('O código deve ter 6 caracteres.', 'error');
        return;
    }

    try {
        const doc = await db.collection('users').doc(code).get();
        if (!doc.exists) {
            showToast('Código não encontrado!', 'error');
            return;
        }

        const data = doc.data();
        const editable = isBeforeDeadline();

        document.getElementById('edit-container').classList.remove('hidden');
        document.getElementById('edit-user-name').textContent = `👤 ${data.name}`;
        document.getElementById('edit-user-code').textContent = `🔑 ${data.code}`;
        document.getElementById('edit-user-points').textContent = `⭐ ${data.totalPoints || 0} pontos`;

        // Carregar resultados reais para mostrar comparação
        const resultsDoc = await db.collection('config').doc('results').get();
        const realResults = resultsDoc.exists ? resultsDoc.data().matches || {} : {};

        if (editable) {
            renderMatchesForm('edit-matches-container', data.bets || {}, true);
            document.getElementById('btn-update-bets').classList.remove('hidden');
            document.getElementById('btn-update-bets').onclick = async () => {
                const updatedBets = collectBets('edit-matches-container');
                try {
                    await db.collection('users').doc(code).update({ bets: updatedBets });
                    showToast('Palpites atualizados!', 'success');
                } catch (err) {
                    console.error(err);
                    showToast('Erro ao atualizar.', 'error');
                }
            };
        } else {
            document.getElementById('btn-update-bets').classList.add('hidden');
            renderBetsWithResults('edit-matches-container', data.bets || {}, realResults);
        }

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
            const flag1 = TEAM_FLAGS[match.team1] || '🏳️';
            const flag2 = TEAM_FLAGS[match.team2] || '🏳️';

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
                    <span class="flag">${flag1}</span>
                    <span class="score-display">${betDisplay1} × ${betDisplay2}</span>
                    <span class="flag">${flag2}</span>
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
        const snapshot = await db.collection('users').orderBy('totalPoints', 'desc').get();

        if (snapshot.empty) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="emoji">🏟️</div>
                    <p>Nenhum participante ainda.</p>
                    <p>Seja o primeiro a criar seus palpites!</p>
                </div>
            `;
            return;
        }

        let html = `
            <table class="ranking-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Participante</th>
                        <th>Pontos</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let rank = 1;
        snapshot.forEach(doc => {
            const data = doc.data();
            let badgeClass = 'normal';
            if (rank === 1) badgeClass = 'gold';
            else if (rank === 2) badgeClass = 'silver';
            else if (rank === 3) badgeClass = 'bronze';

            html += `
                <tr>
                    <td><span class="rank-badge ${badgeClass}">${rank}</span></td>
                    <td>${sanitize(data.name)}</td>
                    <td class="points-cell">${data.totalPoints || 0}</td>
                </tr>
            `;
            rank++;
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
    renderMatchesForm('admin-matches-container', existingResults, true);
}

document.getElementById('btn-save-results').addEventListener('click', async () => {
    const results = collectBets('admin-matches-container');

    try {
        await db.collection('config').doc('results').set({ matches: results });

        // Recalcular pontos de todos os usuários
        const usersSnapshot = await db.collection('users').get();
        const batch = db.batch();

        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            const userBets = userData.bets || {};
            let totalPoints = 0;

            MATCHES_DATA.forEach(match => {
                const bet = userBets[match.id];
                const real = results[match.id];
                if (bet && real && bet.score1 !== undefined && bet.score2 !== undefined &&
                    real.score1 !== undefined && real.score2 !== undefined) {
                    totalPoints += calculatePoints(bet.score1, bet.score2, real.score1, real.score2);
                }
            });

            batch.update(doc.ref, { totalPoints: totalPoints });
        });

        await batch.commit();
        showToast('Resultados salvos e pontuações recalculadas!', 'success');

    } catch (error) {
        console.error('Erro ao salvar resultados:', error);
        showToast('Erro ao salvar resultados.', 'error');
    }
});

// ---- INICIALIZAÇÃO ----
document.addEventListener('DOMContentLoaded', () => {
    loadRanking();
});
