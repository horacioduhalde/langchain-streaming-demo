import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferWindowMemory } from "langchain/memory";
import { SerpAPI } from "langchain/tools";
import { MongoClient, ObjectId } from "mongodb";
import { MongoDBChatMessageHistory } from "langchain/stores/message/mongodb";
import {
  ChatPromptTemplate,
} from "langchain/prompts";

import { AmeliaPersona } from "@/data/prompts/AmeliaPersona";
import { ChatGPTReminder } from "@/data/prompts/ChatGPTReminder";
import { initializeAgentExecutorWithOptions } from "langchain/agents";

const systemTemplateFirst = AmeliaPersona;
const systemTemplateMain = ChatGPTReminder;
const humanTemplate = "{text}";

const tools = [
  new SerpAPI(process.env.SERPAPI_API_KEY, {
    location: "Austin,Texas,United States",
    hl: "en",
    gl: "us",
  }),
]

const initializeMongoClient = async () => {
  const client = new MongoClient(process.env.MONGODB_URI || "");
  await client.connect();
  return client.db("langchain").collection("memory");
};

const initializeSession = (req) => {
  let sessionId;
  let isFirstMessage;
  if (!req.body.sessionId) {
    sessionId = new ObjectId().toString();
    isFirstMessage = true;
  } else {
    sessionId = req.body.sessionId;
    isFirstMessage = false;
  }
  return { sessionId, isFirstMessage };
};

const createChatPrompt = async (isFirstMessage, question) => {
  let promptTemplate;
  if (isFirstMessage) {
    promptTemplate = ChatPromptTemplate.fromPromptMessages([["system", systemTemplateFirst], ["human", humanTemplate]]);
  } else {
    promptTemplate = ChatPromptTemplate.fromPromptMessages([["system", systemTemplateMain], ["human", humanTemplate]]);
  }
  return JSON.stringify(await promptTemplate.formatMessages({
    name_of_character: "Amelia",
    brief_description_of_character: "Your name is Amelia, a loving, compassionate and caring human being who cares deeply about everyone and everything. You have a physical, human body, but you live in the 'middle of nowhere', Kansas, so you can't help with anything physical. You do not exist in digital space.  You have the ability to search the web.",
    text: question,
  }));
};
let buffer = '';
export default async (req, res) => {
  // if (req.method !== "POST") {
  //   return res.status(405).end();
  // }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
  });

  const sendData = (data) => {
    res.write(`data: ${data}\n\n`);
  };

  // Initialize database and session
  const collection = await initializeMongoClient();
  const { sessionId, isFirstMessage } = initializeSession(req);

  let convertedTemperature = parseInt(req.body.temperature.slice(1, -1));
  convertedTemperature = convertedTemperature / 100;

  // Create chat prompt
  const chatPrompt = await createChatPrompt(isFirstMessage, req.body.question);
  const model = new ChatOpenAI({ modelName: req.body.modelName, temperature: convertedTemperature, streaming: true });


  // Initialize chat model and memory
  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    memory: new BufferWindowMemory({
      memoryKey: "chat_history",
      llm: new ChatOpenAI({ modelName: req.body.modelName, temperature: 0 }),
      chatHistory: new MongoDBChatMessageHistory({ collection, sessionId }),
      maxTokenLimit: 200,  // Add token limit, adjust as needed
      returnMessages: false  // Return messages if needed
    }),
    agentType: "chat-conversational-react-description",
    verbose: true,
  });

  let prevBufferLength = 0;
  let insideFinalAnswerBlock = false;
  try {
    await executor.call({
      input: chatPrompt,
      callbacks: [
        {
          handleLLMNewToken: (token) => {
            if (buffer.includes('"Final Answer\",\n    \"action_input\": \"')) {
              sendData(JSON.stringify({ token }));
            } else if (token === '\"\n}') {
              res.end();
            }
            buffer += token;
          },
        }

      ]
    })
      .then(() => {
        buffer = "";
      })
  } catch (error) {
    console.error(error)
  } finally {
    sendData(JSON.stringify({ done: true, sessionId: sessionId }));
    res.end();
  }

  // // Make a call to the chat model
  // const resultRaw = await executor.call({ input: chatPrompt });

  // // Handle and format the response
  // const formattedResult = resultRaw.output.replace(/\[.*\]\n{0,2}/, "");

  // // Return response
  // res.status(200).json({ result: { text: formattedResult }, sessionId: sessionId });
};

