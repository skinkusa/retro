/**
 * Nationality-grouped name pools for generated players.
 * This ensures that first and last names are culturally consistent.
 */

export interface NamePool {
  firstNames: string[];
  lastNames: string[];
}

export const NATIONALITY_POOLS: Record<string, NamePool> = {
  England: {
    firstNames: ["David", "James", "Peter", "Alan", "Gary", "Kevin", "Ian", "Paul", "Chris", "Mark", "Steve", "Tony", "Brian", "Lee", "Nigel", "Rob", "Mick", "Dave", "Terry", "Ray", "Michael", "Andrew", "John", "Richard", "Daniel", "Matthew", "Robert", "Stephen", "Wayne", "Sean", "Trevor", "Stuart", "Graeme", "Dean", "Neil", "Darren", "Jason", "Simon", "Colin", "Gordon", "Bryan", "Teddy", "Les", "Frank", "Dennis", "Eric", "Roy", "Harry", "Jack", "Phil", "Gareth", "Kyle", "Jordan", "Marcus", "Raheem", "Declan", "Bukayo", "Jude", "Mason", "Reece", "Trent", "Conor"],
    lastNames: ["Smith", "Jones", "Brown", "Taylor", "Wilson", "Davies", "Evans", "Thomas", "Johnson", "Roberts", "Walker", "Wright", "Robinson", "Thompson", "White", "Hughes", "Edwards", "Green", "Hall", "Wood", "Beckham", "Scholes", "Neville", "Butt", "Keane", "Pallister", "Bruce", "Sheringham", "Cole", "Adams", "Campbell", "Gerrard", "Carragher", "Fowler", "Lampard", "Terry", "Shearer", "Given", "Solano", "Ferguson", "Defoe", "Kane", "Wilshere", "Foden", "Southgate", "Henderson", "Rashford", "Sterling", "Rice", "Saka", "Bellingham", "Mount", "James", "Alexander-Arnold", "Gallagher", "Moore", "Charlton", "Hurst", "Peters", "Banks", "Lineker", "Gascoigne", "Waddle", "Platt", "Shilton"]
  },
  France: {
    firstNames: ["Zinedine", "Thierry", "Patrick", "Robert", "Nicolas", "Laurent", "Didier", "Marcel", "Youri", "Fabien", "Jean-Pierre", "Eric", "Sylvain", "David", "Franck", "Hugo", "Kylian", "Antoine", "Paul", "N'Golo", "Karim", "Olivier", "Raphaël"],
    lastNames: ["Zidane", "Henry", "Vieira", "Pires", "Anelka", "Blanc", "Deschamps", "Desailly", "Djorkaeff", "Barthez", "Papin", "Cantona", "Wiltord", "Trezeguet", "Ribéry", "Lloris", "Mbappé", "Griezmann", "Pogba", "Kanté", "Benzema", "Giroud", "Varane"]
  },
  Germany: {
    firstNames: ["Jürgen", "Lothar", "Stefan", "Andreas", "Matthias", "Oliver", "Michael", "Bastian", "Philipp", "Thomas", "Manuel", "Miroslav", "Mario", "Mesut", "Toni", "Joshua", "Lukas", "Ilkay", "Kai"],
    lastNames: ["Klinsmann", "Matthäus", "Effenberg", "Brehme", "Sammer", "Kahn", "Ballack", "Schweinsteiger", "Lahm", "Müller", "Neuer", "Klose", "Götze", "Özil", "Kroos", "Kimmich", "Podolski", "Gündogan", "Havertz"]
  },
  Spain: {
    firstNames: ["Raúl", "Fernando", "Xavi", "Andrés", "Iker", "Carles", "Sergio", "David", "Cesc", "Gerard", "Alvaro", "Isco", "Thiago", "Gavi", "Pedri", "Luis"],
    lastNames: ["González", "Hierro", "Hernández", "Iniesta", "Casillas", "Puyol", "Ramos", "Villa", "Fàbregas", "Piqué", "Morata", "Alonso", "Busquets", "Torres", "Silva", "Enrique"]
  },
  Italy: {
    firstNames: ["Alessandro", "Roberto", "Paolo", "Gianluigi", "Francesco", "Filippo", "Fabio", "Andrea", "Giorgio", "Leonardo", "Marco", "Gianfranco", "Giuseppe"],
    lastNames: ["Del Piero", "Baggio", "Maldini", "Buffon", "Totti", "Inzaghi", "Cannavaro", "Pirlo", "Chiellini", "Bonucci", "Verratti", "Zola", "Rossi"]
  },
  Brazil: {
    firstNames: ["Ronaldo", "Romário", "Rivaldo", "Ronaldinho", "Roberto", "Cafu", "Kaká", "Neymar", "Vinícius", "Alisson", "Ederson", "Casemiro", "Bebeto", "Dunga"],
    lastNames: ["Nazário", "Souza", "Vítor", "Gaucho", "Carlos", "Silva", "Leite", "Júnior", "Oliveira", "Becker", "Moraes", "Venâncio", "Santos", "Costa"]
  },
  Netherlands: {
    firstNames: ["Dennis", "Marco", "Ruud", "Patrick", "Clarence", "Edgar", "Edwin", "Frank", "Ronald", "Wesley", "Arjen", "Robin", "Virgil", "Frenkie", "Memphis"],
    lastNames: ["Bergkamp", "van Basten", "Gullit", "Kluivert", "Seedorf", "Davids", "van der Sar", "de Boer", "Sneijder", "Robben", "van Persie", "van Dijk", "de Jong", "Depay", "Koeman"]
  }
};

// For backward compatibility during transition or simple fallback
export const FIRSTNAME_POOL = NATIONALITY_POOLS['England'].firstNames;
export const SURNAME_POOL = NATIONALITY_POOLS['England'].lastNames;
