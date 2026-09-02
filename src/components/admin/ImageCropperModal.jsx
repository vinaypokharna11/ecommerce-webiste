'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crop,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Sliders,
  Check,
  X,
  RefreshCw,
  Sun,
  Contrast,
  Sparkles,
  Maximize2,
  Image as ImageIcon,
  Square,
  RectangleHorizontal,
  RectangleVertical,
} from 'lucide-react';

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 Square (Store Grid)', ratio: 1, icon: Square },
  { id: '4:3', label: '4:3 Standard', ratio: 4 / 3, icon: RectangleHorizontal },
  { id: '3:4', label: '3:4 Portrait', ratio: 3 / 4, icon: RectangleVertical },
  { id: '16:9', label: '16:9 Banner', ratio: 16 / 9, icon: RectangleHorizontal },
  { id: 'free', label: 'Freeform Crop', ratio: null, icon: Maximize2 },
];

const FILTER_PRESETS = [
  { id: 'normal', name: 'Original', brightness: 100, contrast: 100, saturate: 100, warmth: 0, grayscale: 0 },
  { id: 'studio', name: 'Studio Shine', brightness: 108, contrast: 112, saturate: 105, warmth: 0, grayscale: 0 },
  { id: 'vibrant', name: 'Vibrant Colors', brightness: 104, contrast: 110, saturate: 130, warmth: 5, grayscale: 0 },
  { id: 'warm_gold', name: 'Warm Gold', brightness: 102, contrast: 105, saturate: 110, warmth: 20, grayscale: 0 },
  { id: 'cool_silver', name: 'Cool Silver', brightness: 106, contrast: 108, saturate: 95, warmth: -15, grayscale: 0 },
  { id: 'monochrome', name: 'B&W Elegance', brightness: 102, contrast: 120, saturate: 0, warmth: 0, grayscale: 100 },
];

export const ImageCropperModal = ({ isOpen, imageSrc, onClose, onApply }) => {
  const [activeTab, setActiveTab] = useState('crop'); // 'crop', 'transform', 'adjust'
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [selectedPreset, setSelectedPreset] = useState('normal');

  // Transformations
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [fineRotation, setFineRotation] = useState(0); // -45 to 45
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Adjustments
  const [brightness, setBrightness] = useState(100); // 50 to 150
  const [contrast, setContrast] = useState(100); // 50 to 150
  const [saturate, setSaturate] = useState(100); // 0 to 200
  const [warmth, setWarmth] = useState(0); // -50 to 50
  const [grayscale, setGrayscale] = useState(0); // 0 to 100

  // Crop Coordinates in display space (relative to image container)
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, width: 80, height: 80 }); // in percentages (0-100)
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState(null); // 'move', 'nw', 'ne', 'se', 'sw', 'n', 's', 'e', 'w'
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, cropX: 0, cropY: 0, cropW: 0, cropH: 0 });

  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 800, height: 800 });

  // Initialize and reset when modal opens or imageSrc changes
  useEffect(() => {
    if (isOpen && imageSrc) {
      setImageLoaded(false);
      setRotation(0);
      setFineRotation(0);
      setFlipH(false);
      setFlipV(false);
      setZoom(1);
      setBrightness(100);
      setContrast(100);
      setSaturate(100);
      setWarmth(0);
      setGrayscale(0);
      setSelectedPreset('normal');
      setAspectRatio('1:1');
      setCropBox({ x: 10, y: 10, width: 80, height: 80 });
      setActiveTab('crop');

      const img = new Image();
      img.onload = () => {
        setNaturalSize({ width: img.naturalWidth || 800, height: img.naturalHeight || 800 });
        setImageLoaded(true);
        adjustInitialCropBox(img.naturalWidth, img.naturalHeight, 1);
      };
      img.src = imageSrc;
    }
  }, [isOpen, imageSrc]);

  // Adjust crop box when aspect ratio changes
  const adjustInitialCropBox = (imgW, imgH, ratioValue) => {
    if (!ratioValue) {
      setCropBox({ x: 5, y: 5, width: 90, height: 90 });
      return;
    }

    // Default centered square or ratio box
    let w = 80;
    let h = 80;
    const imgAspect = (imgW || 1) / (imgH || 1);

    if (ratioValue >= 1) {
      w = 80;
      h = Math.min(90, (80 * imgAspect) / ratioValue);
    } else {
      h = 80;
      w = Math.min(90, (80 * ratioValue) / imgAspect);
    }

    w = Math.max(20, Math.min(95, w));
    h = Math.max(20, Math.min(95, h));
    const x = Math.max(0, (100 - w) / 2);
    const y = Math.max(0, (100 - h) / 2);

    setCropBox({ x, y, width: w, height: h });
  };

  const handleRatioSelect = (selectedId) => {
    setAspectRatio(selectedId);
    const item = ASPECT_RATIOS.find((r) => r.id === selectedId);
    adjustInitialCropBox(naturalSize.width, naturalSize.height, item?.ratio);
  };

  const applyPreset = (preset) => {
    setSelectedPreset(preset.id);
    setBrightness(preset.brightness);
    setContrast(preset.contrast);
    setSaturate(preset.saturate);
    setWarmth(preset.warmth);
    setGrayscale(preset.grayscale);
  };

  const resetAll = () => {
    setRotation(0);
    setFineRotation(0);
    setFlipH(false);
    setFlipV(false);
    setZoom(1);
    setBrightness(100);
    setContrast(100);
    setSaturate(100);
    setWarmth(0);
    setGrayscale(0);
    setSelectedPreset('normal');
    handleRatioSelect('1:1');
  };

  // Crop Box Dragging & Resizing Handlers
  const startDrag = (e, handle) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragHandle(handle);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      cropX: cropBox.x,
      cropY: cropBox.y,
      cropW: cropBox.width,
      cropH: cropBox.height,
    };
  };

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const deltaXPercent = ((e.clientX - dragStartRef.current.mouseX) / rect.width) * 100;
      const deltaYPercent = ((e.clientY - dragStartRef.current.mouseY) / rect.height) * 100;

      const { cropX, cropY, cropW, cropH } = dragStartRef.current;
      const activeRatio = ASPECT_RATIOS.find((r) => r.id === aspectRatio)?.ratio;

      if (dragHandle === 'move') {
        let nextX = Math.max(0, Math.min(100 - cropW, cropX + deltaXPercent));
        let nextY = Math.max(0, Math.min(100 - cropH, cropY + deltaYPercent));
        setCropBox((prev) => ({ ...prev, x: nextX, y: nextY }));
      } else {
        // Resizing
        let newX = cropX;
        let newY = cropY;
        let newW = cropW;
        let newH = cropH;

        if (dragHandle.includes('e')) newW = Math.max(15, Math.min(100 - cropX, cropW + deltaXPercent));
        if (dragHandle.includes('s')) newH = Math.max(15, Math.min(100 - cropY, cropH + deltaYPercent));
        if (dragHandle.includes('w')) {
          const maxDelta = cropX + cropW - 15;
          const shift = Math.min(maxDelta, Math.max(-cropX, deltaXPercent));
          newX = cropX + shift;
          newW = cropW - shift;
        }
        if (dragHandle.includes('n')) {
          const maxDelta = cropY + cropH - 15;
          const shift = Math.min(maxDelta, Math.max(-cropY, deltaYPercent));
          newY = cropY + shift;
          newH = cropH - shift;
        }

        // Lock ratio if specified
        if (activeRatio) {
          const containerAspect = rect.width / rect.height;
          if (dragHandle.includes('e') || dragHandle.includes('w')) {
            newH = Math.min(100 - newY, (newW * containerAspect) / activeRatio);
          } else {
            newW = Math.min(100 - newX, (newH * activeRatio) / containerAspect);
          }
        }

        setCropBox({
          x: Math.max(0, Math.min(100 - newW, newX)),
          y: Math.max(0, Math.min(100 - newH, newY)),
          width: Math.max(15, Math.min(100, newW)),
          height: Math.max(15, Math.min(100, newH)),
        });
      }
    },
    [isDragging, dragHandle, aspectRatio]
  );

  const stopDrag = useCallback(() => {
    setIsDragging(false);
    setDragHandle(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', stopDrag);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopDrag);
    };
  }, [isDragging, handlePointerMove, stopDrag]);

  // Compute final high-resolution rendered image on HTML5 Canvas
  const handleSaveAndApply = () => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const totalRotation = ((rotation + fineRotation) * Math.PI) / 180;

        // Base image dimensions
        const origW = img.naturalWidth || 800;
        const origH = img.naturalHeight || 800;

        // Step 1: Create an intermediate transformed canvas
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        // Size to encompass rotated image
        const absCos = Math.abs(Math.cos(totalRotation));
        const absSin = Math.abs(Math.sin(totalRotation));
        const rotW = origW * absCos + origH * absSin;
        const rotH = origW * absSin + origH * absCos;

        tempCanvas.width = rotW;
        tempCanvas.height = rotH;

        // Apply filters directly on context
        const warmthHue = warmth * 0.4;
        tempCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) grayscale(${grayscale}%) hue-rotate(${warmthHue}deg)`;

        // Draw rotated & flipped image
        tempCtx.save();
        tempCtx.translate(rotW / 2, rotH / 2);
        tempCtx.rotate(totalRotation);
        tempCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        tempCtx.scale(zoom, zoom);
        tempCtx.drawImage(img, -origW / 2, -origH / 2, origW, origH);
        tempCtx.restore();

        // Step 2: Extract the cropped region
        const cropX = (cropBox.x / 100) * rotW;
        const cropY = (cropBox.y / 100) * rotH;
        const cropW = (cropBox.width / 100) * rotW;
        const cropH = (cropBox.height / 100) * rotH;

        // Final crisp output canvas
        const outCanvas = document.createElement('canvas');
        const outCtx = outCanvas.getContext('2d');

        // Maintain high resolution (min 800px, max 1600px for sharp catalog view)
        const targetWidth = Math.max(600, Math.min(1600, Math.round(cropW)));
        const targetHeight = Math.max(600, Math.min(1600, Math.round(cropH)));

        outCanvas.width = targetWidth;
        outCanvas.height = targetHeight;

        // Enable high-quality image smoothing
        outCtx.imageSmoothingEnabled = true;
        outCtx.imageSmoothingQuality = 'high';

        // Draw crop slice
        outCtx.drawImage(tempCanvas, cropX, cropY, cropW, cropH, 0, 0, targetWidth, targetHeight);

        // Convert to high-quality JPEG base64 data URL
        const dataUrl = outCanvas.toDataURL('image/jpeg', 0.92);
        onApply(dataUrl);
        onClose();
      } catch (err) {
        console.error('Error generating cropped image:', err);
        // Fallback to original
        onApply(imageSrc);
        onClose();
      }
    };
    img.src = imageSrc;
  };

  if (!isOpen) return null;

  // Filter style string for live preview
  const filterStyle = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) grayscale(${grayscale}%) hue-rotate(${warmth * 0.4}deg)`;
  const totalRot = rotation + fineRotation;
  const transformStyle = `rotate(${totalRot}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1}) scale(${zoom})`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-4xl bg-[#171717] text-white rounded-3xl shadow-2xl border border-white/10 overflow-hidden z-10 flex flex-col max-h-[92vh]"
        >
          {/* ── Top Header ── */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#9FD842]/20 border border-[#9FD842]/40 text-[#9FD842] flex items-center justify-center shadow-xs">
                <Crop className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                  <span>Photo Editor & Cropper</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#9FD842] text-[#171717] text-[10px] font-black uppercase tracking-wider">
                    Studio Mode
                  </span>
                </h3>
                <p className="text-[11px] text-white/50">
                  Crop, rotate, and enhance your product image before publishing to catalog
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetAll}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reset all edits"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Main Workspace (Canvas Viewport + Controls) ── */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left/Top: Interactive Image Viewport with Crop Box */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center">
              <div
                ref={containerRef}
                className="relative w-full aspect-square max-w-[440px] bg-[#0A0A0A] rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center select-none shadow-inner"
              >
                {/* Checkered pattern background */}
                <div 
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
                    backgroundSize: '16px 16px',
                  }}
                />

                {/* Base Image with transforms and filters */}
                {imageSrc && (
                  <div
                    className="relative w-full h-full flex items-center justify-center p-4 transition-transform duration-75 ease-out"
                    style={{
                      transform: transformStyle,
                      filter: filterStyle,
                    }}
                  >
                    <img
                      ref={imageRef}
                      src={imageSrc}
                      alt="Crop Target"
                      className="max-h-full max-w-full object-contain pointer-events-none select-none rounded-lg"
                      draggable={false}
                    />
                  </div>
                )}

                {/* Dark Mask Overlay outside Crop Box */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `rgba(0, 0, 0, 0.65)`,
                    clipPath: `polygon(
                      0% 0%, 100% 0%, 100% 100%, 0% 100%,
                      0% ${cropBox.y}%, 
                      ${cropBox.x}% ${cropBox.y}%, 
                      ${cropBox.x}% ${cropBox.y + cropBox.height}%, 
                      ${cropBox.x + cropBox.width}% ${cropBox.y + cropBox.height}%, 
                      ${cropBox.x + cropBox.width}% ${cropBox.y}%, 
                      0% ${cropBox.y}%
                    )`,
                  }}
                />

                {/* Active Interactive Crop Box */}
                <div
                  className="absolute border-2 border-[#9FD842] shadow-[0_0_0_1px_rgba(0,0,0,0.5),0_0_20px_rgba(159,216,66,0.3)] cursor-move transition-shadow"
                  style={{
                    left: `${cropBox.x}%`,
                    top: `${cropBox.y}%`,
                    width: `${cropBox.width}%`,
                    height: `${cropBox.height}%`,
                  }}
                  onPointerDown={(e) => startDrag(e, 'move')}
                >
                  {/* Grid Lines (Rule of Thirds) */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                    <div className="border-r border-b border-white/60" />
                    <div className="border-r border-b border-white/60" />
                    <div className="border-b border-white/60" />
                    <div className="border-r border-b border-white/60" />
                    <div className="border-r border-b border-white/60" />
                    <div className="border-b border-white/60" />
                    <div className="border-r border-b border-white/60" />
                    <div className="border-r border-b border-white/60" />
                    <div />
                  </div>

                  {/* 8 Resize Handles */}
                  <div
                    onPointerDown={(e) => startDrag(e, 'nw')}
                    className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-[#9FD842] rounded-full border-2 border-[#171717] cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                  />
                  <div
                    onPointerDown={(e) => startDrag(e, 'ne')}
                    className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[#9FD842] rounded-full border-2 border-[#171717] cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
                  />
                  <div
                    onPointerDown={(e) => startDrag(e, 'se')}
                    className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-[#9FD842] rounded-full border-2 border-[#171717] cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                  />
                  <div
                    onPointerDown={(e) => startDrag(e, 'sw')}
                    className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-[#9FD842] rounded-full border-2 border-[#171717] cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
                  />
                  <div
                    onPointerDown={(e) => startDrag(e, 'n')}
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-2 bg-[#9FD842] rounded-full border border-[#171717] cursor-ns-resize shadow-md"
                  />
                  <div
                    onPointerDown={(e) => startDrag(e, 's')}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-2 bg-[#9FD842] rounded-full border border-[#171717] cursor-ns-resize shadow-md"
                  />
                  <div
                    onPointerDown={(e) => startDrag(e, 'w')}
                    className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-5 bg-[#9FD842] rounded-full border border-[#171717] cursor-ew-resize shadow-md"
                  />
                  <div
                    onPointerDown={(e) => startDrag(e, 'e')}
                    className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-5 bg-[#9FD842] rounded-full border border-[#171717] cursor-ew-resize shadow-md"
                  />
                </div>

                {/* Aspect Badge on Preview */}
                <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white/80 pointer-events-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9FD842]" />
                  <span>{ASPECT_RATIOS.find((r) => r.id === aspectRatio)?.label || 'Crop'}</span>
                </div>
              </div>

              {/* Quick Zoom Bar below preview */}
              <div className="w-full max-w-[440px] mt-3 flex items-center justify-between gap-3 px-3 py-2 bg-white/5 rounded-2xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(2))))}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#9FD842]"
                  />
                  <span className="text-[11px] font-mono text-white/70 w-10 text-right">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(2))))}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right/Bottom: Tool Panels (Tabs) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              {/* Tab Navigation Pill */}
              <div className="grid grid-cols-3 bg-white/5 p-1 rounded-2xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('crop')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'crop'
                      ? 'bg-[#9FD842] text-[#171717] shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Crop className="w-3.5 h-3.5" />
                  <span>Crop</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('transform')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'transform'
                      ? 'bg-[#9FD842] text-[#171717] shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('adjust')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'adjust'
                      ? 'bg-[#9FD842] text-[#171717] shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Filters</span>
                </button>
              </div>

              {/* ── TAB 1: CROP & ASPECT RATIO ── */}
              {activeTab === 'crop' && (
                <div className="space-y-3.5 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                      Aspect Ratio Presets
                    </span>
                    <span className="text-[10px] text-[#9FD842] font-semibold">1:1 Recommended for Store</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {ASPECT_RATIOS.map((item) => {
                      const Icon = item.icon;
                      const isSelected = aspectRatio === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleRatioSelect(item.id)}
                          className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                            isSelected
                              ? 'bg-[#9FD842]/20 border-[#9FD842] text-white'
                              : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-[#9FD842]' : 'text-white/40'}`} />
                          <div>
                            <span className="text-xs font-bold block">{item.id.toUpperCase()}</span>
                            <span className="text-[10px] text-white/50 block leading-tight">{item.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-white/60 leading-relaxed">
                    💡 <strong className="text-white/80">Pro Tip:</strong> Drag the green handles on the preview to adjust the crop box size, or drag inside the box to reposition the focus.
                  </div>
                </div>
              )}

              {/* ── TAB 2: ROTATE & FLIP ── */}
              {activeTab === 'transform' && (
                <div className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/80 block">
                    Orientation & Mirroring
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold text-white flex flex-col items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-[#9FD842]" />
                      <span>-90° Left</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold text-white flex flex-col items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RotateCw className="w-4 h-4 text-[#9FD842]" />
                      <span>+90° Right</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFlipH(!flipH)}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        flipH ? 'bg-[#9FD842]/20 border-[#9FD842] text-white' : 'bg-white/5 border-white/5 text-white hover:bg-white/10'
                      }`}
                    >
                      <FlipHorizontal className="w-4 h-4 text-[#9FD842]" />
                      <span>Flip Horiz</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFlipV(!flipV)}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        flipV ? 'bg-[#9FD842]/20 border-[#9FD842] text-white' : 'bg-white/5 border-white/5 text-white hover:bg-white/10'
                      }`}
                    >
                      <FlipVertical className="w-4 h-4 text-[#9FD842]" />
                      <span>Flip Vert</span>
                    </button>
                  </div>

                  {/* Fine Angle Straightening */}
                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/70 font-medium">Fine Angle Leveling</span>
                      <span className="font-mono text-[#9FD842]">{fineRotation > 0 ? `+${fineRotation}` : fineRotation}°</span>
                    </div>
                    <input
                      type="range"
                      min="-45"
                      max="45"
                      value={fineRotation}
                      onChange={(e) => setFineRotation(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#9FD842]"
                    />
                  </div>
                </div>
              )}

              {/* ── TAB 3: FILTERS & ADJUSTMENTS ── */}
              {activeTab === 'adjust' && (
                <div className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/10 max-h-[380px] overflow-y-auto">
                  {/* Preset Filters Carousel */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-white/80 block mb-2">
                      Studio Filter Presets
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {FILTER_PRESETS.map((preset) => {
                        const isSelected = selectedPreset === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => applyPreset(preset)}
                            className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#9FD842] text-[#171717] font-extrabold border-[#9FD842] shadow-md'
                                : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:text-white font-medium'
                            }`}
                          >
                            <span className="text-[11px] block truncate">{preset.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sliders */}
                  <div className="space-y-3 pt-2 border-t border-white/10">
                    {/* Brightness */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/70 flex items-center gap-1">
                          <Sun className="w-3.5 h-3.5 text-amber-400" /> Brightness
                        </span>
                        <span className="font-mono text-white/90">{brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="160"
                        value={brightness}
                        onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#9FD842]"
                      />
                    </div>

                    {/* Contrast */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/70 flex items-center gap-1">
                          <Contrast className="w-3.5 h-3.5 text-blue-400" /> Contrast
                        </span>
                        <span className="font-mono text-white/90">{contrast}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="160"
                        value={contrast}
                        onChange={(e) => setContrast(parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#9FD842]"
                      />
                    </div>

                    {/* Saturation */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/70 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Color Vibrancy
                        </span>
                        <span className="font-mono text-white/90">{saturate}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={saturate}
                        onChange={(e) => setSaturate(parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#9FD842]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all active:scale-98 cursor-pointer"
                >
                  Discard Changes
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndApply}
                  className="flex-1 py-3 px-4 rounded-2xl bg-[#9FD842] hover:bg-[#8EC731] text-[#171717] font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#9FD842]/20 active:scale-98 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Apply & Save Photo</span>
                </button>
              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
