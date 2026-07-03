interface FetchOptions {
    query?: string;
}

export async function fetchFromStrapi(endpoint: string, options: FetchOptions = {}) {
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

    return await response.json();
}