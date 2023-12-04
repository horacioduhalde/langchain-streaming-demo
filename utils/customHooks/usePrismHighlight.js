import { useEffect } from "react";

export const usePrismHighlight = (chatHistory) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [chatHistory]);
};
