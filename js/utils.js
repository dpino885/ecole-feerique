// Utility Functions
let voixFée = null;
let voixInitialisee = false;
let derniereUtterance = null; // Garder une référence pour éviter le garbage collection sur Android

function initialiserVoix() {
    if (!("speechSynthesis" in window) || voixInitialisee) return;

    // Charger les voix immédiatement
    chargerVoix();

    // Débloquer l'audio sur mobile avec une utterance silencieuse
    const silence = new SpeechSynthesisUtterance("");
    silence.volume = 0;
    window.speechSynthesis.speak(silence);

    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = chargerVoix;
    }

    voixInitialisee = true;
    console.log("Système vocal initialisé");
}

function chargerVoix() {
    const voix = window.speechSynthesis.getVoices();
    if (!voix || voix.length === 0) return;

    // Priorité à fr-CA, puis fr-FR, puis n'importe quelle voix française
    voixFée = voix.find(v => v.lang === 'fr-CA' || v.lang === 'fr_CA') ||
              voix.find(v => v.lang === 'fr-FR' || v.lang === 'fr_FR') ||
              voix.find(v => v.lang.startsWith('fr'));

    if (voixFée) {
        console.log("Voix sélectionnée :", voixFée.name, voixFée.lang);
    }
}

function parler(message) {
    if (!("speechSynthesis" in window)) return;

    // S'assurer que le système est initialisé (au cas où le premier clic a été manqué)
    if (!voixInitialisee) initialiserVoix();

    // Annuler tout discours en cours
    window.speechSynthesis.cancel();

    // Re-tenter de charger les voix si aucune n'est trouvée (asynchronisme mobile)
    if (!voixFée) chargerVoix();

    // Petit délai pour assurer que le cancel est bien traité sur certains Android/Silk
    setTimeout(() => {
        const msg = new SpeechSynthesisUtterance(message);
        derniereUtterance = msg; // Référence globale pour éviter le GC sur Android

        if (voixFée) {
            msg.voice = voixFée;
        } else {
            msg.lang = 'fr-FR'; // Fallback plus générique que fr-CA
        }

        msg.pitch = 1.2;
        msg.rate = 1.0;
        msg.volume = 1.0;

        // Fix Android : Toujours appeler resume() avant speak() car l'engine se met parfois en pause
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
        }

        window.speechSynthesis.speak(msg);

        // Deuxième fix Android : Si ça reste bloqué, forcer le resume périodiquement
        const forceResume = setInterval(() => {
            if (!window.speechSynthesis.speaking) {
                clearInterval(forceResume);
            } else {
                window.speechSynthesis.resume();
            }
        }, 500);
    }, 150); // Délai légèrement augmenté pour la stabilité
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
