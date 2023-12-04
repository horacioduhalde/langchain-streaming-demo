"use client"
import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { motion, AnimatePresence } from 'framer-motion';


const item = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

// DynamicSuggestionCards component
const DynamicSuggestionCards = ({ handleQuestion, setUserInput }) => {
  const cardInfo = [
    {
      title: "Who are you?",
      description: 'Learn about this ChatBot.',
      hideOnSmall: true  // This will hide the first card on small screens
    },
    {
      title: 'Tell me something awesome.',
      description: "Explore the bot's capabilities.",
      hideOnSmall: false  // This will show the second card on small screens
    }
    // {
    //   title: 'Tell me some uplifting news.',
    //   description: 'Search the web to give me some good news.',
    //   hideOnSmall: false  // This will show the second card on small screens
    // }
  ];

  const cardClickHandler = (card) => {
    handleQuestion(card.title);
  };

  return (
    <div className="flex h-[100%] items-end overflow-hidden">
      <div className="flex w-[100%] h-[150px] justify-evenly">
        <AnimatePresence>
          {cardInfo.map((card, index) => (
            <motion.div
              key={index}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={item}
              custom={index}
              className={`${card.hideOnSmall ? 'hidden md:flex' : 'flex'} flex-col justify-end`}
            >
              <Card className={`w-[300px] hover:shadow-lg transition duration-200 h-15 ease-in-out transform hover:-translate-y-1 hover:scale-105 cursor-pointer`} onClick={() => cardClickHandler(card)}>
                <CardHeader>
                  <CardTitle className="text-left">{card.title}</CardTitle>
                  <CardDescription className="text-left">{card.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DynamicSuggestionCards

