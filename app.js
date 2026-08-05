//   Panorama Viewer v1.0

//======================================================
// ELEMENTOS
//======================================================

const panoElement = document.getElementById("pano");
const loader = document.getElementById("loader");
const btnAutorotate = document.getElementById("btnAutorotate");
const btnFullscreen = document.getElementById("btnFullscreen");
const volverBtn = document.getElementById("volverBtn");

volverBtn.addEventListener("click", () => {
    window.location.href = "index.html";
});

//======================================================
// VISOR
//======================================================

const viewer = new Marzipano.Viewer(panoElement, {
    controls: {
        mouseViewMode: "drag"
    }
});

//======================================================
// GEOMETRÍA
//======================================================

const geometry = new Marzipano.EquirectGeometry([
    {
        width: 4000
    }
]);

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

        image: "panoramas/Panorama(2).jpg",

        hotspots: [

            {
                target: "bano",
                yaw: -1.1,
                pitch: -0.10
            },
            {
                target: "habitacion1",
                yaw: -0.5,
                pitch: -0.05
            },
            {
                target: "cocina",
                yaw: -2.1,
                pitch: -0.05
            }
        ]

    },

    bano: {

        image: "panoramas/Panoramabaño1.jpg",

        hotspots: [

            {
                target: "living",
                yaw: 1.5,
                pitch: -0.15
            }

        ]

    },

    habitacion1: {

        image: "panoramas/Panorama(3).jpg",

        hotspots: [

            {
                target: "living",
                yaw: 4,
                pitch: -0.15
            }

        ]

    },

    cocina: {

        image: "panoramas/Panorama(4).jpg",
        hotspots: [

            {
                target: "living",
                yaw: 2.5,
                pitch: -0.15
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
            fov: Math.PI / 1
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

currentScene.switchTo();

function changeScene(id) {

    currentScene = scenes[id];

    currentScene.switchTo({
        transitionDuration: 1000
    });

}

//======================================================
// CREAR HOTSPOTS
//======================================================

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

    });

}

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