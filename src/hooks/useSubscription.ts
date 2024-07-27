'use client';

import { useUser } from '@clerk/nextjs';
import { collection, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';
import { db } from '../../firebase';
import { FREE_LIMIT, PRO_LIMIT } from '@/util/constants';

export default function useSubscription() {
  const [hasActiveMembership, setHasActiveMembership] = useState(null);
  const [isOverFileLimit, setIsOverFileLimit] = useState(false);
  const { user } = useUser();

  const [snapshot, loading, error] = useDocument(
    user && doc(db, 'users', user.id),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  const [filesSnapshot, filesLoading] = useCollection(
    user && collection(db, 'users', user?.id, 'files')
  );

  useEffect(() => {
    if (!snapshot) return;

    const data = snapshot.data();
    if (!data) return;

    setHasActiveMembership(data.hasActiveMembership);
  }, [snapshot]);

  useEffect(() => {
    if (!filesSnapshot || hasActiveMembership === null) return;

    const files = filesSnapshot.docs;
    const usersLimit = hasActiveMembership ? PRO_LIMIT : FREE_LIMIT;

    console.log(
      'checking if user is over file limit',
      files.length,
      usersLimit
    );

    setIsOverFileLimit(files.length >= usersLimit);
  }, [filesSnapshot, hasActiveMembership, PRO_LIMIT, FREE_LIMIT]);

  return { hasActiveMembership, loading, error, isOverFileLimit, filesLoading };
}
