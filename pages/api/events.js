
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferMemory } from "langchain/memory";
import { GithubRepoLoader } from "langchain/document_loaders/web/github";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  // SSE Setup
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  // Initialize logic
  const loader = new GithubRepoLoader(
    "https://github.com/hwchase17/langchainjs",
    {
      branch: "main",
      recursive: false,
      unknown: "warn",
      maxConcurrency: 5,
    }
  );
  const data = await loader.load();
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 0,
  });
  const splitDocs = await textSplitter.splitDocuments(data);

  const embeddings = new OpenAIEmbeddings();
  const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);

  const sendData = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    streaming: true,
    callbackManager: {
      handleNewToken(token) {
        sendData({ token });
      },
    },
  });

  req.on('close', () => {
    sendData("[DONE]")
    res.end();
  });
};
