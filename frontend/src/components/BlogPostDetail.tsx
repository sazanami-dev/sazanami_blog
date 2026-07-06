import type { StrapiPost } from '../types/strapi.types';

interface BlogPostDetailProps {
  post: StrapiPost;
  strapiUrl: string;
}

export function BlogPostDetail({ post, strapiUrl }: BlogPostDetailProps) {
  const coverImageUrl = post.coverImage ? `${strapiUrl}${post.coverImage.url}` : null;
  const dateStr = post.publishedAt 
    ? new Date(post.publishedAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
    : '未公開';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <a href="/" className="inline-flex items-center gap-2 text-gray-400 font-semibold mb-8 hover:text-blue-400 hover:-translate-x-1 transition-all duration-200">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        記事一覧に戻る
      </a>

      <article className="glass-panel overflow-hidden rounded-2xl">
        {coverImageUrl && (
          <div className="h-64 md:h-96 bg-cover bg-center border-b border-white/8" style={{ backgroundImage: `url(${coverImageUrl})` }} />
        )}
        
        <div className="p-6 md:p-12">
          <div className="flex items-center gap-4 text-sm mb-6">
            {post.category && (
              <span className="bg-blue-500/15 text-blue-400 px-3 py-1 rounded-md font-semibold">
                {post.category.name}
              </span>
            )}
            <span className="text-gray-400">{dateStr}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-6 leading-tight">
            {post.title}
          </h1>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <span key={tag.id} className="text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-md">
                  #{tag.Name}
                </span>
              ))}
            </div>
          )}

          <hr className="border-white/8 my-8" />

          {/* Blocksコンテンツのレンダリング */}
          <div className="text-gray-200 leading-relaxed text-[17px] max-w-none">
            {post.content && post.content.map((block, idx) => {
              if (block.type === 'paragraph') {
                return (
                  <p key={idx} className="mb-6">
                    {block.children?.map((child, cIdx) => {
                      let classes = '';
                      if (child.bold) classes += ' font-bold';
                      if (child.italic) classes += ' italic';
                      if (child.underline) classes += ' underline';
                      if (child.strikethrough) classes += ' line-through';
                      if (child.code) classes += ' font-mono bg-white/10 px-1.5 py-0.5 rounded text-sm text-pink-300';
                      
                      return (
                        <span key={cIdx} className={classes || undefined}>
                          {child.text}
                        </span>
                      );
                    })}
                  </p>
                );
              }
              if (block.type === 'heading') {
                const level = block.level || 2;
                const HeadingTag = `h${level}` as any;
                
                const headingStyles: Record<string, string> = {
                  h1: 'text-3xl font-extrabold text-white mt-12 mb-6 border-b border-white/8 pb-2',
                  h2: 'text-2xl font-bold text-white mt-10 mb-5 border-b border-white/8 pb-2',
                  h3: 'text-xl font-bold text-white mt-8 mb-4',
                  h4: 'text-lg font-bold text-white mt-6 mb-3',
                  h5: 'text-base font-bold text-white mt-4 mb-2',
                  h6: 'text-sm font-bold text-white mt-4 mb-2',
                };
                const headingClass = headingStyles[`h${level}`] || headingStyles.h2;

                return (
                  <HeadingTag key={idx} className={headingClass}>
                    {block.children?.map((child) => child.text).join('')}
                  </HeadingTag>
                );
              }
              return null;
            })}
          </div>
        </div>
      </article>
    </div>
  );
}
