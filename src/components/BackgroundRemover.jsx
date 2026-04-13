import { useState } from 'react';

let bgRemovalModule = null;

async function getRemoveBackground() {
  if (!bgRemovalModule) {
    bgRemovalModule = await import('@imgly/background-removal');
  }
  return bgRemovalModule.removeBackground;
}

async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl);
  return res.blob();
}

export default function BackgroundRemover({ images, setImages }) {
  const [processing, setProcessing] = useState({});
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const removeBackground = async (index) => {
    setProcessing(prev => ({ ...prev, [index]: true }));
    try {
      const removeBg = await getRemoveBackground();
      const blob = await dataUrlToBlob(images[index]);
      const result = await removeBg(blob);
      const url = URL.createObjectURL(result);
      // Convert blob URL to data URL for canvas compatibility
      const reader = new FileReader();
      const dataUrl = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(result);
      });
      URL.revokeObjectURL(url);
      setImages(prev => prev.map((img, i) => i === index ? dataUrl : img));
    } catch (err) {
      console.error('Background removal failed:', err);
      alert('背景除去に失敗しました');
    }
    setProcessing(prev => ({ ...prev, [index]: false }));
  };

  const removeAllBackgrounds = async () => {
    setBulkProcessing(true);
    for (let i = 0; i < images.length; i++) {
      await removeBackground(i);
    }
    setBulkProcessing(false);
  };

  if (images.length === 0) return null;

  return (
    <div className="card">
      <h3>🪄 背景除去（AI処理）</h3>
      <p className="hint">初回はAIモデルのダウンロードに約30秒かかります</p>

      <div className="thumbnail-grid">
        {images.map((src, i) => (
          <div key={i} className="thumbnail-item">
            <img src={src} alt={`商品${i + 1}`} />
            <button
              className="btn-small"
              onClick={() => removeBackground(i)}
              disabled={processing[i]}
            >
              {processing[i] ? '処理中...' : '背景除去'}
            </button>
          </div>
        ))}
      </div>

      <button
        className="btn btn-secondary"
        onClick={removeAllBackgrounds}
        disabled={bulkProcessing}
        style={{ marginTop: '10px', width: '100%' }}
      >
        {bulkProcessing ? '処理中...' : '🪄 全画像一括背景除去'}
      </button>
    </div>
  );
}
