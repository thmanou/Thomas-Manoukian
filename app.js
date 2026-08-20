// ======================================================
// PANORAMA VIEWER
// Sistema escalable mediante proyectos.json
// ======================================================


// ======================================================
// ELEMENTOS HTML
// ======================================================

const intro = document.getElementById("intro");
const panoElement = document.getElementById("pano");
const loader = document.getElementById("loader");

const btnAutorotate =
    document.getElementById("btnAutorotate");

const btnFullscreen =
    document.getElementById("btnFullscreen");

const volverBtn =
    document.getElementById("volverBtn");

const enterButton =
    document.getElementById("enterButton");

const model =
    document.getElementById("modelo");

const viewerContainer =
    document.getElementById("viewer-container");

const indicator =
    document.querySelector(".scroll-indicator");

const topbar =
    document.querySelector(".topbar");

const menuToggle =
    document.getElementById("menuToggle");

const mainNav =
    document.querySelector(".main-nav");

const headerActions =
    document.querySelector(".header-actions");

const panoramaGallery =
    document.getElementById("panorama-gallery");


const panoramaGalleryTrack =
    document.getElementById("panorama-gallery-track");

const params = new URLSearchParams(window.location.search);

const proyectoId = params.get("id");

console.log("Proyecto solicitado:", proyectoId);

// ======================================================
// INDICADOR DE NAVEGACIÓN
// ======================================================

const navigationIndicator =
    document.getElementById(
        "navigation-indicator"
    );

const navigationArrow =
    document.querySelector(
        ".navigation-arrow"
    );

const navigationLabel =
    document.querySelector(
        ".navigation-label"
    );


// ======================================================
// MARZIPANO VIEWER
// ======================================================

const viewer =
    new Marzipano.Viewer(
        panoElement,
        {
            controls: {
                mouseViewMode: "drag"
            }
        }
    );


// ======================================================
// VARIABLES DEL PROYECTO
// ======================================================

let proyectoActual = null;

let tour = {};

let scenes = {};

let currentScene = null;

let navigationHotspots = [];


// ======================================================
// GEOMETRÍA
// ======================================================

const geometry =
    new Marzipano.EquirectGeometry([
        {
            width: 6000
        }
    ]);


// ======================================================
// LIMITADOR DE CÁMARA
// ======================================================

const limiter =
    Marzipano.RectilinearView.limit.traditional(
        4096,
        120 * Math.PI / 180
    );


// ======================================================
// ESTADO INICIAL
// ======================================================

viewerContainer.style.display = "none";

loader.style.display = "none";

if (indicator) {
    indicator.style.display = "none";
}

if (navigationIndicator) {
    navigationIndicator.style.display = "none";
}


// ======================================================
// BOTÓN VOLVER
// ======================================================

if (volverBtn) {

    volverBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "index.html";

        }
    );

}


// ======================================================
// BOTÓN INGRESAR
// ======================================================

if (enterButton) {

    enterButton.addEventListener(
        "click",
        iniciarRecorrido
    );

}


// ======================================================
// INICIAR RECORRIDO
// ======================================================

function iniciarRecorrido() {

    // Ocultar botón / intro
    intro.classList.add("fade");


    setTimeout(() => {

        intro.style.display = "none";


        // Mostrar loader
        loader.style.display = "flex";


        // Esperamos un poco para
        // que termine la transición
        setTimeout(async () => {

            try {

                // Mostrar viewer
                viewerContainer.style.display =
                    "block";


                // Mostrar interfaz


                if (indicator) {
                    indicator.style.display =
                        "block";
                }


                // MUY IMPORTANTE:
                // actualizar tamaño de Marzipano
                viewer.updateSize();


                // Cargar proyecto
                await cargarProyecto();


                // Ocultar loader
                loader.classList.add("hidden");


                // Pequeño retraso para asegurar
                // que el contenedor tenga tamaño
                requestAnimationFrame(() => {

                    viewer.updateSize();

                    if (currentScene) {

                        currentScene.switchTo();

                    }

                });


            } catch (error) {

                console.error(
                    "Error iniciando recorrido:",
                    error
                );

            }

        }, 500);

    }, 700);

}


// ======================================================
// CARGAR PROYECTO DESDE JSON
// ======================================================

async function cargarProyecto() {

    console.log("Cargando proyecto...");
    console.log("ID recibido desde URL:", proyectoId);

    try {

        // Cargar proyectos.json
        const response = await fetch("proyectos.json");

        if (!response.ok) {
            throw new Error(
                `No se pudo cargar proyectos.json (${response.status})`
            );
        }

        const proyectos = await response.json();

        // Buscar el proyecto según ?id=
        proyectoActual = proyectos.find(
            proyecto => proyecto.id === proyectoId
        );

        // Verificar que exista
        if (!proyectoActual) {

            throw new Error(
                `No existe el proyecto: ${proyectoId}`
            );

        }

        console.log(
            "Proyecto encontrado:",
            proyectoActual
        );

        // Verificar recorrido 360
        if (
            !proyectoActual.recorrido360 ||
            !proyectoActual.recorrido360.activo
        ) {

            throw new Error(
                "Este proyecto no tiene recorrido 360 activo."
            );

        }

        // Obtener panoramas
        tour =
            proyectoActual.recorrido360.panoramas;

        if (!tour) {

            throw new Error(
                "El proyecto no contiene panoramas."
            );

        }

        // Crear escenas
        crearEscenas();

        // Crear hotspots
        crearHotspots();

        // Crear galería de panorámicas
        createPanoramaGallery(tour);

        // Panorama inicial
        const panoramaInicial =
            proyectoActual.recorrido360.panoramaInicial;

        if (!scenes[panoramaInicial]) {

            throw new Error(
                `No existe el panorama inicial: ${panoramaInicial}`
            );

        }

        currentScene =
            scenes[panoramaInicial];

        // Mostrar escena
        requestAnimationFrame(() => {

            viewer.updateSize();

            currentScene.switchTo();

        });

        console.log(
            "Recorrido iniciado correctamente."
        );

    } catch (error) {

        console.error(
            "Error cargando proyecto:",
            error
        );

    }

}


// ======================================================
// CREAR ESCENAS
// ======================================================

function crearEscenas() {

    scenes = {};


    for (const id in tour) {

        const data =
            tour[id];


        // ----------------------------------------------
        // Imagen
        // ----------------------------------------------

        const source =
            Marzipano.ImageUrlSource
                .fromString(
                    data.imagen
                );


        // ----------------------------------------------
        // Cámara
        // ----------------------------------------------

        const view =
            new Marzipano.RectilinearView(
                {

                    yaw:
                        data.yawInicial ||
                        0,

                    pitch:
                        data.pitchInicial ||
                        0,

                    fov:
                        (data.fov || 90)
                        * Math.PI / 180

                },

                limiter

            );


        // ----------------------------------------------
        // Crear escena
        // ----------------------------------------------

        scenes[id] =
            viewer.createScene({

                source: source,

                geometry: geometry,

                view: view,

                pinFirstLevel: true

            });

    }


    console.log(
        "Escenas creadas:",
        scenes
    );

}


// ======================================================
// CREAR HOTSPOTS
// ======================================================

function crearHotspots() {

    navigationHotspots = [];


    for (const id in tour) {

        const escena =
            scenes[id];


        const hotspots =
            tour[id].hotspots ||
            [];


        hotspots.forEach(
            hotspotData => {


                // --------------------------------------
                // Crear elemento
                // --------------------------------------

                const hotspot =
                    document.createElement(
                        "div"
                    );


                hotspot.className =
                    "hotspot";


                hotspot.innerHTML = `
                    <div class="hotspot-dot"></div>
                `;


                // --------------------------------------
                // Click
                // --------------------------------------

                hotspot.addEventListener(
                    "click",
                    () => {

                        changeScene(
                            hotspotData.target
                        );

                    }
                );


                // --------------------------------------
                // Agregar a Marzipano
                // --------------------------------------

                escena
                    .hotspotContainer()
                    .createHotspot(

                        hotspot,

                        {

                            yaw:
                                hotspotData.yaw,

                            pitch:
                                hotspotData.pitch

                        }

                    );


                // --------------------------------------
                // Guardar para flecha
                // --------------------------------------

                navigationHotspots.push({

                    sceneId:
                        id,

                    target:
                        hotspotData.target,

                    yaw:
                        hotspotData.yaw,

                    pitch:
                        hotspotData.pitch,

                    nombre:
                        hotspotData.nombre ||
                        hotspotData.target

                });

            }
        );

    }


    console.log(
        "Hotspots creados:",
        navigationHotspots
    );

}


// ======================================================
// CAMBIAR DE ESCENA
// ======================================================

function changeScene(id) {

    if (!scenes[id]) {

        console.error(
            `No existe la escena: ${id}`
        );

        return;

    }


    currentScene =
        scenes[id];


    currentScene.switchTo({

        transitionDuration: 1000

    });

     updateActiveGalleryItem(id);
}

function updateActiveGalleryItem(id) {

    const cards =
        document.querySelectorAll(".panorama-card");

    cards.forEach(card => {

        card.classList.remove("active");

    });

    const activeCard =
        document.querySelector(
            `.panorama-card[data-scene="${id}"]`
        );

    if (activeCard) {

        activeCard.classList.add("active");

        activeCard.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center"
        });

    }

}

function createPanoramaGallery(panoramas) {

    panoramaGalleryTrack.innerHTML = "";

    for (const id in panoramas) {

        const panorama = panoramas[id];

        console.log("Creando tarjeta:", id);
        console.log("Imagen:", panorama.imagen);
        console.log("Miniatura:", panorama.miniatura);

        const card = document.createElement("div");

        card.className = "panorama-card";

        card.dataset.scene = id;

        const imagePath =
            panorama.miniatura || panorama.imagen;

        card.innerHTML = `
            <img 
                src="${imagePath}"
                alt="${panorama.nombre || id}"
            >

            <span>
                ${panorama.nombre || id}
            </span>
        `;

        card.addEventListener("click", () => {

            if (galleryMoved) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }

            changeScene(id);

        });

        panoramaGalleryTrack.appendChild(card);

    }
}

// ======================================================
// CARRUSEL ARRASTRABLE
// ======================================================

const gallery =
    document.getElementById("panorama-gallery");

const galleryTrack =
    document.getElementById("panorama-gallery-track");

let isDraggingGallery = false;

let galleryStartX = 0;
let galleryCurrentX = 0;
let galleryStartOffset = 0;

let galleryMoved = false;


// ------------------------------------------------------
// OBTENER POSICIÓN ACTUAL
// ------------------------------------------------------

function getGalleryOffset() {

    const transform =
        window.getComputedStyle(galleryTrack)
            .transform;

    if (transform === "none") {
        return 0;
    }

    const matrix =
        new DOMMatrix(transform);

    return matrix.m41;
}


// ------------------------------------------------------
// LIMITAR MOVIMIENTO
// ------------------------------------------------------

function limitGalleryOffset(offset) {

    const containerWidth =
        panoramaGallery.getBoundingClientRect().width;

    const trackWidth =
        panoramaGalleryTrack.getBoundingClientRect().width;

    // Hasta dónde podemos desplazar hacia la izquierda
    const maxOffset =
        containerWidth - trackWidth;

    // Si el contenido entra completo, no desplazamos
    if (maxOffset >= 0) {
        return 0;
    }

    return Math.max(
        maxOffset,
        Math.min(0, offset)
    );
}


// ------------------------------------------------------
// MOVER GALERÍA
// ------------------------------------------------------

function moveGallery(offset) {

    const limitedOffset =
        limitGalleryOffset(offset);

    panoramaGalleryTrack.style.transform =
        `translate3d(${limitedOffset}px, 0, 0)`;

}


// ======================================================
// MOUSE
// ======================================================

gallery.addEventListener("mousedown", (event) => {

    isDraggingGallery = true;

    galleryMoved = false;

    galleryStartX = event.clientX;

    galleryStartOffset =
        getGalleryOffset();

    gallery.classList.add("dragging");

});


document.addEventListener("mousemove", (event) => {

    if (!isDraggingGallery) {
        return;
    }

    const difference =
        event.clientX - galleryStartX;

    if (Math.abs(difference) > 5) {
        galleryMoved = true;
    }

    moveGallery(
        galleryStartOffset + difference
    );

});


document.addEventListener("mouseup", () => {

    if (!isDraggingGallery) {
        return;
    }

    isDraggingGallery = false;

    gallery.classList.remove("dragging");

});


// ======================================================
// TOUCH
// ======================================================

gallery.addEventListener("touchstart", (event) => {

    const touch =
        event.touches[0];

    isDraggingGallery = true;

    galleryMoved = false;

    galleryStartX =
        touch.clientX;

    galleryStartOffset =
        getGalleryOffset();

}, {
    passive: true
});


gallery.addEventListener("touchmove", (event) => {

    if (!isDraggingGallery) {
        return;
    }

    const touch =
        event.touches[0];

    const difference =
        touch.clientX - galleryStartX;

    if (Math.abs(difference) > 5) {
        galleryMoved = true;
    }

    moveGallery(
        galleryStartOffset + difference
    );

}, {
    passive: true
});


gallery.addEventListener("touchend", () => {

    isDraggingGallery = false;

});


// ======================================================
// EVITAR CLICK AL ARRASTRAR
// ======================================================

gallery.addEventListener("click", (event) => {

    if (galleryMoved) {

        event.preventDefault();

        event.stopPropagation();

    }

}, true);

function updateGalleryBounds() {

    const containerWidth =
        panoramaGallery.getBoundingClientRect().width;

    const trackWidth =
        panoramaGalleryTrack.getBoundingClientRect().width;

    console.log(
        "Galería:",
        containerWidth,
        "Track:",
        trackWidth
    );

    const currentOffset =
        getGalleryOffset();

    moveGallery(currentOffset);

}
// ======================================================
// OBTENER ID DE ESCENA ACTUAL
// ======================================================

function getCurrentSceneId() {

    for (
        const id in scenes
    ) {

        if (
            scenes[id] ===
            currentScene
        ) {

            return id;

        }

    }


    return null;

}


// ======================================================
// NORMALIZAR ÁNGULO
// ======================================================

function normalizeAngle(angle) {

    while (
        angle > Math.PI
    ) {

        angle -=
            Math.PI * 2;

    }


    while (
        angle < -Math.PI
    ) {

        angle +=
            Math.PI * 2;

    }


    return angle;

}


// ======================================================
// ACTUALIZAR FLECHA
// ======================================================

function updateNavigationIndicator() {

    if (
        !currentScene ||
        !navigationIndicator
    ) {

        return;

    }


    const currentView =
        currentScene.view();


    const cameraYaw =
        currentView.yaw();


    const currentSceneId =
        getCurrentSceneId();


    const availableHotspots =
        navigationHotspots.filter(
            hotspot =>
                hotspot.sceneId ===
                currentSceneId
        );


    if (
        availableHotspots.length === 0
    ) {

        navigationIndicator.style.display =
            "none";

        return;

    }


    // ----------------------------------------------
    // Buscar hotspot más cercano
    // ----------------------------------------------

    let closestHotspot = null;

    let smallestAngle =
        Infinity;


    availableHotspots.forEach(
        hotspot => {

            const difference =
                normalizeAngle(
                    hotspot.yaw -
                    cameraYaw
                );


            const absoluteDifference =
                Math.abs(
                    difference
                );


            if (
                absoluteDifference <
                smallestAngle
            ) {

                smallestAngle =
                    absoluteDifference;

                closestHotspot =
                    hotspot;

            }

        }
    );


    if (!closestHotspot) {

        return;

    }


    // ----------------------------------------------
    // Dirección
    // ----------------------------------------------

    const angle =
        normalizeAngle(

            closestHotspot.yaw -
            cameraYaw

        );


    const rotation =
        angle *
        180 /
        Math.PI;


    navigationArrow.style.transform =
        `rotate(${rotation}deg)`;


    navigationLabel.textContent =
        closestHotspot.nombre;


    navigationIndicator.style.display =
        "flex";

}


// ======================================================
// LOOP DE NAVEGACIÓN
// ======================================================

function navigationLoop() {

    updateNavigationIndicator();


    requestAnimationFrame(
        navigationLoop
    );

}


navigationLoop();


// ======================================================
// MENÚ MOBILE
// ======================================================

if (menuToggle) {

    menuToggle.addEventListener("click", () => {

        if (mainNav) {
            mainNav.classList.toggle("open");
        }

        if (headerActions) {
            headerActions.classList.toggle("open");
        }

        menuToggle.classList.toggle("active");

    });

}


// ======================================================
// AUTORROTACIÓN
// ======================================================

const autorotate =
    Marzipano.autorotate({

        yawSpeed:
            0.03,

        targetPitch:
            0,

        targetFov:
            Math.PI / 1

    });


let autoEnabled =
    true;


viewer.setIdleMovement(
    2500,
    autorotate
);


// ======================================================
// BOTÓN AUTORROTACIÓN
// ======================================================

if (btnAutorotate) {

    btnAutorotate.addEventListener(
        "click",
        () => {

            if (autoEnabled) {

                viewer.stopMovement();

                viewer.setIdleMovement(
                    Infinity
                );


                btnAutorotate.innerHTML =
                    "Girar";


                autoEnabled =
                    false;

            } else {

                viewer.startMovement(
                    autorotate
                );


                viewer.setIdleMovement(
                    2500,
                    autorotate
                );


                btnAutorotate.innerHTML =
                    "Detener";


                autoEnabled =
                    true;

            }

        }
    );

}


// ======================================================
// FULLSCREEN
// ======================================================

if (btnFullscreen) {

    btnFullscreen.addEventListener(
        "click",
        () => {

            if (
                !document.fullscreenElement
            ) {

                document.documentElement
                    .requestFullscreen();

            } else {

                document.exitFullscreen();

            }

        }
    );

}


// ======================================================
// DOBLE CLICK → CENTRAR
// ======================================================

if (panoElement) {

    panoElement.addEventListener(
        "dblclick",
        () => {

            if (!currentScene) {
                return;
            }


            currentScene.lookTo(

                {

                    yaw: 0,

                    pitch: 0,

                    fov:
                        Math.PI / 2

                },

                {

                    transitionDuration:
                        1000

                }

            );

        }
    );

}
// ======================================================
// VOLVER AL MODELO
// ======================================================
const btnModelo = document.getElementById("btnModelo");

if (btnModelo) {

    btnModelo.addEventListener("click", () => {

        viewerContainer.style.display = "none";

        intro.style.display = "block";

        intro.classList.remove("fade");

    });

}
// ======================================================
// VOLVER A GALERIA
// ======================================================
const btnGaleria = document.getElementById("btnGaleria");

if (btnGaleria) {

    btnGaleria.addEventListener("click", () => {

        window.location.href =
            `galeria.html?id=${proyectoId}`;

    });

}
// ======================================================
// VOLVER A PLANOS
// ======================================================
const btnPlanos = document.getElementById("btnPlanos");

if (btnPlanos) {

    btnPlanos.addEventListener("click", () => {

        window.location.href =
            `planos.html?id=${proyectoId}`;

    });

}

// ======================================================
// ACTUALIZAR GALERIA
// ======================================================

window.addEventListener("load", () => {

    setTimeout(() => {

        updateGalleryBounds();

    }, 300);

});

window.addEventListener("resize", () => {

    updateGalleryBounds();

});

// ======================================================
// DEBUG
// ======================================================

window.viewer =
    viewer;

window.scenes =
    scenes;

window.tour =
    tour;

window.proyectoActual =
    proyectoActual;