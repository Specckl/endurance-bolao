// ============================================================
// Endurance Bolão - Caminho do Mata-mata
// ============================================================
// Lê config/results e calcula classificação dos grupos.
// 100% leitura - não altera nada no Firestore.
// ============================================================

// ===== ESTRUTURA OFICIAL DO MATA-MATA - COPA 2026 =====
const KNOCKOUT_BRACKET = {
    r32: [
        { id: 73, slot1: 'pos:2A', slot2: 'pos:2B' },
        { id: 74, slot1: 'pos:1E', slot2: '3rd:A,B,C,D,F' },
        { id: 75, slot1: 'pos:1F', slot2: 'pos:2C' },
        { id: 76, slot1: 'pos:1C', slot2: 'pos:2F' },
        { id: 77, slot1: 'pos:1I', slot2: '3rd:C,D,F,G,H' },
        { id: 78, slot1: 'pos:2E', slot2: 'pos:2I' },
        { id: 79, slot1: 'pos:1A', slot2: '3rd:C,E,F,H,I' },
        { id: 80, slot1: 'pos:1L', slot2: '3rd:E,H,I,J,K' },
        { id: 81, slot1: 'pos:1D', slot2: '3rd:B,E,F,I,J' },
        { id: 82, slot1: 'pos:1G', slot2: '3rd:A,E,H,I,J' },
        { id: 83, slot1: 'pos:2K', slot2: 'pos:2L' },
        { id: 84, slot1: 'pos:1H', slot2: 'pos:2J' },
        { id: 85, slot1: 'pos:1B', slot2: '3rd:E,F,G,I,J' },
        { id: 86, slot1: 'pos:1J', slot2: 'pos:2H' },
        { id: 87, slot1: 'pos:1K', slot2: '3rd:D,E,I,J,L' },
        { id: 88, slot1: 'pos:2D', slot2: 'pos:2G' }
    ],
    r16: [
        { id: 89, slot1: 'winner:73', slot2: 'winner:75' },
        { id: 90, slot1: 'winner:74', slot2: 'winner:77' },
        { id: 91, slot1: 'winner:76', slot2: 'winner:78' },
        { id: 92, slot1: 'winner:79', slot2: 'winner:80' },
        { id: 93, slot1: 'winner:83', slot2: 'winner:84' },
        { id: 94, slot1: 'winner:81', slot2: 'winner:82' },
        { id: 95, slot1: 'winner:86', slot2: 'winner:88' },
        { id: 96, slot1: 'winner:85', slot2: 'winner:87' }
    ],
    qf: [
        { id: 97, slot1: 'winner:89', slot2: 'winner:90' },
        { id: 98, slot1: 'winner:93', slot2: 'winner:94' },
        { id: 99, slot1: 'winner:91', slot2: 'winner:92' },
        { id: 100, slot1: 'winner:95', slot2: 'winner:96' }
    ],
    sf: [
        { id: 101, slot1: 'winner:97', slot2: 'winner:98' },
        { id: 102, slot1: 'winner:99', slot2: 'winner:100' }
    ],
    final: [
        { id: 104, slot1: 'winner:101', slot2: 'winner:102' }
    ]
};

const ROUND_LABELS = {
    r32: '16-avos de Final',
    r16: 'Oitavas de Final',
    qf: 'Quartas de Final',
    sf: 'Semifinais',
    tp: 'Disputa 3º Lugar',
    final: 'Final'
};

async function loadBracketPage() {
    const groupsContainer = document.getElementById('bracket-groups-container');
    const knockoutContainer = document.getElementById('bracket-knockout-container');
    groupsContainer.innerHTML = '<p class="loading">Carregando classificação...</p>';
    knockoutContainer.innerHTML = '<p class="loading">Carregando cruzamentos...</p>';

    try {
        const resultsDoc = await firebase.firestore().collection('config').doc('results').get();
        const realResults = resultsDoc.exists ? (resultsDoc.data().matches || {}) : {};
        const standings = computeAllStandings(realResults);
        renderBracketGroups(groupsContainer, standings);
        renderKnockoutBracket(knockoutContainer, standings, realResults);
    } catch (error) {
        console.error('Erro ao carregar mata-mata:', error);
        groupsContainer.innerHTML = '<p class="loading">Erro ao carregar dados.</p>';
        knockoutContainer.innerHTML = '<p class="loading">Erro ao carregar dados.</p>';
    }
}

function renderKnockoutBracket(container, standings, realResults) {
    container.innerHTML = '';
    const bracket = document.createElement('div');
    bracket.className = 'knockout-bracket';

    ['r32', 'r16', 'qf', 'sf', 'tp', 'final'].forEach(round => {
        const column = document.createElement('div');
        column.className = `knockout-column knockout-${round}`;

        const heading = document.createElement('h3');
        heading.className = 'knockout-round-title';
        heading.textContent = ROUND_LABELS[round];
        column.appendChild(heading);

        // Ordena por horário do kickoff dentro da fase
        const cupMatches = getKnockoutMatchesByRound(round)
            .slice()
            .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));

        cupMatches.forEach(match => {
            const slot1 = resolveKnockoutSlot(match.slot1, standings, realResults, match.id);
            const slot2 = resolveKnockoutSlot(match.slot2, standings, realResults, match.id);
            const matchEl = document.createElement('div');
            matchEl.className = 'knockout-match';

            const teamRow = (slot) => {
                if (slot.team) {
                    return `<div class="knockout-team defined">
                        ${getFlagImg(slot.team)}<span>${slot.team}</span>
                    </div>`;
                }
                return `<div class="knockout-team pending">
                    <span class="pending-label">${slot.label}</span>
                </div>`;
            };

            const dateStr = new Date(match.kickoff).toLocaleString('pt-BR', {
                weekday: 'short', day: '2-digit', month: '2-digit',
                hour: '2-digit', minute: '2-digit'
            });

            matchEl.innerHTML = `
                <div class="knockout-match-id">Jogo ${match.id} · ${dateStr}</div>
                ${teamRow(slot1)}
                <div class="knockout-vs">×</div>
                ${teamRow(slot2)}
            `;
            column.appendChild(matchEl);
        });

        bracket.appendChild(column);
    });

    container.appendChild(bracket);
}

document.querySelectorAll('.bracket-subnav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.subview;
        document.querySelectorAll('.bracket-subnav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.bracket-view').forEach(v => v.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`bracket-view-${target}`).classList.add('active');
    });
});

function computeAllStandings(realResults) {
    const groups = {};
    MATCHES_DATA.forEach(m => {
        if (!groups[m.group]) groups[m.group] = { teams: {}, matches: [] };
        groups[m.group].matches.push(m);
        [m.team1, m.team2].forEach(t => {
            if (!groups[m.group].teams[t]) {
                groups[m.group].teams[t] = {
                    name: t, played: 0, wins: 0, draws: 0, losses: 0,
                    goalsFor: 0, goalsAgainst: 0, points: 0
                };
            }
        });
    });

    Object.values(groups).forEach(group => {
        group.matches.forEach(match => {
            const r = realResults[match.id];
            if (!r || r.score1 === undefined || r.score2 === undefined ||
                r.score1 === null || r.score2 === null) return;

            const s1 = parseInt(r.score1);
            const s2 = parseInt(r.score2);
            if (isNaN(s1) || isNaN(s2)) return;

            const t1 = group.teams[match.team1];
            const t2 = group.teams[match.team2];

            t1.played++; t2.played++;
            t1.goalsFor += s1; t1.goalsAgainst += s2;
            t2.goalsFor += s2; t2.goalsAgainst += s1;

            if (s1 > s2) { t1.wins++; t1.points += 3; t2.losses++; }
            else if (s1 < s2) { t2.wins++; t2.points += 3; t1.losses++; }
            else { t1.draws++; t2.draws++; t1.points++; t2.points++; }
        });
    });

    const result = {};
    Object.keys(groups).sort().forEach(g => {
        const teams = Object.values(groups[g].teams);
        teams.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            const sgA = a.goalsFor - a.goalsAgainst;
            const sgB = b.goalsFor - b.goalsAgainst;
            if (sgB !== sgA) return sgB - sgA;
            if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
            return a.name.localeCompare(b.name);
        });
        result[g] = teams;
    });
    return result;
}

function renderBracketGroups(container, standings) {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'bracket-groups-grid';

    Object.keys(standings).forEach(groupKey => {
        const teams = standings[groupKey];
        const card = document.createElement('div');
        card.className = 'bracket-group-card';

        const header = document.createElement('div');
        header.className = 'bracket-group-header';
        header.textContent = `Grupo ${groupKey}`;
        card.appendChild(header);

        const tableWrapper = document.createElement('div');
        tableWrapper.className = 'table-wrapper';
        const table = document.createElement('table');
        table.className = 'bracket-standings-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th class="pos">#</th>
                    <th class="team">Time</th>
                    <th title="Pontos">P</th>
                    <th title="Jogos">J</th>
                    <th title="Vitórias">V</th>
                    <th title="Empates">E</th>
                    <th title="Derrotas">D</th>
                    <th title="Gols pró">GP</th>
                    <th title="Gols contra">GC</th>
                    <th title="Saldo de gols">SG</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');

        teams.forEach((team, idx) => {
            const pos = idx + 1;
            const tr = document.createElement('tr');
            if (pos <= 2) tr.classList.add('qualified');
            else if (pos === 3) tr.classList.add('maybe-qualified');
            const sg = team.goalsFor - team.goalsAgainst;
            const sgStr = sg > 0 ? `+${sg}` : `${sg}`;
            tr.innerHTML = `
                <td class="pos">${pos}</td>
                <td class="team">${getFlagImg(team.name)}<span>${team.name}</span></td>
                <td class="pts"><strong>${team.points}</strong></td>
                <td>${team.played}</td>
                <td>${team.wins}</td>
                <td>${team.draws}</td>
                <td>${team.losses}</td>
                <td>${team.goalsFor}</td>
                <td>${team.goalsAgainst}</td>
                <td>${sgStr}</td>
            `;
            tbody.appendChild(tr);
        });

        tableWrapper.appendChild(table);
        card.appendChild(tableWrapper);
        grid.appendChild(card);
    });

    container.appendChild(grid);

    const legend = document.createElement('div');
    legend.className = 'bracket-legend';
    legend.innerHTML = `
        <span class="legend-item"><span class="legend-dot qualified"></span> 1º e 2º — Classificados</span>
        <span class="legend-item"><span class="legend-dot maybe-qualified"></span> 3º — Pode classificar (melhores 8)</span>
    `;
    container.appendChild(legend);
}
