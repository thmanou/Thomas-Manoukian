/*======================================================
    HITO STUDIO
    Panorama Viewer v1.0
======================================================*/


//------------------------------------------------------
// ELEMENTOS
//------------------------------------------------------

const panoElement = document.getElementById("pano");

const loader = document.getElementById("loader");

const btnAutorotate = document.getElementById("btnAutorotate");

const btnFullscreen = document.getElementById("btnFullscreen");

const volverBtn = document.getElementById("volverBtn");

volverBtn.addEventListener("click", () => {
    window.location.href = "index.html";
});


//------------------------------------------------------
// VISOR
//------------------------------------------------------

const viewer = new Marzipano.Viewer(panoElement, {

    controls: {

        mouseViewMode: "drag"

    }

});


//------------------------------------------------------
// GEOMETRÍA
//------------------------------------------------------

const geometry = new Marzipano.EquirectGeometry([

    {

        width: 4000

    }

]);



//------------------------------------------------------
// IMAGEN
//------------------------------------------------------

const source = Marzipano.ImageUrlSource.fromString(

    "panoramas/Panoramabaño.jpg"

);



//------------------------------------------------------
// CÁMARA
//------------------------------------------------------

const limiter = Marzipano.RectilinearView.limit.traditional(

    4096,

    120 * Math.PI / 180

);

const view = new Marzipano.RectilinearView(

    {

        yaw: 0,

        pitch: 0,

        fov: Math.PI / 1 // 60°

    },

    limiter

);


//------------------------------------------------------
// ESCENA
//------------------------------------------------------

const scene = viewer.createScene({

    source,

    geometry,

    view,

    pinFirstLevel: true

});

scene.switchTo();



//------------------------------------------------------
// LOADER
//------------------------------------------------------

window.addEventListener("load", () => {

    setTimeout(() => {

        loader.classList.add("hidden");

    }, 400);

});



//------------------------------------------------------
// AUTOROTACIÓN
//------------------------------------------------------

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



//------------------------------------------------------
// BOTÓN AUTOROTACIÓN
//------------------------------------------------------

btnAutorotate.addEventListener("click", () => {

    if (autoEnabled) {

        viewer.stopMovement();

        viewer.setIdleMovement(Infinity);

        btnAutorotate.innerHTML = "Girar";

        autoEnabled = false;

    }

    else {

        viewer.startMovement(autorotate);

        viewer.setIdleMovement(2500, autorotate);

        btnAutorotate.innerHTML = "Detener";

        autoEnabled = true;

    }

});



//------------------------------------------------------
// FULLSCREEN
//------------------------------------------------------

btnFullscreen.addEventListener("click", () => {

    if (!document.fullscreenElement) {

        document.documentElement.requestFullscreen();

    }

    else {

        document.exitFullscreen();

    }

});



//------------------------------------------------------
// HOTSPOT
//------------------------------------------------------

const hotspotElement = document.createElement("div");

hotspotElement.className = "hotspot";

hotspotElement.innerHTML =

`

<div class="hotspot-dot"></div>

`;

hotspotElement.onclick = () => {

    alert(

`Revestimiento:

Porcelanato simil mármol

120x60 cm

Terminación mate.`

    );

};

scene.hotspotContainer().createHotspot(

    hotspotElement,

    {

        yaw: 1.1,

        pitch: -0.15

    }

);



//------------------------------------------------------
// DOBLE CLICK PARA CENTRAR
//------------------------------------------------------

panoElement.addEventListener("dblclick", () => {

    scene.lookTo(

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



//------------------------------------------------------
// EFECTO SUAVE
//------------------------------------------------------

viewer.startMovement(autorotate);



//------------------------------------------------------
// DEBUG
//------------------------------------------------------

window.viewer = viewer;

window.scene = scene;

window.view = view;