'use server';
import { adminDb, adminStorage } from '../../firebaseAdmin';
import { indexName } from '@/lib/langchain';
import pc from '@/lib/pinecone';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export default async function deleteDocument(docId: string) {
  auth().protect();

  const { userId } = await auth();

  await adminDb
    .collection('users')
    .doc(userId!)
    .collection('files')
    .doc(docId)
    .delete();

  await adminStorage
    .bucket(process.env.FIREBASE_STORAGE_BUCKET)
    .file(`users/${userId}/files/${docId}`)
    .delete();

  const index = await pc.index(indexName);
  await index.namespace(docId).deleteAll();

  revalidatePath('/dashboard');
}
