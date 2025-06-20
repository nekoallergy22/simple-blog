import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Post, PostFrontMatter } from '@/types';

const postsDirectory = path.join(process.cwd(), 'posts');

function generateSlug(filename: string): string {
  return filename
    .replace(/\.md$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9\-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getPostsFromMarkdown(): Post[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const markdownFiles = fileNames.filter(name => name.endsWith('.md'));

  const posts: Post[] = markdownFiles.map((fileName) => {
    const filePath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    const frontMatter = data as PostFrontMatter;

    // Generate slug if not provided
    const slug = frontMatter.slug || generateSlug(fileName);
    
    return {
      id: slug,
      title: frontMatter.title || 'Untitled',
      content: content.trim(),
      slug: slug,
      category: frontMatter.category || 'uncategorized',
      date: frontMatter.date || new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  // Sort by date (newest first)
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlugFromMarkdown(slug: string): Post | null {
  const posts = getPostsFromMarkdown();
  console.log('Looking for slug:', slug);
  console.log('Available posts:', posts.map(p => p.slug));
  const found = posts.find(post => post.slug === slug) || null;
  console.log('Found post:', found ? found.title : 'null');
  return found;
}