document.addEventListener("DOMContentLoaded", () => {

    const $ = (selector) => document.querySelector(selector);

    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("id");

    if (!projectId) {
        console.error("Falta el parámetro ?id=proyectoX");
        return;
    }

    let project = null;
    let plants = [];
    let currentPlant = 0;


    /* =====================================================
       CARGAR PROYECTO
    ===================================================== */

    async function loadProject() {

        try {

            const response = await fetch("proyectos.json");

            if (!response.ok) {
                throw new Error(`Error HTTP ${response.status}`);
            }

            const data = await response.json();

            // Permite tanto:
            // [ {...}, {...} ]
            // como:
            // { "proyectos": [ {...}, {...} ] }

            const projects = Array.isArray(data)
                ? data
                : data.proyectos;

            if (!Array.isArray(projects)) {
                throw new Error(
                    "proyectos.json no contiene un array válido."
                );
            }

            project = projects.find(
                item => item.id === projectId
            );

            if (!project) {
                throw new Error(
                    `No existe el proyecto "${projectId}".`
                );
            }

            renderProject();

        } catch (error) {

            console.error(error);

            document.body.innerHTML = `
                <main style="
                    min-height:100vh;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    padding:40px;
                    font-family:Arial,sans-serif;
                ">
                    <div>
                        <p style="margin-bottom:10px;">ERROR</p>
                        <h1>No se pudo cargar el proyecto.</h1>
                        <p style="margin-top:10px;">
                            ${error.message}
                        </p>
                    </div>
                </main>
            `;
        }
    }


    /* =====================================================
       PRESENTACIÓN
    ===================================================== */

    function renderProject() {

        document.title =
            `${project.titulo || "Proyecto"} | Arquitectura`;

        $("#navProjectTitle").textContent =
            project.titulo || "PROYECTO";

        $("#navProjectId").textContent =
            project.id || "—";

        $("#projectTitle").textContent =
            project.titulo || "Sin título";

        $("#presentationSubtitle").textContent =
            project.subtitulo || "";

        $("#presentationText").innerHTML =
            formatText(
                project.presentacion?.texto ||
                project.descripcion ||
                ""
            );

        $("#projectYear").textContent =
            project.anio || "—";

        $("#projectLocation").textContent =
            project.ubicacion || "—";

        $("#projectProgram").textContent =
            project.programa || "—";

        $("#projectArea").textContent =
            project.superficie || "—";


        /* =================================================
           IMAGEN PRINCIPAL
        ================================================= */

        const image = $("#presentationImage");

        const imagePath =
            project.presentacion?.imagen ||
            project.imagenPrincipal ||
            "";

        if (imagePath) {

            image.src = imagePath;

            image.alt =
                project.titulo || "Proyecto";

        } else {

            image.closest(
                ".presentation-image-wrap"
            ).style.display = "none";
        }


        /* =================================================
           GIF
        ================================================= */

        const gif = $("#presentationGif");

        const gifPath =
            project.presentacion?.gif || "";

        if (gifPath) {

            gif.src = gifPath;

            gif.alt =
                `${project.titulo || "Proyecto"} - animación`;

        } else {

            $("#presentationGifWrap").style.display =
                "none";
        }


        renderPlants();
        renderCut();
    }


    function formatText(text) {

        return String(text)
            .replace(/\n{2,}/g, "<br><br>")
            .replace(/\n/g, "<br>");
    }


    /* =====================================================
       PLANTAS
    ===================================================== */

    function renderPlants() {

        plants = project.plantas || [];

        const section =
            $(".project-plans");

        if (!plants.length) {

            section.style.display = "none";

            return;
        }

        const tabs =
            $("#floorTabs");

        tabs.innerHTML = "";

        plants.forEach((plant, index) => {

            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "floor-tab";

            button.textContent =
                plant.nombre ||
                `Planta ${index + 1}`;

            button.addEventListener(
                "click",
                () => showPlant(index)
            );

            tabs.appendChild(button);
        });

        showPlant(0);


        /* ================================================
           PLANTA ANTERIOR
        ================================================= */

        $("#planPrev").addEventListener(
            "click",
            () => {

                const previous =
                    (currentPlant - 1 + plants.length)
                    % plants.length;

                showPlant(previous);
            }
        );


        /* ================================================
           PLANTA SIGUIENTE
        ================================================= */

        $("#planNext").addEventListener(
            "click",
            () => {

                const next =
                    (currentPlant + 1)
                    % plants.length;

                showPlant(next);
            }
        );
    }


    function showPlant(index) {

        const plant =
            plants[index];

        if (!plant) return;

        currentPlant = index;

        const image =
            $("#floorPlan");

        image.classList.remove("visible");

        setTimeout(() => {

            image.onload = () => {
                image.classList.add("visible");
            };

            image.src =
                plant.imagen || "";

            image.alt =
                plant.nombre ||
                `Planta ${index + 1}`;

        }, 100);


        $("#floorLabel").textContent =
            plant.nombre ||
            `Planta ${index + 1}`;

        $("#floorDescription").textContent =
            plant.descripcion || "";

        $("#floorScale").textContent =
            plant.escala
                ? `ESC. ${plant.escala}`
                : "";

        $("#planCounter").textContent =
            `${String(index + 1).padStart(2, "0")} / ${String(plants.length).padStart(2, "0")}`;


        document
            .querySelectorAll(".floor-tab")
            .forEach((tab, i) => {

                tab.classList.toggle(
                    "active",
                    i === index
                );
            });
    }


    /* =====================================================
       CORTE INTERACTIVO
    ===================================================== */

    function renderCut() {

        const cut =
            project.corte;

        const section =
            $(".project-cut");

        if (!cut || !cut.imagen) {

            section.style.display =
                "none";

            return;
        }

        const image =
            $("#cutImage");

        image.src =
            cut.imagen;

        image.alt =
            `Corte de ${project.titulo || "proyecto"}`;

        $("#cutDescription").textContent =
            cut.descripcion || "";

        createHotspots(
            cut.hotspots || []
        );

        initCutControls();
    }


    /* =====================================================
       HOTSPOTS
    ===================================================== */

    function createHotspots(points) {

        const container =
            $("#cutHotspots");

        container.innerHTML = "";

        points.forEach(point => {

            const hotspot =
                document.createElement("button");

            hotspot.type = "button";

            hotspot.className =
                "cut-hotspot";

            hotspot.style.left =
                `${point.x}%`;

            hotspot.style.top =
                `${point.y}%`;

            hotspot.setAttribute(
                "aria-label",
                point.titulo || "Información"
            );


            const tooltip =
                document.createElement("div");

            tooltip.className =
                "cut-tooltip";

            tooltip.innerHTML = `
                <strong>
                    ${point.titulo || ""}
                </strong>

                <span>
                    ${point.texto || ""}
                </span>
            `;

            hotspot.appendChild(
                tooltip
            );


            hotspot.addEventListener(
                "click",
                (event) => {

                    event.stopPropagation();

                    document
                        .querySelectorAll(
                            ".cut-hotspot"
                        )
                        .forEach(item => {
                            item.classList.remove(
                                "active"
                            );
                        });

                    hotspot.classList.add(
                        "active"
                    );
                }
            );


            container.appendChild(
                hotspot
            );
        });
    }


    /* =====================================================
       ZOOM + DRAG DEL CORTE
    ===================================================== */

    function initCutControls() {

        const viewer =
            $("#cutViewer");

        const canvas =
            $("#cutCanvas");

        let scale = 1;

        let offsetX = 0;
        let offsetY = 0;

        let dragging = false;

        let startX = 0;
        let startY = 0;

        const minScale = 1;
        const maxScale = 4;


        /* ================================================
           ACTUALIZAR TRANSFORMACIÓN
        ================================================= */

        function updateTransform() {

            canvas.style.transform =
                `translate(
                    calc(-50% + ${offsetX}px),
                    calc(-50% + ${offsetY}px)
                )
                scale(${scale})`;

            $("#zoomReset").textContent =
                `${Math.round(scale * 100)}%`;
        }


        /* ================================================
           RESET
        ================================================= */

        function resetView() {

            scale = 1;

            offsetX = 0;
            offsetY = 0;

            updateTransform();
        }


        /* ================================================
           ZOOM +
        ================================================= */

        $("#zoomIn").addEventListener(
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


        /* ================================================
           ZOOM -
        ================================================= */

        $("#zoomOut").addEventListener(
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


        /* ================================================
           BOTÓN RESET
        ================================================= */

        $("#zoomReset").addEventListener(
            "click",
            resetView
        );


        /* ================================================
           SCROLL PARA ZOOM
        ================================================= */

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


        /* ================================================
           COMENZAR DRAG
        ================================================= */

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


        /* ================================================
           MOVER
        ================================================= */

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


        /* ================================================
           TERMINAR DRAG
        ================================================= */

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


        /* ================================================
           DOBLE CLICK
        ================================================= */

        viewer.addEventListener(
            "dblclick",
            () => {

                if (scale === 1) {

                    scale = 2;

                } else {

                    resetView();

                    return;
                }

                updateTransform();
            }
        );


        /* ================================================
           EVITAR DRAG DESDE HOTSPOTS
        ================================================= */

        $("#cutHotspots").addEventListener(
            "pointerdown",
            event => {
                event.stopPropagation();
            }
        );


        updateTransform();
    }


    /* =====================================================
       NAV
    ===================================================== */

    const nav =
        $("#projectNav");

    let lastScroll = 0;


    window.addEventListener(
        "scroll",
        () => {

            const currentScroll =
                window.scrollY;


            /* Fondo */

            if (currentScroll > 50) {

                nav.classList.add(
                    "scrolled"
                );

            } else {

                nav.classList.remove(
                    "scrolled"
                );
            }


            /* Ocultar al bajar */

            if (
                currentScroll > lastScroll &&
                currentScroll > 150
            ) {

                nav.classList.add(
                    "hide"
                );

            } else {

                nav.classList.remove(
                    "hide"
                );
            }


            lastScroll =
                currentScroll;
        }
    );


    /* Mostrar nav al llevar mouse arriba */

    document.addEventListener(
        "mousemove",
        event => {

            if (
                event.clientY < 80 &&
                window.scrollY > 150
            ) {

                nav.classList.remove(
                    "hide"
                );
            }
        }
    );


    /* =====================================================
       INICIAR
    ===================================================== */

    loadProject();

});