import fetch from 'node-fetch';

console.log('Testing API endpoint...\n');

// Simulate what the component does
const sessionData = {
  idSession: 1,
  nomSession: "Atelier maquette de bijoux — Niveau 2",
  dateDebut: "2026-03-15",  // What API returns after .split('T')[0]
  dateFin: "2026-03-19",
  capaciteMax: 8,
  nbInscrits: 5
};

console.log('Session data from API (after formatting):');
console.log(JSON.stringify(sessionData, null, 2));

console.log('\nWhat component does at line 457:');
console.log('new Date(session.dateDebut).toLocaleDateString("fr-FR")');
console.log('where session.dateDebut =', sessionData.dateDebut);

const testDate = new Date(sessionData.dateDebut);
console.log('\nParsed Date object:', testDate);
console.log('Is valid?', !isNaN(testDate.getTime()));
console.log('toLocaleDateString result:', testDate.toLocaleDateString('fr-FR'));

console.log('\n--- THE BUG ---');
console.log('Expected: "15/03/2026"');
console.log('Got:', testDate.toLocaleDateString('fr-FR'));

console.log('\n--- ROOT CAUSE ---');
if (isNaN(testDate.getTime())) {
  console.log('Date parsing failed! NaN detected.');
  console.log('This likely happens if dateDebut is null/undefined');
}
