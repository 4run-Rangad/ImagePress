import { useRef, useState } from 'react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/avif'];
const FORMATS = ['JPG', 'PNG', 'WebP', 'GIF', 'BMP', 'AVIF'];

export default function DropZone({ onFilesAdded }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = (files) => {
    const valid = Array.from(files).filter((f) => ACCEPTED_TYPES.includes(f.type));
    if (valid.length) onFilesAdded(valid);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  return (
    <div className="dropzone-wrapper">
      <div
        id="dropzone"
        className={`dropzone ${dragging ? 'dragging' : ''}`}
        onClick={() => inputRef.current.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        role="button"
        tabIndex={0}
        aria-label="Drop images here or click to browse"
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current.click()}
      >
        <div className="dropzone-content">
          <div className="dropzone-icon">🖼️</div>
          <div className="dropzone-title">
            {dragging ? 'Drop images here!' : 'Drop images or click to browse'}
          </div>
          <div className="dropzone-subtitle">
            Compress multiple images at once — instantly in your browser
          </div>
          <div className="dropzone-formats">
            {FORMATS.map((f) => (
              <span key={f} className="format-chip">{f}</span>
            ))}
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          id="file-input"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
          onClick={(e) => (e.target.value = null)}
        />
      </div>
    </div>
  );
}
