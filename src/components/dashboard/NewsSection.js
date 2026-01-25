"use client";

export default function NewsSection({ news }) {
    if (!news || news.length === 0) return null;
    return (
        <div className="mb-8 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 border-l-4 border-blue-500 pl-3">Latest Team News</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {news.slice(0, 4).map((item, i) => (
                    <a key={i} href={item.link} target="_blank" className="bg-slate-800 rounded hover:bg-slate-700 transition border border-slate-700 group overflow-hidden">
                        {item.image && (
                            <img
                                src={item.image}
                                alt={item.title}
                                className="h-32 w-full object-cover rounded-t opacity-80 group-hover:opacity-100 transition"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        )}
                        <div className="p-4">
                            <h4 className="font-bold text-sm text-gray-200 group-hover:text-blue-300 line-clamp-2">{String(item.title)}</h4>
                            <p className="text-xs text-gray-500 mt-2">{String(item.source || "NFL News")}</p>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
