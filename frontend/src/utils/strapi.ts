import type {
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

/** ブログ記事の一覧を取得（リレーション全展開） */
export async function fetchPosts(): Promise<StrapiListResponse<StrapiPost>> {
    return fetchFromStrapi<StrapiListResponse<StrapiPost>>('posts', {
        query: 'populate=*',
    });
}

/** slugでブログ記事を1件取得（リレーション全展開） */
export async function fetchPostBySlug(
    slug: string,
): Promise<StrapiListResponse<StrapiPost>> {
    return fetchFromStrapi<StrapiListResponse<StrapiPost>>('posts', {
        query: `filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`,
    });
}

/** documentIdでブログ記事を1件取得（リレーション全展開） */
export async function fetchPostByDocumentId(
    documentId: string,
): Promise<StrapiSingleResponse<StrapiPost>> {
    return fetchFromStrapi<StrapiSingleResponse<StrapiPost>>(
        `posts/${encodeURIComponent(documentId)}`,
        { query: 'populate=*' },
    );
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