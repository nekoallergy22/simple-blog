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
    console.log('Firebase not configured, using markdown files');
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
          date: data.date,
          difficulty: data.difficulty,
          number: data.number,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }
    }
  } catch (error) {
    console.log('Firebase not configured, using markdown files');
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
    console.log('Firebase not configured, using markdown files');
  }
  
  // Fallback to markdown files
  const allPosts = getPostsFromMarkdown();
  return allPosts.filter(post => post.category === category);
}