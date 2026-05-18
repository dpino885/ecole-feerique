
const canvasTableau = document.getElementById('canvasTableauTrace');
const ctxTableau = canvasTableau ? canvasTableau.getContext('2d', { willReadFrequently: true }) : null;
const conteneurTableau = document.getElementById('conteneurTableauTrace');

// Canevas masqués pour la détection et le fantôme
const canvasMask = document.createElement('canvas');
const ctxMask = canvasMask.getContext('2d', { willReadFrequently: true });

let dessineTableau = false;
let evenementsTableauBranches = false;
const charactersTableau = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function initialiserTableauTrace() {
    if (!canvasTableau || !ctxTableau || !conteneurTableau) return;

    canvasTableau.width = conteneurTableau.clientWidth;
    canvasTableau.height = conteneurTableau.clientHeight;

    canvasMask.width = canvasTableau.width;
    canvasMask.height = canvasTableau.height;

    ctxTableau.lineJoin = 'round';
    ctxTableau.lineCap = 'round';
    ctxTableau.lineWidth = 15;

    preparerFantomes();

    if (!evenementsTableauBranches) {
        brancherEvenementsTableau();
        evenementsTableauBranches = true;
    }
}

function preparerFantomes() {
    ctxMask.clearRect(0, 0, canvasMask.width, canvasMask.height);

    // On dessine les fantômes sur le canvas principal et sur le masque
    ctxTableau.clearRect(0, 0, canvasTableau.width, canvasTableau.height);

    const cols = 9;
    const rows = 4;

    // On laisse une marge en haut pour les boutons
    const marginTop = 80;
    const availableHeight = canvasTableau.height - marginTop;

    const cellWidth = canvasTableau.width / cols;
    const cellHeight = availableHeight / rows;

    ctxTableau.save();
    ctxTableau.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctxTableau.textAlign = "center";
    ctxTableau.textBaseline = "middle";

    ctxMask.save();
    ctxMask.fillStyle = "white"; // Couleur pleine pour le masque de détection
    ctxMask.textAlign = "center";
    ctxMask.textBaseline = "middle";

    const fontSize = Math.min(cellWidth, cellHeight) * 0.7;
    ctxTableau.font = `bold ${fontSize}px Arial Black`;
    ctxMask.font = `bold ${fontSize}px Arial Black`;

    charactersTableau.forEach((char, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = col * cellWidth + cellWidth / 2;
        const y = marginTop + row * cellHeight + cellHeight / 2;

        ctxTableau.fillText(char, x, y);
        ctxMask.fillText(char, x, y);
    });

    ctxTableau.restore();
    ctxMask.restore();
}

function effacerTableauTrace() {
    if (!ctxTableau) return;
    // On efface seulement les traits, pas les fantômes
    // Pour simplifier, on redessine tout
    preparerFantomes();
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

function demarrerTraceTableau(e) {
    dessineTableau = true;
    const rect = canvasTableau.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    ctxTableau.beginPath();
    ctxTableau.moveTo(x, y);
}

function tracerTableau(e) {
    if (!dessineTableau) return;

    const rect = canvasTableau.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    // Détection de collision avec le masque
    const pixel = ctxMask.getImageData(x, y, 1, 1).data;
    const estDansFantome = pixel[3] > 0; // Si l'alpha est > 0, on est sur une lettre/chiffre

    ctxTableau.strokeStyle = estDansFantome ? "#00ff00" : "#ff0000";

    ctxTableau.lineTo(x, y);
    ctxTableau.stroke();

    // On recommence un chemin à chaque segment pour pouvoir changer de couleur
    ctxTableau.beginPath();
    ctxTableau.moveTo(x, y);

    // Particules
    if (typeof Particule !== 'undefined') {
        for (let i = 0; i < 2; i++) {
            let p = new Particule(x + rect.left, y + rect.top);
            p.couleur = ctxTableau.strokeStyle;
            particules.push(p);
        }
    }
}

function arreterTraceTableau() {
    dessineTableau = false;
}

window.initialiserTableauTrace = initialiserTableauTrace;
window.effacerTableauTrace = effacerTableauTrace;
