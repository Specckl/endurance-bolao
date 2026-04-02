// Dados completos dos 72 jogos da fase de grupos - Copa do Mundo 2026
// Formato: { id, group, matchday, date, team1, team2, city, stadium }
const MATCHES_DATA = [
    // ===== GRUPO A =====
    { id: 1, group: "A", matchday: 1, date: "2026-06-11", team1: "México", team2: "África do Sul", city: "Cidade do México", stadium: "Estadio Azteca" },
    { id: 2, group: "A", matchday: 1, date: "2026-06-11", team1: "Coreia do Sul", team2: "República Tcheca", city: "Zapopan", stadium: "Estadio Akron" },
    { id: 25, group: "A", matchday: 2, date: "2026-06-18", team1: "República Tcheca", team2: "África do Sul", city: "Atlanta", stadium: "Mercedes-Benz Stadium" },
    { id: 28, group: "A", matchday: 2, date: "2026-06-18", team1: "México", team2: "Coreia do Sul", city: "Zapopan", stadium: "Estadio Akron" },
    { id: 53, group: "A", matchday: 3, date: "2026-06-24", team1: "República Tcheca", team2: "México", city: "Cidade do México", stadium: "Estadio Azteca" },
    { id: 54, group: "A", matchday: 3, date: "2026-06-24", team1: "África do Sul", team2: "Coreia do Sul", city: "Guadalupe", stadium: "Estadio BBVA" },

    // ===== GRUPO B =====
    { id: 3, group: "B", matchday: 1, date: "2026-06-12", team1: "Canadá", team2: "Bósnia e Herzegovina", city: "Toronto", stadium: "BMO Field" },
    { id: 8, group: "B", matchday: 1, date: "2026-06-13", team1: "Qatar", team2: "Suíça", city: "Santa Clara", stadium: "Levi's Stadium" },
    { id: 26, group: "B", matchday: 2, date: "2026-06-18", team1: "Suíça", team2: "Bósnia e Herzegovina", city: "Vancouver", stadium: "BC Place" },
    { id: 27, group: "B", matchday: 2, date: "2026-06-18", team1: "Canadá", team2: "Qatar", city: "Toronto", stadium: "BMO Field" },
    { id: 51, group: "B", matchday: 3, date: "2026-06-24", team1: "Suíça", team2: "Canadá", city: "Vancouver", stadium: "BC Place" },
    { id: 52, group: "B", matchday: 3, date: "2026-06-24", team1: "Bósnia e Herzegovina", team2: "Qatar", city: "Seattle", stadium: "Lumen Field" },

    // ===== GRUPO C =====
    { id: 7, group: "C", matchday: 1, date: "2026-06-13", team1: "Brasil", team2: "Marrocos", city: "East Rutherford", stadium: "MetLife Stadium" },
    { id: 5, group: "C", matchday: 1, date: "2026-06-13", team1: "Haiti", team2: "Escócia", city: "Foxborough", stadium: "Gillette Stadium" },
    { id: 30, group: "C", matchday: 2, date: "2026-06-19", team1: "Escócia", team2: "Marrocos", city: "Foxborough", stadium: "Gillette Stadium" },
    { id: 29, group: "C", matchday: 2, date: "2026-06-19", team1: "Brasil", team2: "Haiti", city: "Philadelphia", stadium: "Lincoln Financial Field" },
    { id: 49, group: "C", matchday: 3, date: "2026-06-24", team1: "Escócia", team2: "Brasil", city: "Miami Gardens", stadium: "Hard Rock Stadium" },
    { id: 50, group: "C", matchday: 3, date: "2026-06-24", team1: "Marrocos", team2: "Haiti", city: "Atlanta", stadium: "Mercedes-Benz Stadium" },

    // ===== GRUPO D =====
    { id: 4, group: "D", matchday: 1, date: "2026-06-12", team1: "Estados Unidos", team2: "Paraguai", city: "Seattle", stadium: "Lumen Field" },
    { id: 6, group: "D", matchday: 1, date: "2026-06-13", team1: "Austrália", team2: "Turquia", city: "Dallas", stadium: "AT&T Stadium" },
    { id: 32, group: "D", matchday: 2, date: "2026-06-19", team1: "Estados Unidos", team2: "Austrália", city: "Philadelphia", stadium: "Lincoln Financial Field" },
    { id: 31, group: "D", matchday: 2, date: "2026-06-19", team1: "Turquia", team2: "Paraguai", city: "Santa Clara", stadium: "Levi's Stadium" },
    { id: 59, group: "D", matchday: 3, date: "2026-06-25", team1: "Turquia", team2: "Estados Unidos", city: "Santa Clara", stadium: "Levi's Stadium" },
    { id: 60, group: "D", matchday: 3, date: "2026-06-25", team1: "Paraguai", team2: "Austrália", city: "Houston", stadium: "NRG Stadium" },

    // ===== GRUPO E =====
    { id: 10, group: "E", matchday: 1, date: "2026-06-14", team1: "Alemanha", team2: "Curaçao", city: "Houston", stadium: "NRG Stadium" },
    { id: 9, group: "E", matchday: 1, date: "2026-06-14", team1: "Costa do Marfim", team2: "Equador", city: "Philadelphia", stadium: "Lincoln Financial Field" },
    { id: 33, group: "E", matchday: 2, date: "2026-06-20", team1: "Alemanha", team2: "Costa do Marfim", city: "Toronto", stadium: "BMO Field" },
    { id: 34, group: "E", matchday: 2, date: "2026-06-20", team1: "Equador", team2: "Curaçao", city: "Kansas City", stadium: "Arrowhead Stadium" },
    { id: 55, group: "E", matchday: 3, date: "2026-06-25", team1: "Curaçao", team2: "Costa do Marfim", city: "Philadelphia", stadium: "Lincoln Financial Field" },
    { id: 56, group: "E", matchday: 3, date: "2026-06-25", team1: "Equador", team2: "Alemanha", city: "East Rutherford", stadium: "MetLife Stadium" },

    // ===== GRUPO F =====
    { id: 11, group: "F", matchday: 1, date: "2026-06-14", team1: "Holanda", team2: "Japão", city: "Arlington", stadium: "AT&T Stadium" },
    { id: 12, group: "F", matchday: 1, date: "2026-06-14", team1: "Suécia", team2: "Tunísia", city: "Guadalupe", stadium: "Estadio BBVA" },
    { id: 35, group: "F", matchday: 2, date: "2026-06-20", team1: "Holanda", team2: "Suécia", city: "Houston", stadium: "NRG Stadium" },
    { id: 36, group: "F", matchday: 2, date: "2026-06-20", team1: "Tunísia", team2: "Japão", city: "Guadalupe", stadium: "Estadio BBVA" },
    { id: 57, group: "F", matchday: 3, date: "2026-06-25", team1: "Japão", team2: "Suécia", city: "Arlington", stadium: "AT&T Stadium" },
    { id: 58, group: "F", matchday: 3, date: "2026-06-25", team1: "Tunísia", team2: "Holanda", city: "Kansas City", stadium: "Arrowhead Stadium" },

    // ===== GRUPO G =====
    { id: 16, group: "G", matchday: 1, date: "2026-06-15", team1: "Bélgica", team2: "Egito", city: "Seattle", stadium: "Lumen Field" },
    { id: 15, group: "G", matchday: 1, date: "2026-06-15", team1: "Irã", team2: "Nova Zelândia", city: "Inglewood", stadium: "SoFi Stadium" },
    { id: 39, group: "G", matchday: 2, date: "2026-06-21", team1: "Bélgica", team2: "Irã", city: "Inglewood", stadium: "SoFi Stadium" },
    { id: 40, group: "G", matchday: 2, date: "2026-06-21", team1: "Nova Zelândia", team2: "Egito", city: "Vancouver", stadium: "BC Place" },
    { id: 63, group: "G", matchday: 3, date: "2026-06-26", team1: "Egito", team2: "Irã", city: "Seattle", stadium: "Lumen Field" },
    { id: 64, group: "G", matchday: 3, date: "2026-06-26", team1: "Nova Zelândia", team2: "Bélgica", city: "Vancouver", stadium: "BC Place" },

    // ===== GRUPO H =====
    { id: 14, group: "H", matchday: 1, date: "2026-06-15", team1: "Espanha", team2: "Cabo Verde", city: "Atlanta", stadium: "Mercedes-Benz Stadium" },
    { id: 13, group: "H", matchday: 1, date: "2026-06-15", team1: "Arábia Saudita", team2: "Uruguai", city: "Miami Gardens", stadium: "Hard Rock Stadium" },
    { id: 38, group: "H", matchday: 2, date: "2026-06-21", team1: "Espanha", team2: "Arábia Saudita", city: "Atlanta", stadium: "Mercedes-Benz Stadium" },
    { id: 37, group: "H", matchday: 2, date: "2026-06-21", team1: "Uruguai", team2: "Cabo Verde", city: "Miami Gardens", stadium: "Hard Rock Stadium" },
    { id: 65, group: "H", matchday: 3, date: "2026-06-26", team1: "Cabo Verde", team2: "Arábia Saudita", city: "Houston", stadium: "NRG Stadium" },
    { id: 66, group: "H", matchday: 3, date: "2026-06-26", team1: "Uruguai", team2: "Espanha", city: "Zapopan", stadium: "Estadio Akron" },

    // ===== GRUPO I =====
    { id: 17, group: "I", matchday: 1, date: "2026-06-16", team1: "França", team2: "Senegal", city: "East Rutherford", stadium: "MetLife Stadium" },
    { id: 18, group: "I", matchday: 1, date: "2026-06-16", team1: "Iraque", team2: "Noruega", city: "Foxborough", stadium: "Gillette Stadium" },
    { id: 42, group: "I", matchday: 2, date: "2026-06-22", team1: "França", team2: "Iraque", city: "Philadelphia", stadium: "Lincoln Financial Field" },
    { id: 41, group: "I", matchday: 2, date: "2026-06-22", team1: "Noruega", team2: "Senegal", city: "East Rutherford", stadium: "MetLife Stadium" },
    { id: 61, group: "I", matchday: 3, date: "2026-06-26", team1: "Noruega", team2: "França", city: "Foxborough", stadium: "Gillette Stadium" },
    { id: 62, group: "I", matchday: 3, date: "2026-06-26", team1: "Senegal", team2: "Iraque", city: "Toronto", stadium: "BMO Field" },

    // ===== GRUPO J =====
    { id: 19, group: "J", matchday: 1, date: "2026-06-16", team1: "Argentina", team2: "Argélia", city: "Kansas City", stadium: "Arrowhead Stadium" },
    { id: 20, group: "J", matchday: 1, date: "2026-06-16", team1: "Áustria", team2: "Jordânia", city: "Santa Clara", stadium: "Levi's Stadium" },
    { id: 43, group: "J", matchday: 2, date: "2026-06-22", team1: "Argentina", team2: "Áustria", city: "Arlington", stadium: "AT&T Stadium" },
    { id: 44, group: "J", matchday: 2, date: "2026-06-22", team1: "Jordânia", team2: "Argélia", city: "Santa Clara", stadium: "Levi's Stadium" },
    { id: 69, group: "J", matchday: 3, date: "2026-06-27", team1: "Argélia", team2: "Áustria", city: "Kansas City", stadium: "Arrowhead Stadium" },
    { id: 70, group: "J", matchday: 3, date: "2026-06-27", team1: "Jordânia", team2: "Argentina", city: "Arlington", stadium: "AT&T Stadium" },

    // ===== GRUPO K =====
    { id: 23, group: "K", matchday: 1, date: "2026-06-17", team1: "Portugal", team2: "RD Congo", city: "Houston", stadium: "NRG Stadium" },
    { id: 24, group: "K", matchday: 1, date: "2026-06-17", team1: "Uzbequistão", team2: "Colômbia", city: "Cidade do México", stadium: "Estadio Azteca" },
    { id: 47, group: "K", matchday: 2, date: "2026-06-23", team1: "Portugal", team2: "Uzbequistão", city: "Houston", stadium: "NRG Stadium" },
    { id: 48, group: "K", matchday: 2, date: "2026-06-23", team1: "Colômbia", team2: "RD Congo", city: "Zapopan", stadium: "Estadio Akron" },
    { id: 71, group: "K", matchday: 3, date: "2026-06-27", team1: "Colômbia", team2: "Portugal", city: "Miami Gardens", stadium: "Hard Rock Stadium" },
    { id: 72, group: "K", matchday: 3, date: "2026-06-27", team1: "RD Congo", team2: "Uzbequistão", city: "Atlanta", stadium: "Mercedes-Benz Stadium" },

    // ===== GRUPO L =====
    { id: 22, group: "L", matchday: 1, date: "2026-06-17", team1: "Inglaterra", team2: "Croácia", city: "Arlington", stadium: "AT&T Stadium" },
    { id: 21, group: "L", matchday: 1, date: "2026-06-17", team1: "Gana", team2: "Panamá", city: "Toronto", stadium: "BMO Field" },
    { id: 45, group: "L", matchday: 2, date: "2026-06-23", team1: "Inglaterra", team2: "Gana", city: "Foxborough", stadium: "Gillette Stadium" },
    { id: 46, group: "L", matchday: 2, date: "2026-06-23", team1: "Panamá", team2: "Croácia", city: "Toronto", stadium: "BMO Field" },
    { id: 67, group: "L", matchday: 3, date: "2026-06-27", team1: "Panamá", team2: "Inglaterra", city: "East Rutherford", stadium: "MetLife Stadium" },
    { id: 68, group: "L", matchday: 3, date: "2026-06-27", team1: "Croácia", team2: "Gana", city: "Philadelphia", stadium: "Lincoln Financial Field" }
];

// Códigos ISO dos países para bandeiras via flagcdn.com
const TEAM_FLAGS = {
    "México": "mx", "África do Sul": "za", "Coreia do Sul": "kr", "República Tcheca": "cz",
    "Canadá": "ca", "Bósnia e Herzegovina": "ba", "Qatar": "qa", "Suíça": "ch",
    "Brasil": "br", "Marrocos": "ma", "Haiti": "ht", "Escócia": "gb-sct",
    "Estados Unidos": "us", "Paraguai": "py", "Austrália": "au", "Turquia": "tr",
    "Alemanha": "de", "Curaçao": "cw", "Costa do Marfim": "ci", "Equador": "ec",
    "Holanda": "nl", "Japão": "jp", "Suécia": "se", "Tunísia": "tn",
    "Bélgica": "be", "Egito": "eg", "Irã": "ir", "Nova Zelândia": "nz",
    "Espanha": "es", "Cabo Verde": "cv", "Arábia Saudita": "sa", "Uruguai": "uy",
    "França": "fr", "Senegal": "sn", "Iraque": "iq", "Noruega": "no",
    "Argentina": "ar", "Argélia": "dz", "Áustria": "at", "Jordânia": "jo",
    "Portugal": "pt", "RD Congo": "cd", "Uzbequistão": "uz", "Colômbia": "co",
    "Inglaterra": "gb-eng", "Croácia": "hr", "Gana": "gh", "Panamá": "pa"
};

function getFlagImg(teamName) {
    const code = TEAM_FLAGS[teamName];
    if (!code) return '<span class="flag">🏳️</span>';
    return `<img class="flag-img" src="https://flagcdn.com/w40/${code}.png" alt="${teamName}" loading="lazy">`;
}

// Data limite para envio/alteração de palpites
const DEADLINE = new Date("2026-06-10T23:59:59");
