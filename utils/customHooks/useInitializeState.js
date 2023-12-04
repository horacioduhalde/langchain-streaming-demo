import { useEffect } from 'react';

export const useInitializeState = (updateToolState, selectedModel, selectedTool, selectedTemperature, selectedPersonality) => {
  useEffect(() => {
    const toolNames = {
      "option-one": "Default - No Tools",
      "option-two": "GitHub Tool",
      "option-three": "Web Tool",
    };
    const modelNames = {
      "option-one": "gpt-3.5-turbo",
      "option-two": "gpt-3.5-turbo-16k",
      "option-three": "gpt-4"
    };

    const initialModel = selectedModel || "option-one";
    const initialModelName = modelNames[initialModel] || "gpt-3.5-turbo";
    updateToolState("selectedModel", initialModel);
    updateToolState("selectedModelName", initialModelName);

    const initialTemperature = selectedTemperature || [50];
    updateToolState("selectedTemperature", initialTemperature);

    const initialTool = selectedTool || "option-one";
    const initialToolName = toolNames[initialTool] || "Default";
    updateToolState("selectedTool", initialTool);
    updateToolState("selectedToolName", initialToolName);

    const initialPersonality = selectedPersonality || "amelia";
    updateToolState("selectedPersonality", initialPersonality);
  }, []);
};
