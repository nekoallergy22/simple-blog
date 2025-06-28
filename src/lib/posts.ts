import { collection, getDocs, doc, getDoc, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from './firebase';
import { Post } from '@/types';
import { getPostsFromMarkdown, getPostBySlugFromMarkdown } from './markdown';

export async function getAllPosts(): Promise<Post[]> {
  // Try Firebase first, fallback to markdown files
  try {
    if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      const postsRef = collection(db, 'posts');
      const q = query(postsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const posts: Post[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          slug: data.slug,
          category: data.category,
          section: data.section || 'ai', // default to ai for existing content
          date: data.date,
          difficulty: data.difficulty,
          number: data.number,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });
      
      return posts;
    }
  } catch (error) {
    console.error('Firebase error in getAllPosts:', error);
  }
  
  // Fallback to markdown files
  return getPostsFromMarkdown();
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  // Try Firebase first, fallback to markdown files
  try {
    if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      const postsRef = collection(db, 'posts');
      const q = query(postsRef, where('slug', '==', slug), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        
        
        return {
          id: doc.id,
          title: data.title,
          content: data.content,
          slug: data.slug,
          category: data.category,
          section: data.section || 'ai', // default to ai for existing content
          date: data.date,
          difficulty: data.difficulty,
          number: data.number,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }
    }
  } catch (error) {
    console.error('Firebase error in getPostBySlug:', error);
  }
  
  // Fallback to markdown files
  return getPostBySlugFromMarkdown(slug);
}

export async function getPostsByCategory(category: string): Promise<Post[]> {
  // Try Firebase first, fallback to markdown files
  try {
    if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef, 
        where('category', '==', category),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const posts: Post[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          slug: data.slug,
          category: data.category,
          section: data.section || 'ai', // default to ai for existing content
          date: data.date,
          difficulty: data.difficulty,
          number: data.number,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });
      
      return posts;
    }
  } catch (error) {
    console.error('Firebase error in getPostsByCategory:', error);
  }
  
  // Fallback to markdown files
  const allPosts = getPostsFromMarkdown();
  return allPosts.filter(post => post.category === category);
}

export async function getPostsBySection(section: string): Promise<Post[]> {
  // Try Firebase first, fallback to markdown files
  try {
    if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      const postsRef = collection(db, 'posts');
      const q = query(postsRef, where('section', '==', section));
      const querySnapshot = await getDocs(q);
      
      const posts: Post[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          slug: data.slug,
          category: data.category,
          section: data.section || 'ai',
          date: data.date,
          difficulty: data.difficulty,
          number: data.number,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });
      
      // Sort on client-side to avoid compound index requirement
      return posts.sort((a, b) => {
        // Sort by number first, then by date
        if (a.number && b.number && a.number !== b.number) {
          return a.number - b.number;
        }
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    }
  } catch (error) {
    console.error('Firebase error in getPostsBySection:', error);
  }
  
  // Fallback to markdown files
  const allPosts = getPostsFromMarkdown();
  return allPosts.filter(post => post.section === section);
}