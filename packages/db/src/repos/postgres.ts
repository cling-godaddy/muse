import type { Site, SiteTheme, SiteNode, Page, Section, NavbarSection } from "@muse/core";
import type { SitesTable } from "./types";
import { getDb } from "../db";

interface SiteRow {
  id: string
  name: string
  theme: SiteTheme
  navbar: NavbarSection | null
  tree: SiteNode[]
  created_at: string
  updated_at: string
}

interface PageRow {
  id: string
  site_id: string
  slug: string
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
    async save(site: Site): Promise<void> {
      const now = new Date().toISOString();

      await sql`BEGIN`;

      try {
        await sql`
          INSERT INTO sites (id, name, theme, navbar, tree, created_at, updated_at)
          VALUES (${site.id}, ${site.name}, ${JSON.stringify(site.theme)}, ${site.navbar ? JSON.stringify(site.navbar) : null}, ${JSON.stringify(site.tree)}, ${site.createdAt}, ${now})
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            theme = EXCLUDED.theme,
            navbar = EXCLUDED.navbar,
            tree = EXCLUDED.tree,
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
            INSERT INTO pages (id, site_id, slug, meta, created_at, updated_at)
            VALUES (${page.id}, ${site.id}, ${page.slug}, ${JSON.stringify(page.meta)}, ${page.createdAt ?? now}, ${now})
            ON CONFLICT (id) DO UPDATE SET
              slug = EXCLUDED.slug,
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
      const pageRows = await sql`SELECT * FROM pages WHERE site_id = ${id} ORDER BY created_at` as PageRow[];
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
          meta: row.meta,
          sections: sectionsByPage.get(row.id) ?? [],
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      }

      return {
        id: siteRow.id,
        name: siteRow.name,
        theme: siteRow.theme,
        navbar: siteRow.navbar ?? undefined,
        tree: siteRow.tree,
        pages,
        createdAt: siteRow.created_at,
        updatedAt: siteRow.updated_at,
      };
    },

    async delete(id: string): Promise<void> {
      await sql`DELETE FROM sites WHERE id = ${id}`;
    },
  };
}
