import { FileText, Image, ExternalLink } from 'lucide-react';

interface Props {
  evidence: string;
  maxImages?: number;
}

export default function EvidenceFiles({ evidence, maxImages = 3 }: Props) {
  if (!evidence || evidence === '[]') return null;

  let files: string[];
  try {
    files = JSON.parse(evidence);
  } catch {
    return null;
  }

  if (files.length === 0) return null;

  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];

  const images = files.filter(f => imageExts.some(ext => f.toLowerCase().endsWith(ext)));
  const docs = files.filter(f => !imageExts.some(ext => f.toLowerCase().endsWith(ext)));

  return (
    <div>
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-2">
          {images.slice(0, maxImages).map((p, idx) => (
            <a
              key={idx}
              href={`/${p}`}
              target="_blank"
              rel="noreferrer"
              className="group relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 hover:border-primary-300 hover:shadow-sm transition-all"
            >
              <img
                src={`/${p}`}
                alt={`Evidence ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <ExternalLink size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
              </div>
            </a>
          ))}
          {images.length > maxImages && (
            <div className="w-20 h-20 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
              +{images.length - maxImages}
            </div>
          )}
        </div>
      )}

      {docs.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {docs.map((p, idx) => (
            <a
              key={idx}
              href={`/${p}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md hover:bg-gray-200 hover:text-gray-800 transition-colors"
            >
              <FileText size={12} /> {p.split('/').pop() || `File ${idx + 1}`}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
