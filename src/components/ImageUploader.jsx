import { useCallback, useRef } from 'react';

export default function ImageUploader({ images, setImages, maxImages = 6 }) {
  const fileInputRef = useRef(null);

  const handleFiles = useCallback((files) => {
    const remaining = maxImages - images.length;
    const newFiles = Array.from(files).slice(0, remaining);
    const promises = newFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(promises).then(dataUrls => {
      setImages(prev => [...prev, ...dataUrls]);
    });
  }, [images.length, maxImages, setImages]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="card">
      <h3>📷 商品画像（最大{maxImages}枚）</h3>
      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <p>タップして画像を選択<br />またはドラッグ＆ドロップ</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      {images.length > 0 && (
        <div className="thumbnail-grid">
          {images.map((src, i) => (
            <div key={i} className="thumbnail-item">
              <img src={src} alt={`商品${i + 1}`} />
              <button className="thumbnail-remove" onClick={() => removeImage(i)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
