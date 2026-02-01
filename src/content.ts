
console.log("[ImageScanner] Loaded");

const Config = {
  MIN_WIDTH: 30,
  MIN_HEIGHT: 30,
  LAZY_LOAD_ATTRS: [
    "src",
    "data-src",
    "data-lazy-src",
    "data-original",
    "data-image",
    "data-bg",
  ],
  BG_SCAN_CLASSES: ["ng-lazyload-image", "lazyload", "lazy"],
};

const scannedUrls = new Map();
let imageId = 0;

function extractUrl(element, ...attrs) {
  for (const attr of attrs) {
    const val = element.getAttribute?.(attr) || element[attr] || "";
    if (val) return val.trim();
  }
  return "";
}

function getFormat(url) {
  try {
    const match = url.match(/\.([a-z0-9]+)([?#]|$)/i);
    return match ? match[1].toUpperCase() : "unknown";
  } catch {
    return "unknown";
  }
}

function normalizeUrl(url) {
  try {

    return url.split("?")[0].split("#")[0];
  } catch {
    return url;
  }
}


function getDimensions(img, element) {
  let width = 0,
    height = 0;

  if (img?.nodeType === 1) {
    width = img.naturalWidth || img.width || img.offsetWidth || 0;
    height = img.naturalHeight || img.height || img.offsetHeight || 0;
  }

  if (width === 0 || height === 0) {
    width = element.offsetWidth || width;
    height = element.offsetHeight || height;
  }

  if (width === 0) {
    const w = parseInt(element.getAttribute?.("width") || "0");
    if (w > 0) width = w;
  }
  if (height === 0) {
    const h = parseInt(element.getAttribute?.("height") || "0");
    if (h > 0) height = h;
  }

  return { width, height };
}

function addImage(src, alt, width, height) {
  if (!src || src.length < 5) return; 

  const normalized = normalizeUrl(src);
  if (scannedUrls.has(normalized)) return; 

  if (
    width > 0 &&
    height > 0 &&
    width < Config.MIN_WIDTH &&
    height < Config.MIN_HEIGHT
  ) {
    return; 
  }

  imageId++;
  scannedUrls.set(normalized, true);

  return {
    id: `img-${imageId}`,
    src: src,
    alt: alt || `Image ${imageId}`,
    width: Math.max(width, 0),
    height: Math.max(height, 0),
    format: getFormat(src),
  };
}

function scanAllImages() {
  console.log("[ImageScanner] Starting comprehensive scan...");
  const images = [];


  document.querySelectorAll("img").forEach((img) => {
    const src = extractUrl(img, ...Config.LAZY_LOAD_ATTRS);
    if (src) {
      const { width, height } = getDimensions(img, img);
      const result = addImage(src, img.alt || img.title, width, height);
      if (result) images.push(result);
    }
  });


  document.querySelectorAll("picture").forEach((picture) => {

    picture.querySelectorAll("source").forEach((source) => {
      const srcset = source.srcSet || "";
      if (srcset) {
     
        const urls = srcset
          .split(",")
          .map((s) => s.trim().split(/\s+/)[0])
          .filter((u) => u);

        urls.forEach((url) => {
          const { width, height } = getDimensions(null, picture);
          const result = addImage(url, `Picture from srcset`, width, height);
          if (result) images.push(result);
        });
      }
    });

  
    const imgInPicture = picture.querySelector("img");
    if (imgInPicture) {
      const src = extractUrl(imgInPicture, ...Config.LAZY_LOAD_ATTRS);
      if (src) {
        const { width, height } = getDimensions(imgInPicture, picture);
        const result = addImage(src, imgInPicture.alt, width, height);
        if (result) images.push(result);
      }
    }
  });


  const bgElements = document.querySelectorAll(
    "[style*='background'], [style*='background-image']",
  );
  bgElements.forEach((el) => {
    const style = window.getComputedStyle(el);
    const bgImage = style.backgroundImage || "";

   
    const match = bgImage.match(/url\(['"]?([^'")]+)['"]?\)/i);
    if (match && match[1]) {
      const url = match[1].trim();
      const { width, height } = getDimensions(null, el);

      
      if (width >= Config.MIN_WIDTH && height >= Config.MIN_HEIGHT) {
        const result = addImage(
          url,
          `Background ${el.className}`,
          width,
          height,
        );
        if (result) images.push(result);
      }
    }
  });

 
  document.querySelectorAll("svg image").forEach((svgImg) => {
    const href = extractUrl(svgImg, "href", "xlink:href", "src");
    if (href) {
      const { width, height } = getDimensions(svgImg, svgImg);
      const result = addImage(href, "SVG Image", width, height);
      if (result) images.push(result);
    }
  });


  document.querySelectorAll("img[src^='data:']").forEach((img) => {
    const src = img.src;
    const { width, height } = getDimensions(img, img);
    const result = addImage(src, img.alt || "Data URI Image", width, height);
    if (result) images.push(result);
  });

  const allElements = document.querySelectorAll("*");
  let cssCount = 0;
  for (const el of allElements) {
    if (cssCount > 100) break; 
    const style = window.getComputedStyle(el);
    const bgImage = style.backgroundImage;

    if (bgImage && bgImage !== "none") {
      const match = bgImage.match(/url\(['"]?([^'")]+)['"]?\)/i);
      if (match && match[1]) {
        const url = match[1].trim();
        const normalized = normalizeUrl(url);

        if (!scannedUrls.has(normalized)) {
          const { width, height } = getDimensions(null, el);
          if (width >= Config.MIN_WIDTH && height >= Config.MIN_HEIGHT) {
            const result = addImage(url, `CSS Background`, width, height);
            if (result) {
              images.push(result);
              cssCount++;
            }
          }
        }
      }
    }
  }

  console.log(`[ImageScanner] Found ${images.length} unique images total`);
  return images;
}

function sendToPanel(images) {
  if (images.length === 0) {
    console.log("[ImageScanner] No images found");
    return;
  }

  chrome.runtime.sendMessage(
    {
      type: "SCAN_IMAGES",
      data: images,
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.warn("[ImageScanner] Error:", chrome.runtime.lastError);
      } else {
        console.log(`[ImageScanner] Sent ${images.length} images to panel`);
      }
    },
  );
}


function performScan() {
  const images = scanAllImages();
  sendToPanel(images);
}


if (document.readyState === "loading") {
  window.addEventListener("load", () => {
    console.log("[ImageScanner] Page loaded, starting scan in 1s");
    setTimeout(performScan, 1000);
  });
} else {
  console.log("[ImageScanner] Page ready, starting scan in 1s");
  setTimeout(performScan, 1000);
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "RESCAN") {
    console.log("[ImageScanner] Rescan requested");
    scannedUrls.clear();
    imageId = 0;
    const images = scanAllImages();
    sendResponse({ images });
  }
});


let debounceTimer;
const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    console.log("[ImageScanner] DOM changed, scanning for new images");
    performScan();
  }, 2000);
});


window.addEventListener("load", () => {
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src", "data-src", "style", "class"],
    });
  }
});

console.log("[ImageScanner] Ready");
