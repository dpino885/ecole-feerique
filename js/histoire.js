// 7. LOGIQUE DU MODULE HISTOIRE
const baseHistoires = [
    {
        titre: "L'Aventure 1",
        pages: [
            "images/histoire1.1.webp",
            "images/histoire1.2.webp",
            "images/histoire1.3.webp",
            "images/histoire1.4.webp",
            "images/histoire1.5.webp",
            "images/histoire1.6.webp"
        ]
    },
    { titre: "Histoire 2", pages: [] },
    { titre: "Histoire 3", pages: [] },
    { titre: "Histoire 4", pages: [] },
    { titre: "Histoire 5", pages: [] },
    { titre: "Histoire 6", pages: [] }
];

let histoireActuelle = null;
let pageActuelle = 0;

function genererSelectionHistoires() {
    const grille = document.getElementById('grilleLivres');
    if (!grille) return;
    grille.innerHTML = "";

    baseHistoires.forEach((histoire, index) => {
        const btn = document.createElement('button');
        btn.className = 'btn-livre';
        btn.innerHTML = `📖`; // On peut mettre l'index ou un titre plus tard
        btn.onclick = () => ouvrirHistoire(index);
        grille.appendChild(btn);
    });

    document.getElementById('selectionHistoires').style.display = 'flex';
    document.getElementById('lecteurHistoire').style.display = 'none';
}

function ouvrirHistoire(index) {
    histoireActuelle = baseHistoires[index];
    if (!histoireActuelle || histoireActuelle.pages.length === 0) {
        parler("Cette histoire n'est pas encore prête !");
        return;
    }

    pageActuelle = 0;
    document.getElementById('selectionHistoires').style.display = 'none';
    document.getElementById('lecteurHistoire').style.display = 'flex';
    document.getElementById('btnRetourGlobal').style.display = 'none';

    afficherPage();
}

function afficherPage() {
    const img = document.getElementById('imageHistoire');
    const fin = document.getElementById('ecranFinHistoire');
    const btnPrecedent = document.getElementById('btnPrecedentHistoire');
    const btnSuivant = document.getElementById('btnSuivantHistoire');

    if (pageActuelle < histoireActuelle.pages.length) {
        img.src = histoireActuelle.pages[pageActuelle];
        img.style.display = 'block';
        fin.style.display = 'none';
    } else {
        img.style.display = 'none';
        fin.style.display = 'flex';
    }

    btnPrecedent.disabled = (pageActuelle === 0);
    // On permet d'aller une page au-delà de la dernière image pour voir l'écran "FIN"
    btnSuivant.disabled = (pageActuelle > histoireActuelle.pages.length - 1);
}

function pageSuivante() {
    if (pageActuelle <= histoireActuelle.pages.length - 1) {
        pageActuelle++;
        afficherPage();
    }
}

function pagePrecedente() {
    if (pageActuelle > 0) {
        pageActuelle--;
        afficherPage();
    }
}

function quitterHistoire() {
    document.getElementById('lecteurHistoire').style.display = 'none';
    document.getElementById('selectionHistoires').style.display = 'flex';
    document.getElementById('btnRetourGlobal').style.display = 'flex';
}
