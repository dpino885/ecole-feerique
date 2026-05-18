// 6. LOGIQUE DU DESSIN (AVEC POINTS DE PASSAGE ET TRAJECTOIRES)
const SURFACE_LIBRE = {
    moduleId: 'moduleDessin',
    canvasId: 'canvasDessin',
    conteneurId: 'conteneurCanevas'
};
const SURFACE_LETTRES = {
    moduleId: 'moduleTracerLettres',
    canvasId: 'canvasTracerLettres',
    canvasGuideId: 'canvasTracerLettresGuide',
    conteneurId: 'conteneurTracerLettres'
};
const SURFACE_CHIFFRES = {
    moduleId: 'moduleTracerChiffres',
    canvasId: 'canvasTracerChiffres',
    canvasGuideId: 'canvasTracerChiffresGuide',
    conteneurId: 'conteneurTracerChiffres'
};

const configDessin = {
    moduleEl: null,
    canvas: null,
    ctx: null,
    canvasGuide: null,
    ctxGuide: null,
    conteneur: null
};

// État du tracé guidé
let traitEnCours = 0;
let pointEnCours = 0;
let estEnTrainDeSuivre = false;
let caractereActuel = '';

const DISTANCE_ACTIVATION = 60;
const DISTANCE_SUIVI = 80;

function bindDessinSurface(spec) {
    configDessin.moduleEl = document.getElementById(spec.moduleId);
    configDessin.canvas = document.getElementById(spec.canvasId);
    configDessin.ctx = configDessin.canvas
        ? configDessin.canvas.getContext('2d', { willReadFrequently: true })
        : null;
    configDessin.canvasGuide = spec.canvasGuideId ? document.getElementById(spec.canvasGuideId) : null;
    configDessin.ctxGuide = configDessin.canvasGuide ? configDessin.canvasGuide.getContext('2d') : null;
    configDessin.conteneur = document.getElementById(spec.conteneurId);
}

let dernierCanvasDessin = null;

function syncSurfaceDepuisCanvas(canvas) {
    if (!canvas || !canvas.id) return;
    const map = {
        canvasDessin: SURFACE_LIBRE,
        canvasTracerLettres: SURFACE_LETTRES,
        canvasTracerChiffres: SURFACE_CHIFFRES
    };
    const spec = map[canvas.id];
    if (spec) bindDessinSurface(spec);
}

bindDessinSurface(SURFACE_LIBRE);

let enTrainDeDessiner = false;
let estEnTrainDeCelebrer = false;

function initialiserDessin() {
    const { canvas, ctx, canvasGuide, conteneur, moduleEl } = configDessin;
    if (!canvas || !ctx || !conteneur) return;
    canvas.width = conteneur.clientWidth;
    canvas.height = conteneur.clientHeight;

    if (canvasGuide) {
        canvasGuide.width = canvas.width;
        canvasGuide.height = canvas.height;
    }

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 25;

    if (moduleEl) moduleEl.style.zIndex = '500';

    if (typeActuel !== 'libre') {
        dessinerFantome();
        rafraichirGuide();
    }
}

function changerCouleur(c) {
    couleurActuelle = c;
    parler("Couleur magique !");
}

function initialiserDessin() {
    const { canvas, ctx, conteneur, moduleEl } = configDessin;
    if (!canvas || !ctx || !conteneur) return;

    // Ajuster à la taille réelle du conteneur parent
    canvas.width = conteneur.offsetWidth;
    canvas.height = conteneur.offsetHeight;

    canvasMasque.width = canvas.width;
    canvasMasque.height = canvas.height;

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 25;

    if (moduleEl) moduleEl.style.zIndex = '500';

    if (typeActuel !== 'libre') {
        dessinerFantome();
    }
}

function effacerDessin(changerDeLettre = true) {
    const { canvas, ctx, ctxGuide, canvasGuide } = configDessin;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (ctxGuide && canvasGuide) ctxGuide.clearRect(0, 0, canvasGuide.width, canvasGuide.height);

    traitEnCours = 0;
    pointEnCours = 0;
    estEnTrainDeSuivre = false;

    if (typeActuel !== 'libre' && changerDeLettre) {
        if (typeActuel === 'lettre') {
            indexModeleActuel = (indexModeleActuel + 1) % modelesLettres.length;
        } else {
            indexModeleActuel = (indexModeleActuel + 1) % modelesChiffres.length;
        }
        afficherNouveauModele();
    } else if (typeActuel !== 'libre') {
        dessinerFantome();
        rafraichirGuide();
    }
}

function afficherNouveauModele() {
    traitEnCours = 0;
    pointEnCours = 0;
    estEnTrainDeSuivre = false;

    let caractere =
        typeActuel === 'lettre'
            ? modelesLettres[indexModeleActuel]
            : modelesChiffres[indexModeleActuel];

    caractereActuel = caractere;

    dessinerFantome();
    rafraichirGuide();

    let texte =
        typeActuel === 'lettre'
            ? 'la lettre ' + caractere.toLowerCase()
            : 'le chiffre ' + caractere;
    parler('Essaie de tracer ' + texte);
}

function dessinerFantome() {
    const { canvas, ctx } = configDessin;
    if (!canvas || !ctx || typeActuel === 'libre') return;

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "500px 'Arial Black', sans-serif";

    const xMid = canvas.width / 2;
    const yMid = canvas.height / 2;

    ctx.fillText(caractereActuel, xMid, yMid);
    ctx.restore();
}

function getCoordsAbsolues(pt) {
    const { canvas } = configDessin;
    if (!canvas) return {x:0, y:0};
    return {
        x: (canvas.width / 2) + pt.x,
        y: (canvas.height / 2) + pt.y
    };
}

function rafraichirGuide() {
    if (typeActuel === 'libre' || estEnTrainDeCelebrer) return;
    const { ctxGuide, canvasGuide, moduleEl } = configDessin;
    if (!ctxGuide || !canvasGuide || !moduleEl || moduleEl.style.display === 'none') return;

    ctxGuide.clearRect(0, 0, canvasGuide.width, canvasGuide.height);

    const trajectoire = TRAJECTOIRES[caractereActuel];
    if (!trajectoire || !trajectoire[traitEnCours]) return;

    const ptCible = getCoordsAbsolues(trajectoire[traitEnCours][pointEnCours]);

    // Dessiner le point cible (une étoile scintillante)
    ctxGuide.save();
    const temps = Date.now() / 200;
    const scale = 1 + Math.sin(temps) * 0.2;

    ctxGuide.translate(ptCible.x, ptCible.y);
    ctxGuide.scale(scale, scale);

    ctxGuide.beginPath();
    ctxGuide.arc(0, 0, 15, 0, Math.PI * 2);
    ctxGuide.fillStyle = "white";
    ctxGuide.shadowBlur = 20;
    ctxGuide.shadowColor = "yellow";
    ctxGuide.fill();

    // Petite étoile
    ctxGuide.fillStyle = "yellow";
    ctxGuide.beginPath();
    for (let i = 0; i < 5; i++) {
        ctxGuide.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * 25,
                        Math.sin((18 + i * 72) * Math.PI / 180) * 25);
        ctxGuide.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * 10,
                        Math.sin((54 + i * 72) * Math.PI / 180) * 10);
    }
    ctxGuide.closePath();
    ctxGuide.fill();

    ctxGuide.restore();
}

function distance(p1, p2) {
    return Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
}

function distancePointSegment(p, a, b) {
    const l2 = (a.x - b.x)**2 + (a.y - b.y)**2;
    if (l2 === 0) return distance(p, a);
    let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return distance(p, {
        x: a.x + t * (b.x - a.x),
        y: a.y + t * (b.y - a.y)
    });
}

function demarrerDessin(e) {
    if (estEnTrainDeCelebrer) return;
    syncSurfaceDepuisCanvas(e.currentTarget);
    dernierCanvasDessin = e.currentTarget;
    const { canvas, ctx } = configDessin;
    if (!canvas || !ctx) return;
    enTrainDeDessiner = true;

    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    if (typeActuel !== 'libre') {
        const trajectoire = TRAJECTOIRES[caractereActuel];
        if (trajectoire && trajectoire[traitEnCours]) {
            const trait = trajectoire[traitEnCours];
            const ptSuivant = getCoordsAbsolues(trait[pointEnCours]);

            if (pointEnCours === 0) {
                if (distance({x, y}, ptSuivant) < DISTANCE_ACTIVATION) {
                    estEnTrainDeSuivre = true;
                    pointEnCours = 1;
                    ctx.beginPath();
                    ctx.moveTo(ptSuivant.x, ptSuivant.y);
                }
            } else {
                const ptPrecedent = getCoordsAbsolues(trait[pointEnCours - 1]);
                if (distance({x, y}, ptPrecedent) < DISTANCE_ACTIVATION || distance({x, y}, ptSuivant) < DISTANCE_ACTIVATION) {
                    estEnTrainDeSuivre = true;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                }
            }
        }
    } else {
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    dessiner(e);
}

function dessiner(e) {
    if (!enTrainDeDessiner) return;
    const { canvas, ctx } = configDessin;
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    if (typeActuel !== 'libre') {
        if (!estEnTrainDeSuivre) return;

        const trajectoire = TRAJECTOIRES[caractereActuel];
        const trait = trajectoire[traitEnCours];
        const pPrev = getCoordsAbsolues(trait[pointEnCours - 1]);
        const pNext = getCoordsAbsolues(trait[pointEnCours]);

        const distChemin = distancePointSegment({x, y}, pPrev, pNext);

        if (distChemin < DISTANCE_SUIVI) {
            ctx.strokeStyle = couleurActuelle;
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);

            if (distance({x, y}, pNext) < DISTANCE_ACTIVATION) {
                pointEnCours++;
                if (pointEnCours >= trait.length) {
                    // Trait fini !
                    pointEnCours = 0;
                    traitEnCours++;
                    estEnTrainDeSuivre = false;

                    if (traitEnCours >= trajectoire.length) {
                        celebrerFinTracer();
                    } else {
                        parler("Super !");
                    }
                }
            }
        } else {
            // Trop loin, on arrête le trait en cours
            estEnTrainDeSuivre = false;
        }
    } else {
        ctx.strokeStyle = couleurActuelle;
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    for (let i = 0; i < 2; i++) {
        let p = new Particule(x + rect.left, y + rect.top);
        p.couleur = couleurActuelle;
        particules.push(p);
    }
}

function arreterDessin() {
    if (dernierCanvasDessin) syncSurfaceDepuisCanvas(dernierCanvasDessin);
    const { ctx } = configDessin;
    if (!ctx) return;
    enTrainDeDessiner = false;
    estEnTrainDeSuivre = false;
    ctx.beginPath();
}

function celebrerFinTracer() {
    if (estEnTrainDeCelebrer) return;
    const { canvas, ctx, ctxGuide, canvasGuide } = configDessin;
    if (!canvas || !ctx) return;
    estEnTrainDeCelebrer = true;
    if (ctxGuide && canvasGuide) ctxGuide.clearRect(0, 0, canvasGuide.width, canvasGuide.height);

    parler("C'est magnifique ! Bravo !");

    // Explosion de confettis
    for (let i = 0; i < 100; i++) {
        const p = new Particule(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
        p.couleur = `hsl(${Math.random() * 360}, 100%, 50%)`;
        particules.push(p);
    }

    setTimeout(() => {
        effacerDessin(true);
        estEnTrainDeCelebrer = false;
    }, 5000);
}

// Global loop to redraw the guide point
function boucleGuide() {
    if (typeActuel !== 'libre' && !estEnTrainDeCelebrer) {
        rafraichirGuide();
    }
    requestAnimationFrame(boucleGuide);
}
boucleGuide();

window.addEventListener('mouseup', arreterDessin);
window.addEventListener('touchend', arreterDessin);

// Export for main.js or other modules
window.initialiserDessin = initialiserDessin;
window.effacerDessin = effacerDessin;
window.afficherNouveauModele = afficherNouveauModele;
window.changerCouleur = changerCouleur;
window.demarrerDessin = demarrerDessin;
window.dessiner = dessiner;
window.arreterDessin = arreterDessin;
window.bindDessinSurface = bindDessinSurface;
window.SURFACE_LIBRE = SURFACE_LIBRE;
window.SURFACE_LETTRES = SURFACE_LETTRES;
window.SURFACE_CHIFFRES = SURFACE_CHIFFRES;
