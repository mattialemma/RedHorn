import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { cropImageFile } from "@/lib/image-crop";

type ImageCropModalProps = {
  isOpen: boolean;
  imageFile: File | null;
  imageSrc: string | null;
  title: string;
  description: string;
  onConfirm: (croppedFile: File) => void | Promise<void>;
  onCancel: () => void;
};

export function ImageCropModal({ isOpen, imageFile, imageSrc, title, description, onConfirm, onCancel }: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const reset = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
  }, []);

  const handleCancel = useCallback(() => {
    if (isProcessing) return;
    reset();
    onCancel();
  }, [isProcessing, onCancel, reset]);

  const handleCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!imageFile || !imageSrc || !croppedAreaPixels || isProcessing) return;

    setIsProcessing(true);
    try {
      const croppedFile = await cropImageFile(imageFile, imageSrc, croppedAreaPixels, rotation);
      await onConfirm(croppedFile);
      reset();
    } finally {
      setIsProcessing(false);
    }
  }, [croppedAreaPixels, imageFile, imageSrc, isProcessing, onConfirm, reset, rotation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 py-6">
      <section
        aria-labelledby="image-crop-title"
        aria-modal="true"
        role="dialog"
        className="w-full max-w-3xl rounded-2xl border border-slate-700 bg-[#111720] p-5 shadow-2xl sm:p-6"
      >
        <div className="mb-5">
          <h2 id="image-crop-title" className="text-xl font-bold text-white">
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>

        <div className="relative h-[320px] overflow-hidden rounded-3xl border border-white/10 bg-black/40 sm:h-[420px]">
          {imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={handleCropComplete}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
            />
          ) : null}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-slate-300" htmlFor="client-logo-zoom">
            Zoom
            <input
              id="client-logo-zoom"
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="accent-white"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-300" htmlFor="client-logo-rotation">
            Rotazione
            <input
              id="client-logo-rotation"
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={(event) => setRotation(Number(event.target.value))}
              className="accent-white"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={handleCancel} disabled={isProcessing}>
            Annulla
          </Button>
          <Button onClick={handleConfirm} disabled={!imageFile || !imageSrc || !croppedAreaPixels || isProcessing}>
            Applica
          </Button>
        </div>
      </section>
    </div>
  );
}

