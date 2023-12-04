import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToolSwitcher } from "@/app/context/toolSwitcherContext";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
export default function ToolSwitcherRadioGroup({ defaultValue }) {
  const { selectedModel, selectedModelName, selectedTemperature, updateToolState } = useToolSwitcher();
  const [tempModel, setTempModel] = useState(selectedModel);
  const [isChanged, setIsChanged] = useState(false);
  const [tempTemperature, setTempTemperature] = useState(selectedTemperature);


  const handleModelSwitch = (value) => {
    setTempModel(value);
    console.log(tempModel)
    setIsChanged(value !== selectedModel);
  };



  const saveChanges = () => {
    const modelNames = {
      "option-one": "gpt-3.5-turbo",
      "option-two": "gpt-3.5-turbo-16k",
      "option-three": "gpt-4"
    };
    updateToolState("selectedModel", tempModel);
    updateToolState("selectedModelName", modelNames[tempModel]);
    updateToolState("selectedTemperature", tempTemperature);
    setIsChanged(false);
  };

  useEffect(() => {
    setIsChanged(tempModel !== selectedModel);
    console.log(selectedModel)
    console.log(tempModel)
  }, [tempModel, selectedModel]);

  return (
    <>
      <RadioGroup defaultValue={selectedModel} onValueChange={handleModelSwitch} className="pb-3">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option-one" id="gpt-3.5-turbo" />
          <Label htmlFor="gpt-3.5-turbo">GPT-3.5-turbo</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option-two" id="gpt-3.5-turbo-16k" />
          <Label htmlFor="gpt-3.5-turbo-16k">GPT-3.5-turbo-16k</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option-three" id="gpt-4" />
          <Label htmlFor="gpt-4">GPT-4</Label>
        </div>
      </RadioGroup>

      <div className="pt-1 pb-3">
        <Separator className="mb-5" />
        <Label htmlFor="temperature" className="font-bold text-xl ">Temperature</Label>
        <Slider defaultValue={[selectedTemperature]}
          max={100}
          step={1}
          onValueChange={(i) => {
            setTempTemperature(i)
            console.log(tempTemperature)
            setIsChanged(tempTemperature !== selectedTemperature)
          }} className="pt-2" />
      </div>

      {isChanged && <Button className="mt-2" onClick={saveChanges}>Save</Button>}
    </>
  );
};

