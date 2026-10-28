import { Link } from "react-router-dom";
import type { Poem } from "../../features/poems/poems.types";

interface PoemCardProps {
  poem: Poem;
}

export function PoemCard({ poem }: PoemCardProps) {
  return (
    <article className="bg-white border border-stone-200 rounded-xl transition-all hover:border-stone-400 hover:shadow-sm">
      <Link to={`/poems/${poem.id}`} className="block p-6 group">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-xl font-serif font-bold text-stone-800 group-hover:text-amber-800 transition-colors">
            {poem.title}
          </h2>
          <span className="text-xs text-stone-400">{poem.createdAt}</span>
        </div>

        <p className="text-sm font-medium text-stone-500 mb-4">
          Tác giả: <span className="text-stone-700">{poem.author}</span>
        </p>

        {poem.excerpt && (
          <p className="text-stone-600 font-serif italic text-sm whitespace-pre-line border-l-2 border-stone-200 pl-4 py-1">
            {poem.excerpt}
          </p>
        )}

        <div className="mt-4 flex items-center text-xs font-medium text-amber-800 group-hover:underline">
          Đọc trọn vẹn bài thơ →
        </div>
      </Link>
    </article>
  );
}
