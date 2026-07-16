import type { StrapiPost } from '../types/strapi.types';
import { resolveMediaUrl } from '../utils/strapi';

interface BlogListProps {
  posts: StrapiPost[];
  strapiUrl: string;
}

export function BlogList({ posts, strapiUrl }: BlogListProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <section className="text-center py-16 mb-8">
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Sazanami Blog
        </h1>
        <p className="text-slate-500 text-lg max-w-xl mx-auto">
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
                    <div className="h-44 bg-cover bg-center border-b border-black/5" style={{ backgroundImage: `url(${coverImageUrl})` }} />
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
