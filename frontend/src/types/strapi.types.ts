// ============================
// Strapi v5 REST API 共通型
// ============================

/** Strapi REST API のレスポンスラッパー（一覧取得用） */
export interface StrapiListResponse<T> {
  data: T[];
  meta: StrapiMeta;
}

/** Strapi REST API のレスポンスラッパー（単一取得用） */
export interface StrapiSingleResponse<T> {
  data: T;
  meta: StrapiMeta;
}

/** レスポンスメタ情報 */
export interface StrapiMeta {
  pagination?: StrapiPagination;
}

/** ページネーション情報 */
export interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

// ============================
// コンテンツ型（API レスポンス）
// ============================

/** Strapi共通のベースフィールド */
interface StrapiBaseEntity {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

/** Post（ブログ記事） — api::post.post に対応 */
export interface StrapiPost extends StrapiBaseEntity {
  title: string;
  slug: string | null;
  content: StrapiBlock[] | null;
  coverImage: StrapiMedia | null;
  category: StrapiCategory | null;
  tags: StrapiTag[];
}

/** Category — api::category.category に対応 */
export interface StrapiCategory extends StrapiBaseEntity {
  name: string;
  slug: string | null;
}

/** Tag — api::tag.tag に対応 */
export interface StrapiTag extends StrapiBaseEntity {
  Name: string;
  slug: string | null;
}

/** Media（画像・ファイル等） */
export interface StrapiMedia {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  formats: StrapiMediaFormats | null;
  url: string;
  previewUrl: string | null;
  mime: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

/** Media のフォーマットバリエーション */
export interface StrapiMediaFormats {
  thumbnail?: StrapiMediaFormat;
  small?: StrapiMediaFormat;
  medium?: StrapiMediaFormat;
  large?: StrapiMediaFormat;
}

/** 個別のMedia フォーマット情報 */
export interface StrapiMediaFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  url: string;
}

// ============================
// Blocks エディタ用型定義
// ============================

export interface StrapiBlock {
  type: string;
  level?: number;
  format?: string;
  children?: StrapiBlockChild[];
  image?: StrapiBlockImage;
}

export interface StrapiBlockImage {
  name: string;
  alternativeText: string | null;
  url: string;
  width?: number;
  height?: number;
  mime?: string;
  size?: number;
}

export interface StrapiBlockChild {
  type: string;
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  children?: StrapiBlockChild[];
  url?: string;
}

