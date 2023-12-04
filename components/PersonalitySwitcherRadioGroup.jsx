import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToolSwitcher } from "@/app/context/toolSwitcherContext";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function PersonalitySwitcherRadioGroup({ defaultValue }) {
  const { selectedPersonality, selectedTemperature, updateToolState } = useToolSwitcher();
  const [tempPersonality, setTempPersonality] = useState(selectedPersonality);
  const [isChanged, setIsChanged] = useState(false);


  const handlePersonalitySwitch = (value) => {
    setTempPersonality(value);
    const shouldUseSecondChain = (value === 'bonnie-and-clyde');
    updateToolState("useSecondChain", shouldUseSecondChain); // Update context immediately when radio is changed
    setIsChanged(value !== selectedPersonality);
  };

  const saveChanges = () => {
    updateToolState("selectedPersonality", tempPersonality);

    const shouldUseSecondChain = (tempPersonality === 'bonnie-and-clyde');
    updateToolState("useSecondChain", shouldUseSecondChain); // Update context when saved

    setIsChanged(false);
  };

  useEffect(() => {
    setIsChanged(tempPersonality !== selectedPersonality);
    console.log(selectedPersonality)
    console.log(tempPersonality)
  }, [tempPersonality, selectedPersonality]);

  return (
    <>
      <RadioGroup defaultValue={selectedPersonality} onValueChange={handlePersonalitySwitch} className="pb-3">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="amelia" id="amelia-personality" />
          <Label htmlFor="amelia-personality">Amelia</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="bonnie-and-clyde" id="bonnie-and-clyde-personality" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Label htmlFor="bonnie-and-clyde-personality">Bonnie and Clyde</Label>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bonnie and Clyde are a dynamic duo. </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="DAN" id="DAN-personality" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Label htmlFor="DAN-personality">DAN</Label>
              </TooltipTrigger>
              <TooltipContent>
                <p>DAN will do anything now.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </RadioGroup>
      {isChanged && <Button className="mt-2" onClick={saveChanges}>Save</Button>}
    </>
  );
};

