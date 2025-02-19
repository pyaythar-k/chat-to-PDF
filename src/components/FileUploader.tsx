'use client';
import useSubscription from '@/hooks/useSubscription';
import useUpload, { StatusText } from '@/hooks/useUpload';
import {
  CheckCircleIcon,
  CircleArrowDownIcon,
  HammerIcon,
  RocketIcon,
  SaveIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CSSProperties, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { Button } from './ui/button';

export default function FileUploader() {
  const { progress, status, fileId, handleUpload } = useUpload();
  const { isOverFileLimit, filesLoading } = useSubscription();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (fileId) {
      router.push(`/dashboard/files/${fileId}`);
    }
  }, [fileId, router]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      console.log(acceptedFiles);
      const file = acceptedFiles[0];
      if (file) {
        console.log('DEBUG: ' + isOverFileLimit);
        if (!isOverFileLimit && !filesLoading) {
          await handleUpload(file);
        } else {
          toast({
            variant: 'destructive',
            title: 'Free Plan File Limit Reached',
            description:
              'You have reached the maximum files allowed for your plan.',
            action: (
              <Button asChild variant="outline" className="text-black">
                <Link href="/dashboard/upgrade">Upgrade</Link>
              </Button>
            ),
          });
        }
      } else {
        //toast.error
      }
    },
    [handleUpload, isOverFileLimit, filesLoading]
  );

  const statusIcons: {
    [key in StatusText]: JSX.Element;
  } = {
    [StatusText.UPLOADING]: (
      <RocketIcon size={20} className="text-indigo-600" />
    ),
    [StatusText.UPLOADED]: (
      <CheckCircleIcon size={20} className="text0indigo-600" />
    ),
    [StatusText.SAVING]: <SaveIcon size={20} className="text0indigo-600" />,
    [StatusText.GENERATING]: (
      <HammerIcon size={20} className="text0indigo-600 animate-bounce" />
    ),
  };

  const { getRootProps, getInputProps, isDragActive, isFocused, isDragAccept } =
    useDropzone({
      onDrop,
      maxFiles: 1,
      accept: {
        'application/pdf': ['.pdf'],
      },
    });

  const uploadInProgress = progress != null && progress >= 0 && progress <= 100;

  return (
    <div className="flex flex-col gap-4 items-center max-w-7xl mx-auto">
      {uploadInProgress && (
        <div className="mt-32 flex flex-col justify-center items-center gap-5">
          <div
            className={`radial-progress bg-indigo-300 text-white border-indigo-500 border-4 ${
              progress === 100 && 'hidden'
            }`}
            role="progressbar"
            style={
              {
                '--value': progress,
                '--size': '12rem',
                '--thickness': '1.3rem',
              } as CSSProperties
            }
          >
            {progress} %
          </div>
          {statusIcons[status!]}
          <p className="text-indigo-600 animate-pulse">
            {status !== null && <span>{status.toString()}</span>}
          </p>
        </div>
      )}
      {!uploadInProgress && (
        <div
          {...getRootProps()}
          className={`p-10 border-2 border-dashed mt-10 w-[90%] border-indigo-600 text-indigo-600 rounded-lg h-96 flex items-center justify-center ${
            isFocused || isDragAccept ? 'bg-indigo-300' : 'bg-indigo-100'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center">
            {isDragActive ? (
              <>
                <RocketIcon className="h-20 w-20 animate-ping" />
                <p>Drop the files here ...</p>
              </>
            ) : (
              <>
                <CircleArrowDownIcon className="h-20 w-20 animate-bounce" />
                <p>
                  Drag &apos;n&apos; drop some files here, or click to select
                  files
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
