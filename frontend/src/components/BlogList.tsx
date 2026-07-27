import type { StrapiPost } from '../types/strapi.types';
import { resolveMediaUrl } from '../utils/strapi';
import sazanamiLogo from '../assets/sazanami_dev.svg';

interface BlogListProps {
  posts: StrapiPost[];
  strapiUrl: string;
}

export function BlogList({ posts, strapiUrl }: BlogListProps) {
  const logoSrc = typeof sazanamiLogo === 'string' ? sazanamiLogo : sazanamiLogo.src;
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <section className="text-center py-12 md:py-16 mb-8">
        <div className="flex items-center justify-center gap-2 md:gap-2 mb-6">
          <img
            src={logoSrc}
            alt="sazanami logo"
            className="w-64 md:w-80 md:h-auto"
          />
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Blog
          </h1>
        </div>
        <p className="text-slate-500 text-base md:text-lg max-w-4xl mx-auto px-4">
          サークルの活動、開発記録、メンバーによるブログ記事をお届けします。
        </p>
      </section>

      {posts.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-500 rounded-2xl">
          <p>記事がありません。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => {
            const coverImageUrl = post.coverImage ? resolveMediaUrl(post.coverImage.url, strapiUrl) : null;
            const dateStr = post.publishedAt 
              ? new Date(post.publishedAt).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })
              : '未公開';

            return (
              <a href={`/blog/${post.slug ?? post.documentId}`} key={post.id} className="block group">
                <article className="glass-panel h-full flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-500/20 hover:shadow-xl hover:shadow-slate-200/50">
                  {coverImageUrl ? (
                    <div className="h-48 overflow-hidden border-b border-black/5 bg-slate-50 flex items-center justify-center">
                      <img src={coverImageUrl} alt={post.title} className="max-w-full max-h-full object-contain" />
                    </div>
                  ) : (
                    <div className="h-44 bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center items-center text-blue-500/30 font-semibold tracking-wider text-sm border-b border-black/5">
                      <span>No Image</span>
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-center mb-4 text-xs font-semibold text-slate-500">
                      {post.category && (
                        <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md">
                          {post.category.name}
                        </span>
                      )}
                      <span>{dateStr}</span>
                    </div>
                    <h2 className="text-lg font-bold mb-4 line-clamp-2 text-slate-800 group-hover:text-blue-600 transition-colors duration-200">
                      {post.title}
                    </h2>
                    <div className="flex flex-wrap gap-1.5 mt-auto text-xs text-slate-500">
                      {post.tags && post.tags.map((tag) => (
                        <span key={tag.id} className="opacity-80">#{tag.Name}</span>
                      ))}
                    </div>
                  </div>
                </article>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
