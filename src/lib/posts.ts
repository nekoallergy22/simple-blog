import { Post } from '@/types';
import { getPostsFromMarkdown, getPostBySlugFromMarkdown } from './markdown';
import { 
  getPostsFromStatic, 
  getPostBySlugFromStatic, 
  getPostsBySectionFromStatic, 
  getPostsByCategoryFromStatic 
} from './static-posts';

export async function getAllPosts(): Promise<Post[]> {
  // Try Static JSON first, fallback to markdown files
  try {
    return await getPostsFromStatic();
  } catch (staticError) {
    console.warn('Static JSON fallback failed, trying Markdown:', staticError instanceof Error ? staticError.message : 'Unknown error');
    
    // Fallback to markdown files
    return getPostsFromMarkdown();
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  // Try Static JSON first, fallback to markdown files
  try {
    const post = await getPostBySlugFromStatic(slug);
    if (post) return post;
  } catch (staticError) {
    console.warn('Static JSON fallback failed for slug:', slug, staticError instanceof Error ? staticError.message : 'Unknown error');
  }
  
  // Fallback to markdown files
  return getPostBySlugFromMarkdown(slug);
}

export async function getPostsByCategory(category: string): Promise<Post[]> {
  // Try Static JSON first, fallback to markdown files
  try {
    return await getPostsByCategoryFromStatic(category);
  } catch (staticError) {
    console.warn('Static JSON fallback failed for category:', category, staticError instanceof Error ? staticError.message : 'Unknown error');
    
    // Fallback to markdown files
    const allPosts = getPostsFromMarkdown();
    return allPosts.filter(post => post.category === category);
  }
}

export async function getPostsBySection(section: string): Promise<Post[]> {
  // Try Static JSON first, fallback to markdown files
  try {
    return await getPostsBySectionFromStatic(section);
  } catch (staticError) {
    console.warn('Static JSON fallback failed for section:', section, staticError instanceof Error ? staticError.message : 'Unknown error');
    
    // Fallback to markdown files
    const allPosts = getPostsFromMarkdown();
    return allPosts.filter(post => post.section === section);
  }
}