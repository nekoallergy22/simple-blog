const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
if (!process.env.FIREBASE_PROJECT_ID) {
  console.error('Firebase configuration not found. Please set environment variables.');
  process.exit(1);
}

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

try {
  initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
  process.exit(1);
}

const db = getFirestore();

// Function to generate slug from filename
function generateSlug(filename) {
  return filename
    .replace(/\.md$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9\-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Function to sync markdown files to Firestore
async function syncMarkdownFiles() {
  const postsDir = path.join(process.cwd(), 'posts');
  
  if (!fs.existsSync(postsDir)) {
    console.log('Posts directory not found. Creating posts directory...');
    fs.mkdirSync(postsDir, { recursive: true });
    return;
  }

  const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));
  
  if (files.length === 0) {
    console.log('No markdown files found in posts directory.');
    return;
  }

  console.log(`Found ${files.length} markdown files. Syncing to Firestore...`);

  for (const file of files) {
    try {
      const filePath = path.join(postsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data: frontMatter, content } = matter(fileContent);
      
      // Validate required frontmatter fields
      if (!frontMatter.title || !frontMatter.date) {
        console.warn(`Skipping ${file}: Missing required frontmatter (title, date)`);
        continue;
      }

      // Generate slug from filename if not provided
      const slug = frontMatter.slug || generateSlug(file);
      
      const postData = {
        title: frontMatter.title,
        content: content.trim(),
        slug: slug,
        category: frontMatter.category || 'uncategorized',
        date: frontMatter.date,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Check if post already exists
      const existingPost = await db.collection('posts')
        .where('slug', '==', slug)
        .limit(1)
        .get();

      if (!existingPost.empty) {
        // Update existing post
        const docId = existingPost.docs[0].id;
        await db.collection('posts').doc(docId).update({
          ...postData,
          createdAt: existingPost.docs[0].data().createdAt, // Preserve original creation date
        });
        console.log(`Updated: ${file} -> ${slug}`);
      } else {
        // Create new post
        await db.collection('posts').add(postData);
        console.log(`Created: ${file} -> ${slug}`);
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }

  console.log('Markdown sync completed!');
}

// Run the sync
syncMarkdownFiles().catch(console.error);