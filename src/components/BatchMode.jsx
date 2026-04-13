import { useState, useRef } from 'react';
import { renderCanvas } from '../utils/canvasRenderer';

function ProductCard({ index, product, onUpdate, onRemove, canRemove }) {
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    const remaining = 6 - product.images.length;
    const newFiles = Array.from(files).slice(0, remaining);
    const promises = newFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(promises).then(dataUrls => {
      onUpdate(index, { ...product, images: [...product.images, ...dataUrls] });
    });
  };

  const removeImage = (imgIndex) => {
    onUpdate(index, {
      ...product,
      images: product.images.filter((_, i) => i !== imgIndex),
    });
  };

  return (
    <div className="card" style={{ border: '2px solid #f0e0e0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>📦 商品 {index + 1}</h3>
        {canRemove && (
          <button
            className="btn-tiny btn-tiny-danger"
            onClick={() => onRemove(index)}
          >
            🗑 削除
          </button>
        )}
      </div>

      <input
        type="text"
        className="title-input"
        value={product.title}
        onChange={e => onUpdate(index, { ...product, title: e.target.value })}
        placeholder={`商品${index + 1}のタイトル（英語）`}
        style={{ marginBottom: 10 }}
      />

      <div
        className="drop-zone"
        style={{ padding: '16px' }}
        onClick={() => fileInputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        onDragOver={(e) => e.preventDefault()}
      >
        <p style={{ margin: 0, fontSize: 13 }}>
          画像を追加（最大6枚）{product.images.length > 0 && ` - ${product.images.length}枚選択中`}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      {product.images.length > 0 && (
        <div className="thumbnail-grid" style={{ marginTop: 8 }}>
          {product.images.map((src, i) => (
            <div key={i} className="thumbnail-item">
              <img src={src} alt={`画像${i + 1}`} />
              <button className="thumbnail-remove" onClick={() => removeImage(i)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BatchMode({ settings }) {
  const [products, setProducts] = useState([{ title: '', images: [] }]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState([]);

  const addProduct = () => {
    setProducts(prev => [...prev, { title: '', images: [] }]);
  };

  const updateProduct = (index, product) => {
    setProducts(prev => prev.map((p, i) => i === index ? product : p));
  };

  const removeProduct = (index) => {
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    const validProducts = products.filter(p => p.title.trim());
    if (validProducts.length === 0) {
      alert('少なくとも1つの商品タイトルを入力してください');
      return;
    }

    setGenerating(true);
    setProgress({ current: 0, total: validProducts.length });
    const generatedResults = [];

    for (let i = 0; i < validProducts.length; i++) {
      setProgress({ current: i + 1, total: validProducts.length });
      const canvas = document.createElement('canvas');

      await renderCanvas(canvas, {
        title: validProducts[i].title,
        images: validProducts[i].images,
        ...settings,
      });

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      generatedResults.push({ title: validProducts[i].title, blob });
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

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {products.map((product, i) => (
          <ProductCard
            key={i}
            index={i}
            product={product}
            onUpdate={updateProduct}
            onRemove={removeProduct}
            canRemove={products.length > 1}
          />
        ))}
      </div>

      <button
        className="btn btn-outline"
        onClick={addProduct}
        style={{ width: '100%', marginTop: 12, marginBottom: 12 }}
      >
        ＋ 商品を追加
      </button>

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
