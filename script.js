const COLORES_CONFETI = ['#ffd93b', '#f5a623', '#e08b00', '#ffe066', '#fff3a0', '#8bc34a'];

const VIDEO_ID = 'S7gMzYqXIZc';
const TIEMPO_INICIO = 46;
const FIN_BUCLE = TIEMPO_INICIO + 30;
let sonidoActivo = true;
let reproductor = null;
let musicaLocalDisponible = false;

function activarPantallaTarjeta() {
    document.getElementById('pantalla-inicio').classList.remove('activo');
    const pantalla = document.getElementById('pantalla-tarjeta');
    pantalla.classList.add('activo');
    document.documentElement.classList.add('modo-oscuro');
    document.body.classList.add('modo-oscuro');
    const tarjeta = pantalla.querySelector('.tarjeta');
    tarjeta.classList.remove('entra');
    void tarjeta.offsetWidth;
    tarjeta.classList.add('entra');
    window.scrollTo(0, 0);
}

function mostrarTarjeta() {
    const input = document.getElementById('nombreInput');
    const nombre = input.value.trim();

    if (nombre === '') {
        input.placeholder = 'Escribe un nombre';
        input.style.borderColor = '#e74c3c';
        input.style.boxShadow = '0 0 0 4px rgba(231, 76, 60, 0.4)';
        input.focus();
        setTimeout(() => {
            input.style.borderColor = '#999999';
            input.style.boxShadow = 'none';
            input.placeholder = '';
        }, 1500);
        return;
    }

    document.getElementById('nombreMostrado').textContent = `🌻 ${nombre} 🌻`;

    activarPantallaTarjeta();

    const url = new URL(window.location);
    url.searchParams.set('nombre', nombre);
    window.history.replaceState({}, '', url);
}

/* ============ CONFETI ============ */
function lanzarConfeti(cantidad = 80) {
    const cont = document.getElementById('confetti');
    if (!cont) return;

    for (let i = 0; i < cantidad; i++) {
        const p = document.createElement('span');
        const color = COLORES_CONFETI[Math.floor(Math.random() * COLORES_CONFETI.length)];
        p.style.left = Math.random() * 100 + '%';
        p.style.backgroundColor = color;
        p.style.width = 6 + Math.random() * 7 + 'px';
        p.style.height = 10 + Math.random() * 9 + 'px';
        p.style.animationDuration = 2.4 + Math.random() * 2 + 's';
        p.style.animationDelay = Math.random() * 0.4 + 's';
        p.style.setProperty('--sway', Math.random() * 140 - 70 + 'px');
        cont.appendChild(p);

        setTimeout(() => p.remove(), 5200);
    }
}

/* ============ MÚSICA (Local + YouTube) ============ */
let pendienteReproducir = false;

function crearReproductor() {
    if (typeof YT === 'undefined' || !YT.Player) {
        setTimeout(crearReproductor, 400);
        return;
    }
    if (reproductor) return;

    reproductor = new YT.Player('reproductor-musica', {
        width: '400',
        height: '225',
        videoId: VIDEO_ID,
        playerVars: {
            controls: 0,
            disablekb: 1,
            rel: 0,
            playsinline: 1,
            start: TIEMPO_INICIO,
        },
        events: {
            onReady: () => {
                reproductor.setVolume(100);
                reproductor.unMute();
                if (pendienteReproducir && sonidoActivo) {
                    pendienteReproducir = false;
                    reproductor.seekTo(TIEMPO_INICIO, true);
                    reproductor.playVideo();
                }
            },
            onError: (e) => {
                if (typeof console !== 'undefined') console.warn('YouTube error:', e.data);
            },
        },
    });
}

function iniciarAudioLocal() {
    const audio = document.getElementById('musicaAudio');
    if (!audio) return;
    audio.addEventListener('loadeddata', () => {
        musicaLocalDisponible = true;
    });
    audio.addEventListener('canplay', () => {
        musicaLocalDisponible = true;
    });
    audio.addEventListener('error', () => {
        musicaLocalDisponible = false;
    });
    audio.load();
}

function tocarMelodia() {
    if (!sonidoActivo) return;

    const audio = document.getElementById('musicaAudio');
    if (musicaLocalDisponible && audio) {
        audio.muted = false;
        if (Math.abs(audio.currentTime - TIEMPO_INICIO) > 1.5) {
            audio.currentTime = TIEMPO_INICIO;
        }
        audio.play().catch(() => {});
        return;
    }

    try {
        if (!reproductor) {
            pendienteReproducir = true;
            crearReproductor();
            return;
        }
        const estado = reproductor.getPlayerState();
        if (estado === -1 || estado === 0 || estado === 2 || estado === 5 || estado === 3) {
            reproductor.seekTo(TIEMPO_INICIO, true);
            reproductor.playVideo();
        }
    } catch (e) {
        if (typeof console !== 'undefined') console.warn('Error al reproducir la música', e);
    }
}

function gestionarBucle() {
    const audio = document.getElementById('musicaAudio');
    if (musicaLocalDisponible && audio) {
        if (!audio.paused && audio.currentTime >= FIN_BUCLE) {
            audio.currentTime = TIEMPO_INICIO;
        }
        return;
    }
    if (!reproductor || typeof reproductor.getCurrentTime !== 'function') return;
    try {
        const estado = reproductor.getPlayerState();
        if ((estado === 1 || estado === 0) && reproductor.getCurrentTime() >= FIN_BUCLE) {
            reproductor.seekTo(TIEMPO_INICIO, true);
            if (estado === 0) reproductor.playVideo();
        }
    } catch (e) { /* bucle solo funciona mientras hay internet */ }
}

function alternarSonido(boton) {
    sonidoActivo = !sonidoActivo;
    boton.textContent = sonidoActivo ? '🔊' : '🔇';
    boton.classList.toggle('apagado', !sonidoActivo);
    const audio = document.getElementById('musicaAudio');
    if (audio && musicaLocalDisponible) {
        audio.muted = !sonidoActivo;
    }
    if (reproductor && typeof reproductor.mute === 'function') {
        if (sonidoActivo) {
            reproductor.unMute();
        } else {
            reproductor.mute();
        }
    }
    if (sonidoActivo) {
        tocarMelodia();
    }
}

/* ============ EVENTOS ============ */
document.getElementById('nombreInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') mostrarTarjeta();
});

/* ============ GIRASOL ESQUIVO (troll) ============ */
const MAX_INTENTOS = 20;
const FRASES_ESQUIVA = [
    '¡jeje!', '¡casi!', '¡no me tocas!', '¡soy más rápido!', '¡sigo aquí!',
    '¡uy, te esquivé!', '¡velocidad ninja!', '¡sigue intentando!', '¡muy lento!', '¡ni de cerca!',
    '¡otra vez?', '¡no te canses!', '¡casi me atrapas!', '¡prueba otra vez!', '¡de aquí no me sacas!',
    '¡cada vez más cerca!', '¡bum, otro salto!', '¡soy escurridizo!', '¡casi! ¡sigue!', '¡ok, va la última!'
];
let intentosGirasol = 0;
let timerBurbuja = null;

function mostrarBurbuja(texto) {
    const burbuja = document.getElementById('burbujaGirasol');
    if (!burbuja) return;
    burbuja.textContent = texto;
    burbuja.classList.remove('visible');
    void burbuja.offsetWidth;
    burbuja.classList.add('visible');
    clearTimeout(timerBurbuja);
    timerBurbuja = setTimeout(() => burbuja.classList.remove('visible'), 1100);
}

function esquivarGirasol() {
    if (intentosGirasol >= MAX_INTENTOS) return;
    intentosGirasol += 1;
    mostrarBurbuja(FRASES_ESQUIVA[(intentosGirasol - 1) % FRASES_ESQUIVA.length]);
    const contenedor = document.getElementById('girasolEsquivo');
    if (!contenedor) return;
    const dX = Math.round(Math.random() * 300 - 150);
    const dY = Math.round(Math.random() * 220 - 60);
    const rot = Math.round(Math.random() * 40 - 20);
    contenedor.style.transform = `translate(calc(-50% + ${dX}px), calc(-50% + ${dY}px)) rotate(${rot}deg)`;
}

function dejarAtraparGirasol() {
    const contenedor = document.getElementById('girasolEsquivo');
    if (contenedor) contenedor.style.transform = '';
    document.documentElement.classList.remove('modo-oscuro');
    document.body.classList.remove('modo-oscuro');
    document.getElementById('pantalla-tarjeta').classList.add('revelado');
    lanzarConfeti(50);
    tocarMelodia();
    mostrarBurbuja('¡Me atrapaste! 💛');
    girasol.classList.remove('pop');
    void girasol.offsetWidth;
    girasol.classList.add('pop');
}

const girasol = document.querySelector('.girasol-principal');
const girasolEsquivo = document.getElementById('girasolEsquivo');

girasolEsquivo.addEventListener('mouseenter', () => {
    if (intentosGirasol < MAX_INTENTOS) {
        esquivarGirasol();
    }
});

girasolEsquivo.addEventListener('touchstart', (e) => {
    if (intentosGirasol < MAX_INTENTOS) {
        e.preventDefault();
        esquivarGirasol();
    }
});

girasolEsquivo.addEventListener('click', () => {
    if (intentosGirasol < MAX_INTENTOS) {
        esquivarGirasol();
        return;
    }
    dejarAtraparGirasol();
});

window.addEventListener('DOMContentLoaded', () => {
    iniciarAudioLocal();
    crearReproductor();
    setInterval(gestionarBucle, 300);
    const params = new URLSearchParams(window.location.search);
    const nombre = params.get('nombre');
    if (nombre) {
        document.getElementById('nombreInput').value = nombre;
        document.getElementById('nombreMostrado').textContent = `🌻 ${nombre} 🌻`;
        activarPantallaTarjeta();
        lanzarConfeti(60);
    } else {
        document.getElementById('nombreInput').focus();
    }
});