// Utility Functions
let voixFée = null;
let voixInitialisee = false;

function initialiserVoix() {
    if (!("speechSynthesis" in window) || voixInitialisee) return;

    // Débloquer l'audio sur mobile avec une utterance silencieuse
    const silence = new SpeechSynthesisUtterance("");
    window.speechSynthesis.speak(silence);

    chargerVoix();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = chargerVoix;
    }

    voixInitialisee = true;
    console.log("Système vocal initialisé");
}

function chargerVoix() {
    const voix = window.speechSynthesis.getVoices();
    // Priorité à fr-CA, puis fr-FR, puis n'importe quelle voix française
    voixFée = voix.find(v => v.lang === 'fr-CA') ||
              voix.find(v => v.lang === 'fr-FR') ||
              voix.find(v => v.lang.startsWith('fr'));
}

function parler(message) {
    if (!("speechSynthesis" in window)) return;

    // Annuler tout discours en cours
    window.speechSynthesis.cancel();

    // Petit délai pour assurer que le cancel est bien traité sur certains Android/Silk
    setTimeout(() => {
        const msg = new SpeechSynthesisUtterance(message);

        if (voixFée) {
            msg.voice = voixFée;
        } else {
            msg.lang = 'fr-CA';
        }

        msg.pitch = 1.2;
        msg.rate = 1.0;

        window.speechSynthesis.speak(msg);
    }, 100);
}

function brancherEvenementsCanvas(canvas) {
    if (!canvas) return;
    canvas.addEventListener('mousedown', demarrerDessin);
    canvas.addEventListener('mousemove', dessiner);
    canvas.addEventListener('mouseup', arreterDessin);
    canvas.addEventListener('mouseout', arreterDessin);

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup', {});
        canvas.dispatchEvent(mouseEvent);
    }, { passive: false });
}
