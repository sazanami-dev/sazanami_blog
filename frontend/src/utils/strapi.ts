import type {
    PostSortOrder,
    StrapiListResponse,
    StrapiPost,
    StrapiSingleResponse,
} from '../types/strapi.types';

interface FetchOptions {
    query?: string;
}

/**
 * Strapi REST API への汎用フェッチ関数。
 * ジェネリクスで戻り値の型を指定できる。
 */
async function fetchFromStrapi<T>(
    endpoint: string,
    options: FetchOptions = {},
): Promise<T> {
    const strapiApiUrl = import.meta.env.STRAPI_API_URL 
        || (typeof process !== 'undefined' ? process.env.STRAPI_API_URL : undefined)
        || import.meta.env.STRAPI_URL 
        || (typeof process !== 'undefined' ? process.env.STRAPI_URL : undefined);
    const token = import.meta.env.STRAPI_TOKEN || (typeof process !== 'undefined' ? process.env.STRAPI_TOKEN : undefined);

    // クエリパラメータがある場合は結合（例: 画像やカテゴリを一緒に取得する populate など）
    const queryString = options.query ? `?${options.query}` : '';
    const url = `${strapiApiUrl}/api/${endpoint}${queryString}`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Strapi API error: ${response.statusText}`);
    }

    return (await response.json()) as T;
}

// ============================
// 型安全なヘルパー関数
// ============================

/**
 * 記事取得時の populate 指定。
 * `populate=*` は1階層しか展開しないため、投稿者のアバターまで明示的に展開する。
 */
const POST_POPULATE = [
    'populate[coverImage]=true',
    'populate[category]=true',
    'populate[tags]=true',
    'populate[author][populate][avatar]=true',
].join('&');

/** ブログ記事の一覧を公開日順に取得（リレーション・投稿者アバター込み） */
export async function fetchPosts(
    sort: PostSortOrder = 'newest',
): Promise<StrapiListResponse<StrapiPost>> {
    const direction = sort === 'oldest' ? 'asc' : 'desc';
    return fetchFromStrapi<StrapiListResponse<StrapiPost>>('posts', {
        query: `sort[0]=originalPublishedAt:${direction}&sort[1]=publishedAt:${direction}&${POST_POPULATE}`,
    });
}

/** slugでブログ記事を1件取得（リレーション・投稿者アバター込み） */
export async function fetchPostBySlug(
    slug: string,
): Promise<StrapiListResponse<StrapiPost>> {
    return fetchFromStrapi<StrapiListResponse<StrapiPost>>('posts', {
        query: `filters[slug][$eq]=${encodeURIComponent(slug)}&${POST_POPULATE}`,
    });
}

/** documentIdでブログ記事を1件取得（リレーション・投稿者アバター込み） */
export async function fetchPostByDocumentId(
    documentId: string,
): Promise<StrapiSingleResponse<StrapiPost>> {
    return fetchFromStrapi<StrapiSingleResponse<StrapiPost>>(
        `posts/${encodeURIComponent(documentId)}`,
        { query: POST_POPULATE },
    );
}

// ============================
// 日付ヘルパー
// ============================

/** 記事の公開日（初回公開日を優先し、未設定なら publishedAt） */
export function getPublishedDate(post: StrapiPost): string | null {
    return post.originalPublishedAt ?? post.publishedAt;
}

const DATE_FORMATS: Record<'short' | 'long', Intl.DateTimeFormatOptions> = {
    short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
};

/** ISO 日時文字列を日本語の日付表記に変換する */
export function formatDate(iso: string, style: 'short' | 'long' = 'short'): string {
    return new Date(iso).toLocaleDateString('ja-JP', {
        ...DATE_FORMATS[style],
        timeZone: 'Asia/Tokyo',
    });
}

/** 公開日より後の日付に更新されているか（日付単位で比較） */
export function isUpdatedAfterPublish(post: StrapiPost): boolean {
    const published = getPublishedDate(post);
    if (!published) return false;
    return new Date(post.updatedAt) > new Date(published)
        && formatDate(post.updatedAt) !== formatDate(published);
}

// ============================
// メディア URL ヘルパー
// ============================

/**
 * Strapi のメディア URL を公開用 URL に正規化する。
 *
 * - 相対パス（例: `/uploads/image.png`）→ strapiUrl を先頭に付与
 * - 絶対URL（例: `http://localhost:1337/uploads/image.png`）→ ホスト部分を strapiUrl に差し替え
 *
 * Blocks エディタ内の画像は絶対URLで保存されるため、
 * そのまま使うと本番環境で localhost を参照してしまい表示されなくなる。
 */
export function resolveMediaUrl(rawUrl: string, strapiUrl: string): string {
    // 末尾スラッシュを統一的に除去
    const base = strapiUrl.replace(/\/+$/, '');

    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
        // 絶対URLからパス部分だけ抽出し、公開用ホストに差し替え
        try {
            const { pathname } = new URL(rawUrl);
            return `${base}${pathname}`;
        } catch {
            // URL パースに失敗した場合はそのまま返す
            return rawUrl;
        }
    }

    // 相対パスの場合は公開用ホストを先頭に付与
    const path = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
    return `${base}${path}`;
}