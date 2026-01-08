import type { Site, SiteTheme, Page, Section, NavbarSection } from "@muse/core";
import type { SitesTable, SiteSummary, SiteUpdatableFields, MessagesTable, StoredMessage, StoredUsage, StoredAgentState } from "./types";
import { getDb } from "../db";

interface SiteRow {
  id: string
  user_id: string
  name: string
  description: string | null
  location: string | null
  site_type: string | null
  theme: SiteTheme
  navbar: NavbarSection | null
  costs: Site["costs"] | null
  domain: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

interface PageRow {
  id: string
  site_id: string
  slug: string
  parent_id: string | null
  page_order: number
  meta: { title: string, description?: string, ogImage?: string }
  created_at: string
  updated_at: string
}

interface SectionRow {
  id: string
  page_id: string
  type: string
  preset: string | null
  position: number
  content: Record<string, unknown>
  created_at: string
  updated_at: string
}

export function createPostgresSitesTable(): SitesTable {
  const sql = getDb();

  return {
    async save(site: Site, userId: string): Promise<void> {
      const now = new Date().toISOString();

      await sql`BEGIN`;

      try {
        await sql`
          INSERT INTO sites (id, user_id, name, description, location, site_type, theme, navbar, costs, created_at, updated_at)
          VALUES (${site.id}, ${userId}, ${site.name}, ${site.description ?? null}, ${site.location ?? null}, ${site.siteType ?? "landing"}, ${JSON.stringify(site.theme)}, ${site.navbar ? JSON.stringify(site.navbar) : null}, ${site.costs ? JSON.stringify(site.costs) : null}, ${site.createdAt}, ${now})
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            location = EXCLUDED.location,
            site_type = EXCLUDED.site_type,
            theme = EXCLUDED.theme,
            navbar = EXCLUDED.navbar,
            costs = EXCLUDED.costs,
            updated_at = EXCLUDED.updated_at
        `;

        const existingPages = await sql`SELECT id FROM pages WHERE site_id = ${site.id}` as { id: string }[];
        const existingPageIds = new Set(existingPages.map(p => p.id));
        const newPageIds = new Set(Object.keys(site.pages));

        for (const pageId of existingPageIds) {
          if (!newPageIds.has(pageId)) {
            await sql`DELETE FROM pages WHERE id = ${pageId}`;
          }
        }

        for (const page of Object.values(site.pages)) {
          await sql`
            INSERT INTO pages (id, site_id, slug, parent_id, page_order, meta, created_at, updated_at)
            VALUES (${page.id}, ${site.id}, ${page.slug}, ${page.parentId ?? null}, ${page.order ?? 0}, ${JSON.stringify(page.meta)}, ${page.createdAt ?? now}, ${now})
            ON CONFLICT (id) DO UPDATE SET
              slug = EXCLUDED.slug,
              parent_id = EXCLUDED.parent_id,
              page_order = EXCLUDED.page_order,
              meta = EXCLUDED.meta,
              updated_at = EXCLUDED.updated_at
          `;

          const existingSections = await sql`SELECT id FROM sections WHERE page_id = ${page.id}` as { id: string }[];
          const existingSectionIds = new Set(existingSections.map(s => s.id));
          const newSectionIds = new Set(page.sections.map(s => s.id));

          for (const sectionId of existingSectionIds) {
            if (!newSectionIds.has(sectionId)) {
              await sql`DELETE FROM sections WHERE id = ${sectionId}`;
            }
          }

          for (const [i, section] of page.sections.entries()) {
            const { id, type, preset, ...content } = section;

            await sql`
              INSERT INTO sections (id, page_id, type, preset, position, content, created_at, updated_at)
              VALUES (${id}, ${page.id}, ${type}, ${preset ?? null}, ${i}, ${JSON.stringify(content)}, ${now}, ${now})
              ON CONFLICT (id) DO UPDATE SET
                type = EXCLUDED.type,
                preset = EXCLUDED.preset,
                position = EXCLUDED.position,
                content = EXCLUDED.content,
                updated_at = EXCLUDED.updated_at
            `;
          }
        }

        await sql`COMMIT`;
      }
      catch (error) {
        await sql`ROLLBACK`;
        throw error;
      }
    },

    async getById(id: string): Promise<Site | null> {
      const sites = await sql`SELECT * FROM sites WHERE id = ${id}` as SiteRow[];
      const siteRow = sites[0];
      if (!siteRow) return null;
      const pageRows = await sql`SELECT * FROM pages WHERE site_id = ${id} ORDER BY page_order, created_at` as PageRow[];
      const pageIds = pageRows.map(p => p.id);
      const sectionRows: SectionRow[] = pageIds.length > 0
        ? await sql`SELECT * FROM sections WHERE page_id = ANY(${pageIds}) ORDER BY position` as SectionRow[]
        : [];

      const sectionsByPage = new Map<string, Section[]>();
      for (const row of sectionRows) {
        const section: Section = {
          id: row.id,
          type: row.type,
          preset: row.preset ?? undefined,
          ...row.content,
        } as Section;

        const list = sectionsByPage.get(row.page_id) ?? [];
        list.push(section);
        sectionsByPage.set(row.page_id, list);
      }

      const pages: Record<string, Page> = {};
      for (const row of pageRows) {
        pages[row.id] = {
          id: row.id,
          slug: row.slug,
          parentId: row.parent_id,
          order: row.page_order,
          meta: row.meta,
          sections: sectionsByPage.get(row.id) ?? [],
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      }

      return {
        id: siteRow.id,
        name: siteRow.name,
        description: siteRow.description ?? void 0,
        location: siteRow.location ?? void 0,
        siteType: (siteRow.site_type as "landing" | "full") ?? void 0,
        theme: siteRow.theme,
        navbar: siteRow.navbar ?? void 0,
        costs: siteRow.costs ?? void 0,
        pages,
        createdAt: siteRow.created_at,
        updatedAt: siteRow.updated_at,
      };
    },

    async getByIdForUser(id: string, userId: string): Promise<Site | null> {
      const sites = await sql`SELECT * FROM sites WHERE id = ${id} AND user_id = ${userId}` as SiteRow[];
      const siteRow = sites[0];
      if (!siteRow) return null;

      const pageRows = await sql`SELECT * FROM pages WHERE site_id = ${id} ORDER BY page_order, created_at` as PageRow[];
      const pageIds = pageRows.map(p => p.id);
      const sectionRows: SectionRow[] = pageIds.length > 0
        ? await sql`SELECT * FROM sections WHERE page_id = ANY(${pageIds}) ORDER BY position` as SectionRow[]
        : [];

      const sectionsByPage = new Map<string, Section[]>();
      for (const row of sectionRows) {
        const section: Section = {
          id: row.id,
          type: row.type,
          preset: row.preset ?? undefined,
          ...row.content,
        } as Section;

        const list = sectionsByPage.get(row.page_id) ?? [];
        list.push(section);
        sectionsByPage.set(row.page_id, list);
      }

      const pages: Record<string, Page> = {};
      for (const row of pageRows) {
        pages[row.id] = {
          id: row.id,
          slug: row.slug,
          parentId: row.parent_id,
          order: row.page_order,
          meta: row.meta,
          sections: sectionsByPage.get(row.id) ?? [],
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      }

      return {
        id: siteRow.id,
        name: siteRow.name,
        description: siteRow.description ?? void 0,
        location: siteRow.location ?? void 0,
        siteType: (siteRow.site_type as "landing" | "full") ?? void 0,
        theme: siteRow.theme,
        navbar: siteRow.navbar ?? void 0,
        costs: siteRow.costs ?? void 0,
        pages,
        createdAt: siteRow.created_at,
        updatedAt: siteRow.updated_at,
      };
    },

    async listByUser(userId: string): Promise<SiteSummary[]> {
      const rows = await sql`
        SELECT s.id, s.name, s.updated_at, s.thumbnail_url, COUNT(p.id)::int as page_count
        FROM sites s
        LEFT JOIN pages p ON p.site_id = s.id
        WHERE s.user_id = ${userId}
        GROUP BY s.id
        ORDER BY s.updated_at DESC
      ` as { id: string, name: string, updated_at: string, thumbnail_url: string | null, page_count: number }[];

      return rows.map(r => ({
        id: r.id,
        name: r.name,
        updatedAt: r.updated_at,
        pageCount: r.page_count,
        thumbnailUrl: r.thumbnail_url ?? undefined,
      }));
    },

    async delete(id: string, userId: string): Promise<void> {
      await sql`DELETE FROM sites WHERE id = ${id} AND user_id = ${userId}`;
    },

    async updateSection(sectionId: string, section: Section): Promise<void> {
      const { id, type, preset, ...content } = section;
      const now = new Date().toISOString();
      void id; // extracted to exclude from content

      await sql`
        UPDATE sections
        SET type = ${type},
            preset = ${preset ?? null},
            content = ${JSON.stringify(content)},
            updated_at = ${now}
        WHERE id = ${sectionId}
      `;
    },

    async updateFields(siteId: string, fields: SiteUpdatableFields): Promise<void> {
      const now = new Date().toISOString();

      // Update each field individually - simpler than dynamic query building
      if ("name" in fields) {
        await sql`UPDATE sites SET name = ${fields.name}, updated_at = ${now} WHERE id = ${siteId}`;
      }
      if ("description" in fields) {
        await sql`UPDATE sites SET description = ${fields.description}, updated_at = ${now} WHERE id = ${siteId}`;
      }
      if ("location" in fields) {
        await sql`UPDATE sites SET location = ${fields.location}, updated_at = ${now} WHERE id = ${siteId}`;
      }
      if ("thumbnailUrl" in fields) {
        await sql`UPDATE sites SET thumbnail_url = ${fields.thumbnailUrl}, updated_at = ${now} WHERE id = ${siteId}`;
      }
      if ("theme" in fields) {
        await sql`UPDATE sites SET theme = ${JSON.stringify(fields.theme)}, updated_at = ${now} WHERE id = ${siteId}`;
      }
    },

    async appendCost(siteId: string, cost: StoredUsage): Promise<void> {
      const now = new Date().toISOString();
      // Use jsonb_set to append cost to the existing array, or create new array if null
      await sql`
        UPDATE sites
        SET
          costs = COALESCE(costs, '[]'::jsonb) || ${JSON.stringify(cost)}::jsonb,
          updated_at = ${now}
        WHERE id = ${siteId}
      `;
    },
  };
}

interface MessageRow {
  id: string
  site_id: string
  role: "user" | "assistant"
  content: string
  created_at: string
  usage: StoredUsage | null
  agents: StoredAgentState[] | null
}

export function createPostgresMessagesTable(): MessagesTable {
  const sql = getDb();

  return {
    async save(message: StoredMessage): Promise<void> {
      await sql`
        INSERT INTO messages (id, site_id, role, content, created_at, usage, agents)
        VALUES (
          ${message.id},
          ${message.siteId},
          ${message.role},
          ${message.content},
          ${message.createdAt},
          ${message.usage ? JSON.stringify(message.usage) : null},
          ${message.agents ? JSON.stringify(message.agents) : null}
        )
        ON CONFLICT (id) DO UPDATE SET
          content = EXCLUDED.content,
          usage = EXCLUDED.usage,
          agents = EXCLUDED.agents
      `;
    },

    async saveBatch(messages: StoredMessage[]): Promise<void> {
      if (messages.length === 0) return;

      await sql`BEGIN`;
      try {
        for (const message of messages) {
          await sql`
            INSERT INTO messages (id, site_id, role, content, created_at, usage, agents)
            VALUES (
              ${message.id},
              ${message.siteId},
              ${message.role},
              ${message.content},
              ${message.createdAt},
              ${message.usage ? JSON.stringify(message.usage) : null},
              ${message.agents ? JSON.stringify(message.agents) : null}
            )
            ON CONFLICT (id) DO UPDATE SET
              content = EXCLUDED.content,
              usage = EXCLUDED.usage,
              agents = EXCLUDED.agents
          `;
        }
        await sql`COMMIT`;
      }
      catch (error) {
        await sql`ROLLBACK`;
        throw error;
      }
    },

    async getBySiteId(siteId: string): Promise<StoredMessage[]> {
      const rows = await sql`
        SELECT id, site_id, role, content, created_at, usage, agents
        FROM messages
        WHERE site_id = ${siteId}
        ORDER BY created_at ASC
      ` as MessageRow[];

      return rows.map(row => ({
        id: row.id,
        siteId: row.site_id,
        role: row.role,
        content: row.content,
        createdAt: row.created_at,
        usage: row.usage ?? undefined,
        agents: row.agents ?? undefined,
      }));
    },

    async deleteBySiteId(siteId: string): Promise<void> {
      await sql`DELETE FROM messages WHERE site_id = ${siteId}`;
    },
  };
}
