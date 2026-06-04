export type CropAreaPixels = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function getRadianAngle(rotation: number) {
  return (rotation * Math.PI) / 180;
}

function getRotatedSize(width: number, height: number, rotation: number) {
  const angle = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(angle) * width) + Math.abs(Math.sin(angle) * height),
    height: Math.abs(Math.sin(angle) * width) + Math.abs(Math.cos(angle) * height),
  };
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to encode image"));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

function loadImageFromUrl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to read image"));
    image.src = src;
  });
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to read image"));
    };
    image.src = objectUrl;
  });
}

function replaceExtension(name: string, extension: string) {
  const dotIndex = name.lastIndexOf(".");
  const baseName = dotIndex >= 0 ? name.slice(0, dotIndex) : name;
  return `${baseName}${extension}`;
}

export async function cropImageFile(file: File, imageSrc: string, cropAreaPixels: CropAreaPixels, rotation: number) {
  const width = Math.max(1, Math.round(cropAreaPixels.width));
  const height = Math.max(1, Math.round(cropAreaPixels.height));
  const x = Math.max(0, Math.round(cropAreaPixels.x));
  const y = Math.max(0, Math.round(cropAreaPixels.y));
  const image = await loadImageFromUrl(imageSrc);
  const rotatedSize = getRotatedSize(image.naturalWidth, image.naturalHeight, rotation);
  const rotationInRadians = getRadianAngle(rotation);
  const mimeType = file.type === "image/jpeg" ? "image/jpeg" : "image/png";
  const extension = mimeType === "image/jpeg" ? ".jpg" : ".png";

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(rotatedSize.width);
  canvas.height = Math.ceil(rotatedSize.height);

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not available");
  }

  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate(rotationInRadians);
  context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

  const imageData = context.getImageData(x, y, width, height);
  const outputSize = 512;
  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = outputSize;
  croppedCanvas.height = outputSize;

  const croppedContext = croppedCanvas.getContext("2d");
  if (!croppedContext) {
    throw new Error("Canvas is not available");
  }

  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = width;
  sourceCanvas.height = height;

  const sourceContext = sourceCanvas.getContext("2d");
  if (!sourceContext) {
    throw new Error("Canvas is not available");
  }

  sourceContext.putImageData(imageData, 0, 0);
  croppedContext.drawImage(sourceCanvas, 0, 0, outputSize, outputSize);
  const blob = await canvasToBlob(croppedCanvas, mimeType, 0.86);

  return new File([blob], replaceExtension(file.name, extension), {
    type: mimeType,
    lastModified: file.lastModified,
  });
}

export async function compressImageForClient(file: File, maxBytes = 2 * 1024 * 1024): Promise<File> {
  if (!["image/png", "image/jpeg"].includes(file.type)) {
    return file;
  }

  const image = await loadImageFromFile(file);
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not available");
  }

  context.drawImage(image, 0, 0, width, height);
  const outputMime = file.type === "image/png" && file.size <= maxBytes ? "image/png" : "image/jpeg";
  const extension = outputMime === "image/jpeg" ? ".jpg" : ".png";
  const qualities = [0.86, 0.76, 0.66, 0.56];

  for (const quality of qualities) {
    const blob = await canvasToBlob(canvas, outputMime, quality);
    if (blob.size <= maxBytes || quality === qualities[qualities.length - 1]) {
      return new File([blob], replaceExtension(file.name, extension), {
        type: outputMime,
        lastModified: file.lastModified,
      });
    }
  }

  return file;
}
