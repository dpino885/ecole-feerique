// 3. JEU DES FÉES (CHIFFRES)
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
