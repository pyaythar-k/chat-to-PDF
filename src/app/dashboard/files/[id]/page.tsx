import { auth } from '@clerk/nextjs/server';
import { adminDb } from '../../../../../firebaseAdmin';
import { ref } from 'firebase/storage';
import PdfView from '@/components/PdfView';
import Chat from '@/components/Chat';

export default async function ChatToFilePage({
  params: { id },
}: {
  params: { id: string };
}) {
  auth().protect();
  const { userId } = await auth();

  const firebaseRef = await adminDb
    .collection('users')
    .doc(userId!)
    .collection('files')
    .doc(id)
    .get();

  const url = firebaseRef.data()?.downloadURL;

  return (
    <div className="grid lg:grid-cols-5 h-full overflow-hidden">
      <div className="col-span-5 lg:col-span-2 overflow-y-auto">
        <Chat id={id} />
      </div>
      <div className="col-span-5 lg:col-span-3 bg-gray-100 border-r-2 lg:border-indigo-600 lg:-order-1 overflow-auto">
        <PdfView url={url} />
      </div>
    </div>
  );
}
