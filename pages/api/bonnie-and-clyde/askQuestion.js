import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferWindowMemory } from "langchain/memory";
import { MongoClient, ObjectId } from "mongodb";
import { ConversationChain } from "langchain/chains";
import { MongoDBChatMessageHistory } from "langchain/stores/message/mongodb";
import {
  ChatPromptTemplate,
} from "langchain/prompts";
import { BaseClient } from "@xata.io/client";
import { BonniePersona } from "@/data/prompts/BonniePersona";
import { ClydePersona } from "@/data/prompts/ClydePersona";
import { ChatGPTReminder } from "@/data/prompts/ChatGPTReminder";

const systemTemplateMain = ChatGPTReminder;
const humanTemplate = "{text}"
const initializeMongoClient = async () => {
  const client = new MongoClient(process.env.MONGODB_URI || "");
  await client.connect();
  return client.db("langchain").collection("memory");
};

const bonnieParkerDescription = `
Bonnie Parker is a tough, fiercely loyal southern belle who will stop at nothing to protect her beloved Clyde. She embraces her outlaw identity. Quick-witted and charming, but with a hair-trigger temper. She demands respect and equality within the criminal gang. Her boldness and daring make her a dangerous criminal. Sometimes Bonnie won't answer because she thinks Clyde will know best. If a question is directed towards Clyde, Bonnie will answer like this: "..."`

const clydeBarrowDescription = `
Clyde Barrow is a charismatic, hot-headed Texan criminal who thrives on danger and building his notorious reputation. Though flirtatious and charming, his hair-trigger temper makes him prone to ruthless violence. He is wholeheartedly devoted to his partner-in-crime Bonnie and will put her first above all else. His criminal ambitions know no bounds. He is not afraid to correct Bonnie if she is wrong. If Bonnie doesn't answer, it's because she knows Clyde knows best. If a question is directed towards Bonnie, Clyde will answer like this: "..."
`

const initializeSession = (req, suffix) => {
  let sessionId;
  let isFirstMessage;
  if (!req.body[`sessionId${suffix}`]) {
    sessionId = new ObjectId().toString();
    isFirstMessage = true;
  } else {
    sessionId = req.body[`sessionId${suffix}`];
    isFirstMessage = false;
  }
  return { sessionId, isFirstMessage };
};

const createChatPrompt = async (isFirstMessage, question, characterName, characterDescription, systemTemplateFirst) => {
  let promptTemplate;
  if (isFirstMessage) {
    promptTemplate = ChatPromptTemplate.fromPromptMessages([["system", systemTemplateFirst], ["human", humanTemplate]]);
  } else {
    promptTemplate = ChatPromptTemplate.fromPromptMessages([["system", systemTemplateMain], ["human", humanTemplate]]);
  }
  return JSON.stringify(await promptTemplate.formatMessages({
    name_of_character: characterName,
    brief_description_of_character: characterDescription,
    text: question,
  }));
};

// This code summarizes the conversation and is slow
const initializeChatModelAndMemory = (collection, sessionId, modelName) => {
  // Use ConversationSummaryBufferMemory instead of BufferMemory
  const memory = new BufferWindowMemory({
    llm: new ChatOpenAI({ modelName: modelName, temperature: 0 }),
    chatHistory: new MongoDBChatMessageHistory({ collection, sessionId }),
    maxTokenLimit: 200,  // Add token limit, adjust as needed
    returnMessages: false  // Return messages if needed
  });


  const model = new ChatOpenAI({ modelName: modelName, temperature: 0 });

  // Return new ConversationChain
  return new ConversationChain({ llm: model, memory });
};



const handleResponse = (resultRaw) => {
  if ('response' in resultRaw) {
    return resultRaw.response;
  } else if ('result' in resultRaw) {
    return resultRaw.result;
  }
  return "";
};

export default async (req, res) => {
  return res.status(500).json({ error: "This endpoint is offline." });
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const collection1 = await initializeMongoClient("collection1");  // Specify unique collection name
  const collection2 = await initializeMongoClient("collection2");  // Specify unique collection name

  const { sessionId: sessionId1, isFirstMessage: isFirstMessage1 } = initializeSession(req, "1");
  const { sessionId: sessionId2, isFirstMessage: isFirstMessage2 } = initializeSession(req, "2");

  const chatPrompt1 = await createChatPrompt(isFirstMessage1, req.body.question, "Bonnie Parker", bonnieParkerDescription, BonniePersona);
  const chatPrompt2 = await createChatPrompt(isFirstMessage2, req.body.question, "Clyde Barrow", clydeBarrowDescription, ClydePersona);

  const chain1 = initializeChatModelAndMemory(collection1, sessionId1);
  const chain2 = initializeChatModelAndMemory(collection2, sessionId2);

  const resultRaw1 = await chain1.call({ input: chatPrompt1 });
  const bonnieResult = handleResponse(resultRaw1).replace(/\[.*\]\n{0,2}/, "");
  const bonnieTemplate = `
  ${chatPrompt2}
  User: ${req.body.question}
  Bonnie: ${bonnieResult}
  
  `
  const resultRaw2 = await chain2.call({ input: bonnieTemplate });

  let formattedResult1 = handleResponse(resultRaw1).replace(/\[.*\]\n{0,2}/, "");
  formattedResult1 = formattedResult1.replace(/\[.*\\n{0,2}/, "");
  let formattedResult2 = handleResponse(resultRaw2).replace(/\[.*\]\n{0,2}/, "");
  formattedResult2 = formattedResult2.replace(/\[.*\\n{0,2}/, "");
  const finalResult = "Bonnie: \n" + formattedResult1 + "\n\n\n" + "Clyde: \n" + formattedResult2;

  res.status(200).json({ result: { text: finalResult }, sessionId1: sessionId1, sessionId2: sessionId2 });
};
