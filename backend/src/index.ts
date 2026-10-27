import type { Core } from '@strapi/strapi';

const POST_UID = 'api::post.post';
const AUTHOR_UID = 'api::author.author';

/** リレーション入力に何らかの値が指定されているか（Content Manager は未選択でも { connect: [], disconnect: [] } を送る） */
function hasRelationValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'object' && !Array.isArray(value)) {
    const { connect, set } = value as { connect?: unknown[]; set?: unknown[] };
    return (connect?.length ?? 0) > 0 || (set?.length ?? 0) > 0;
  }
  return true;
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    // 初回 Publish 時に originalPublishedAt をセットする。
    // Strapi 5 では再 Publish のたびに publishedAt が上書きされるため、初回公開日は別フィールドで保持する。
    // ※ firstPublishedAt は Strapi の予約名で、document service の update 時に null へ書き換えられるため使えない。
    strapi.documents.use(async (context, next) => {
      if (context.uid !== POST_UID || context.action !== 'publish') {
        return next();
      }

      const { documentId } = context.params as { documentId?: string };
      if (documentId) {
        const draft = await strapi.documents(POST_UID).findOne({
          documentId,
          status: 'draft',
          fields: ['originalPublishedAt'],
        });

        // ドラフトに書き込めば、続く publish で公開版にもコピーされる
        if (draft && !draft.originalPublishedAt) {
          await strapi.documents(POST_UID).update({
            documentId,
            data: { originalPublishedAt: new Date().toISOString() },
          });
        }
      }

      return next();
    });

    // 管理画面で記事を作成したとき、投稿者が未選択ならログイン中の管理ユーザーに紐づく Author をセットする。
    // API トークン経由の作成など、管理ユーザーがいないリクエストでは何もしない。
    strapi.documents.use(async (context, next) => {
      if (context.uid !== POST_UID || context.action !== 'create') {
        return next();
      }

      const { data } = context.params as { data?: Record<string, unknown> };
      const ctx = strapi.requestContext.get();
      const adminUser = ctx?.state?.auth?.strategy?.name === 'admin' ? ctx.state.user : undefined;

      if (data && adminUser && !hasRelationValue(data.author)) {
        const author = await strapi.documents(AUTHOR_UID).findFirst({
          filters: { adminUser: { id: adminUser.id } },
          fields: ['documentId'],
        });

        if (author) {
          data.author = author.documentId;
        }
      }

      return next();
    });
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // originalPublishedAt が未設定の公開済み記事へ、現在の publishedAt をバックフィルする
    const rows = await strapi.db.query(POST_UID).findMany({
      select: ['documentId', 'publishedAt'],
      where: {
        publishedAt: { $notNull: true },
        originalPublishedAt: { $null: true },
      },
    });

    for (const row of rows) {
      await strapi.db.query(POST_UID).updateMany({
        where: { documentId: row.documentId },
        data: { originalPublishedAt: row.publishedAt },
      });
    }
  },
};
