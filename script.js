// ==========================================================================
// 1. CONFIGURATION DE LA VOIX ET DES ÉTOILES
// ==========================================================================
function parler(message) {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(message);
    msg.lang = 'fr-CA'; // Force l'accent québécois
    msg.pitch = 1.2;    // Voix de fée un peu plus haute
    window.speechSynthesis.speak(msg);
}

const canvas = document.getElementById('canvasParticules');
const ctx = canvas.getContext('2d');
let particules = [];

function redimensionner() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', redimensionner);
redimensionner();

class Particule {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.taille = Math.random() * 5 + 2;
        this.vitesseX = Math.random() * 3 - 1.5;
        this.vitesseY = Math.random() * 3 - 1.5;
        this.couleur = `hsl(${Math.random() * 60 + 280}, 100%, 70%)`; 
        this.vie = 1; 
    }
    update() {
        this.x += this.vitesseX;
        this.y += this.vitesseY;
        this.vie -= 0.02; 
    }
    dessiner() {
        ctx.fillStyle = this.couleur;
        ctx.globalAlpha = this.vie;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.taille, 0, Math.PI * 2);
        ctx.fill();
    }
}

function gererParticules() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particules.length; i++) {
        particules[i].update();
        particules[i].dessiner();
        if (particules[i].vie <= 0) {
            particules.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(gererParticules);
}
gererParticules();

function creerTrainee(e) {
    let x = e.touches ? e.touches[0].clientX : e.clientX;
    let y = e.touches ? e.touches[0].clientY : e.clientY;
    for (let i = 0; i < 3; i++) {
        let p = new Particule(x, y);
        const moduleDessin = document.getElementById('moduleDessin');
        if (moduleDessin && moduleDessin.style.display === 'block') {
            p.couleur = couleurActuelle; 
        }
        particules.push(p);
    }
}
window.addEventListener('mousemove', creerTrainee);
window.addEventListener('touchmove', creerTrainee);

// ==========================================================================
// 2. NAVIGATION ET PLEIN ÉCRAN
// ==========================================================================
function basculerPleinEcran() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
        document.exitFullscreen();
    }
}

function ouvrirModule(type) {
    // On cache le menu et on montre le bouton retour
    document.getElementById('menuPrincipal').style.display = 'none';
    document.getElementById('btnRetourGlobal').style.display = 'flex';

    // On cache tous les modules
    const modules = ['moduleChiffres', 'moduleAlphabet', 'moduleFormes', 'moduleDessin'];
    modules.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.style.display = 'none';
    });

    // Logique spécifique par module
    if(type === 'chiffres') {
        document.getElementById('moduleChiffres').style.display = 'block';
        parler("Trouve les fées cachées et compte avec moi !");
        initialiserJeuFées();
    } else if(type === 'alphabet') {
        document.getElementById('moduleAlphabet').style.display = 'block';
        genererAlphabet();
        parler("L'alphabet des fées !");
    } else if(type === 'formes') {
        document.getElementById('moduleFormes').style.display = 'block';
        parler("Le jardin des formes !");
        ouvrirModuleFormes(); // <--- LA LIGNE MANQUANTE EST ICI !
 } else if(type === 'dessin') {
        // ON CHANGE 'block' par 'flex' ici :
        document.getElementById('moduleDessin').style.display = 'flex';
        
        document.getElementById('btnRetourGlobal').style.display = 'none';
        
        // On s'assure que le canvas prend la bonne taille tout de suite
        initialiserDessin();
        
        // Si tu as ajouté la fonction pour les lettres/chiffres :
        if (typeof masquerTracer === "function") {
            masquerTracer(); // On commence en mode dessin libre
        }

        parler("Dessine avec tes doigts magiques !");
    }
}
function retourMenu() {
    document.getElementById('btnRetourGlobal').style.display = 'none';
    const modules = ['moduleChiffres', 'moduleAlphabet', 'moduleFormes', 'moduleDessin'];
    modules.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.style.display = 'none';
    });
    document.getElementById('menuPrincipal').style.display = 'flex';
}

// ==========================================================================
// 3. JEU DES FÉES (CHIFFRES)
// ==========================================================================
let scoreFées = 0;
function initialiserJeuFées() {
    scoreFées = 0;
    mettreAJourCompteur();
    const arene = document.getElementById('areneFées');
    if(arene) {
        arene.innerHTML = "";
        setTimeout(apparaitreFee, 1000);
    }
}

function apparaitreFee() {
    const arene = document.getElementById('areneFées');
    if(!arene || document.getElementById('moduleChiffres').style.display === 'none') return;

    const fee = document.createElement('div');
    fee.className = 'fee-cliquable';
    fee.innerHTML = "🧚‍♀️";

    const margeH = window.innerWidth * 0.20;
    const margeV = window.innerHeight * 0.20;
    const x = margeH + Math.random() * (window.innerWidth - (margeH * 2) - 100);
    const y = margeV + Math.random() * (window.innerHeight - (margeV * 2) - 100);
    
    fee.style.left = `${x}px`;
    fee.style.top = `${y}px`;

    fee.onclick = function(e) {
        e.stopPropagation();
        scoreFées++;
        parler(scoreFées.toString()); 
        for (let i = 0; i < 20; i++) {
            const p = new Particule(x + 75, y + 75);
            p.couleur = "#ffd700"; 
            particules.push(p);
        }
        fee.remove();
        mettreAJourCompteur();
        setTimeout(apparaitreFee, 800);
    };
    arene.appendChild(fee);
}

function mettreAJourCompteur() {
    const texte = document.getElementById('compteurFées');
    if(texte) texte.innerText = `Fées trouvées : ${scoreFées}`;
}

// ==========================================================================
// 4. ALPHABET SÉQUENTIEL MAGIQUE
// ==========================================================================
const motsMagiques = {
    'A': 'Arc-en-ciel', 'B': 'Baguette', 'C': 'Château', 'D': 'Dragon',
    'E': 'Étoile', 'F': 'Fée', 'G': 'Gâteau', 'H': 'Hibou',
    'I': 'Île', 'J': 'Jardin', 'K': 'Koala', 'L': 'Lune',
    'M': 'Magie', 'N': 'Nuage', 'O': 'Oiseau', 'P': 'Papillon',
    'Q': 'Quiche', 'R': 'Reine', 'S': 'Soleil', 'T': 'Trésor',
    'U': 'Unique', 'V': 'Vaguette', 'W': 'Wagon', 'X': 'Xylophone',
    'Y': 'Yack', 'Z': 'Zèbre'
};

let indexLettreActuelle = 0;

/**
 * Prépare le module quand on l'ouvre depuis le menu
 */
function genererAlphabet() {
    const ecranDepart = document.getElementById('ecranDepartAlphabet');
    const zoneJeu = document.getElementById('zoneLettreMagique');
    
    if(ecranDepart && zoneJeu) {
        ecranDepart.style.display = 'block';
        zoneJeu.style.display = 'none';
    }
    indexLettreActuelle = 0;
}

/**
 * Lancé par le gros bouton "JOUER"
 */
function demarrerAlphabet() {
    console.log("Tentative de démarrage de l'alphabet..."); // Pour déboguer
    const ecran = document.getElementById('ecranDepartAlphabet');
    const zone = document.getElementById('zoneLettreMagique');
    
    if (ecran && zone) {
        ecran.style.setProperty('display', 'none', 'important');
        zone.style.setProperty('display', 'flex', 'important');
        indexLettreActuelle = 0; // On s'assure de repartir à A
        afficherLettre();
    } else {
        console.error("Erreur : Les IDs ecranDepartAlphabet ou zoneLettreMagique sont introuvables !");
    }
}

/**
 * Gère l'affichage et la voix pour la lettre en cours
 */
function afficherLettre() {
    const alphabet = Object.keys(motsMagiques);
    const lettre = alphabet[indexLettreActuelle];
    const mot = motsMagiques[lettre];
    
    const bouton = document.getElementById('grandeLettre');
    const texteMot = document.getElementById('motExemple');
    
    if (bouton && texteMot) {
        bouton.innerText = lettre;
        texteMot.innerText = mot;
        
        // Couleur dynamique (arc-en-ciel au fil de l'alphabet)
        const teinte = (indexLettreActuelle * (360 / 26));
        bouton.style.background = `linear-gradient(135deg, hsl(${teinte}, 70%, 60%), hsl(${teinte}, 80%, 40%))`;
        
        // La fée parle
        parler(`La lettre ${lettre.toLowerCase()}... comme ${mot} !`);
        
        // Explosion d'étoiles au centre
        for (let i = 0; i < 20; i++) {
            const p = new Particule(window.innerWidth / 2, window.innerHeight / 2);
            p.couleur = `hsl(${teinte}, 100%, 70%)`;
            particules.push(p);
        }
    }
}

function lettreSuivante() {
    const alphabet = Object.keys(motsMagiques);
    indexLettreActuelle++;
    
    if (indexLettreActuelle >= alphabet.length) {
        indexLettreActuelle = 0;
        parler("Bravo championne ! On recommence au début !");
    }
    afficherLettre();
}

function lettrePrecedente() {
    const alphabet = Object.keys(motsMagiques);
    indexLettreActuelle--;
    
    if (indexLettreActuelle < 0) {
        indexLettreActuelle = alphabet.length - 1;
    }
    afficherLettre();
}

// ==========================================================================
// 5. LOGIQUE DES FORMES
// ==========================================================================

// --- LOGIQUE CHERCHE ET TROUVE (FORMES) ---
const listeFormes = [
    { nom: 'Carré', symbole: '■', couleur: '#FF5722', genre: 'le' },
    { nom: 'Cercle', symbole: '●', couleur: '#2196F3', genre: 'le' },
    { nom: 'Triangle', symbole: '▲', couleur: '#4CAF50', genre: 'le' },
    { nom: 'Étoile', symbole: '★', couleur: '#FFEB3B', genre: "l'" },
    { nom: 'Cœur', symbole: '❤', couleur: '#E91E63', genre: 'le' },
    { nom: 'Losange', symbole: '◆', couleur: '#9C27B0', genre: 'le' },
    { nom: 'Rectangle', symbole: '▮', couleur: '#795548', genre: 'le' },
    { nom: 'Hexagone', symbole: '⬢', couleur: '#00BCD4', genre: "l'" },
    { nom: 'Nuage', symbole: '☁', couleur: '#B0BEC5', genre: 'le' },
    // --- NOUVEAUX AJOUTS ---
    { nom: 'Lune', symbole: '🌙', couleur: '#FFD700', genre: 'la' },
    { nom: 'Soleil', symbole: '☀️', couleur: '#FFA500', genre: 'le' },
    { nom: 'Goutte', symbole: '💧', couleur: '#00FFFF', genre: 'la' },
    { nom: 'Éclair', symbole: '⚡', couleur: '#FFFF00', genre: "l'" },
    { nom: 'Trèfle', symbole: '☘️', couleur: '#2E7D32', genre: 'le' },
    { nom: 'Diamant', symbole: '💎', couleur: '#81D4FA', genre: 'le' }
];

let formeCible = null;

// Cette fonction fait le pont entre le menu et le jeu
function ouvrirModuleFormes() {
    console.log("Démarrage du jeu des formes...");
    // On s'assure que la zone est vide avant de commencer
    const zone = document.getElementById('zoneOptionsFormes');
    if (zone) {
        zone.innerHTML = '';
        nouveauDefiForme(); // On lance le tout premier défi
    }
}
function nouveauDefiForme() {
    // 1. Choisir la forme à trouver
    formeCible = listeFormes[Math.floor(Math.random() * listeFormes.length)];
    
    // LOGIQUE DE GRAMMAIRE CORRIGÉE
    const article = formeCible.genre;
    const espace = article.endsWith("'") ? "" : " ";
    const phraseMagique = `Peux-tu trouver ${article}${espace}${formeCible.nom.toLowerCase()} ?`;

    document.getElementById('consigneForme').innerText = phraseMagique;
    parler(phraseMagique);

    // 2. Mélanger les options - On en garde 3 pour que ça respire sur la tablette
    let options = [...listeFormes].sort(() => 0.5 - Math.random()).slice(0, 3);
    
    // Si la cible n'est pas dans les 3, on remplace la première par la cible
    if (!options.find(o => o.nom === formeCible.nom)) {
        options[0] = formeCible;
    }
    // On remélange pour que la cible ne soit pas toujours à gauche
    options.sort(() => 0.5 - Math.random()); 

    // 3. Afficher les boutons
    const zone = document.getElementById('zoneOptionsFormes');
    zone.innerHTML = ''; 
    
    options.forEach(forme => {
        const btn = document.createElement('button');
        btn.className = 'forme-option';
        
        // C'est ici que la magie opère pour le CSS (data-forme="Lune")
        btn.setAttribute('data-forme', forme.nom);
        
        // On utilise un span pour appliquer les effets de texte du CSS
        btn.innerHTML = `<span>${forme.symbole}</span>`;
        btn.style.color = forme.couleur;
        
        btn.onclick = () => verifierForme(forme.nom);
        zone.appendChild(btn);
    });
}

let victoiresFormes = 0; // On commence à zéro

function verifierForme(nomClique) {
    const article = formeCible.genre;
    const espace = article.includes("'") ? "" : " ";
    const nomComplet = `${article}${espace}${formeCible.nom.toLowerCase()}`;

    if (nomClique === formeCible.nom) {
        victoiresFormes++; // +1 point !
        
        parler(`Bravo ! C'est bien ${nomComplet} !`);
        
        // Explosion d'étoiles
        for (let i = 0; i < 40; i++) {
            const p = new Particule(window.innerWidth / 2, window.innerHeight / 2);
            p.couleur = formeCible.couleur;
            particules.push(p);
        }

        // --- SYSTÈME DE RÉCOMPENSE ---
        if (victoiresFormes >= 5) {
            victoiresFormes = 0; // On remet à zéro pour la prochaine fois
            setTimeout(apparaitreFeeGeante, 1500); 
        } else {
            setTimeout(nouveauDefiForme, 4000);
        }

    } else {
        parler(`Oups ! Cherche encore ${nomComplet} !`);
    }
}

function apparaitreFeeGeante() {
    parler("Félicitations ! Tu es une championne des formes !");
    
    // On crée une fée géante qui vole au milieu
    const fee = document.createElement('div');
    fee.innerHTML = "🧚‍♀️";
    fee.style.position = 'fixed';
    fee.style.left = '50%';
    fee.style.top = '50%';
    fee.style.transform = 'translate(-50%, -50%) scale(0)';
    fee.style.fontSize = '250px';
    fee.style.zIndex = '10000';
    fee.style.transition = 'transform 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    fee.style.pointerEvents = 'none';
    
    document.body.appendChild(fee);

    // Animation d'apparition (Pop!)
    setTimeout(() => {
        fee.style.transform = 'translate(-50%, -50%) scale(1.5)';
    }, 100);

    // Elle s'en va après 3 secondes et relance le jeu
    setTimeout(() => {
        fee.style.transform = 'translate(-50%, -50%) scale(0)';
        setTimeout(() => {
            fee.remove();
            nouveauDefiForme();
        }, 1000);
    }, 3500);
}

// ==========================================================================
// 6. LOGIQUE DU DESSIN
// ==========================================================================
const canvasDessin = document.getElementById('canvasDessin');
const ctxDessin = canvasDessin.getContext('2d', { willReadFrequently: true }); // Optimisé pour verifierTracerFini
const canvasFantome = document.getElementById('canvasFantome');
const ctxFantome = canvasFantome.getContext('2d', { willReadFrequently: true });
let enTrainDeDessiner = false;
let couleurActuelle = 'yellow';
let estEnTrainDeCelebrer = false; 
let pixelsAttendus = 0;

const modelesLettres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const modelesChiffres = "0123456789".split("");
let indexModeleActuel = 0; 
let typeActuel = 'libre';

function initialiserDessin() {
    const conteneur = document.getElementById('conteneurCanevas');
    canvasDessin.width = conteneur.clientWidth;
    canvasDessin.height = conteneur.clientHeight;
    canvasFantome.width = conteneur.clientWidth;
    canvasFantome.height = conteneur.clientHeight;
    
    ctxDessin.lineJoin = 'round';
    ctxDessin.lineCap = 'round';
    ctxDessin.lineWidth = 15; // Un peu plus épais pour faciliter la détection
    
    document.getElementById('moduleDessin').style.zIndex = "500";
}

function changerCouleur(c) { 
    couleurActuelle = c; 
    const noms = {
        '#ff0000': "Rouge comme une pomme !", '#00ff00': "Vert comme l'herbe !",
        '#0000ff': "Bleu comme le ciel !", '#ffff00': "Jaune comme le soleil !",
        '#ff00ff': "Mauve comme une fleur !", '#ff9800': "Orange comme une citrouille !",
        '#ffffff': "Blanc comme la neige !"
    };
    parler(noms[c] || "Couleur magique !");
}

// VERSION UNIQUE ET CORRIGÉE
function effacerDessin(changerDeLettre = true) { 
    ctxDessin.clearRect(0, 0, canvasDessin.width, canvasDessin.height); 
    
    if (typeActuel !== 'libre' && changerDeLettre) {
        if (typeActuel === 'lettre') {
            indexModeleActuel = (indexModeleActuel + 1) % modelesLettres.length;
        } else {
            indexModeleActuel = (indexModeleActuel + 1) % modelesChiffres.length;
        }
        afficherNouveauModele();
    }
}

function preparerTracer(type) {
    typeActuel = type;
    indexModeleActuel = 0; // On commence bien au début (A ou 0)
    effacerDessin(false);  // On efface SANS changer la lettre pour rester sur le A
    afficherNouveauModele();
}

function masquerTracer() {
    typeActuel = 'libre';
    ctxFantome.clearRect(0, 0, canvasFantome.width, canvasFantome.height);
    pixelsAttendus = 0;
    parler("Dessin libre ! Amuse-toi !");
}

function afficherNouveauModele() {
    ctxFantome.clearRect(0, 0, canvasFantome.width, canvasFantome.height);

    if (typeActuel === 'libre') return;

    let caractere = (typeActuel === 'lettre') ? modelesLettres[indexModeleActuel] : modelesChiffres[indexModeleActuel];

    // Dessiner le modèle sur le canvas fantôme
    ctxFantome.font = "350px 'Arial', sans-serif";
    ctxFantome.textAlign = "center";
    ctxFantome.textBaseline = "middle";

    // Couleur transparente/grise pour ressembler à un tracé à suivre sur tableau noir
    ctxFantome.fillStyle = "rgba(255, 255, 255, 0.2)";
    // Optionnel: ajouter un contour
    ctxFantome.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctxFantome.lineWidth = 5;

    const centerX = canvasFantome.width / 2;
    const centerY = canvasFantome.height / 2;

    ctxFantome.fillText(caractere, centerX, centerY);
    ctxFantome.strokeText(caractere, centerX, centerY);

    // Calculer le nombre de pixels attendus
    const imageData = ctxFantome.getImageData(0, 0, canvasFantome.width, canvasFantome.height);
    const data = imageData.data;
    pixelsAttendus = 0;

    for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 10) { // Si le pixel n'est pas complètement transparent
            pixelsAttendus++;
        }
    }

    // On force une petite pause avec une virgule pour que la tablette
    // ne fasse pas de liaison bizarre et respecte "la lettre"
    if (typeActuel === 'lettre') {
        // En mettant le caractère en minuscule, certaines voix 
        // sont moins "robotiques"
        parler("Essaie de tracer la lettre, " + caractere.toLowerCase());
    } else {
        parler("Essaie de tracer le chiffre, " + caractere);
    }
}

// GESTION DU TRACÉ
function demarrerDessin(e) {
    if (estEnTrainDeCelebrer) return;
    enTrainDeDessiner = true;
    dessiner(e);
}

function arreterDessin() {
    if (enTrainDeDessiner && typeActuel !== 'libre') {
        verifierTracerFini();
    }
    enTrainDeDessiner = false;
    ctxDessin.beginPath();
}

function dessiner(e) {
    if (!enTrainDeDessiner) return;
    const rect = canvasDessin.getBoundingClientRect();
    let x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    let y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    ctxDessin.strokeStyle = couleurActuelle;
    ctxDessin.shadowBlur = 5;
    ctxDessin.shadowColor = couleurActuelle;

    ctxDessin.lineTo(x, y);
    ctxDessin.stroke();
    ctxDessin.beginPath();
    ctxDessin.moveTo(x, y);
    
    for(let i = 0; i < 2; i++) {
        let p = new Particule(x + rect.left, y + rect.top);
        p.couleur = couleurActuelle;
        particules.push(p);
    }
}

// On ajoute un petit délai pour ne pas couper son élan
let timerVerification;

function arreterDessin() {
    if (enTrainDeDessiner && typeActuel !== 'libre') {
        // On attend 1.5 seconde d'inactivité avant de vérifier si c'est fini
        // Ça lui permet de lever le doigt et de le remettre pour finir sa lettre
        clearTimeout(timerVerification);
        timerVerification = setTimeout(verifierTracerFini, 1500); 
    }
    enTrainDeDessiner = false;
    ctxDessin.beginPath();
}

function verifierTracerFini() {
    if (estEnTrainDeCelebrer || typeActuel === 'libre' || pixelsAttendus === 0) return;

    const imgDataDessin = ctxDessin.getImageData(0, 0, canvasDessin.width, canvasDessin.height);
    const imgDataFantome = ctxFantome.getImageData(0, 0, canvasFantome.width, canvasFantome.height);
    
    const dataDessin = imgDataDessin.data;
    const dataFantome = imgDataFantome.data;
    
    let pixelsCouverts = 0;

    // Parcourir tous les pixels (on regarde l'alpha, index + 3)
    // On peut faire des sauts (par exemple += 16 pour tester 1 pixel sur 4) pour optimiser,
    // mais puisque pixelsAttendus est calculé en parcourant tout, on parcourt tout pour que le ratio soit juste.
    for (let i = 3; i < dataDessin.length; i += 4) {
        // Si l'enfant a dessiné ici ET que ça fait partie du modèle
        if (dataDessin[i] > 50 && dataFantome[i] > 10) {
            pixelsCouverts++;
        }
    }

    // Calcul du pourcentage de couverture
    let pourcentageCouverture = pixelsCouverts / pixelsAttendus;

    // Si l'enfant a recouvert au moins 60% du modèle (on peut ajuster)
    if (pourcentageCouverture > 0.6) {
        celebrerFinTracer();
    }
}

function celebrerFinTracer() {
    if (estEnTrainDeCelebrer) return;
    estEnTrainDeCelebrer = true;
    
    // Message plus générique mais correct grammaticalement
    let messageBravo = (typeActuel === 'lettre') ? 
        "C'est magnifique ! Tu as très bien tracé la lettre !" : 
        "C'est magnifique ! Tu as très bien tracé le chiffre !";
    
    parler(messageBravo);

    // Confettis
    for (let i = 0; i < 100; i++) {
        const p = new Particule(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
        p.couleur = `hsl(${Math.random() * 360}, 100%, 50%)`;
        particules.push(p);
    }

    // On attend 6 secondes (plus long) avant de changer pour qu'elle admire son travail
    setTimeout(() => {
        effacerDessin(true); 
        estEnTrainDeCelebrer = false;
    }, 6000); 
}

// ÉCOUTEURS D'ÉVÉNEMENTS
canvasDessin.addEventListener('mousedown', demarrerDessin);
canvasDessin.addEventListener('mousemove', dessiner);
window.addEventListener('mouseup', arreterDessin);
canvasDessin.addEventListener('touchstart', (e) => { e.preventDefault(); demarrerDessin(e); }, {passive: false});
canvasDessin.addEventListener('touchmove', (e) => { e.preventDefault(); dessiner(e); }, {passive: false});
window.addEventListener('touchend', arreterDessin);