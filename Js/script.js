

const slides = document.querySelectorAll(".slide");

if (slides.length > 0) {

    let index = 0;

    function changeSlide() {
        slides[index].classList.remove("active");
        index = (index + 1) % slides.length;
        slides[index].classList.add("active");
    }

    setInterval(changeSlide, 4000);
}


// NAV SCROLL EFFECT
const nav = document.querySelector("nav");
let lastScroll = 0;

window.addEventListener("scroll", () => {

    const currentScroll = window.pageYOffset;

    // Cambia fondo cuando bajás
    if (currentScroll > 50) {
        nav.classList.add("scrolled");
    } else {
        nav.classList.remove("scrolled");
    }

    // Oculta cuando bajás, muestra cuando subís
    if (currentScroll > lastScroll && currentScroll > 150) {
        nav.classList.add("hide");
    } else {
        nav.classList.remove("hide");
    }

    lastScroll = currentScroll;
});

document.addEventListener("mousemove", (e) => {
    if (e.clientY < 70 && window.scrollY > 150) {
        nav.classList.remove("hide");
    }
});

// HABILIDADES //

const circles = document.querySelectorAll(".circle");

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {

            const circle = entry.target;
            const percent = parseInt(circle.getAttribute("data-percent"));
            const span = circle.querySelector("span");

            let current = 0;

            // Color dinámico según porcentaje
            function getColor(value) {
                if (value >= 85) return "#111";        // alto - negro
                if (value >= 70) return "#444";        // medio - gris oscuro
                if (value >= 50) return "#777";        // medio bajo - gris
                return "#aaa";                         // bajo - gris claro
            }

            const interval = setInterval(() => {

                if (current >= percent) {
                    clearInterval(interval);
                } else {
                    current++;

                    const color = getColor(percent);

                    circle.style.background =
                        `conic-gradient(${color} ${current * 3.6}deg, #ddd 0deg)`;

                    span.textContent = current + "%";
                }

            }, 15);

            observer.unobserve(circle);
        }
    });
}, { threshold: 0.2 });

circles.forEach(circle => {
    observer.observe(circle);
});

// PROYECTOS //




document.addEventListener("DOMContentLoaded", () => {
  cargarProyecto();
});

async function cargarProyecto() {
  try {
    const response = await fetch("proyectos.json");
    if (!response.ok) throw new Error("No se pudo cargar proyectos.json");

    const proyectos = await response.json();

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const proyecto = proyectos.find(p => p.id === id);

    if (!proyecto) {
      console.warn("Proyecto no encontrado");
      return;
    }

    // =========================
    // RENDER INFO PRINCIPAL
    // =========================

    document.getElementById("titulo").textContent = proyecto.titulo;
    document.getElementById("subtitulo").textContent = proyecto.subtitulo;
    document.getElementById("descripcion").innerHTML =
        proyecto.descripcion.replace(/\n/g, "<br>");
    document.getElementById("imagen-principal").src = proyecto.imagenPrincipal;
    document.getElementById("anio").textContent = proyecto.anio;
    document.getElementById("ubicacion").textContent = proyecto.ubicacion;
    document.getElementById("programa").textContent = proyecto.programa;
    document.getElementById("superficie").textContent = proyecto.superficie;

    // =========================
    // GENERAR GALERÍA
    // =========================

    const galeria = document.getElementById("galeria");
    galeria.innerHTML = "";

    proyecto.galeria.forEach(src => {
      const img = document.createElement("img");
      img.src = src;
      img.loading = "lazy";
      galeria.appendChild(img);
    });

    // Inicializar lightbox después de crear imágenes
    initLightbox();

  } catch (error) {
    console.error("Error cargando proyecto:", error);
  }
}


// ========================================
// LIGHTBOX PROFESIONAL
// ========================================

function initLightbox() {

  const images = document.querySelectorAll("#galeria img");
  if (!images.length) return;

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeBtn = document.querySelector(".lightbox-close");
  const nextBtn = document.querySelector(".next");
  const prevBtn = document.querySelector(".prev");
  const currentSpan = document.getElementById("current");
  const totalSpan = document.getElementById("total");

  let currentIndex = 0;

  totalSpan.textContent = images.length;

  function openLightbox(index) {
    currentIndex = index;
    lightboxImg.src = images[currentIndex].src;
    currentSpan.textContent = currentIndex + 1;
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "auto";
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    openLightbox(currentIndex);
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    openLightbox(currentIndex);
  }

  // Click imágenes
  images.forEach((img, index) => {
    img.addEventListener("click", () => openLightbox(index));
  });

  // Botones
  nextBtn?.addEventListener("click", showNext);
  prevBtn?.addEventListener("click", showPrev);
  closeBtn?.addEventListener("click", closeLightbox);

  // Click fondo
  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Teclado
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;

    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
    if (e.key === "Escape") closeLightbox();
  });

  // Swipe móvil
  let startX = 0;

  lightbox.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  lightbox.addEventListener("touchend", (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (diff > 50) showNext();
    if (diff < -50) showPrev();
  });
}