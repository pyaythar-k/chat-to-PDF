import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import pc from './pinecone';
import { auth } from '@clerk/nextjs/server';
import { Index, RecordMetadata } from '@pinecone-database/pinecone';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { PineconeStore } from '@langchain/pinecone';
import { PineconeConflictError } from '@pinecone-database/pinecone/dist/errors';
import { adminDb } from '../../firebaseAdmin';

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-4o-mini',
});

export const indexName = 'chat-to-pdf';

async function fetchMessageFromDB(docId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('user not found');
  }

  console.log('fetching chat history from firestore database');

  const chats = await adminDb
    .collection('users')
    .doc(userId)
    .collection('files')
    .doc(docId)
    .collection('chat')
    .orderBy('createdAt', 'desc')
    .limit(5)
    .get();

  const chatHistory = chats.docs.map((doc) => {
    return doc.data().role === 'human'
      ? new HumanMessage(doc.data().message)
      : new AIMessage(doc.data().message);
  });

  console.log(`fetched last ${chatHistory.length} messages successfully`);
  console.log(chatHistory.map((msg) => msg.content.toString()));

  return chatHistory;
}

export async function generateDocs(docId: string) {
  const { userId } = await auth();

  if (!userId) throw new Error('user not found');

  console.log('--- fetching the download URL from firebase...');
  const firebaseRef = await adminDb
    .collection('users')
    .doc(userId)
    .collection('files')
    .doc(docId)
    .get();

  const downloadUrl = firebaseRef.data()?.downloadURL;

  if (!downloadUrl) {
    throw new Error('download url not found');
  }

  console.log('download url fetched successfully');

  const response = await fetch(downloadUrl);

  const data = await response.blob();

  console.log('loading pdf');
  const loader = new PDFLoader(data);
  const docs = await loader.load();

  console.log('splitting document into smaller parts');
  const splitter = new RecursiveCharacterTextSplitter();

  const splitDocs = await splitter.splitDocuments(docs);
  console.log(`split into ${splitDocs.length} documents`);

  return splitDocs;
}

async function namespaceExists(
  index: Index<RecordMetadata>,
  namespace: string
) {
  if (namespace === null) throw new Error('No namespace value provided');
  const { namespaces } = await index.describeIndexStats();
  return namespaces?.[namespace] !== undefined;
}

export async function generateEmbeddingsInPineconeVectorStore(docId: string) {
  const { userId } = await auth();

  if (!userId) throw new Error('user not found');

  let pineconeVectorStore;

  console.log('--- Generating embeddings ---');
  const embeddings = new OpenAIEmbeddings();

  const index = await pc.index(indexName);
  const namespaceAlreadyExists = await namespaceExists(index, docId);

  if (namespaceAlreadyExists) {
    console.log(
      `Namespace ${docId} already exists, reusing existing embeddings... `
    );

    pineconeVectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace: docId,
    });

    return pineconeVectorStore;
  } else {
    const splitDocs = await generateDocs(docId);

    console.log(
      `storing embeddings in namespace ${docId} in the ${indexName} Pinecone vector store`
    );

    pineconeVectorStore = await PineconeStore.fromDocuments(
      splitDocs,
      embeddings,
      {
        pineconeIndex: index,
        namespace: docId,
      }
    );

    return pineconeVectorStore;
  }
}

const generateLangchainCompletion = async (docId: string, question: string) => {
  let pineconeVectorStore;

  pineconeVectorStore = await generateEmbeddingsInPineconeVectorStore(docId);

  if (!pineconeVectorStore) {
    throw new Error('PineconeVectorStore not found');
  }

  console.log('creating a retriever');
  const retriever = pineconeVectorStore.asRetriever();

  const chatHistory = await fetchMessageFromDB(docId);

  console.log('defining a prompt template');
  const historyAwarePrompt = ChatPromptTemplate.fromMessages([
    ...chatHistory,
    ['user', '{input}'],
    [
      'user',
      'Given the above conversation, genearte a search query to look up in order to get information relevant to the conversation',
    ],
  ]);

  console.log('creating history-aware retriever chain');
  const historyAwareRetrieverChain = await createHistoryAwareRetriever({
    llm: model,
    retriever,
    rephrasePrompt: historyAwarePrompt,
  });

  console.log('defining a prompt template for answering questions...');
  const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      "Answer the user's questions based on the below context:\n\n{context}",
    ],
    ...chatHistory,
    ['user', '{input}'],
  ]);

  console.log('creating a document combining chain...');
  const historyAwareCombineDocsChain = await createStuffDocumentsChain({
    llm: model,
    prompt: historyAwareRetrievalPrompt,
  });

  console.log('creating main retrieval chain...');
  const conversationalRetrievalChain = await createRetrievalChain({
    retriever: historyAwareRetrieverChain,
    combineDocsChain: historyAwareCombineDocsChain,
  });

  console.log('running the chain with a sample conversation...');
  const reply = await conversationalRetrievalChain.invoke({
    chat_history: chatHistory,
    input: question,
  });

  console.log(reply.answer);
  return reply.answer;
};

export { model, generateLangchainCompletion };
