// Utility Functions
let voixFée = null;
let voixInitialisee = false;
let derniereUtterance = null; // Garder une référence pour éviter le garbage collection sur Android
let utteranceSilencieuse = null; // Référence persistante pour le déblocage

function initialiserVoix() {
    if (!("speechSynthesis" in window) || voixInitialisee) return;

    // Forcer le resume avant tout sur Android
    window.speechSynthesis.resume();

    // Charger les voix immédiatement
    chargerVoix();

    // Débloquer l'audio sur mobile avec une utterance quasi-silencieuse
    // Utiliser un point ou un petit mot car certains Android ignorent l'espace vide
    utteranceSilencieuse = new SpeechSynthesisUtterance(".");
    utteranceSilencieuse.volume = 0.001;
    utteranceSilencieuse.rate = 10;

    try {
        // Certains navigateurs Android nécessitent un resume avant le premier speak
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utteranceSilencieuse);
    } catch (e) {
        console.error("Erreur initialisation voix:", e);
    }

    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = chargerVoix;
    }

    voixInitialisee = true;
}

function chargerVoix() {
    if (!("speechSynthesis" in window)) return;

    const voix = window.speechSynthesis.getVoices();
    if (!voix || voix.length === 0) return;

    // Priorité à fr-CA, puis fr-FR, puis n'importe quelle voix française
    voixFée = voix.find(v => {
        const l = v.lang.toLowerCase().replace('_', '-');
        return l === 'fr-ca' || l === 'fr-fr';
    }) || voix.find(v => v.lang.toLowerCase().startsWith('fr'));

    if (voixFée) {
        console.log("Voix sélectionnée :", voixFée.name, voixFée.lang);
    }
}

function parler(message) {
    if (!("speechSynthesis" in window)) return;

    // S'assurer que le système est initialisé
    if (!voixInitialisee) initialiserVoix();
    if (!voixFée) chargerVoix();

    // Sur Android, cancel() est parfois capricieux. On resume avant pour être sûr de débloquer.
    window.speechSynthesis.resume();
    window.speechSynthesis.cancel();

    // Petit délai pour assurer que le cancel est bien traité par le moteur
    setTimeout(() => {
        const msg = new SpeechSynthesisUtterance(message);
        derniereUtterance = msg; // Protection indispensable contre le Garbage Collection sur Android

        if (voixFée) {
            msg.voice = voixFée;
        }
        msg.lang = 'fr-FR';
        msg.pitch = 1.1;
        msg.rate = 0.95;
        msg.volume = 1.0;

        // Fix Android : force le resume pendant la lecture pour éviter les coupures (bug des 15 secondes)
        let intervalHeartbeat = null;
        msg.onstart = () => {
            if (intervalHeartbeat) clearInterval(intervalHeartbeat);
            intervalHeartbeat = setInterval(() => {
                if (!window.speechSynthesis.speaking) {
                    clearInterval(intervalHeartbeat);
                } else {
                    window.speechSynthesis.resume();
                }
            }, 500);
        };

        msg.onend = () => {
            if (intervalHeartbeat) clearInterval(intervalHeartbeat);
            derniereUtterance = null;
        };

        msg.onerror = (event) => {
            console.error("Erreur TTS:", event);
            if (intervalHeartbeat) clearInterval(intervalHeartbeat);
            window.speechSynthesis.resume();
        };

        window.speechSynthesis.speak(msg);
    }, 150); // Délai légèrement augmenté pour Android
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
