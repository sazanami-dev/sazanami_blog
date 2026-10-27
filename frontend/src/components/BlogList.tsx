import type { PostSortOrder, StrapiPost } from '../types/strapi.types';
import { formatDate, getPublishedDate, isUpdatedAfterPublish, resolveMediaUrl } from '../utils/strapi';
import sazanamiLogo from '../assets/sazanami_dev.svg';
import { AuthorBadge } from './AuthorBadge';

interface BlogListProps {
  posts: StrapiPost[];
  strapiUrl: string;
  sort: PostSortOrder;
}

const SORT_OPTIONS: { value: PostSortOrder; label: string; href: string }[] = [
  { value: 'newest', label: '新しい順', href: '/' },
  { value: 'oldest', label: '古い順', href: '/?sort=oldest' },
];

export function BlogList({ posts, strapiUrl, sort }: BlogListProps) {
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
        <>
          <div className="flex justify-end mb-6">
            <nav aria-label="並び替え" className="glass-panel inline-flex p-1 rounded-xl text-sm font-semibold">
              {SORT_OPTIONS.map((option) => {
                const isActive = option.value === sort;
                return (
                  <a
                    key={option.value}
                    href={option.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`px-4 py-1.5 rounded-lg transition-colors duration-200 ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-blue-600'
                    }`}
                  >
                    {option.label}
                  </a>
                );
              })}
            </nav>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post) => {
              const coverImageUrl = post.coverImage ? resolveMediaUrl(post.coverImage.url, strapiUrl) : null;
              const publishedDate = getPublishedDate(post);

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
                        <div className="ml-auto flex flex-col items-end gap-0.5">
                          {publishedDate ? (
                            <time dateTime={publishedDate}>公開 {formatDate(publishedDate)}</time>
                          ) : (
                            <span>未公開</span>
                          )}
                          {isUpdatedAfterPublish(post) && (
                            <time dateTime={post.updatedAt} className="font-normal text-slate-400">
                              更新 {formatDate(post.updatedAt)}
                            </time>
                          )}
                        </div>
                      </div>
                      <h2 className="text-lg font-bold mb-4 line-clamp-2 text-slate-800 group-hover:text-blue-600 transition-colors duration-200">
                        {post.title}
                      </h2>
                      <div className="flex flex-wrap gap-1.5 mt-auto text-xs text-slate-500">
                        {post.tags && post.tags.map((tag) => (
                          <span key={tag.id} className="opacity-80">#{tag.Name}</span>
                        ))}
                      </div>
                      {post.author && (
                        <div className="mt-4 pt-4 border-t border-black/5">
                          <AuthorBadge author={post.author} strapiUrl={strapiUrl} />
                        </div>
                      )}
                    </div>
                  </article>
                </a>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
