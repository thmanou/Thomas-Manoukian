// ======================================================
// SCRIPT GENERAL — PORTFOLIO + PROYECTO
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    // ==================================================
    // SLIDER
    // ==================================================

    const slides = document.querySelectorAll(".slide");

    if (slides.length > 0) {

        let index = 0;

        slides[0].classList.add("active");

        function changeSlide() {

            slides[index].classList.remove("active");

            index = (index + 1) % slides.length;

            slides[index].classList.add("active");
        }

        setInterval(changeSlide, 4000);
    }


    // ==================================================
    // NAV SCROLL EFFECT
    // ==================================================

    const nav = document.querySelector("nav");

    if (nav) {

        let lastScroll = 0;

        window.addEventListener("scroll", () => {

            const currentScroll = window.pageYOffset;

            // Cambia fondo cuando bajás
            if (currentScroll > 50) {
                nav.classList.add("scrolled");
            } else {
                nav.classList.remove("scrolled");
            }

            // Oculta cuando bajás
            // Muestra cuando subís
            if (
                currentScroll > lastScroll &&
                currentScroll > 150
            ) {
                nav.classList.add("hide");
            } else {
                nav.classList.remove("hide");
            }

            lastScroll = currentScroll;
        });


        // Mostrar nav al llevar el mouse arriba
        document.addEventListener("mousemove", (e) => {

            if (
                e.clientY < 70 &&
                window.scrollY > 150
            ) {
                nav.classList.remove("hide");
            }

        });
    }


    // ==================================================
    // HABILIDADES
    // ==================================================

    const circles =
        document.querySelectorAll(".circle");

    if (circles.length > 0) {

        const observer =
            new IntersectionObserver(entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) return;

                    const circle =
                        entry.target;

                    const percent =
                        parseInt(
                            circle.getAttribute(
                                "data-percent"
                            )
                        );

                    const span =
                        circle.querySelector("span");

                    let current = 0;


                    // Color según porcentaje
                    function getColor(value) {

                        if (value >= 85)
                            return "#111";

                        if (value >= 70)
                            return "#444";

                        if (value >= 50)
                            return "#777";

                        return "#aaa";
                    }


                    const interval =
                        setInterval(() => {

                            if (current >= percent) {

                                clearInterval(
                                    interval
                                );

                            } else {

                                current++;

                                const color =
                                    getColor(percent);

                                circle.style.background =
                                    `conic-gradient(
                                        ${color}
                                        ${current * 3.6}deg,
                                        #ddd 0deg
                                    )`;

                                span.textContent =
                                    current + "%";
                            }

                        }, 15);


                    observer.unobserve(circle);
                });

            }, {
                threshold: 0.2
            });


        circles.forEach(circle => {
            observer.observe(circle);
        });
    }


    // ==================================================
    // CARGAR PROYECTO
    // ==================================================

    cargarProyecto();

});


// ======================================================
// PROYECTO
// ======================================================

async function cargarProyecto() {

    try {

        const response =
            await fetch("proyectos.json");

        if (!response.ok) {
            throw new Error(
                "No se pudo cargar proyectos.json"
            );
        }


        const data =
            await response.json();


        // Permite trabajar tanto con:
        //
        // [
        //   {...},
        //   {...}
        // ]
        //
        // como con:
        //
        // {
        //   "proyectos": [...]
        // }

        const proyectos =
            Array.isArray(data)
                ? data
                : data.proyectos;


        if (!Array.isArray(proyectos)) {

            throw new Error(
                "proyectos.json no contiene proyectos válidos"
            );
        }


        // ==================================================
        // OBTENER ID DE LA URL
        // ==================================================

        const params =
            new URLSearchParams(
                window.location.search
            );

        const id =
            params.get("id");


        if (!id) {

            console.warn(
                "No se encontró ?id= en la URL"
            );

            return;
        }


        // ==================================================
        // BUSCAR PROYECTO
        // ==================================================

        const proyecto =
            proyectos.find(
                p => p.id === id
            );


        if (!proyecto) {

            console.warn(
                "Proyecto no encontrado:",
                id
            );

            return;
        }


        console.log(
            "Proyecto cargado:",
            proyecto
        );


        // ==================================================
        // INFORMACIÓN GENERAL
        // ==================================================

        setText(
            "titulo",
            proyecto.titulo
        );

        setText(
            "subtitulo",
            proyecto.subtitulo
        );

        setText(
            "descripcion",
            proyecto.descripcion
        );


        setText(
            "anio",
            proyecto.anio
        );

        setText(
            "ubicacion",
            proyecto.ubicacion
        );

        setText(
            "programa",
            proyecto.programa
        );

        setText(
            "superficie",
            proyecto.superficie
        );


        // ==================================================
        // IMAGEN PRINCIPAL
        // ==================================================

        const imagenPrincipal =
            document.getElementById(
                "imagen-principal"
            );

        if (
            imagenPrincipal &&
            proyecto.imagenPrincipal
        ) {

            imagenPrincipal.src =
                proyecto.imagenPrincipal;

            imagenPrincipal.alt =
                proyecto.titulo || "Proyecto";
        }


        // ==================================================
        // NUEVA PÁGINA DE DOCUMENTACIÓN
        // ==================================================

        cargarPresentacion(
            proyecto
        );

        cargarPlantas(
            proyecto
        );

        cargarCorte(
            proyecto
        );


        // ==================================================
        // GALERÍA
        // ==================================================

        cargarGaleria(
            proyecto
        );


        // ==================================================
        // CAMBIAR TITLE DEL NAVEGADOR
        // ==================================================

        if (proyecto.titulo) {

            document.title =
                `${proyecto.titulo} | Arquitectura`;
        }


    } catch (error) {

        console.error(
            "Error cargando proyecto:",
            error
        );
    }
}


// ======================================================
// FUNCIÓN AUXILIAR PARA TEXTOS
// ======================================================

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (!element) return;

    element.textContent =
        value || "";
}


// ======================================================
// PRESENTACIÓN
// ======================================================

function cargarPresentacion(proyecto) {

    // --------------------------------------------------
    // TÍTULO
    // --------------------------------------------------

    setText(
        "projectTitle",
        proyecto.titulo
    );


    // --------------------------------------------------
    // SUBTÍTULO
    // --------------------------------------------------

    setText(
        "presentationSubtitle",
        proyecto.subtitulo
    );


    // --------------------------------------------------
    // DESCRIPCIÓN
    // --------------------------------------------------

    const text =
        document.getElementById(
            "presentationText"
        );

    if (text) {

        text.textContent =
            proyecto.presentacion?.texto ||
            proyecto.descripcion ||
            "";
    }


    // --------------------------------------------------
    // DATOS
    // --------------------------------------------------

    setText(
        "projectYear",
        proyecto.anio
    );

    setText(
        "projectLocation",
        proyecto.ubicacion
    );

    setText(
        "projectProgram",
        proyecto.programa
    );

    setText(
        "projectArea",
        proyecto.superficie
    );


    // --------------------------------------------------
    // NAV
    // --------------------------------------------------

    setText(
        "navProjectTitle",
        proyecto.titulo
    );

    setText(
        "navProjectId",
        proyecto.id
    );


    // --------------------------------------------------
    // IMAGEN
    // --------------------------------------------------

    const image =
        document.getElementById(
            "presentationImage"
        );

    if (
        image &&
        (
            proyecto.presentacion?.imagen ||
            proyecto.imagenPrincipal
        )
    ) {

        image.src =
            proyecto.presentacion?.imagen ||
            proyecto.imagenPrincipal;

        image.alt =
            proyecto.titulo || "Proyecto";
    }


    // --------------------------------------------------
    // GIF / ANIMACIÓN
    // --------------------------------------------------

    const gif =
        document.getElementById(
            "presentationGif"
        );

    const gifWrap =
        document.getElementById(
            "presentationGifWrap"
        );


    if (
        gif &&
        proyecto.presentacion?.gif
    ) {

        gif.src =
            proyecto.presentacion.gif;

        gif.alt =
            `${proyecto.titulo || "Proyecto"} - animación`;

    } else if (gifWrap) {

        gifWrap.style.display =
            "none";
    }
}


// ======================================================
// PLANTAS
// ======================================================

function cargarPlantas(proyecto) {

    const section =
        document.querySelector(
            ".project-plans"
        );


    const tabs =
        document.getElementById(
            "floorTabs"
        );


    const image =
        document.getElementById(
            "floorPlan"
        );


    if (
        !section ||
        !tabs ||
        !image
    ) {
        return;
    }


    const plantas =
        proyecto.plantas || [];


    // --------------------------------------------------
    // SI NO HAY PLANTAS
    // --------------------------------------------------

    if (!plantas.length) {

        section.style.display =
            "none";

        return;
    }


    // --------------------------------------------------
    // VARIABLES
    // --------------------------------------------------

    let currentPlant = 0;


    // --------------------------------------------------
    // CREAR BOTONES
    // --------------------------------------------------

    tabs.innerHTML = "";


    plantas.forEach(
        (planta, index) => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "floor-tab";


            button.textContent =
                planta.nombre ||
                `Planta ${index + 1}`;


            button.addEventListener(
                "click",
                () => {
                    mostrarPlanta(
                        index
                    );
                }
            );


            tabs.appendChild(
                button
            );
        }
    );


    // --------------------------------------------------
    // MOSTRAR PLANTA
    // --------------------------------------------------

    function mostrarPlanta(index) {

        const planta =
            plantas[index];


        if (!planta) return;


        currentPlant =
            index;


        // Imagen

        image.classList.remove(
            "visible"
        );


        image.onload = () => {

            image.classList.add(
                "visible"
            );
        };


        image.src =
            planta.imagen || "";


        image.alt =
            planta.nombre ||
            `Planta ${index + 1}`;


        // Nombre

        setText(
            "floorLabel",
            planta.nombre ||
            `Planta ${index + 1}`
        );


        // Descripción

        setText(
            "floorDescription",
            planta.descripcion
        );


        // Escala

        const scale =
            document.getElementById(
                "floorScale"
            );


        if (scale) {

            scale.textContent =
                planta.escala
                    ? `ESC. ${planta.escala}`
                    : "";
        }


        // Contador

        setText(
            "planCounter",
            `${String(index + 1).padStart(2, "0")} / ${String(plantas.length).padStart(2, "0")}`
        );


        // Estado de botones

        document
            .querySelectorAll(
                ".floor-tab"
            )
            .forEach(
                (tab, i) => {

                    tab.classList.toggle(
                        "active",
                        i === index
                    );
                }
            );
    }


    // --------------------------------------------------
    // FLECHA ANTERIOR
    // --------------------------------------------------

    const previous =
        document.getElementById(
            "planPrev"
        );


    previous?.addEventListener(
        "click",
        () => {

            const newIndex =
                (
                    currentPlant -
                    1 +
                    plantas.length
                ) %
                plantas.length;


            mostrarPlanta(
                newIndex
            );
        }
    );


    // --------------------------------------------------
    // FLECHA SIGUIENTE
    // --------------------------------------------------

    const next =
        document.getElementById(
            "planNext"
        );


    next?.addEventListener(
        "click",
        () => {

            const newIndex =
                (
                    currentPlant +
                    1
                ) %
                plantas.length;


            mostrarPlanta(
                newIndex
            );
        }
    );


    // Primera planta

    mostrarPlanta(0);
}


// ======================================================
// CORTE INTERACTIVO
// ======================================================

function cargarCorte(proyecto) {

    const section =
        document.querySelector(
            ".project-cut"
        );


    const viewer =
        document.getElementById(
            "cutViewer"
        );


    const canvas =
        document.getElementById(
            "cutCanvas"
        );


    const image =
        document.getElementById(
            "cutImage"
        );


    if (
        !section ||
        !viewer ||
        !canvas ||
        !image
    ) {
        return;
    }


    const corte =
        proyecto.corte;


    // --------------------------------------------------
    // SI NO HAY CORTE
    // --------------------------------------------------

    if (
        !corte ||
        !corte.imagen
    ) {

        section.style.display =
            "none";

        return;
    }


    // --------------------------------------------------
    // IMAGEN
    // --------------------------------------------------

    image.src =
        corte.imagen;


    image.alt =
        `Corte de ${
            proyecto.titulo ||
            "proyecto"
        }`;


    setText(
        "cutDescription",
        corte.descripcion
    );


    // --------------------------------------------------
    // HOTSPOTS
    // --------------------------------------------------

    crearHotspots(
        corte.hotspots || []
    );


    // --------------------------------------------------
    // CONTROLES
    // --------------------------------------------------

    inicializarZoomCorte();
}


// ======================================================
// HOTSPOTS DEL CORTE
// ======================================================

function crearHotspots(points) {

    const container =
        document.getElementById(
            "cutHotspots"
        );


    if (!container) return;


    container.innerHTML = "";


    points.forEach(
        point => {

            const hotspot =
                document.createElement(
                    "button"
                );


            hotspot.type =
                "button";


            hotspot.className =
                "cut-hotspot";


            hotspot.style.left =
                `${point.x}%`;


            hotspot.style.top =
                `${point.y}%`;


            hotspot.setAttribute(
                "aria-label",
                point.titulo ||
                "Información"
            );


            // Tooltip

            const tooltip =
                document.createElement(
                    "div"
                );


            tooltip.className =
                "cut-tooltip";


            const title =
                document.createElement(
                    "strong"
                );


            title.textContent =
                point.titulo || "";


            const description =
                document.createElement(
                    "span"
                );


            description.textContent =
                point.texto || "";


            tooltip.appendChild(
                title
            );


            tooltip.appendChild(
                description
            );


            hotspot.appendChild(
                tooltip
            );


            // Click

            hotspot.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    document
                        .querySelectorAll(
                            ".cut-hotspot"
                        )
                        .forEach(
                            item => {

                                item.classList.remove(
                                    "active"
                                );
                            }
                        );


                    hotspot.classList.add(
                        "active"
                    );
                }
            );


            container.appendChild(
                hotspot
            );
        }
    );
}


// ======================================================
// ZOOM + PAN DEL CORTE
// ======================================================

function inicializarZoomCorte() {

    const viewer =
        document.getElementById(
            "cutViewer"
        );


    const canvas =
        document.getElementById(
            "cutCanvas"
        );


    if (!viewer || !canvas) {
        return;
    }


    let scale = 1;

    let offsetX = 0;
    let offsetY = 0;

    let dragging = false;

    let startX = 0;
    let startY = 0;


    const minScale = 1;
    const maxScale = 4;


    // --------------------------------------------------
    // ACTUALIZAR
    // --------------------------------------------------

    function updateTransform() {

        canvas.style.transform =
            `translate(
                calc(-50% + ${offsetX}px),
                calc(-50% + ${offsetY}px)
            )
            scale(${scale})`;


        const reset =
            document.getElementById(
                "zoomReset"
            );


        if (reset) {

            reset.textContent =
                `${Math.round(
                    scale * 100
                )}%`;
        }
    }


    // --------------------------------------------------
    // RESET
    // --------------------------------------------------

    function resetView() {

        scale = 1;

        offsetX = 0;
        offsetY = 0;

        updateTransform();
    }


    // --------------------------------------------------
    // ZOOM +
    // --------------------------------------------------

    const zoomIn =
        document.getElementById(
            "zoomIn"
        );


    zoomIn?.addEventListener(
        "click",
        () => {

            scale =
                Math.min(
                    maxScale,
                    scale + 0.25
                );

            updateTransform();
        }
    );


    // --------------------------------------------------
    // ZOOM -
    // --------------------------------------------------

    const zoomOut =
        document.getElementById(
            "zoomOut"
        );


    zoomOut?.addEventListener(
        "click",
        () => {

            scale =
                Math.max(
                    minScale,
                    scale - 0.25
                );


            if (scale === 1) {

                offsetX = 0;
                offsetY = 0;
            }


            updateTransform();
        }
    );


    // --------------------------------------------------
    // RESET
    // --------------------------------------------------

    const zoomReset =
        document.getElementById(
            "zoomReset"
        );


    zoomReset?.addEventListener(
        "click",
        resetView
    );


    // --------------------------------------------------
    // SCROLL
    // --------------------------------------------------

    viewer.addEventListener(
        "wheel",
        event => {

            event.preventDefault();


            if (event.deltaY < 0) {

                scale =
                    Math.min(
                        maxScale,
                        scale + 0.15
                    );

            } else {

                scale =
                    Math.max(
                        minScale,
                        scale - 0.15
                    );
            }


            if (scale === 1) {

                offsetX = 0;
                offsetY = 0;
            }


            updateTransform();

        },
        {
            passive: false
        }
    );


    // --------------------------------------------------
    // DRAG
    // --------------------------------------------------

    viewer.addEventListener(
        "pointerdown",
        event => {

            if (scale <= 1)
                return;


            dragging = true;


            viewer.classList.add(
                "dragging"
            );


            startX =
                event.clientX -
                offsetX;


            startY =
                event.clientY -
                offsetY;


            viewer.setPointerCapture(
                event.pointerId
            );
        }
    );


    viewer.addEventListener(
        "pointermove",
        event => {

            if (!dragging)
                return;


            offsetX =
                event.clientX -
                startX;


            offsetY =
                event.clientY -
                startY;


            updateTransform();
        }
    );


    function stopDrag(event) {

        dragging = false;


        viewer.classList.remove(
            "dragging"
        );


        try {

            viewer.releasePointerCapture(
                event.pointerId
            );

        } catch {}
    }


    viewer.addEventListener(
        "pointerup",
        stopDrag
    );


    viewer.addEventListener(
        "pointercancel",
        stopDrag
    );


    // --------------------------------------------------
    // DOBLE CLICK
    // --------------------------------------------------

    viewer.addEventListener(
        "dblclick",
        () => {

            if (scale === 1) {

                scale = 2;

                updateTransform();

            } else {

                resetView();
            }
        }
    );


    // Evitar que los hotspots
    // activen el drag

    const hotspots =
        document.getElementById(
            "cutHotspots"
        );


    hotspots?.addEventListener(
        "pointerdown",
        event => {

            event.stopPropagation();
        }
    );


    updateTransform();
}


// ======================================================
// GALERÍA
// ======================================================

function cargarGaleria(proyecto) {

    const galeria =
        document.getElementById(
            "galeria"
        );


    if (!galeria) return;


    galeria.innerHTML = "";


    if (
        !proyecto.galeria ||
        !proyecto.galeria.length
    ) {
        return;
    }


    proyecto.galeria.forEach(
        src => {

            const img =
                document.createElement(
                    "img"
                );


            img.src =
                src;


            img.loading =
                "lazy";


            galeria.appendChild(
                img
            );
        }
    );


    // Inicializar lightbox

    initLightbox();
}


// ======================================================
// LIGHTBOX
// ======================================================

function initLightbox() {

    const images =
        document.querySelectorAll(
            "#galeria img"
        );


    if (!images.length)
        return;


    const lightbox =
        document.getElementById(
            "lightbox"
        );


    const lightboxImg =
        document.getElementById(
            "lightbox-img"
        );


    const closeBtn =
        document.querySelector(
            ".lightbox-close"
        );


    const nextBtn =
        document.querySelector(
            ".next"
        );


    const prevBtn =
        document.querySelector(
            ".prev"
        );


    const currentSpan =
        document.getElementById(
            "current"
        );


    const totalSpan =
        document.getElementById(
            "total"
        );


    if (!lightbox)
        return;


    let currentIndex = 0;


    totalSpan.textContent =
        images.length;


    // --------------------------------------------------
    // ABRIR
    // --------------------------------------------------

    function openLightbox(index) {

        currentIndex =
            index;


        lightboxImg.src =
            images[currentIndex].src;


        currentSpan.textContent =
            currentIndex + 1;


        lightbox.classList.add(
            "active"
        );


        document.body.style.overflow =
            "hidden";
    }


    // --------------------------------------------------
    // CERRAR
    // --------------------------------------------------

    function closeLightbox() {

        lightbox.classList.remove(
            "active"
        );


        document.body.style.overflow =
            "auto";
    }


    // --------------------------------------------------
    // SIGUIENTE
    // --------------------------------------------------

    function showNext() {

        currentIndex =
            (
                currentIndex + 1
            ) %
            images.length;


        openLightbox(
            currentIndex
        );
    }


    // --------------------------------------------------
    // ANTERIOR
    // --------------------------------------------------

    function showPrev() {

        currentIndex =
            (
                currentIndex -
                1 +
                images.length
            ) %
            images.length;


        openLightbox(
            currentIndex
        );
    }


    // --------------------------------------------------
    // CLICK EN IMÁGENES
    // --------------------------------------------------

    images.forEach(
        (img, index) => {

            img.addEventListener(
                "click",
                () => {

                    openLightbox(
                        index
                    );
                }
            );
        }
    );


    // --------------------------------------------------
    // BOTONES
    // --------------------------------------------------

    nextBtn?.addEventListener(
        "click",
        showNext
    );


    prevBtn?.addEventListener(
        "click",
        showPrev
    );


    closeBtn?.addEventListener(
        "click",
        closeLightbox
    );


    // --------------------------------------------------
    // CLICK EN FONDO
    // --------------------------------------------------

    lightbox.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                lightbox
            ) {

                closeLightbox();
            }
        }
    );


    // --------------------------------------------------
    // TECLADO
    // --------------------------------------------------

    document.addEventListener(
        "keydown",
        event => {

            if (
                !lightbox.classList.contains(
                    "active"
                )
            ) {
                return;
            }


            if (
                event.key ===
                "ArrowRight"
            ) {

                showNext();
            }


            if (
                event.key ===
                "ArrowLeft"
            ) {

                showPrev();
            }


            if (
                event.key ===
                "Escape"
            ) {

                closeLightbox();
            }
        }
    );


    // --------------------------------------------------
    // SWIPE MÓVIL
    // --------------------------------------------------

    let startX = 0;


    lightbox.addEventListener(
        "touchstart",
        event => {

            startX =
                event.touches[0].clientX;
        }
    );


    lightbox.addEventListener(
        "touchend",
        event => {

            const endX =
                event.changedTouches[0]
                    .clientX;


            const diff =
                startX -
                endX;


            if (diff > 50) {

                showNext();
            }


            if (diff < -50) {

                showPrev();
            }
        }
    );
}