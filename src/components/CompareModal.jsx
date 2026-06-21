import { useEffect, useRef } from 'react';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function CompareModal({ item, onClose }) {
  const overlayRef = useRef(null);

  const originalUrl = item.previewUrl;
  const compressedUrl = item.compressedBlob
    ? URL.createObjectURL(item.compressedBlob)
    : null;

  useEffect(() => {
    return () => {
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    };
  }, [compressedUrl]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const savings = item.compressedBlob
    ? Math.round(((item.file.size - item.compressedBlob.size) / item.file.size) * 100)
    : 0;

  return (
    <div
      className="compare-modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Before and after comparison"
    >
      <div className="compare-modal">
        <div className="compare-modal-header">
          <span className="compare-modal-title">
            👁 Before & After — {item.file.name}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            id="close-compare-modal"
            aria-label="Close comparison"
          >
            ✕ Close
          </button>
        </div>

        <div className="compare-images">
          {/* Original */}
          <div className="compare-side">
            <div className="compare-label original">
              <span>Original</span>
              <span>{formatBytes(item.file.size)}</span>
            </div>
            <img
              src={originalUrl}
              alt="Original"
              className="compare-img"
            />
          </div>

          {/* Compressed */}
          <div className="compare-side">
            <div className="compare-label compressed">
              <span>Compressed ({savings}% smaller)</span>
              <span>{item.compressedBlob ? formatBytes(item.compressedBlob.size) : '—'}</span>
            </div>
            {compressedUrl ? (
              <img
                src={compressedUrl}
                alt="Compressed"
                className="compare-img"
              />
            ) : (
              <div className="compare-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Not available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
