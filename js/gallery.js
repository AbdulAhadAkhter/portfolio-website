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

document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector(".gallery");
  if (!gallery) return;

  const category = gallery.dataset.category || "architecture";

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
