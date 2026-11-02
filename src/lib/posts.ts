import { getCollection, type CollectionEntry } from 'astro:content';
import { getItems, type Item } from './items';
import { withBase } from './url';

/** A blog post, normalised for cards, lists and the post page. */
export interface Post {
  slug: string;
  href: string;
  title: string;
  description: string;
  date: Date;
  /** "2 Nov 2026" */
  dateLabel: string;
  author: string;
  /** "SV" for "Sanne de Vries": shown in the avatar circle. */
  initials: string;
  role?: string;
  topic?: string;
  readingMinutes: number;
  /** The library skills and external picks the post is about. */
  items: Item[];
  entry: CollectionEntry<'posts'>;
}

const WORDS_PER_MINUTE = 200;

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function readingMinutes(body = ''): number {
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

let cache: Promise<Post[]> | undefined;

async function load(): Promise<Post[]> {
  const items = await getItems();
  const bySlug = new Map(items.map((item) => [item.slug, item]));
  const entries = await getCollection('posts', ({ data }) => !data.draft);

  return entries
    .map((entry) => {
      const data = entry.data;
      const linked = data.skills.map((slug) => {
        const item = bySlug.get(slug);
        if (!item) {
          throw new Error(
            `posts/${entry.id}.md lists "${slug}" under skills:, but there is no ` +
              `skills/${slug}/ or external/${slug}.md.`,
          );
        }
        return item;
      });

      return {
        slug: entry.id,
        href: withBase(`/blog/${entry.id}/`),
        title: data.title,
        description: data.description,
        date: data.date,
        dateLabel: dateFormat.format(data.date),
        author: data.author,
        initials: initials(data.author),
        role: data.role,
        topic: data.topic,
        readingMinutes: readingMinutes(entry.body),
        items: linked,
        entry,
      } satisfies Post;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime() || a.title.localeCompare(b.title));
}

/** Every published post, newest first. */
export function getPosts(): Promise<Post[]> {
  cache ??= load();
  return cache;
}

/** Posts about one library skill or external pick, newest first. */
export async function postsFor(slug: string): Promise<Post[]> {
  return (await getPosts()).filter((post) => post.items.some((item) => item.slug === slug));
}

/** Items with at least one post, most written about first. */
export function mostWrittenAbout(posts: Post[]): { item: Item; count: number }[] {
  const counts = new Map<string, { item: Item; count: number }>();
  for (const post of posts) {
    for (const item of post.items) {
      const entry = counts.get(item.slug);
      if (entry) entry.count++;
      else counts.set(item.slug, { item, count: 1 });
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.item.title.localeCompare(b.item.title));
}
