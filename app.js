//   Panorama Viewer v1.0

//======================================================
// ELEMENTOS
//======================================================

const intro = document.getElementById("intro");
const panoElement = document.getElementById("pano");
const loader = document.getElementById("loader");
const btnAutorotate = document.getElementById("btnAutorotate");
const btnFullscreen = document.getElementById("btnFullscreen");
const volverBtn = document.getElementById("volverBtn");
const enterButton = document.getElementById("enterButton");
const model = document.getElementById("modelo");
const viewerContainer = document.getElementById("viewer-container");
const viewer = new Marzipano.Viewer(panoElement, {
    controls: {
        mouseViewMode: "drag"
    }
});
const indicator = document.querySelector(".scroll-indicator");
const topbar = document.querySelector(".topbar");
const navigationIndicator =
    document.getElementById("navigation-indicator");

const navigationArrow =
    document.querySelector(".navigation-arrow");

const navigationLabel =
    document.querySelector(".navigation-label");

volverBtn.addEventListener("click", () => {
    window.location.href = "index.html";
});

/* =======================================================
   modelo
======================================================= */



viewerContainer.style.display = "none";

window.addEventListener("load",()=>{

    loader.style.display = "none";

    topbar.style.display="none";

    indicator.style.display="none";

});

enterButton.addEventListener("click", () => {

    intro.classList.add("fade");

    setTimeout(() => {

        intro.style.display = "none";

        loader.style.display = "flex";

        setTimeout(() => {

            loader.style.display = "none";

            viewerContainer.style.display = "block";

            topbar.style.display = "flex";

            indicator.style.display = "block";

            currentScene.switchTo();

        }, 1500);

    }, 700);

});

viewerContainer.style.display = "block";

//======================================================
// OCULTAR MENU
//======================================================

const menuToggle = document.getElementById("menuToggle");
const actions = document.querySelector(".actions");

menuToggle.addEventListener("click", () => {
    actions.classList.toggle("open");

});


//======================================================
// GEOMETRÍA
//======================================================

const geometry = new Marzipano.EquirectGeometry([
    {
        width: 6000
    }
]);

// Esperar un frame para que el navegador calcule el tamaño
requestAnimationFrame(() => {
    viewer.updateSize();
    currentScene.switchTo();
});

//======================================================
// LIMITADOR DE CÁMARA
//======================================================

const limiter = Marzipano.RectilinearView.limit.traditional(
    4096,
    120 * Math.PI / 180
);

//======================================================
// TOUR
//======================================================

const tour = {

    living: {

        image: "panoramas/Panorama(1).jpg",

        hotspots: [

            {
                target: "bano",
                yaw: -2,
                pitch: 0.45
            },
            {
                target: "habitacion1",
                yaw: -1.5,
                pitch: 0.50
            },
            {
                target: "cocina",
                yaw: -15.5,
                pitch: 0.35
            }
        ]

    },

    bano: {

        image: "panoramas/Panoramabaño1.jpg",

        hotspots: [

            {
                target: "living",
                yaw: 1.5,
                pitch: 0.35
            }

        ]

    },

    habitacion1: {

        image: "panoramas/Panorama(6).jpg",

        hotspots: [

            {
                target: "living",
                yaw: 1.5,
                pitch: 0.35
            }

        ]

    },

    cocina: {

        image: "panoramas/Panorama(5).jpg",
        hotspots: [
            {
                target: "living",
                yaw: 4.5,
                pitch: 0.35
            }

        ]

    }

    // Agregar nuevas escenas aquí

    /*
    cocina: {

        image: "panoramas/PanoramaCocina.jpg",

        hotspots: [

            {
                target:"living",
                yaw:0.8,
                pitch:-0.12
            }

        ]

    }
    */

};

//======================================================
// CREAR ESCENAS
//======================================================

const scenes = {};

for (const id in tour) {

    const data = tour[id];

    const source = Marzipano.ImageUrlSource.fromString(data.image);

    const view = new Marzipano.RectilinearView(
        {
            yaw: 0,
            pitch: 0,
            fov: Math.PI / 2
        },
        limiter
    );

    scenes[id] = viewer.createScene({
        source,
        geometry,
        view,
        pinFirstLevel: true
    });

}

//======================================================
// CAMBIO DE ESCENA
//======================================================

let currentScene = scenes.living;

function changeScene(id) {

    currentScene = scenes[id];

    currentScene.switchTo({
        transitionDuration: 1000
    });

}

//======================================================
// CREAR HOTSPOTS
//======================================================

const navigationHotspots = [];

for (const id in tour) {

    const scene = scenes[id];

    tour[id].hotspots.forEach(h => {

        const hotspot = document.createElement("div");

        hotspot.className = "hotspot";

        hotspot.innerHTML = `
            <div class="hotspot-dot"></div>
        `;

        hotspot.onclick = () => {

            changeScene(h.target);

        };

        scene.hotspotContainer().createHotspot(
            hotspot,
            {
                yaw: h.yaw,
                pitch: h.pitch
            }
        );

        navigationHotspots.push({
            sceneId: id,
            target: h.target,
            yaw: h.yaw,
            pitch: h.pitch
        });

    });

}

function updateNavigationIndicator(){

    if(!currentScene){
        return;
    }

    const currentView = currentScene.view();

    const cameraYaw = currentView.yaw();

    const availableHotspots =
        navigationHotspots.filter(
            hotspot => hotspot.sceneId === getCurrentSceneId()
        );

    if(availableHotspots.length === 0){

        navigationIndicator.style.display = "none";

        return;

    }

    // Buscar el hotspot más cercano a la dirección actual
    let closestHotspot = null;
    let smallestAngle = Infinity;

    availableHotspots.forEach(hotspot => {

        let difference =
            normalizeAngle(hotspot.yaw - cameraYaw);

        const absoluteDifference =
            Math.abs(difference);

        if(absoluteDifference < smallestAngle){

            smallestAngle = absoluteDifference;

            closestHotspot = hotspot;

        }

    });

    if(!closestHotspot){
        return;
    }

    let angle =
        normalizeAngle(
            closestHotspot.yaw - cameraYaw
        );

    // Si está prácticamente enfrente,
    // la flecha apunta hacia arriba.
    const rotation =
        angle * 180 / Math.PI;

    navigationArrow.style.transform =
        `rotate(${rotation}deg)`;

    navigationLabel.textContent =
        getSceneName(closestHotspot.target);

    navigationIndicator.style.display =
        "flex";
}

function normalizeAngle(angle){

    while(angle > Math.PI){
        angle -= Math.PI * 2;
    }

    while(angle < -Math.PI){
        angle += Math.PI * 2;
    }

    return angle;
}

function getCurrentSceneId(){

    for(const id in scenes){

        if(scenes[id] === currentScene){
            return id;
        }

    }

    return null;
}

function getSceneName(id){

    const names = {

        living: "Living",

        bano: "Baño",

        habitacion1: "Habitación",

        cocina: "Cocina"

    };

    return names[id] || id;

}

function navigationLoop(){

    updateNavigationIndicator();

    requestAnimationFrame(navigationLoop);
}

navigationLoop();
//======================================================
// LOADER
//======================================================

window.addEventListener("load", () => {

    setTimeout(() => {

        loader.classList.add("hidden");

    }, 400);

});

//======================================================
// AUTOROTACIÓN
//======================================================

const autorotate = Marzipano.autorotate({

    yawSpeed: 0.03,

    targetPitch: 0,

    targetFov: Math.PI / 1

});

let autoEnabled = true;

viewer.setIdleMovement(
    2500,
    autorotate
);

viewer.startMovement(autorotate);

//======================================================
// BOTÓN AUTOROTACIÓN
//======================================================

btnAutorotate.addEventListener("click", () => {

    if (autoEnabled) {

        viewer.stopMovement();
        viewer.setIdleMovement(Infinity);

        btnAutorotate.innerHTML = "Girar";

        autoEnabled = false;

    } else {

        viewer.startMovement(autorotate);
        viewer.setIdleMovement(2500, autorotate);

        btnAutorotate.innerHTML = "Detener";

        autoEnabled = true;

    }

});

//======================================================
// FULLSCREEN
//======================================================

btnFullscreen.addEventListener("click", () => {

    if (!document.fullscreenElement) {

        document.documentElement.requestFullscreen();

    } else {

        document.exitFullscreen();

    }

});

//======================================================
// DOBLE CLICK PARA CENTRAR
//======================================================

panoElement.addEventListener("dblclick", () => {

    currentScene.lookTo(
        {
            yaw: 0,
            pitch: 0,
            fov: Math.PI / 2
        },
        {
            transitionDuration: 1000
        }
    );

});

//======================================================
// DEBUG
//======================================================

window.viewer = viewer;
window.scenes = scenes;
window.tour = tour;