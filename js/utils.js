// Utility Functions

/**
 * Gestionnaire de Voix optimisé pour Mobile (iOS/Android)
 */
const VoiceManager = {
    voixFée: null,
    initialisee: false,
    derniereUtterance: null,
    intervalHeartbeat: null,
    voixPromise: null,

    init() {
        if (!("speechSynthesis" in window) || this.initialisee) return;

        // Tenter de charger les voix immédiatement
        this.chargerVoix();

        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => this.chargerVoix();
        }

        this.initialisee = true;
        console.log("VoiceManager: Initialisé");
    },

    chargerVoix() {
        if (this.voixPromise) return this.voixPromise;

        this.voixPromise = new Promise((resolve) => {
            let tentatives = 0;
            const tenterChargement = () => {
                tentatives++;
                const voix = window.speechSynthesis.getVoices();
                if (voix && voix.length > 0) {
                    // Priorité à fr-CA, puis fr-FR, puis n'importe quelle voix française
                    this.voixFée = voix.find(v => {
                        const l = v.lang.toLowerCase().replace('_', '-');
                        return l === 'fr-ca' || l === 'fr-fr';
                    }) || voix.find(v => v.lang.toLowerCase().startsWith('fr'));

                    if (this.voixFée) {
                        console.log("VoiceManager: Voix sélectionnée :", this.voixFée.name, this.voixFée.lang);
                    }
                    resolve(this.voixFée);
                } else if (tentatives < 10) {
                    // Sur certains navigateurs, getVoices() peut être vide au début
                    setTimeout(tenterChargement, 100);
                } else {
                    console.warn("VoiceManager: Aucune voix trouvée après 10 tentatives");
                    resolve(null);
                }
            };
            tenterChargement();
        });
        return this.voixPromise;
    },

    /**
     * Déverrouille le moteur de synthèse vocale.
     * Pour une application native Android (WebView), utiliser :
     * webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
     */
    unlock() {
        if (this.initialisee) {
            window.speechSynthesis.resume();
            return;
        }
        console.log("VoiceManager: Tentative de déverrouillage audio");
        // iOS/Android require a speak() call within a user interaction
        window.speechSynthesis.resume();

        const silence = new SpeechSynthesisUtterance(".");
        silence.volume = 0.001; // Plus sûr que 0 sur certains appareils
        silence.rate = 10;

        // On attache un événement pour vérifier si ça a marché
        silence.onstart = () => console.log("VoiceManager: Moteur déverrouillé avec succès");

        window.speechSynthesis.speak(silence);

        // Initialiser aussi le reste
        this.init();
    },

    parler(message) {
        if (!("speechSynthesis" in window)) return;

        // Nettoyage des processus en cours
        this.stopper();

        // Android exige une exécution strictement synchrone pour ne pas briser la chaîne de confiance
        const msg = new SpeechSynthesisUtterance(message);
        this.derniereUtterance = msg; // Protection Garbage Collection

        if (this.voixFée) {
            msg.voice = this.voixFée;
            msg.lang = this.voixFée.lang;
        } else {
            // Langue par défaut immédiate si la voix n'est pas encore chargée
            msg.lang = 'fr-CA';
        }

        // Paramètres optimisés
        msg.pitch = 1.1;
        msg.rate = 0.95;
        msg.volume = 1.0;

        msg.onstart = () => {
            // Heartbeat Android : empêche la coupure après 15 secondes
            if (this.intervalHeartbeat) clearInterval(this.intervalHeartbeat);
            this.intervalHeartbeat = setInterval(() => {
                if (window.speechSynthesis.speaking) {
                    window.speechSynthesis.resume();
                } else {
                    clearInterval(this.intervalHeartbeat);
                }
            }, 500);
        };

        msg.onend = () => {
            if (this.intervalHeartbeat) clearInterval(this.intervalHeartbeat);
            this.derniereUtterance = null;
        };

        msg.onerror = (event) => {
            console.error("VoiceManager: Erreur TTS", event);
            if (this.intervalHeartbeat) clearInterval(this.intervalHeartbeat);
            // Si erreur, on tente de reset le moteur
            window.speechSynthesis.resume();
        };

        window.speechSynthesis.speak(msg);
    },

    stopper() {
        if (this.intervalHeartbeat) clearInterval(this.intervalHeartbeat);
        window.speechSynthesis.resume();
        window.speechSynthesis.cancel();
    }
};

// Fonctions globales pour rester compatible avec le reste du code
function initialiserVoix() {
    VoiceManager.unlock();
}

function parler(message) {
    VoiceManager.parler(message);
}

// Utilitaires Canvas (inchangés mais conservés ici par cohérence avec l'ancien fichier)
function brancherEvenementsCanvas(canvas) {
    if (!canvas) return;

    const options = { passive: false };

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
    }, options);

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }, options);

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup', {});
        canvas.dispatchEvent(mouseEvent);
    }, options);
}
