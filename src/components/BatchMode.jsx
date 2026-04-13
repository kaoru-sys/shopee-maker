import { useState, useRef } from 'react';
import { renderCanvas } from '../utils/canvasRenderer';

export default function BatchMode({ settings }) {
  const [titles, setTitles] = useState('');
  const [images, setImages] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState([]);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    const promises = Array.from(files).map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(promises).then(dataUrls => {
      setImages(prev => [...prev, ...dataUrls]);
    });
  };

  const handleGenerate = async () => {
    const titleList = titles.split('\n').map(t => t.trim()).filter(Boolean);
    if (titleList.length === 0) {
      alert('商品タイトルを入力してください');
      return;
    }

    setGenerating(true);
    setProgress({ current: 0, total: titleList.length });
    const generatedResults = [];

    for (let i = 0; i < titleList.length; i++) {
      setProgress({ current: i + 1, total: titleList.length });
      const canvas = document.createElement('canvas');
      const productImages = images[i] ? [images[i]] : [];

      await renderCanvas(canvas, {
        title: titleList[i],
        images: productImages,
        ...settings,
      });

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      generatedResults.push({ title: titleList[i], blob });
    }

    setResults(generatedResults);
    setGenerating(false);
  };

  const handleDownloadZip = async () => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    results.forEach(({ title, blob }) => {
      const safeName = title.replace(/[/\\?%*:|"<>]/g, '_');
      zip.file(`shopee_${safeName}.png`, blob);
    });

    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const content = await zip.generateAsync({ type: 'blob' });

    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopee_images_${dateStr}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="card">
        <h3>📝 商品タイトル一覧</h3>
        <textarea
          className="batch-textarea"
          value={titles}
          onChange={e => setTitles(e.target.value)}
          placeholder={"1行に1つタイトルを入力\n例:\nDemon Slayer\nTamagotchi\nPokemon"}
          rows={6}
        />
      </div>

      <div className="card">
        <h3>📷 商品画像（タイトル順に割り当て）</h3>
        <div
          className="drop-zone"
          onClick={() => fileInputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          onDragOver={(e) => e.preventDefault()}
        >
          <p>タップして画像を選択</p>
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
                <img src={src} alt={`画像${i + 1}`} />
                <button className="thumbnail-remove" onClick={() => removeImage(i)}>✕</button>
                <span className="thumbnail-label">{i + 1}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        className="btn btn-primary"
        onClick={handleGenerate}
        disabled={generating}
        style={{ width: '100%', marginBottom: '12px' }}
      >
        {generating ? `🎨 ${progress.current}/${progress.total} 生成中...` : '🎨 一括生成'}
      </button>

      {generating && (
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${(progress.current / progress.total) * 100}%` }}
          />
        </div>
      )}

      {results.length > 0 && !generating && (
        <button
          className="btn btn-download"
          onClick={handleDownloadZip}
          style={{ width: '100%' }}
        >
          📥 ZIPでまとめてダウンロード
        </button>
      )}
    </div>
  );
}
