'use client';

import { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, RotateCw, Maximize2, Minimize2 } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
  cropShape?: 'rect' | 'round';
}

export function ImageCropper({ 
  image, 
  onCropComplete, 
  onCancel,
  aspectRatio = 1,
  cropShape = 'rect'
}: ImageCropperProps) {
  const { language } = useLanguage();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [imageScale, setImageScale] = useState<{ scaleX: number; scaleY: number } | null>(null);
  const [currentAspectRatio, setCurrentAspectRatio] = useState<number | undefined>(aspectRatio);
  const [customAspectRatio, setCustomAspectRatio] = useState<string>('');
  const [isFreeAspect, setIsFreeAspect] = useState(false);

  useEffect(() => {
    if (image) {
      console.log('ImageCropper: Image prop received, length:', image.length, 'starts with:', image.substring(0, 30));
      // Preload image to ensure it's ready and get actual dimensions
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        console.log('ImageCropper: Image loaded successfully, dimensions:', img.width, 'x', img.height);
        setImageSize({ width: img.width, height: img.height });
        setImageLoaded(true);
      };
      img.onerror = (error) => {
        console.error('ImageCropper: Error loading image:', error);
        setImageLoaded(false);
        setImageSize(null);
      };
      img.src = image;
      
      // Set loaded immediately if it's a data URL (already loaded)
      if (image.startsWith('data:')) {
        console.log('ImageCropper: Data URL detected, setting loaded immediately');
        // Still need to get dimensions
        img.onload = () => {
          setImageSize({ width: img.width, height: img.height });
          setImageLoaded(true);
        };
      }
    } else {
      setImageLoaded(false);
      setImageSize(null);
    }
  }, [image]);

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onRotationChange = useCallback((rotation: number) => {
    setRotation(rotation);
  }, []);

  const onCropCompleteCallback = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
    
    // Calculate scale factor between displayed image and original image
    if (imageSize && croppedAreaPixels) {
      // Get the actual displayed image dimensions from the cropper
      // The cropper shows the image scaled to fit, so we need to calculate the scale
      const scaleX = imageSize.width / (croppedAreaPixels.width / (croppedArea.width || 1));
      const scaleY = imageSize.height / (croppedAreaPixels.height / (croppedArea.height || 1));
      setImageScale({ scaleX, scaleY });
    }
  }, [imageSize]);

  // Preset aspect ratios
  const aspectRatioPresets = [
    { label: language === 'ar' ? 'حر' : 'Free', value: undefined, icon: '🔓' },
    { label: '1:1', value: 1, icon: '⬜' },
    { label: '16:9', value: 16/9, icon: '📺' },
    { label: '9:16', value: 9/16, icon: '📱' },
    { label: '4:3', value: 4/3, icon: '🖥️' },
    { label: '3:4', value: 3/4, icon: '📄' },
    { label: '21:9', value: 21/9, icon: '🖥️' },
    { label: '2:1', value: 2/1, icon: '📐' },
  ];

  const handleAspectRatioChange = (value: number | undefined) => {
    setCurrentAspectRatio(value);
    setIsFreeAspect(value === undefined);
    setCustomAspectRatio('');
    // Reset crop position when aspect ratio changes
    setCrop({ x: 0, y: 0 });
  };

  const handleCustomAspectRatio = (value: string) => {
    setCustomAspectRatio(value);
    if (value && value.includes(':')) {
      const [width, height] = value.split(':').map(Number);
      if (width > 0 && height > 0) {
        setCurrentAspectRatio(width / height);
        setIsFreeAspect(false);
        setCrop({ x: 0, y: 0 });
      }
    } else if (value && !isNaN(Number(value)) && Number(value) > 0) {
      setCurrentAspectRatio(Number(value));
      setIsFreeAspect(false);
      setCrop({ x: 0, y: 0 });
    }
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getRadianAngle = (degreeValue: number) => {
    return (degreeValue * Math.PI) / 180;
  };

  const rotateSize = (width: number, height: number, rotation: number) => {
    const rotRad = getRadianAngle(rotation);
    return {
      width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
      height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
  };

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: any,
    rotation = 0
  ): Promise<string> => {
    if (!pixelCrop || typeof pixelCrop.x !== 'number' || typeof pixelCrop.y !== 'number' || 
        typeof pixelCrop.width !== 'number' || typeof pixelCrop.height !== 'number') {
      throw new Error('Invalid crop area provided');
    }

    const image = await createImage(imageSrc);
    
    // Get the natural (original) image dimensions
    // react-easy-crop's croppedAreaPixels is already based on the natural image size
    const naturalWidth = image.naturalWidth || image.width;
    const naturalHeight = image.naturalHeight || image.height;
    
    // react-easy-crop gives us pixels in the natural image coordinate system
    // So we can use them directly, but we need to ensure we're working with natural dimensions
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { 
      willReadFrequently: true,
      alpha: true // Preserve alpha channel for transparency
    });

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const rotRad = getRadianAngle(rotation);

    // calculate bounding box of the rotated image using natural dimensions
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
      naturalWidth,
      naturalHeight,
      rotation
    );

    // set canvas size to match the bounding box - ensure integers
    canvas.width = Math.max(1, Math.round(bBoxWidth));
    canvas.height = Math.max(1, Math.round(bBoxHeight));

    // Clear canvas with transparent background (not black)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // translate canvas context to a central location to allow rotating and flipping around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.scale(1, 1);
    ctx.translate(-naturalWidth / 2, -naturalHeight / 2);

    // draw rotated image at full natural size
    ctx.drawImage(image, 0, 0, naturalWidth, naturalHeight);

    // Use crop coordinates directly from react-easy-crop (already in natural image coordinates)
    // Ensure pixel values are integers
    let x = Math.round(pixelCrop.x);
    let y = Math.round(pixelCrop.y);
    let width = Math.round(pixelCrop.width);
    let height = Math.round(pixelCrop.height);

    // Ensure values are within valid range
    x = Math.max(0, Math.min(x, canvas.width - 1));
    y = Math.max(0, Math.min(y, canvas.height - 1));
    width = Math.max(1, Math.min(width, canvas.width - x));
    height = Math.max(1, Math.min(height, canvas.height - y));

    // Final validation
    if (width <= 0 || height <= 0 || x < 0 || y < 0 || 
        x + width > canvas.width || y + height > canvas.height) {
      throw new Error(`Invalid crop area: x=${x}, y=${y}, width=${width}, height=${height}, canvas=${canvas.width}x${canvas.height}`);
    }

    // Get the cropped image data
    const data = ctx.getImageData(
      x,
      y,
      width,
      height
    );

    // Create new canvas with exact crop dimensions
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = width;
    croppedCanvas.height = height;
    const croppedCtx = croppedCanvas.getContext('2d', { 
      alpha: true,
      willReadFrequently: false
    });

    if (!croppedCtx) {
      throw new Error('Failed to create cropped canvas context');
    }

    // Clear with transparent background
    croppedCtx.clearRect(0, 0, width, height);

    // Paste cropped image data
    croppedCtx.putImageData(data, 0, 0);

    // As Base64 string - Use PNG to preserve transparency
    return new Promise((resolve, reject) => {
      croppedCanvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        const reader = new FileReader();
        reader.addEventListener('load', () => resolve(reader.result as string));
        reader.addEventListener('error', (error) => reject(error));
        reader.readAsDataURL(blob);
      }, 'image/png', 1.0); // Use PNG format with maximum quality to preserve transparency
    });
  };

  const handleCropComplete = async () => {
    if (!croppedAreaPixels) {
      console.error('No crop area selected');
      return;
    }

    // Validate croppedAreaPixels
    if (typeof croppedAreaPixels.x !== 'number' || typeof croppedAreaPixels.y !== 'number' ||
        typeof croppedAreaPixels.width !== 'number' || typeof croppedAreaPixels.height !== 'number') {
      console.error('Invalid crop area:', croppedAreaPixels);
      return;
    }

    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation);
      onCropComplete(croppedImage);
    } catch (error) {
      console.error('Error cropping image:', error);
      alert(`Error cropping image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={(e) => {
      if (e.target === e.currentTarget) {
        onCancel();
      }
    }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {language === 'ar' ? 'قص الصورة' : 'Crop Image'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label={language === 'ar' ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative bg-gray-900" style={{ width: '100%', height: '600px', minHeight: '600px', position: 'relative' }}>
          {image && imageLoaded ? (
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'block' }}>
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={isFreeAspect ? undefined : (currentAspectRatio ?? aspectRatio)}
                cropShape={cropShape}
                onCropChange={onCropChange}
                onZoomChange={onZoomChange}
                onRotationChange={onRotationChange}
                onCropComplete={onCropCompleteCallback}
                restrictPosition={false}
                showGrid={true}
                zoomWithScroll={true}
                style={{
                  containerStyle: {
                    background: 'transparent'
                  },
                  cropAreaStyle: {
                    border: '2px solid #DAA520',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <RotateCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p>{language === 'ar' ? 'جاري تحميل الصورة...' : 'Loading image...'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 border-t space-y-4 max-h-[400px] overflow-y-auto">
          {/* Aspect Ratio Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'نسبة العرض إلى الارتفاع' : 'Aspect Ratio'}
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-3">
              {aspectRatioPresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handleAspectRatioChange(preset.value)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    (isFreeAspect && preset.value === undefined) || 
                    (!isFreeAspect && currentAspectRatio === preset.value)
                      ? 'bg-[#DAA520] text-white border-[#DAA520]'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  title={preset.label}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-base">{preset.icon}</span>
                    <span className="text-[10px]">{preset.label}</span>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Custom Aspect Ratio Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={language === 'ar' ? 'مخصص (مثال: 16:9 أو 1.5)' : 'Custom (e.g., 16:9 or 1.5)'}
                value={customAspectRatio}
                onChange={(e) => handleCustomAspectRatio(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
              />
              {customAspectRatio && (
                <button
                  onClick={() => {
                    setCustomAspectRatio('');
                    setCurrentAspectRatio(aspectRatio);
                    setIsFreeAspect(false);
                  }}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Current Crop Info */}
            {croppedAreaPixels && (
              <div className="mt-2 text-xs text-gray-500 text-center">
                {language === 'ar' ? 'حجم القص:' : 'Crop Size:'} {Math.round(croppedAreaPixels.width)} × {Math.round(croppedAreaPixels.height)} px
                {currentAspectRatio && !isFreeAspect && (
                  <span className="ml-2">
                    ({language === 'ar' ? 'نسبة' : 'Ratio'}: {currentAspectRatio.toFixed(2)})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Zoom Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'التكبير' : 'Zoom'}
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onZoomChange(Math.max(1, zoom - 0.1))}
                className="p-1 hover:bg-gray-100 rounded"
                disabled={zoom <= 1}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <input
                type="range"
                min={1}
                max={5}
                step={0.1}
                value={zoom}
                onChange={(e) => onZoomChange(Number(e.target.value))}
                className="flex-1"
              />
              <button
                onClick={() => onZoomChange(Math.min(5, zoom + 0.1))}
                className="p-1 hover:bg-gray-100 rounded"
                disabled={zoom >= 5}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1 text-center">
              {Math.round(zoom * 100)}%
            </div>
          </div>

          {/* Rotation Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'الدوران' : 'Rotation'}
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRotationChange((rotation - 90 + 360) % 360)}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                {language === 'ar' ? '-90°' : '-90°'}
              </button>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(e) => onRotationChange(Number(e.target.value))}
                className="flex-1"
              />
              <button
                onClick={() => onRotationChange((rotation + 90) % 360)}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                {language === 'ar' ? '+90°' : '+90°'}
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1 text-center">
              {rotation}°
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              onClick={handleCropComplete}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-[#DAA520] text-white rounded-lg hover:bg-[#C4941F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  {language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {language === 'ar' ? 'تطبيق القص' : 'Apply Crop'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

