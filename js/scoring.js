// ============================================================
// Endurance Bolão - Utilitários de pontuação e desempate
// ============================================================
// Funções compartilhadas usadas por: ranking, playoff seeding,
// admin recálculo e cálculo de avanço no mata-mata do bolão.
// ============================================================

// Calcula pontos de um único palpite vs resultado real.
function scoreSingleBet(b1, b2, r1, r2) {
    if (b1 === undefined || b2 === undefined || r1 === undefined || r2 === undefined) return 0;
    if (b1 === null || b2 === null || r1 === null || r2 === null) return 0;
    const u1 = parseInt(b1), u2 = parseInt(b2);
    const v1 = parseInt(r1), v2 = parseInt(r2);
    if (isNaN(u1) || isNaN(u2) || isNaN(v1) || isNaN(v2)) return 0;
    if (u1 === v1 && u2 === v2) return 12;
    let pts = 0;
    const realRes = v1 > v2 ? 'h' : v1 < v2 ? 'a' : 'd';
    const userRes = u1 > u2 ? 'h' : u1 < u2 ? 'a' : 'd';
    if (realRes === userRes) pts += 3;
    if (u1 === v1) pts += 3;
    if (u2 === v2) pts += 3;
    return pts;
}

// Stats do usuário considerando apenas jogos da FASE DE GRUPOS (1-72).
function computeUserGroupStats(user, realResults) {
    const bets = user.bets || {};
    let total = 0, exact = 0, winner = 0;
    if (typeof MATCHES_DATA === 'undefined') return { total: 0, exact: 0, winner: 0 };
    MATCHES_DATA.forEach(match => {
        const bet = bets[match.id];
        const real = realResults[match.id];
        if (!bet || !real) return;
        const b1 = bet.score1, b2 = bet.score2;
        const r1 = real.score1, r2 = real.score2;
        if (b1 === undefined || b2 === undefined || r1 === undefined || r2 === undefined) return;
        const pts = scoreSingleBet(b1, b2, r1, r2);
        total += pts;
        if (pts === 12) {
            exact++;
        } else {
            const u1 = parseInt(b1), u2 = parseInt(b2);
            const v1 = parseInt(r1), v2 = parseInt(r2);
            const realRes = v1 > v2 ? 'h' : v1 < v2 ? 'a' : 'd';
            const userRes = u1 > u2 ? 'h' : u1 < u2 ? 'a' : 'd';
            if (realRes === userRes) winner++;
        }
    });
    return { total, exact, winner };
}

// Critério de classificação:
//   1) mais pontos totais
//   2) mais placares exatos
//   3) mais vencedores/empates acertados
//   4) alfabético (estabilidade)
function compareForRanking(a, b) {
    if (b.total !== a.total) return b.total - a.total;
    if (b.exact !== a.exact) return b.exact - a.exact;
    if (b.winner !== a.winner) return b.winner - a.winner;
    return (a.name || '').localeCompare(b.name || '');
}

// Pontos de um usuário SOMENTE nos jogos de uma fase do mata-mata da Copa.
// cupRound: 'r32' | 'r16' | 'qf' | 'sf' | 'final'
function computePlayoffPhasePoints(user, cupRound, realResults) {
    if (typeof getKnockoutMatchesByRound !== 'function') return 0;
    const matches = getKnockoutMatchesByRound(cupRound);
    const bets = user.playoffBets || {};
    let total = 0;
    matches.forEach(match => {
        const bet = bets[match.id];
        const real = realResults[match.id];
        if (!bet || !real) return;
        total += scoreSingleBet(bet.score1, bet.score2, real.score1, real.score2);
    });
    return total;
}

// Indica se todos os jogos de uma fase da Copa têm resultado postado.
function isPhaseFullyPlayed(cupRound, realResults) {
    if (typeof getKnockoutMatchesByRound !== 'function') return false;
    const matches = getKnockoutMatchesByRound(cupRound);
    return matches.length > 0 && matches.every(m => {
        const r = realResults[m.id];
        return r && r.score1 !== undefined && r.score2 !== undefined
            && r.score1 !== null && r.score2 !== null;
    });
}

// Mapa: fase do bolão -> fase da Copa
const BOLAO_TO_CUP = {
    r16:   'r16',   // bolão oitavas usa Copa R16 (oitavas)
    qf:    'qf',    // bolão quartas usa Copa QF
    sf:    'sf',    // bolão semis usa Copa SF
    final: 'final'  // bolão final usa Copa Final
};

// Resolve quem avança em cada confronto do bracket.
// top16: array de usuarios na ordem do seeding (top16[0] = 1º).
// Retorna estrutura: { r16: { M1: {...}, ... }, qf: {...}, sf: {...}, final: {...} }
function determinePlayoffAdvancement(top16, realResults) {
    const result = { r16: {}, qf: {}, sf: {}, final: {} };

    const seedOf = (user) => {
        if (!user) return 999;
        const idx = top16.findIndex(u => u.code === user.code);
        return idx >= 0 ? idx + 1 : 999;
    };

    const decide = (u1, u2, cupRound, phaseDone) => {
        const p1 = computePlayoffPhasePoints(u1, cupRound, realResults);
        const p2 = computePlayoffPhasePoints(u2, cupRound, realResults);
        let winner = null;
        if (phaseDone) {
            if (p1 > p2) winner = u1;
            else if (p2 > p1) winner = u2;
            else {
                // Desempate: melhor seed (menor número)
                winner = seedOf(u1) < seedOf(u2) ? u1 : u2;
            }
        }
        return { p1, p2, u1, u2, winner, decided: !!winner };
    };

    // R16 (bolão oitavas) — usa Copa R16
    const r16Done = isPhaseFullyPlayed(BOLAO_TO_CUP.r16, realResults);
    PLAYOFF_BRACKET.r16.forEach(match => {
        const u1 = top16[match.seed1 - 1];
        const u2 = top16[match.seed2 - 1];
        if (!u1 || !u2) {
            result.r16[match.id] = { decided: false };
            return;
        }
        result.r16[match.id] = decide(u1, u2, BOLAO_TO_CUP.r16, r16Done);
    });

    // QF — usa Copa QF
    const qfDone = isPhaseFullyPlayed(BOLAO_TO_CUP.qf, realResults);
    PLAYOFF_BRACKET.qf.forEach(match => {
        const from1 = result.r16[match.from1];
        const from2 = result.r16[match.from2];
        if (!from1?.decided || !from2?.decided) {
            result.qf[match.id] = { decided: false };
            return;
        }
        result.qf[match.id] = decide(from1.winner, from2.winner, BOLAO_TO_CUP.qf, qfDone);
    });

    // SF — usa Copa SF
    const sfDone = isPhaseFullyPlayed(BOLAO_TO_CUP.sf, realResults);
    PLAYOFF_BRACKET.sf.forEach(match => {
        const from1 = result.qf[match.from1];
        const from2 = result.qf[match.from2];
        if (!from1?.decided || !from2?.decided) {
            result.sf[match.id] = { decided: false };
            return;
        }
        result.sf[match.id] = decide(from1.winner, from2.winner, BOLAO_TO_CUP.sf, sfDone);
    });

    // Final — usa Copa Final
    const finalDone = isPhaseFullyPlayed(BOLAO_TO_CUP.final, realResults);
    PLAYOFF_BRACKET.final.forEach(match => {
        const from1 = result.sf[match.from1];
        const from2 = result.sf[match.from2];
        if (!from1?.decided || !from2?.decided) {
            result.final[match.id] = { decided: false };
            return;
        }
        result.final[match.id] = decide(from1.winner, from2.winner, BOLAO_TO_CUP.final, finalDone);
    });

    return result;
}
