// Global State Variables
let particules = [];
let couleurActuelle = '#ff00ff';
let indexModeleActuel = 0;
let typeActuel = 'libre';
let scoreFées = 0;
let difficulteActuelleMemory = 'facile';
let cartesRetournees = [];
let pairesTrouveesMemory = 0;
let peutJouerMemory = true;
let audioCtx = null;
let comptineActuelle = null;
let indexNoteComptine = 0;
let modeSuisLumiere = false;
let timeoutLumiere = null;

const modelesLettres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const modelesChiffres = "0123456789".split("");
