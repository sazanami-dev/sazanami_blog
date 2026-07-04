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
    const strapiUrl = import.meta.env.STRAPI_URL;
    const token = import.meta.env.STRAPI_TOKEN;

    // クエリパラメータがある場合は結合（例: 画像やカテゴリを一緒に取得する populate など）
    const queryString = options.query ? `?${options.query}` : '';
    const url = `${strapiUrl}/api/${endpoint}${queryString}`;

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