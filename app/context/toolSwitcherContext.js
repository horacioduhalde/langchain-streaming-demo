"use client"

import React, { createContext, useContext, useState } from 'react';

const ToolSwitcherContext = createContext();

export const useToolSwitcher = () => {
  const context = useContext(ToolSwitcherContext);
  if (!context) {
    throw new Error('useToolSwitcher must be used within a ToolSwitcherProvider');
  }
  return context;
};

export const ToolSwitcherProvider = ({ children }) => {
  const [toolState, setToolState] = useState({
    selectedTool: null,
    selectedToolName: null,
    selectedModel: null,
    selectedModelName: null,
    selectedPersonality: null,
    selectedPersonalityName: null,
    selectedTemperature: null,
    githubRepo: '',
    useSecondChain: false,
  });

  const updateToolState = (key, value) => {
    setToolState(prevState => ({ ...prevState, [key]: value }));
  };

  return (
    <ToolSwitcherContext.Provider value={{ ...toolState, updateToolState }}>
      {children}
    </ToolSwitcherContext.Provider>
  );
};

