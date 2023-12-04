import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import React from 'react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import ToolSwitcherRadioGroup from "@/components/ToolSwitcherRadioGroup"
import ModelSwitcherRadioGroup from "@/components/ModelSwitcherRadioGroup"
import PersonalitySwitcherRadioGroup from "@/components/PersonalitySwitcherRadioGroup"



export default function SettingsTabs() {
  return (

    <Tabs defaultValue="model" className="md:max-w-[500px] sm:max-w-[75%]">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="model">Model</TabsTrigger>
        <TabsTrigger value="tools">Tools</TabsTrigger>
        <TabsTrigger value="personality">Personality</TabsTrigger>
      </TabsList>
      <TabsContent value="model">
        <Card>
          <CardHeader>
            <CardTitle>Model</CardTitle>
            <CardDescription>
              Change the chatbot's model and temperature. Currently only supports GPT-3.5-turbo and GPT-4.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <ModelSwitcherRadioGroup defaultValue="gpt-3.5-turbo" />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="tools">
        <Card>
          <CardHeader>
            <CardTitle>Tools</CardTitle>
            <CardDescription>
              <p className="text-red-500 italic">Chatbot GitHub browsing does not work. Web browsing does. </p>
              Give the chatbot tools here. Only one tool can be active at a time but they can be changed at any time during the conversation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <ToolSwitcherRadioGroup defaultValue="option-one" />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="personality">
        <Card>
          <CardHeader>
            <CardTitle>Personality</CardTitle>
            <CardDescription>
              <p className="text-red-500 italic">Changing the Chatbot's Personality will reset the chat history. </p>
              <p className="text-red-500 italic">Chatbot personalities currently do not work due to breaking changes with streaming. </p>
              Change the chatbot's personality. The default personality is Amelia, a kind and helpful assistant. Hover over the other personalities to see what they're like.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <PersonalitySwitcherRadioGroup defaultValue="option-one" />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
};

