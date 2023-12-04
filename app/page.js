"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import DynamicSuggestionCards from "@/components/suggestionCard"
import SettingsDialogue from "@/components/settingsDialogue"
import { useToolSwitcher } from "@/app/context/toolSwitcherContext";
import parseTextForCode from "@/utils/parseTextForCode"
import Prism from 'prismjs';
import { ModeToggle } from "@/components/modeToggle";
import { ToolBadge } from "@/components/Badge";
import axios from 'axios';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { motion } from 'framer-motion';

import { useInitializeState } from '@/utils/customHooks/useInitializeState';
import { usePrismHighlight } from '@/utils/customHooks/usePrismHighlight';
import { useScrollToBottom } from '@/utils/customHooks/useScrollToBottom';

// Consider using Shadcn ScrollArea for the chatbox
// Consider using Shadcn Slider for the temperature of the model
// Consider using Shadcn Toast to show that settings have been changed
// Use shadcn Tabs for the settings menu
// Use shadcn Badge to display what the current model is, what its personality is, and what tool(s) it has.
// If is sending, then replace send button with a loading spinner. 
// Prevent sending until 0.5 second after initial render.


export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isSending, setIsSending] = useState(false)
  const [sessionId, setSessionId] = useState(null);

  const chatBoxRef = useRef(null);
  const { selectedTool, selectedToolName, selectedModel, selectedModelName, selectedTemperature, selectedPersonality, githubRepo, updateToolState, useSecondChain } = useToolSwitcher();
  const textAreaRef = useRef(null);


  useInitializeState(updateToolState, selectedModel, selectedTool, selectedTemperature, selectedPersonality);
  usePrismHighlight(chatHistory);
  useScrollToBottom(chatBoxRef, chatHistory);

  useEffect(() => {
    setChatHistory([]);
    setSessionId(null);
  }, [selectedPersonality])

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  // Press enter to submit question, shift + enter to add a new line
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (event.key === 'Enter' && event.shiftKey) {
        return;
      }
      event.preventDefault();
      handleQuestion();
    }
  };


  useEffect(() => {
    // The following code is not necessary for styling but it removes all unnecessary indentations so we'll keep it here for now
    const codeBlocks = document.querySelectorAll('.code-block');
    codeBlocks.forEach((block) => {
      // Manipulate styles or classes here, e.g.
      block.classList.add('bg-black');
    });
    const langLabels = document.querySelectorAll('.lang-label');
    langLabels.forEach((label) => {
      // Manipulate styles or classes here, e.g.
      label.classList.add('bg-black');
    }
    );
  }, [selectedTool, githubRepo]);


  let ctrl;
  const handleQuestion = async (input = userInput) => {
    if (isSending) return;
    console.log(input);
    const question = userInput.trim() || input.trim();
    if (question === "") return;

    setIsSending(true);
    setUserInput("");
    const newEntry = { user: input, bot: "...", messageID: Date.now().toString() };
    setChatHistory((prevChatHistory) => [...prevChatHistory, newEntry]);

    // Define a mapping between personalities and their API prefixes
    const personalityPrefixes = {
      "amelia": "",
      "DAN": "DAN",
      "bonnie-and-clyde": "bonnie-and-clyde",
      "lucy": "lucy",
    };

    let baseEndpoint;
    if (selectedTool === "option-two") {
      baseEndpoint = "askGithub";
    } else if (selectedTool === "option-three") {
      baseEndpoint = "askTheWeb";
    } else {
      baseEndpoint = "askQuestion";
    }

    // Look up the API prefix based on the selected personality
    const prefix = personalityPrefixes[selectedPersonality] || "";
    const apiEndpoint = `/api/${prefix ? `${prefix}/` : ""}${baseEndpoint}`;

    const payload = {
      question: input,
      sessionId: sessionId,
      modelName: selectedModelName,
      temperature: selectedTemperature,
      personality: selectedPersonality,
      useSecondChain: useSecondChain,
    };

    if (selectedTool === "option-two" && githubRepo) {
      payload.repo = githubRepo;
    }

    try {
      let firstTokenReceived = false;
      ctrl = new AbortController();
      if (typeof window !== 'undefined') {
        fetchEventSource(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: ctrl.signal,
          onmessage: (event) => {
            const data = JSON.parse(event.data);
            if (data.done) {
              setSessionId(data.sessionId);
              // console.log("Session ID:", sessionId);
              // console.log("done");
              setIsSending(false);
              ctrl.abort();
              return;
            } else {
              console.log(data);
              // setConnectionActive(true);
              setChatHistory((prevChatHistory) => {
                const updatedChatHistory = [...prevChatHistory];
                const lastMessageIndex = updatedChatHistory.length - 1;
                const lastBotMessage = updatedChatHistory[lastMessageIndex].bot;

                // Combine both conditions in a single update
                updatedChatHistory[lastMessageIndex].bot = !firstTokenReceived ? lastBotMessage.replace("...", "") + data.token : lastBotMessage + data.token;

                // Update the flag only after setting the message
                firstTokenReceived = true;

                return updatedChatHistory;
              });
            }
          },
          openWhenHidden: true,
        })
      }
    } catch (error) {
      setChatHistory((prevChatHistory) => {
        const updatedChatHistory = [...prevChatHistory];
        updatedChatHistory[updatedChatHistory.length - 1].bot = "Something went wrong, please try again later.";
        return updatedChatHistory;
      });
    } finally {
      setIsSending(false);
    }
  };
  return (
    // Color user's and bot's bubble  background based on the theme
    <>
      <main className="flex h-screen overflow-y-hidden flex-col items-center justify-between p-8">
        {/* Tool switcher needs to switch cards too */}
        <div className="w-[75dvw] justify-end pb-3 hidden sm:flex">
          <div className="flex space-x-2">
            <ToolBadge />
            <ModeToggle />
            <SettingsDialogue />
          </div>
        </div>
        <div className="text-center">
          <div className="flex flex-col h-screen">
            <div ref={chatBoxRef} className="h-[75dvh] md:w-[75dvw] lg:w-[50dvw] overflow-y-auto p-4 border rounded">
              {chatHistory.map((entry, index) => (
                <div key={entry.messageId} className="mb-2 p-2 space-y-4">
                  <div className="flex items-center space-x-4 w-max max-w-[100%] flex-col gap-2 rounded-lg px-3 py-2 ml-auto">
                    <span className='flex w-[100%] justify-end'>
                      <span className='relative flex h-10 w-10 bg-muted-foreground shrink-0 overflow-hidden rounded-full justify-center items-center'>U</span> </span>
                    <span className="font-bold text-left flex w-[100%] flex-col gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-xl"><span className="font-normal">{entry.user}</span></span>
                  </div>
                  <div className="items-center space-x-4 space-y-3 w-max max-w-[100%] gap-2 px-3 py-2">
                    <span className='flex w-[100%] justify-start'>
                      <span className='relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full justify-center items-center bg-primary-foreground'>B</span>
                    </span>
                    <div className="font-bold text-left flex w-max max-w-[100%] flex-col gap-2 px-3 py-2 text-sm bg-muted rounded-xl">
                      <span className="font-normal">
                        {entry.bot}
                      </span>
                    </div>
                  </div>

                </div>
              ))}

              {/* Animate the cards coming in */}
              {chatHistory.length === 0 && (
                <div className="flex h-[100%] w-[100%] justify-center  items-end overflow-hidden">
                  <motion.div className='w-[100%]'>
                    {chatHistory.length === 0 && (
                      <div>
                        <DynamicSuggestionCards
                          handleQuestion={handleQuestion}
                        />
                      </div>
                    )}
                  </motion.div>
                </div>

              )}

            </div>
            <div className="flex items-center space-x-4 px-4 py-1 bg-transparent border rounded mt-4">
              <Textarea
                ref={textAreaRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isSending ? "Thinking..." : "Ask me anything..."}
                className="flex-grow p-2 py-3 pt-6 border-0 rounded resize-none text-xl focus-visible:ring-0 focus-visible:ring-offset-0"
                rows="1"
              />
              <Button onClick={() => handleQuestion()} disabled={isSending}>
                Send
              </Button>
            </div>
          </div>

        </div>
      </main >
    </>
  );
}
