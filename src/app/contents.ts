import {
  ClockIcon,
  DownloadIcon,
  FileTextIcon,
  FileUpIcon,
  HelpCircleIcon,
  ListIcon,
  LockIcon,
  MessageCircleMoreIcon,
  SearchIcon,
  UserCheckIcon,
} from 'lucide-react';

export const features = [
  {
    name: 'Upload Document',
    description: 'Allows users to upload PDF documents for AI analysis.',
    icon: FileUpIcon,
  },
  {
    name: 'Chat with AI',
    description:
      'Enables users to have a conversation with AI about the uploaded document.',
    icon: MessageCircleMoreIcon,
  },
  {
    name: 'Document Parsing',
    description:
      'AI parses and understands the content of the uploaded PDF document.',
    icon: FileTextIcon,
  },
  {
    name: 'Content Summarization',
    description: 'AI summarizes the key points from the uploaded document.',
    icon: ListIcon,
  },
  {
    name: 'Question Answering',
    description:
      'AI answers questions related to the content of the uploaded document.',
    icon: HelpCircleIcon,
  },
  {
    name: 'Document Search',
    description:
      'Allows users to search for specific content within the uploaded document.',
    icon: SearchIcon,
  },
  {
    name: 'Secure Storage',
    description: 'Ensures secure storage of uploaded documents.',
    icon: LockIcon,
  },
  {
    name: 'User Authentication',
    description: 'Provides user authentication for secure access to documents.',
    icon: UserCheckIcon,
  },
  {
    name: 'History Tracking',
    description:
      'Tracks the history of user interactions with the AI and documents.',
    icon: ClockIcon,
  },
  {
    name: 'Export Chat',
    description:
      'Allows users to export the chat history with AI for future reference.',
    icon: DownloadIcon,
  },
];
