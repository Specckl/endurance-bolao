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
    { id: 74, round: 'r32', kickoff: '2026-06-29T13:00:00-03:00', slot1: 'pos:1E', slot2: '3rd:A,B,C,D,F' },
    { id: 75, round: 'r32', kickoff: '2026-06-29T17:00:00-03:00', slot1: 'pos:1F', slot2: 'pos:2C' },
    { id: 76, round: 'r32', kickoff: '2026-06-29T21:00:00-03:00', slot1: 'pos:1C', slot2: 'pos:2F' },
    { id: 77, round: 'r32', kickoff: '2026-06-30T13:00:00-03:00', slot1: 'pos:1I', slot2: '3rd:C,D,F,G,H' },
    { id: 78, round: 'r32', kickoff: '2026-06-30T17:00:00-03:00', slot1: 'pos:2E', slot2: 'pos:2I' },
    { id: 79, round: 'r32', kickoff: '2026-06-30T21:00:00-03:00', slot1: 'pos:1A', slot2: '3rd:C,E,F,H,I' },
    { id: 80, round: 'r32', kickoff: '2026-07-01T13:00:00-03:00', slot1: 'pos:1L', slot2: '3rd:E,H,I,J,K' },
    { id: 81, round: 'r32', kickoff: '2026-07-01T17:00:00-03:00', slot1: 'pos:1D', slot2: '3rd:B,E,F,I,J' },
    { id: 82, round: 'r32', kickoff: '2026-07-01T21:00:00-03:00', slot1: 'pos:1G', slot2: '3rd:A,E,H,I,J' },
    { id: 83, round: 'r32', kickoff: '2026-07-02T13:00:00-03:00', slot1: 'pos:2K', slot2: 'pos:2L' },
    { id: 84, round: 'r32', kickoff: '2026-07-02T17:00:00-03:00', slot1: 'pos:1H', slot2: 'pos:2J' },
    { id: 85, round: 'r32', kickoff: '2026-07-02T21:00:00-03:00', slot1: 'pos:1B', slot2: '3rd:E,F,G,I,J' },
    { id: 86, round: 'r32', kickoff: '2026-07-03T13:00:00-03:00', slot1: 'pos:1J', slot2: 'pos:2H' },
    { id: 87, round: 'r32', kickoff: '2026-07-03T17:00:00-03:00', slot1: 'pos:1K', slot2: '3rd:D,E,I,J,L' },
    { id: 88, round: 'r32', kickoff: '2026-07-03T21:00:00-03:00', slot1: 'pos:2D', slot2: 'pos:2G' },

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

// Resolve qual time esta no slot, com base nos resultados ja postados.
// Retorna { team: nome ou null, label: descricao curta }.
function resolveKnockoutSlot(slot, standings, realResults) {
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
        return { team: null, label: `3º de ${value.split(',').join('/')}` };
    }
    if (type === 'winner') {
        const matchId = parseInt(value);
        const r = realResults[matchId];
        const m = KNOCKOUT_MATCHES.find(x => x.id === matchId);
        if (!r || !m) return { team: null, label: `Vencedor ${matchId}` };
        // Determinar vencedor pelo placar (sem desempate por penáltis por enquanto)
        if (r.score1 === undefined || r.score2 === undefined) return { team: null, label: `Vencedor ${matchId}` };
        if (r.score1 === r.score2) {
            // Empate — admin precisaria informar quem passou (campo winner separado).
            // Por segurança, retornamos null.
            if (r.winner === 1) {
                const s1 = resolveKnockoutSlot(m.slot1, standings, realResults);
                if (s1.team) return s1;
            } else if (r.winner === 2) {
                const s2 = resolveKnockoutSlot(m.slot2, standings, realResults);
                if (s2.team) return s2;
            }
            return { team: null, label: `Vencedor ${matchId}` };
        }
        const winningSlot = r.score1 > r.score2 ? m.slot1 : m.slot2;
        return resolveKnockoutSlot(winningSlot, standings, realResults);
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
