import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useToolSwitcher } from "@/app/context/toolSwitcherContext";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function ToolSwitcherRadioGroup({ defaultValue }) {
  const { selectedTool, selectedToolName, githubRepo, updateToolState } = useToolSwitcher();
  const [tempTool, setTempTool] = useState(selectedTool);
  const [tempGithubRepo, setTempGithubRepo] = useState(githubRepo);
  const [isChanged, setIsChanged] = useState(false);


  const handleToolSwitch = (value) => {
    setTempTool(value);
    console.log(tempTool)
    setIsChanged(value !== selectedTool || tempGithubRepo !== githubRepo);
  };

  const handleRepoChange = (e) => {
    setTempGithubRepo(e.target.value);
    setIsChanged(tempTool !== selectedTool || e.target.value !== githubRepo);
  };

  const saveChanges = () => {
    const toolNames = {
      "option-one": "Default - No Tools",
      "option-two": "GitHub Tool",
      "option-three": "Web Tool",
    };
    updateToolState("selectedTool", tempTool);
    updateToolState("selectedToolName", toolNames[tempTool]);
    if (tempTool !== "option-two") {
      updateToolState("githubRepo", "");
    } else {
      updateToolState("githubRepo", tempGithubRepo);
    }
    setIsChanged(false);
  };

  useEffect(() => {
    setIsChanged(tempTool !== selectedTool || tempGithubRepo !== githubRepo);
    console.log(selectedTool)
    console.log(tempTool)
  }, [tempTool, tempGithubRepo, selectedTool, githubRepo]);

  return (
    <>
      <RadioGroup defaultValue={selectedTool} onValueChange={handleToolSwitch}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option-one" id="Default Tool" />
          <Label htmlFor="option-one">Default</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option-two" id="GitHub Tool" />
          <Label htmlFor="option-two">Chat with GitHub</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option-three" id="Web Tool" />
          <Label htmlFor="option-three">Web Browsing</Label>
        </div>
      </RadioGroup>
      {tempTool === "option-two" && (
        <Input
          type="text"
          placeholder="https://github.com/MarcelGallois/langchainjs-chat"
          value={tempGithubRepo}
          onChange={handleRepoChange}
          className="my-2"
        />
      )}
      {/* {tempTool === "option-three" && (
        <Input
          type="text"
          placeholder="Ask the web..."
          value={tempGithubRepo}
          onChange={handleRepoChange}
          className="mt-2"
        />
      )} */}
      {isChanged && <Button className="mt-2" onClick={saveChanges}>Save</Button>}
    </>
  );
};

