// LOGIQUE DU MODULE CASSE-TÊTE

const imagesPuzzle = [
    { src: 'images/chat-casse-tete.jpg', nom: 'Chat' },
    { src: 'images/dragon-casse-tete.webp', nom: 'Dragon' },
    { src: 'images/licorne-casse-tete.jpg', nom: 'Licorne' }
];

const configurationsPuzzle = {
    'facile': { rows: 4, cols: 4 },
    'normal': { rows: 6, cols: 6 },
    'difficile': { rows: 8, cols: 8 }
};

let pieceSelectionnee = null;
let decalageX = 0;
let decalageY = 0;

function initialiserModulePuzzle() {
    const selection = document.getElementById('selectionPuzzle');
    const jeu = document.getElementById('jeuPuzzle');
    selection.style.display = 'block';
    jeu.style.display = 'none';

    genererSelectionImagesPuzzle();
}

function changerDifficultePuzzle(nouvelleDiff) {
    difficulteActuellePuzzle = nouvelleDiff;
    // Mettre à jour l'UI des boutons si besoin
    const boutons = document.querySelectorAll('#selectionPuzzle .selection-difficulte button');
    boutons.forEach(btn => {
        if (btn.innerText.toLowerCase().includes(nouvelleDiff)) {
            btn.style.background = '#ffd700';
            btn.style.color = '#311b92';
        } else {
            btn.style.background = '';
            btn.style.color = '';
        }
    });
}

function genererSelectionImagesPuzzle() {
    const grille = document.getElementById('grilleImagesPuzzle');
    grille.innerHTML = '';

    imagesPuzzle.forEach(imgData => {
        const div = document.createElement('div');
        div.className = 'item-image-puzzle';
        div.innerHTML = `<img src="${imgData.src}" alt="${imgData.nom}">`;
        div.onclick = () => demarrerPuzzle(imgData.src);
        grille.appendChild(div);
    });
}

async function demarrerPuzzle(srcImage) {
    imageActuellePuzzle = srcImage;
    const selection = document.getElementById('selectionPuzzle');
    const jeu = document.getElementById('jeuPuzzle');

    selection.style.display = 'none';
    jeu.style.display = 'block';

    const img = new Image();
    img.src = srcImage;
    await img.decode();

    preparerJeu(img);
}

function preparerJeu(img) {
    const zonePlateau = document.getElementById('zonePlateau');
    const zonePieces = document.getElementById('zonePieces');
    zonePlateau.innerHTML = '';
    zonePieces.innerHTML = '';

    const config = configurationsPuzzle[difficulteActuellePuzzle];
    const rows = config.rows;
    const cols = config.cols;

    // Calculer les dimensions pour que le puzzle tienne dans l'écran
    const maxWidth = window.innerWidth * 0.8;
    const maxHeight = window.innerHeight * 0.7;
    const ratioImg = img.width / img.height;

    let puzzleWidth, puzzleHeight;
    if (maxWidth / ratioImg <= maxHeight) {
        puzzleWidth = maxWidth;
        puzzleHeight = maxWidth / ratioImg;
    } else {
        puzzleHeight = maxHeight;
        puzzleWidth = maxHeight * ratioImg;
    }

    zonePlateau.style.width = puzzleWidth + 'px';
    zonePlateau.style.height = puzzleHeight + 'px';

    const pieceWidth = puzzleWidth / cols;
    const pieceHeight = puzzleHeight / rows;

    piecesPuzzle = [];

    // Définir les types d'onglets pour chaque pièce (0: plat, 1: mâle, -1: femelle)
    const horizontalTabs = Array.from({ length: rows }, () => Array.from({ length: cols - 1 }, () => Math.random() < 0.5 ? 1 : -1));
    const verticalTabs = Array.from({ length: rows - 1 }, () => Array.from({ length: cols }, () => Math.random() < 0.5 ? 1 : -1));

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const piece = creerPiece(img, r, c, rows, cols, pieceWidth, pieceHeight, horizontalTabs, verticalTabs);
            piecesPuzzle.push(piece);
            zonePieces.appendChild(piece.element);
        }
    }

    melangerPieces(puzzleWidth, puzzleHeight);
}

function creerPiece(img, r, c, rows, cols, w, h, hTabs, vTabs) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // On ajoute de la marge pour les onglets
    const tabSize = Math.min(w, h) * 0.2;
    canvas.width = w + tabSize * 2;
    canvas.height = h + tabSize * 2;

    const pieceData = {
        row: r,
        col: c,
        targetX: c * w,
        targetY: r * h,
        currentX: 0,
        currentY: 0,
        isLocked: false,
        element: canvas
    };

    // Dessiner la forme de la pièce
    ctx.beginPath();
    const x = tabSize;
    const y = tabSize;

    // Haut
    ctx.moveTo(x, y);
    if (r > 0) {
        dessinerOnglet(ctx, x, y, x + w, y, vTabs[r - 1][c], 'H');
    } else {
        ctx.lineTo(x + w, y);
    }

    // Droite
    if (c < cols - 1) {
        dessinerOnglet(ctx, x + w, y, x + w, y + h, hTabs[r][c], 'V');
    } else {
        ctx.lineTo(x + w, y + h);
    }

    // Bas
    if (r < rows - 1) {
        dessinerOnglet(ctx, x + w, y + h, x, y + h, vTabs[r][c], 'H');
    } else {
        ctx.lineTo(x, y + h);
    }

    // Gauche
    if (c > 0) {
        dessinerOnglet(ctx, x, y + h, x, y, hTabs[r][c - 1], 'V');
    } else {
        ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.clip();

    // Dessiner l'image
    const sourceX = (c * img.width) / cols;
    const sourceY = (r * img.height) / rows;
    const sourceW = img.width / cols;
    const sourceH = img.height / rows;

    ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, x, y, w, h);

    // Bordure
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    canvas.className = 'piece-puzzle';
    canvas.style.width = (w + tabSize * 2) + 'px';
    canvas.style.height = (h + tabSize * 2) + 'px';
    canvas.style.left = '0px';
    canvas.style.top = '0px';

    // Evenements
    canvas.addEventListener('mousedown', demarrerDrag);
    canvas.addEventListener('touchstart', demarrerDrag, { passive: false });

    pieceData.tabSize = tabSize;
    return pieceData;
}

function dessinerOnglet(ctx, x1, y1, x2, y2, type, orientation) {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const size = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) * 0.2;

    if (orientation === 'H') {
        const direction = (x2 > x1) ? 1 : -1;
        ctx.lineTo(midX - size * direction, y1);
        ctx.bezierCurveTo(
            midX - size * direction, y1 - size * type,
            midX + size * direction, y1 - size * type,
            midX + size * direction, y1
        );
        ctx.lineTo(x2, y2);
    } else {
        const direction = (y2 > y1) ? 1 : -1;
        ctx.lineTo(x1, midY - size * direction);
        ctx.bezierCurveTo(
            x1 + size * type, midY - size * direction,
            x1 + size * type, midY + size * direction,
            x1, midY + size * direction
        );
        ctx.lineTo(x2, y2);
    }
}

function melangerPieces(puzzleWidth, puzzleHeight) {
    const margin = 50;
    piecesPuzzle.forEach(piece => {
        const x = Math.random() * (window.innerWidth - piece.element.offsetWidth);
        const y = Math.random() * (window.innerHeight - piece.element.offsetHeight);

        piece.currentX = x;
        piece.currentY = y;
        piece.element.style.transform = `translate(${x}px, ${y}px)`;
        piece.element.style.zIndex = Math.floor(Math.random() * 100) + 10;
    });
}

function demarrerDrag(e) {
    if (!peutJouerPuzzle) return;
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;

    const piece = piecesPuzzle.find(p => p.element === e.target);
    if (!piece || piece.isLocked) return;

    pieceSelectionnee = piece;
    pieceSelectionnee.element.style.zIndex = 1000;

    const rect = pieceSelectionnee.element.getBoundingClientRect();
    decalageX = touch.clientX - rect.left;
    decalageY = touch.clientY - rect.top;

    window.addEventListener('mousemove', glisserPiece);
    window.addEventListener('touchmove', glisserPiece, { passive: false });
    window.addEventListener('mouseup', lacherPiece);
    window.addEventListener('touchend', lacherPiece);
}

function glisserPiece(e) {
    if (!pieceSelectionnee) return;
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;

    const x = touch.clientX - decalageX;
    const y = touch.clientY - decalageY;

    pieceSelectionnee.currentX = x;
    pieceSelectionnee.currentY = y;
    pieceSelectionnee.element.style.transform = `translate(${x}px, ${y}px)`;
}

function lacherPiece() {
    if (!pieceSelectionnee) return;

    const piece = pieceSelectionnee;
    pieceSelectionnee = null;

    window.removeEventListener('mousemove', glisserPiece);
    window.removeEventListener('touchmove', glisserPiece);
    window.removeEventListener('mouseup', lacherPiece);
    window.removeEventListener('touchend', lacherPiece);

    // Vérifier si la pièce est proche de sa position cible
    const plateauRect = document.getElementById('zonePlateau').getBoundingClientRect();
    const targetXGlobal = plateauRect.left + piece.targetX - piece.tabSize;
    const targetYGlobal = plateauRect.top + piece.targetY - piece.tabSize;

    const distance = Math.sqrt(Math.pow(piece.currentX - targetXGlobal, 2) + Math.pow(piece.currentY - targetYGlobal, 2));

    if (distance < 30) {
        piece.isLocked = true;
        piece.currentX = targetXGlobal;
        piece.currentY = targetYGlobal;
        piece.element.style.transform = `translate(${targetXGlobal}px, ${targetYGlobal}px)`;
        piece.element.style.zIndex = 5;
        piece.element.classList.add('locked');

        // Petite explosion d'étoiles
        for (let i = 0; i < 5; i++) {
            const p = new Particule(targetXGlobal + piece.element.offsetWidth/2, targetYGlobal + piece.element.offsetHeight/2);
            p.couleur = "#ffd700";
            particules.push(p);
        }

        verifierVictoirePuzzle();
    }
}

function verifierVictoirePuzzle() {
    if (piecesPuzzle.every(p => p.isLocked)) {
        celebrerVictoirePuzzle();
    }
}

function celebrerVictoirePuzzle() {
    peutJouerPuzzle = false;
    // Grande explosion d'étoiles
    for (let i = 0; i < 100; i++) {
        const p = new Particule(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
        p.couleur = `hsl(${Math.random() * 360}, 100%, 50%)`;
        particules.push(p);
    }

    setTimeout(() => {
        peutJouerPuzzle = true;
        initialiserModulePuzzle();
    }, 4000);
}
