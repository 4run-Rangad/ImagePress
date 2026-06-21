import { useCallback, useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import DropZone from './components/DropZone';
import SettingsPanel from './components/SettingsPanel';
import ImageCard from './components/ImageCard';
import CompareModal from './components/CompareModal';
import useToasts from './hooks/useToasts.jsx';

let idCounter = 0;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const DEFAULT_SETTINGS = {
  quality: 0.8,
  maxWidthOrHeight: 1920,
  maxSizeMB: 1,
  preserveExif: false,
};

export default function App() {
  const [images, setImages] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [compareId, setCompareId] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const { addToast, ToastContainer } = useToasts();
  const abortControllers = useRef({});

  // Add new files
  const handleFilesAdded = useCallback((files) => {
    const newItems = files.map((file) => {
      const id = ++idCounter;
      const previewUrl = URL.createObjectURL(file);
      return { id, file, previewUrl, status: 'pending', compressedBlob: null, error: null };
    });
    setImages((prev) => [...prev, ...newItems]);
    addToast(`${newItems.length} image${newItems.length > 1 ? 's' : ''} added`, 'info');
  }, [addToast]);

  // Compress all pending images
  const compressAll = useCallback(async () => {
    const pending = images.filter((img) => img.status === 'pending');
    if (!pending.length) {
      addToast('No pending images to compress', 'info');
      return;
    }

    setCompressing(true);

    const compressionOptions = {
      maxSizeMB: settings.maxSizeMB,
      maxWidthOrHeight: settings.maxWidthOrHeight,
      initialQuality: settings.quality,
      useWebWorker: true,
      preserveExif: settings.preserveExif,
    };

    for (const item of pending) {
      const controller = new AbortController();
      abortControllers.current[item.id] = controller;

      // Mark as compressing
      setImages((prev) =>
        prev.map((img) =>
          img.id === item.id ? { ...img, status: 'compressing' } : img
        )
      );

      try {
        const blob = await imageCompression(item.file, {
          ...compressionOptions,
          signal: controller.signal,
        });

        setImages((prev) =>
          prev.map((img) =>
            img.id === item.id
              ? { ...img, status: 'done', compressedBlob: blob }
              : img
          )
        );
      } catch (err) {
        if (err.name === 'AbortError') {
          setImages((prev) =>
            prev.map((img) =>
              img.id === item.id ? { ...img, status: 'pending' } : img
            )
          );
        } else {
          setImages((prev) =>
            prev.map((img) =>
              img.id === item.id
                ? { ...img, status: 'error', error: err.message }
                : img
            )
          );
        }
      } finally {
        delete abortControllers.current[item.id];
      }
    }

    setCompressing(false);
    addToast('Compression complete!', 'success');
  }, [images, settings, addToast]);

  // Download single image
  const handleDownload = useCallback((id) => {
    const item = images.find((img) => img.id === id);
    if (!item || !item.compressedBlob) return;
    const url = URL.createObjectURL(item.compressedBlob);
    const a = document.createElement('a');
    const ext = item.file.name.split('.').pop();
    a.href = url;
    a.download = `compressed_${item.file.name}`;
    a.click();
    URL.revokeObjectURL(url);
    addToast(`Downloaded ${item.file.name}`, 'success');
  }, [images, addToast]);

  // Download all compressed images
  const downloadAll = useCallback(async () => {
    const done = images.filter((img) => img.status === 'done');
    if (!done.length) {
      addToast('No compressed images ready', 'info');
      return;
    }
    for (const item of done) {
      await new Promise((resolve) => {
        const url = URL.createObjectURL(item.compressedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compressed_${item.file.name}`;
        a.click();
        URL.revokeObjectURL(url);
        setTimeout(resolve, 150);
      });
    }
    addToast(`Downloaded ${done.length} images`, 'success');
  }, [images, addToast]);

  // Remove image
  const handleRemove = useCallback((id) => {
    setImages((prev) => {
      const item = prev.find((img) => img.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (abortControllers.current[id]) abortControllers.current[id].abort();
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  // Clear all
  const clearAll = useCallback(() => {
    images.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (abortControllers.current[item.id]) abortControllers.current[item.id].abort();
    });
    setImages([]);
    addToast('All images cleared', 'info');
  }, [images, addToast]);

  // Stats
  const totalOriginal = images.reduce((s, img) => s + img.file.size, 0);
  const totalCompressed = images
    .filter((img) => img.compressedBlob)
    .reduce((s, img) => s + img.compressedBlob.size, 0);
  const doneCount = images.filter((img) => img.status === 'done').length;
  const overallSavings =
    totalOriginal > 0 && doneCount > 0
      ? Math.round(((totalOriginal - totalCompressed) / totalOriginal) * 100)
      : 0;

  const compareItem = images.find((img) => img.id === compareId);

  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">🗜️</div>
          <span className="logo-text">ImagePress</span>
        </div>
        <span className="header-badge">100% Browser-based</span>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          No uploads · No servers · Fully private
        </div>
        <h1>
          Compress Images <span className="gradient-text">Instantly</span>
          <br />in Your Browser
        </h1>
        <p className="hero-subtitle">
          Reduce file sizes by up to 90% without visible quality loss.
          Works entirely client-side — your images never leave your device.
        </p>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-value">90%</span>
            <span className="stat-label">Max Savings</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">6+</span>
            <span className="stat-label">Formats</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">∞</span>
            <span className="stat-label">Free Forever</span>
          </div>
        </div>
      </section>

      {/* Main */}
      <main className="main-container">
        <DropZone onFilesAdded={handleFilesAdded} />

        {images.length > 0 && (
          <>
            <SettingsPanel settings={settings} onChange={setSettings} />

            {/* Action Bar */}
            <div className="action-bar">
              <div className="action-info">
                <span className="file-count-badge">
                  {images.length} image{images.length !== 1 ? 's' : ''}
                </span>
                {doneCount > 0 && (
                  <span className="file-count-badge" style={{ background: 'var(--success-bg)', color: 'var(--success)', borderColor: 'rgba(16,185,129,0.3)' }}>
                    {doneCount} compressed
                  </span>
                )}
              </div>
              <div className="action-buttons">
                <button
                  id="compress-all-btn"
                  className="btn btn-primary"
                  onClick={compressAll}
                  disabled={compressing || images.every((img) => img.status !== 'pending')}
                >
                  {compressing ? (
                    <><span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> Compressing…</>
                  ) : (
                    <>🗜️ Compress All</>
                  )}
                </button>
                {doneCount > 0 && (
                  <button
                    id="download-all-btn"
                    className="btn btn-success"
                    onClick={downloadAll}
                  >
                    ⬇ Download All
                  </button>
                )}
                <button
                  id="clear-all-btn"
                  className="btn btn-danger"
                  onClick={clearAll}
                >
                  🗑 Clear All
                </button>
              </div>
            </div>

            {/* Image Grid */}
            <div className="images-grid">
              {images.map((item) => (
                <ImageCard
                  key={item.id}
                  item={item}
                  onRemove={handleRemove}
                  onDownload={handleDownload}
                  onCompare={setCompareId}
                />
              ))}
            </div>

            {/* Summary Bar */}
            {doneCount > 0 && (
              <div className="summary-bar">
                <div className="summary-stats">
                  <div className="summary-stat">
                    <span className="summary-stat-value">{doneCount}</span>
                    <span className="summary-stat-label">Compressed</span>
                  </div>
                  <div className="summary-stat">
                    <span className="summary-stat-value">{formatBytes(totalOriginal)}</span>
                    <span className="summary-stat-label">Original Size</span>
                  </div>
                  <div className="summary-stat">
                    <span className="summary-stat-value">{formatBytes(totalCompressed)}</span>
                    <span className="summary-stat-label">Compressed Size</span>
                  </div>
                  <div className="summary-stat">
                    <span className="summary-stat-value">{overallSavings}%</span>
                    <span className="summary-stat-label">Space Saved</span>
                  </div>
                </div>
                <button
                  className="btn btn-success"
                  onClick={downloadAll}
                  id="summary-download-all-btn"
                >
                  ⬇ Download All ({doneCount})
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Compare Modal */}
      {compareId && compareItem && (
        <CompareModal item={compareItem} onClose={() => setCompareId(null)} />
      )}

      {/* Toasts */}
      <ToastContainer />
    </div>
  );
}
