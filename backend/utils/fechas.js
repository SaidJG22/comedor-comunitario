const ZONA = 'America/Argentina/Tucuman';

// Fecha de hoy
const hoy = () => new Date().toLocaleDateString('sv-SE', { timeZone: ZONA });

module.exports = { hoy };
