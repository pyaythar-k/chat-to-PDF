'use client';

import { useUser } from '@clerk/nextjs';
import {
  FormEvent,
  startTransition,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2Icon, LoaderIcon } from 'lucide-react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { getFirestore, collection, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import askQuestion from '@/actions/askQuestion';
import ChatMessage from './ChatMessage';
import { useToast } from './ui/use-toast';
import Link from 'next/link';

export type Message = {
  id?: string;
  role: 'human' | 'ai' | 'placeholder';
  message: string;
  createdAt: Date;
};

export default function Chat({ id }: { id: string }) {
  const { user } = useUser();
  const { toast } = useToast();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, startTransition] = useTransition();

  const bottomOfChatRef = useRef<HTMLDivElement>(null);

  const [snapshot, loading, error] = useCollection(
    user &&
      query(
        collection(db, 'users', user?.id, 'files', id, 'chat'),
        orderBy('createdAt', 'asc')
      )
  );
  console.log('snapshot', snapshot?.docs);

  useEffect(() => {
    bottomOfChatRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  useEffect(() => {
    if (!snapshot) return;

    console.log('updated snapshot', snapshot.docs);

    const lastMessage = messages.pop();

    if (lastMessage?.role === 'ai' && lastMessage.message === 'Thinking...') {
      return;
    }

    const newMessages = snapshot.docs.map((doc) => {
      const { role, message, createdAt } = doc.data();

      return {
        id: doc.id,
        role,
        message,
        createdAt: createdAt.toDate(),
      };
    });

    setMessages(newMessages);
    console.log('Messages: ', messages);

    //do not use messages here.. infinte loop
  }, [snapshot]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const q = input;
    setInput('');

    setMessages((prev) => [
      ...prev,
      {
        role: 'human',
        message: q,
        createdAt: new Date(),
      },
      {
        role: 'ai',
        message: 'Thinking...',
        createdAt: new Date(),
      },
    ]);

    startTransition(async () => {
      const { success, message } = await askQuestion(id, q);

      if (!success) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: message,
          action: (
            <Button asChild variant="outline" className="text-black">
              <Link href="/dashboard/upgrade">Upgrade</Link>
            </Button>
          ),
        });
      }

      if (!success) {
        setMessages((prev) =>
          prev.slice(0, prev.length - 1).concat([
            {
              role: 'ai',
              message: `whoops... ${message}`,
              createdAt: new Date(),
            },
          ])
        );
      }
    });
    console.log(messages);
  };

  return (
    <div className="flex flex-col h-full overflow-scroll">
      <div className="flex-1 w-full">
        {loading ? (
          <div className="flex items-center justify-center">
            <Loader2Icon className="animate-spin h-20 w-20 text-indigo-600 mt-20" />
          </div>
        ) : (
          <div className="p-5">
            {messages.length === 0 && (
              <ChatMessage
                key={'placeholder'}
                message={{
                  role: 'ai',
                  message: 'Ask me anything about the document!',
                  createdAt: new Date(),
                }}
              />
            )}

            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}

            <div ref={bottomOfChatRef} />
          </div>
        )}
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex sticky bottom-0 space-x-2 p-5 bg-indigo-600/75"
      >
        <Input
          className="bg-white"
          placeholder="Ask a Question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="submit" disabled={!input || isPending}>
          {isPending ? (
            <LoaderIcon className="animate-spin text-indigo-600" />
          ) : (
            'Ask'
          )}
        </Button>
      </form>
    </div>
  );
}
