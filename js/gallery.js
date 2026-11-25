const IMAGE_BASE = "../images";

function altFromFilename(filename) {
  const name = filename.replace(/\.[^.]+$/, "");
  return name.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function imagesFromManifest(manifest, category) {
  const filenames = manifest[category] || [];
  return filenames.map((filename) => ({
    src: `${IMAGE_BASE}/${category}/${filename}`,
    alt: altFromFilename(filename),
  }));
}

function renderGallery(container, images) {
  if (images.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = images
    .map(
      (img) =>
        `<figure class="gallery-item"><img src="${img.src}" alt="${img.alt}" loading="lazy" /></figure>`
    )
    .join("");
}

function setupLightbox(gallery) {
  const overlay = document.createElement("div");
  overlay.className = "lightbox";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Image viewer");
  overlay.hidden = true;
  overlay.innerHTML = `
    <button class="lightbox-btn lightbox-close" type="button" aria-label="Close">&times;</button>
    <button class="lightbox-btn lightbox-prev" type="button" aria-label="Previous image">&#8249;</button>
    <img class="lightbox-img" alt="" />
    <button class="lightbox-btn lightbox-next" type="button" aria-label="Next image">&#8250;</button>
  `;
  document.body.appendChild(overlay);

  const lightboxImg = overlay.querySelector(".lightbox-img");
  let current = 0;

  const getImages = () => Array.from(gallery.querySelectorAll(".gallery-item img"));

  function show(index) {
    const images = getImages();
    if (images.length === 0) return;
    current = (index + images.length) % images.length;
    lightboxImg.src = images[current].currentSrc || images[current].src;
    lightboxImg.alt = images[current].alt;
  }

  function open(index) {
    show(index);
    overlay.hidden = false;
    document.body.classList.add("lightbox-open");
  }

  function close() {
    overlay.hidden = true;
    lightboxImg.removeAttribute("src");
    document.body.classList.remove("lightbox-open");
  }

  gallery.addEventListener("click", (event) => {
    const img = event.target.closest(".gallery-item img");
    if (!img) return;
    open(getImages().indexOf(img));
  });

  overlay.addEventListener("click", (event) => {
    if (event.target.closest(".lightbox-prev")) return show(current - 1);
    if (event.target.closest(".lightbox-next")) return show(current + 1);
    if (event.target !== lightboxImg) close();
  });

  document.addEventListener("keydown", (event) => {
    if (overlay.hidden) return;
    if (event.key === "Escape") close();
    else if (event.key === "ArrowLeft") show(current - 1);
    else if (event.key === "ArrowRight") show(current + 1);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector(".gallery");
  if (!gallery) return;

  const category = gallery.dataset.category || "architecture";
  setupLightbox(gallery);

  fetch("../js/gallery-manifest.json")
    .then((response) => {
      if (!response.ok) throw new Error("Failed to load gallery manifest");
      return response.json();
    })
    .then((manifest) => {
      renderGallery(gallery, imagesFromManifest(manifest, category));
    })
    .catch((error) => {
      console.error(error);
      renderGallery(gallery, []);
    });
});
