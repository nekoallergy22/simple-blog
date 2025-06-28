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
  const posts: Post[] = [];
  
  // Get all section directories
  const sections = ['ai', 'python', 'datascience', 'tensorflow', 'git', 'docker', 'linux'];
  
  for (const section of sections) {
    const sectionDirectory = path.join(postsDirectory, section);
    
    if (!fs.existsSync(sectionDirectory)) {
      continue;
    }

    const fileNames = fs.readdirSync(sectionDirectory);
    const markdownFiles = fileNames.filter(name => name.endsWith('.md'));

    const sectionPosts: Post[] = markdownFiles.map((fileName) => {
      const filePath = path.join(sectionDirectory, fileName);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);
      const frontMatter = data as PostFrontMatter;

      // Parse number from filename as fallback
      const fileNumber = parseInt(fileName.match(/^(\d+)/)?.[1] || '0', 10);
      
      // Ensure number is properly parsed (YAML parsing might return string)
      let postNumber = frontMatter.number;
      if (typeof postNumber === 'string') {
        postNumber = parseInt(postNumber, 10);
      }
      if (!postNumber && postNumber !== 0) {
        postNumber = fileNumber;
      }

      // Generate slug if not provided
      const slug = frontMatter.slug || generateSlug(fileName);
      
      // Map difficulty to level
      let level = frontMatter.level;
      if (!level && frontMatter.difficulty) {
        switch (frontMatter.difficulty) {
          case 'basic':
            level = 1;
            break;
          case 'intermediate':
            level = 2;
            break;
          case 'advanced':
            level = 3;
            break;
          default:
            level = 1;
        }
      }
      
      return {
        id: slug,
        title: frontMatter.title || 'Untitled',
        content: content.trim(),
        slug: slug,
        category: frontMatter.category || 'uncategorized',
        section: frontMatter.section || section,
        date: frontMatter.date || new Date().toISOString().split('T')[0],
        difficulty: frontMatter.difficulty,
        level: level,
        number: postNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    posts.push(...sectionPosts);
  }

  // Sort by number (ascending) then by date
  return posts.sort((a, b) => {
    if (a.number && b.number) {
      return a.number - b.number;
    }
    if (a.number && !b.number) return -1;
    if (!a.number && b.number) return 1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
}

export function getPostBySlugFromMarkdown(slug: string): Post | null {
  const posts = getPostsFromMarkdown();
  return posts.find(post => post.slug === slug) || null;
}