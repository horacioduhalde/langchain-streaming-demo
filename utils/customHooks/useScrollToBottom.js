import { useEffect } from "react";

export const useScrollToBottom = (chatBoxRef, chatHistory) => {
  useEffect(() => {
    const chatBox = chatBoxRef.current;
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }, [chatHistory]);
};
