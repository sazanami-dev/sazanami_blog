import type { StrapiAuthor } from '../types/strapi.types';
import { resolveMediaUrl } from '../utils/strapi';

interface AuthorBadgeProps {
  author: StrapiAuthor;
  strapiUrl: string;
  size?: 'sm' | 'md';
}

const SIZE_STYLES = {
  sm: { avatar: 'w-6 h-6 text-[10px]', name: 'text-xs' },
  md: { avatar: 'w-9 h-9 text-sm', name: 'text-sm' },
};

/** 投稿者のアバターと名前を表示する（アバター未設定時は名前の頭文字） */
export function AuthorBadge({ author, strapiUrl, size = 'sm' }: AuthorBadgeProps) {
  const styles = SIZE_STYLES[size];
  const avatarUrl = author.avatar
    ? resolveMediaUrl(author.avatar.formats?.thumbnail?.url ?? author.avatar.url, strapiUrl)
    : null;

  return (
    <span className="inline-flex items-center gap-2 min-w-0">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className={`${styles.avatar} rounded-full object-cover border border-black/5 shrink-0`}
        />
      ) : (
        <span
          aria-hidden="true"
          className={`${styles.avatar} rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 text-blue-600 font-bold flex items-center justify-center shrink-0`}
        >
          {author.name.charAt(0)}
        </span>
      )}
      <span className={`${styles.name} font-semibold text-slate-600 truncate`}>{author.name}</span>
    </span>
  );
}
