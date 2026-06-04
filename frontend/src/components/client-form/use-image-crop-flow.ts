import { useCallback, useEffect, useRef, useState } from "react";

function revokeObjectUrl(url: string | null) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export function useImageCropFlow() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [cropSourceFile, setCropSourceFile] = useState<File | null>(null);
  const [cropSourceUrl, setCropSourceUrl] = useState<string | null>(null);
  const previewObjectUrlRef = useRef<string | null>(null);
  const cropObjectUrlRef = useRef<string | null>(null);

  const clearCropSource = useCallback(() => {
    revokeObjectUrl(cropObjectUrlRef.current);
    cropObjectUrlRef.current = null;
    setCropSourceFile(null);
    setCropSourceUrl(null);
  }, []);

  const handleImageSelect = useCallback(
    (file: File) => {
      clearCropSource();
      const objectUrl = URL.createObjectURL(file);
      cropObjectUrlRef.current = objectUrl;
      setCropSourceFile(file);
      setCropSourceUrl(objectUrl);
    },
    [clearCropSource],
  );

  const handleCropConfirm = useCallback(
    (file: File) => {
      revokeObjectUrl(previewObjectUrlRef.current);
      const objectUrl = URL.createObjectURL(file);
      previewObjectUrlRef.current = objectUrl;
      setPreviewUrl(objectUrl);
      setSelectedImageFile(file);
      clearCropSource();
    },
    [clearCropSource],
  );

  const clearSelectedImage = useCallback(() => {
    revokeObjectUrl(previewObjectUrlRef.current);
    previewObjectUrlRef.current = null;
    setPreviewUrl(null);
    setSelectedImageFile(null);
  }, []);

  useEffect(
    () => () => {
      revokeObjectUrl(previewObjectUrlRef.current);
      revokeObjectUrl(cropObjectUrlRef.current);
    },
    [],
  );

  return {
    previewUrl,
    selectedImageFile,
    cropSourceFile,
    cropSourceUrl,
    isCropModalOpen: Boolean(cropSourceFile && cropSourceUrl),
    handleImageSelect,
    handleCropConfirm,
    handleCropCancel: clearCropSource,
    clearSelectedImage,
  };
}
