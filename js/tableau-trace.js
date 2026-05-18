
const canvasTableau = document.getElementById('canvasTableauTrace');
const ctxTableau = canvasTableau ? canvasTableau.getContext('2d', { willReadFrequently: true }) : null;
const conteneurTableau = document.getElementById('conteneurTableauTrace');

// Canevas masqués pour la détection et le fantôme
const canvasMask = document.createElement('canvas');
const ctxMask = canvasMask.getContext('2d', { willReadFrequently: true });

// Canevas persistant pour le dessin de l'utilisateur
const canvasDessinPersistant = document.createElement('canvas');
const ctxDessinPersistant = canvasDessinPersistant.getContext('2d');

let dessineTableau = false;
let evenementsTableauBranches = false;
let modeTrace = 'lettres'; // 'lettres' ou 'chiffres'
let indexCaractereActuel = 0;

const CHIFFRES = "0123456789".split("");
const LETTRES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function getCaracteresActuels() {
    return modeTrace === 'chiffres' ? CHIFFRES : LETTRES;
}

function initialiserTableauTrace(mode) {
    if (!canvasTableau || !ctxTableau || !conteneurTableau) return;

    if (mode) modeTrace = mode;
    indexCaractereActuel = 0;

    canvasTableau.width = conteneurTableau.clientWidth;
    canvasTableau.height = conteneurTableau.clientHeight;

    canvasMask.width = canvasTableau.width;
    canvasMask.height = canvasTableau.height;

    canvasDessinPersistant.width = canvasTableau.width;
    canvasDessinPersistant.height = canvasTableau.height;

    ctxTableau.lineJoin = 'round';
    ctxTableau.lineCap = 'round';
    ctxTableau.lineWidth = 20;

    ctxDessinPersistant.lineJoin = 'round';
    ctxDessinPersistant.lineCap = 'round';
    ctxDessinPersistant.lineWidth = 20;

    preparerFantome();

    if (!evenementsTableauBranches) {
        brancherEvenementsTableau();
        evenementsTableauBranches = true;
    }
}

function preparerFantome() {
    const caracteres = getCaracteresActuels();
    const char = caracteres[indexCaractereActuel];

    const x = canvasTableau.width / 2;
    const y = canvasTableau.height / 2;
    const fontSize = Math.min(canvasTableau.width, canvasTableau.height) * 0.8;

    // Mise à jour du masque une seule fois par caractère
    ctxMask.save();
    ctxMask.clearRect(0, 0, canvasMask.width, canvasMask.height);
    ctxMask.fillStyle = "white";
    ctxMask.textAlign = "center";
    ctxMask.textBaseline = "middle";
    ctxMask.font = `bold ${fontSize}px Arial Black`;
    ctxMask.fillText(char, x, y);
    ctxMask.restore();

    ctxDessinPersistant.clearRect(0, 0, canvasDessinPersistant.width, canvasDessinPersistant.height);

    dessinerTout();
    parlerCaractere(char);
}

function dessinerTout() {
    const caracteres = getCaracteresActuels();
    const char = caracteres[indexCaractereActuel];

    ctxTableau.clearRect(0, 0, canvasTableau.width, canvasTableau.height);

    // Dessin du fantôme
    const x = canvasTableau.width / 2;
    const y = canvasTableau.height / 2;

    ctxTableau.save();
    ctxTableau.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctxTableau.textAlign = "center";
    ctxTableau.textBaseline = "middle";

    const fontSize = Math.min(canvasTableau.width, canvasTableau.height) * 0.8;
    ctxTableau.font = `bold ${fontSize}px Arial Black`;
    ctxTableau.fillText(char, x, y);
    ctxTableau.restore();

    // Dessin des traits de l'utilisateur
    ctxTableau.drawImage(canvasDessinPersistant, 0, 0);
}

function effacerTableauTrace() {
    ctxDessinPersistant.clearRect(0, 0, canvasDessinPersistant.width, canvasDessinPersistant.height);
    dessinerTout();
}

function caractereSuivant() {
    const caracteres = getCaracteresActuels();
    indexCaractereActuel = (indexCaractereActuel + 1) % caracteres.length;
    preparerFantome();
}

function caracterePrecedent() {
    const caracteres = getCaracteresActuels();
    indexCaractereActuel = (indexCaractereActuel - 1 + caracteres.length) % caracteres.length;
    preparerFantome();
}

function parlerCaractere(char) {
    if (typeof parler === 'function') {
        parler(char);
    }
}

function brancherEvenementsTableau() {
    canvasTableau.addEventListener('mousedown', demarrerTraceTableau);
    canvasTableau.addEventListener('mousemove', tracerTableau);
    canvasTableau.addEventListener('mouseup', arreterTraceTableau);
    canvasTableau.addEventListener('mouseout', arreterTraceTableau);

    canvasTableau.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvasTableau.dispatchEvent(mouseEvent);
    }, { passive: false });

    canvasTableau.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvasTableau.dispatchEvent(mouseEvent);
    }, { passive: false });

    canvasTableau.addEventListener('touchend', (e) => {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup', {});
        canvasTableau.dispatchEvent(mouseEvent);
    }, { passive: false });
}

let dernierX, dernierY;

function demarrerTraceTableau(e) {
    dessineTableau = true;
    const rect = canvasTableau.getBoundingClientRect();
    dernierX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    dernierY = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
}

function tracerTableau(e) {
    if (!dessineTableau) return;

    const rect = canvasTableau.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    // Détection de collision avec le masque
    const pixel = ctxMask.getImageData(x, y, 1, 1).data;
    const estDansFantome = pixel[3] > 0;

    const couleur = estDansFantome ? "#00ff00" : "#ff0000";

    ctxDessinPersistant.strokeStyle = couleur;
    ctxDessinPersistant.beginPath();
    ctxDessinPersistant.moveTo(dernierX, dernierY);
    ctxDessinPersistant.lineTo(x, y);
    ctxDessinPersistant.stroke();

    dernierX = x;
    dernierY = y;

    dessinerTout();

    // Particules
    if (typeof Particule !== 'undefined') {
        for (let i = 0; i < 2; i++) {
            let p = new Particule(x + rect.left, y + rect.top);
            p.couleur = couleur;
            particules.push(p);
        }
    }
}

function arreterTraceTableau() {
    dessineTableau = false;
}

window.initialiserTableauTrace = initialiserTableauTrace;
window.effacerTableauTrace = effacerTableauTrace;
window.caractereSuivant = caractereSuivant;
window.caracterePrecedent = caracterePrecedent;
