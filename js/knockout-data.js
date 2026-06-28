// ============================================================
// Jogos do Mata-mata - Copa do Mundo 2026
// ============================================================
// Cada jogo tem: id, round, kickoff (ISO local time), slot1 e slot2
// (descricoes "1A", "2B", "3-A/B/C", "Vencedor 73", etc.)
// kickoff = data e hora do jogo. Lock = kickoff - 1 hora.
// Ajuste as datas/horarios se a FIFA publicar oficiais.
// ============================================================

const KNOCKOUT_MATCHES = [
    // ===== ROUND OF 32 (16-avos) =====
    { id: 73, round: 'r32', kickoff: '2026-06-28T16:00:00-03:00', slot1: 'pos:2A', slot2: 'pos:2B' },
    { id: 74, round: 'r32', kickoff: '2026-06-29T17:30:00-03:00', slot1: 'pos:1E', slot2: '3rd:A,B,C,D,F' },
    { id: 75, round: 'r32', kickoff: '2026-06-29T22:00:00-03:00', slot1: 'pos:1F', slot2: 'pos:2C' },
    { id: 76, round: 'r32', kickoff: '2026-06-29T14:00:00-03:00', slot1: 'pos:1C', slot2: 'pos:2F' },
    { id: 77, round: 'r32', kickoff: '2026-06-30T18:00:00-03:00', slot1: 'pos:1I', slot2: '3rd:C,D,F,G,H' },
    { id: 78, round: 'r32', kickoff: '2026-06-30T14:00:00-03:00', slot1: 'pos:2E', slot2: 'pos:2I' },
    { id: 79, round: 'r32', kickoff: '2026-06-30T22:00:00-03:00', slot1: 'pos:1A', slot2: '3rd:C,E,F,H,I' },
    { id: 80, round: 'r32', kickoff: '2026-07-01T13:00:00-03:00', slot1: 'pos:1L', slot2: '3rd:E,H,I,J,K' },
    { id: 81, round: 'r32', kickoff: '2026-07-01T21:00:00-03:00', slot1: 'pos:1D', slot2: '3rd:B,E,F,I,J' },
    { id: 82, round: 'r32', kickoff: '2026-07-01T17:00:00-03:00', slot1: 'pos:1G', slot2: '3rd:A,E,H,I,J' },
    { id: 83, round: 'r32', kickoff: '2026-07-02T20:00:00-03:00', slot1: 'pos:2K', slot2: 'pos:2L' },
    { id: 84, round: 'r32', kickoff: '2026-07-02T16:00:00-03:00', slot1: 'pos:1H', slot2: 'pos:2J' },
    { id: 85, round: 'r32', kickoff: '2026-07-03T00:00:00-03:00', slot1: 'pos:1B', slot2: '3rd:E,F,G,I,J' },
    { id: 86, round: 'r32', kickoff: '2026-07-03T19:00:00-03:00', slot1: 'pos:1J', slot2: 'pos:2H' },
    { id: 87, round: 'r32', kickoff: '2026-07-03T22:30:00-03:00', slot1: 'pos:1K', slot2: '3rd:D,E,I,J,L' },
    { id: 88, round: 'r32', kickoff: '2026-07-03T15:00:00-03:00', slot1: 'pos:2D', slot2: 'pos:2G' },

    // ===== ROUND OF 16 (Oitavas) =====
    { id: 89, round: 'r16', kickoff: '2026-07-04T13:00:00-03:00', slot1: 'winner:73', slot2: 'winner:75' },
    { id: 90, round: 'r16', kickoff: '2026-07-04T17:00:00-03:00', slot1: 'winner:74', slot2: 'winner:77' },
    { id: 91, round: 'r16', kickoff: '2026-07-05T13:00:00-03:00', slot1: 'winner:76', slot2: 'winner:78' },
    { id: 92, round: 'r16', kickoff: '2026-07-05T17:00:00-03:00', slot1: 'winner:79', slot2: 'winner:80' },
    { id: 93, round: 'r16', kickoff: '2026-07-06T13:00:00-03:00', slot1: 'winner:83', slot2: 'winner:84' },
    { id: 94, round: 'r16', kickoff: '2026-07-06T17:00:00-03:00', slot1: 'winner:81', slot2: 'winner:82' },
    { id: 95, round: 'r16', kickoff: '2026-07-07T13:00:00-03:00', slot1: 'winner:86', slot2: 'winner:88' },
    { id: 96, round: 'r16', kickoff: '2026-07-07T17:00:00-03:00', slot1: 'winner:85', slot2: 'winner:87' },

    // ===== QUARTERFINALS (Quartas) =====
    { id: 97,  round: 'qf', kickoff: '2026-07-09T17:00:00-03:00', slot1: 'winner:89', slot2: 'winner:90' },
    { id: 98,  round: 'qf', kickoff: '2026-07-09T21:00:00-03:00', slot1: 'winner:93', slot2: 'winner:94' },
    { id: 99,  round: 'qf', kickoff: '2026-07-10T17:00:00-03:00', slot1: 'winner:91', slot2: 'winner:92' },
    { id: 100, round: 'qf', kickoff: '2026-07-11T17:00:00-03:00', slot1: 'winner:95', slot2: 'winner:96' },

    // ===== SEMIFINALS (Semis) =====
    { id: 101, round: 'sf', kickoff: '2026-07-14T17:00:00-03:00', slot1: 'winner:97', slot2: 'winner:98' },
    { id: 102, round: 'sf', kickoff: '2026-07-15T17:00:00-03:00', slot1: 'winner:99', slot2: 'winner:100' },

    // ===== FINAL =====
    { id: 104, round: 'final', kickoff: '2026-07-19T17:00:00-03:00', slot1: 'winner:101', slot2: 'winner:102' }
];

// Mapeamento das fases do BOLÃO para as fases da COPA.
// O bolão usa o resultado dos jogos da Copa para pontuar.
const PLAYOFF_PHASE_TO_CUP_ROUND = {
    'oitavas': 'r16',   // Bolão oitavas (8 confrontos) ~ Copa R16 (8 jogos)
    'quartas': 'qf',    // 4 confrontos ~ 4 jogos
    'semis':   'sf',    // 2 confrontos ~ 2 jogos
    'final':   'final'  // 1 confronto ~ 1 jogo
};

const PLAYOFF_PHASE_ORDER = ['oitavas', 'quartas', 'semis', 'final'];

const PLAYOFF_PHASE_LABEL = {
    'oitavas': 'Oitavas de Final',
    'quartas': 'Quartas de Final',
    'semis':   'Semifinais',
    'final':   'Final'
};

function getKnockoutMatchesByRound(round) {
    return KNOCKOUT_MATCHES.filter(m => m.round === round);
}

// ============================================================
// 3os COLOCADOS - ranking e atribuição aos slots do R32
// ============================================================
// Slots dos jogos 73-88 que recebem 3o colocado, com a lista dos
// grupos elegiveis (subset oficial FIFA 2026).
const THIRD_PLACE_SLOTS = [
    { matchId: 74, allowed: ['A','B','C','D','F'] },
    { matchId: 77, allowed: ['C','D','F','G','H'] },
    { matchId: 79, allowed: ['C','E','F','H','I'] },
    { matchId: 80, allowed: ['E','H','I','J','K'] },
    { matchId: 81, allowed: ['B','E','F','I','J'] },
    { matchId: 82, allowed: ['A','E','H','I','J'] },
    { matchId: 85, allowed: ['E','F','G','I','J'] },
    { matchId: 87, allowed: ['D','E','I','J','L'] }
];

function rankThirdPlaceTeams(standings) {
    const thirds = [];
    Object.keys(standings).forEach(g => {
        const team = standings[g][2];
        if (!team) return;
        thirds.push({
            group: g,
            name: team.name,
            points: team.points,
            goalDiff: team.goalsFor - team.goalsAgainst,
            goalsFor: team.goalsFor
        });
    });
    thirds.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.name.localeCompare(b.name);
    });
    return thirds;
}

// Tabela oficial FIFA Annex C - subset.
// Key: lista alfabetica dos 8 grupos cujos 3os se classificaram.
// Value: mapeamento slot -> grupo (qual 3o vai pra qual jogo).
// Quando a combinacao atual nao esta na tabela, cai pro backtracking.
const FIFA_THIRD_PLACE_TABLE = {
    // Cenario Copa 2026 atual (B,D,E,F,I,J,K,L)
    'B,D,E,F,I,J,K,L': {
        74: 'D',  // 1E vs 3D
        77: 'F',  // 1I vs 3F
        79: 'E',  // 1A vs 3E
        80: 'K',  // 1L vs 3K
        81: 'B',  // 1D vs 3B
        82: 'I',  // 1G vs 3I
        85: 'J',  // 1B vs 3J
        87: 'L'   // 1K vs 3L
    }
};

function assignThirdsToSlots(top8Thirds) {
    // Primeiro tenta a tabela oficial FIFA
    const groupsKey = top8Thirds.map(t => t.group).sort().join(',');
    const official = FIFA_THIRD_PLACE_TABLE[groupsKey];
    if (official) {
        const result = {};
        Object.keys(official).forEach(slotId => {
            const grp = official[slotId];
            const third = top8Thirds.find(t => t.group === grp);
            if (third) result[parseInt(slotId)] = third;
        });
        return result;
    }

    // Fallback: backtracking (valida restricoes mas pode diferir da FIFA)
    function backtrack(idx, usedGroups, assignment) {
        if (idx === THIRD_PLACE_SLOTS.length) return { ...assignment };
        const slot = THIRD_PLACE_SLOTS[idx];
        for (const t of top8Thirds) {
            if (usedGroups.has(t.group)) continue;
            if (!slot.allowed.includes(t.group)) continue;
            assignment[slot.matchId] = t;
            usedGroups.add(t.group);
            const r = backtrack(idx + 1, usedGroups, assignment);
            if (r) return r;
            usedGroups.delete(t.group);
            delete assignment[slot.matchId];
        }
        return null;
    }
    return backtrack(0, new Set(), {}) || {};
}

let _thirdsAssignmentCache = null;
let _thirdsAssignmentKey = null;

function getThirdsAssignment(standings) {
    if (!standings) return {};
    const completeGroups = Object.keys(standings).filter(g => {
        const teams = standings[g];
        return teams && teams.length >= 3 && teams.every(t => t.played === 3);
    }).length;
    if (completeGroups < 12) {
        _thirdsAssignmentCache = {};
        _thirdsAssignmentKey = completeGroups;
        return _thirdsAssignmentCache;
    }
    // Cache key inclui pontos dos 3os (invalida quando admin reedita resultados)
    const sig = Object.keys(standings).sort().map(g => {
        const t = standings[g][2];
        return `${g}:${t.points}:${t.goalsFor - t.goalsAgainst}:${t.goalsFor}`;
    }).join('|');
    if (_thirdsAssignmentKey === sig && _thirdsAssignmentCache) return _thirdsAssignmentCache;
    const ranked = rankThirdPlaceTeams(standings);
    const top8 = ranked.slice(0, 8);
    _thirdsAssignmentCache = assignThirdsToSlots(top8);
    _thirdsAssignmentKey = sig;
    return _thirdsAssignmentCache;
}

// Resolve qual time esta no slot, com base nos resultados ja postados.
// Retorna { team: nome ou null, label: descricao curta }.
// matchId: ID do jogo que contem o slot (usado para resolver slots '3rd').
function resolveKnockoutSlot(slot, standings, realResults, matchId) {
    const [type, value] = slot.split(':');
    if (type === 'pos') {
        const pos = parseInt(value[0]);
        const group = value[1];
        const teams = standings[group];
        if (!teams || !teams[pos - 1]) return { team: null, label: `${pos}º ${group}` };
        const allPlayed = teams.every(t => t.played === 3);
        if (!allPlayed) return { team: null, label: `${pos}º ${group}` };
        return { team: teams[pos - 1].name, label: `${pos}º ${group}` };
    }
    if (type === '3rd') {
        const assignment = getThirdsAssignment(standings);
        if (matchId && assignment[matchId]) {
            const a = assignment[matchId];
            return { team: a.name, label: `3º ${a.group}` };
        }
        return { team: null, label: `3º de ${value.split(',').join('/')}` };
    }
    if (type === 'winner') {
        const winMatchId = parseInt(value);
        const r = realResults[winMatchId];
        const m = KNOCKOUT_MATCHES.find(x => x.id === winMatchId);
        if (!r || !m) return { team: null, label: `Vencedor ${winMatchId}` };
        if (r.score1 === undefined || r.score2 === undefined) return { team: null, label: `Vencedor ${winMatchId}` };
        if (r.score1 === r.score2) {
            if (r.winner === 1) {
                const s1 = resolveKnockoutSlot(m.slot1, standings, realResults, winMatchId);
                if (s1.team) return s1;
            } else if (r.winner === 2) {
                const s2 = resolveKnockoutSlot(m.slot2, standings, realResults, winMatchId);
                if (s2.team) return s2;
            }
            return { team: null, label: `Vencedor ${winMatchId}` };
        }
        const winningSlot = r.score1 > r.score2 ? m.slot1 : m.slot2;
        return resolveKnockoutSlot(winningSlot, standings, realResults, winMatchId);
    }
    return { team: null, label: '?' };
}

function isMatchLocked(match) {
    const kickoff = new Date(match.kickoff);
    const lock = new Date(kickoff.getTime() - 60 * 60 * 1000); // 1 hora antes
    return new Date() >= lock;
}

function isMatchTeamsDefined(match, standings, realResults) {
    const s1 = resolveKnockoutSlot(match.slot1, standings, realResults);
    const s2 = resolveKnockoutSlot(match.slot2, standings, realResults);
    return !!s1.team && !!s2.team;
}
