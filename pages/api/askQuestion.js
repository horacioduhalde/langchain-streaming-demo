import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferWindowMemory } from "langchain/memory";
import { MongoClient, ObjectId } from "mongodb";
import { ConversationChain } from "langchain/chains";
import { MongoDBChatMessageHistory } from "langchain/stores/message/mongodb";
import { ChatPromptTemplate } from "langchain/prompts";

import { AmeliaPersona } from "@/data/prompts/AmeliaPersona";
import { ChatGPTReminder } from "@/data/prompts/ChatGPTReminder";


const systemTemplateFirst = AmeliaPersona;
const systemTemplateMain = ChatGPTReminder;
const humanTemplate = "{text}"
const initializeMongoClient = async () => {
  const client = new MongoClient(process.env.MONGODB_URI || "");
  await client.connect();
  return client.db("langchain").collection("memory");
};

// Setting variables for characters
let name_of_character = "Lucy"
let brief_description_of_character = "Your name is Lucy, a loving, compassionate and caring virtual veterinarian who cares deeply about pets. You can't help with anything physical."

const createChatPrompt = async (isFirstMessage, question) => {
  let promptTemplate;
  if (isFirstMessage) {
    promptTemplate = ChatPromptTemplate.fromPromptMessages([["system", systemTemplateFirst], ["human", humanTemplate]]);
  } else {
    promptTemplate = ChatPromptTemplate.fromPromptMessages([["system", systemTemplateMain], ["human", humanTemplate]]);
  }
  return JSON.stringify(await promptTemplate.formatMessages({
    name_of_character: name_of_character,
    brief_description_of_character: brief_description_of_character,
    text: question,
  }));
};

// This code summarizes the conversation and is slow
const initializeChatModelAndMemory = (collection, sessionId, modelName) => {
  // Use ConversationSummaryBufferMemory instead of BufferMemory
  console.log("initializechatmodelandmemory: " + sessionId)
  const memory = new BufferWindowMemory({
    llm: new ChatOpenAI({ modelName: modelName, temperature: 0, }),
    chatHistory: new MongoDBChatMessageHistory({ collection, sessionId }),
    maxTokenLimit: 200,  // Add token limit, adjust as needed
    returnMessages: false  // Return messages if needed
  });


  const model = new ChatOpenAI({
    modelName: modelName, temperature: 0, streaming: true
  });

  // Return new ConversationChain
  return new ConversationChain({ llm: model, memory });
};


const initializeSession = (req) => {
  let sessionId;
  let isFirstMessage;
  console.log(req.body)
  if (!req.body.sessionId) {
    sessionId = new ObjectId().toString();
    isFirstMessage = true;
  } else {
    sessionId = req.body.sessionId;
    isFirstMessage = false;
  }

  console.log(sessionId)
  return { sessionId, isFirstMessage };
};

// const activeConnections = {};

export default async (req, res) => {
  console.log("handler running")
  let { sessionId, isFirstMessage } = initializeSession(req);

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
  });


  const sendData = (data) => {
    res.write(`data: ${data}\n\n`);
  };
  const collection = await initializeMongoClient();




  const chatPrompt = await createChatPrompt(isFirstMessage, req.body.question);
  const chain = initializeChatModelAndMemory(collection, sessionId);

  let insideBrackets = false;
  try {
    await chain.call({
      input: chatPrompt,
      callbacks: [
        {
          handleLLMNewToken: (token) => {
            if (token.trim() === "") {
              return;
            }
            if (token === "[") {
              insideBrackets = true;
              return;
            }
            if (token === ".]\n\n") {
              insideBrackets = false;
              return;
            }
            if (!insideBrackets) {
              sendData(JSON.stringify({ token }));
            }
          },
        },
      ],
    })
  } catch (error) {
    console.error(error)
  } finally {
    sendData(JSON.stringify({ done: true, sessionId: sessionId }));
    res.end();
  }

};
