"use client";

import API_URL from "@/lib/utils";
import axios from "axios";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import FroalaEditor from "react-froala-wysiwyg";
import "froala-editor/css/froala_style.min.css";
import "froala-editor/css/froala_editor.pkgd.min.css";
import { Card } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "./../../hooks/use-toast";
import { useRouter } from "next/navigation";

const languages = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Spanish", value: "es" },
  { label: "Russian", value: "ru" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Hindi", value: "hi" },
];

export default function CreateFAQ() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [creating, setCreating] = useState(false);
  const [sourceLang, setSourceLang] = useState("en");
  const router = useRouter();

  const handleCreate = async () => {
    setCreating(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${API_URL}faqs`,
        {
          question,
          answer,
          lang: sourceLang
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast({
        title: "FAQ Created Successfully",
        description: "Your new FAQ has been created."
      });
      
      // Redirect to edit page for the new FAQ
      router.push(`/`);
    } catch (err) {
      console.error("Error creating FAQ: ", err);
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: err.response?.data?.message || "Failed to create FAQ"
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="p-4 flex flex-col gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Base Language</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-[200px] justify-between",
                    !sourceLang && "text-muted-foreground"
                  )}
                >
                  {sourceLang
                    ? languages.find((lang) => lang.value === sourceLang)?.label
                    : "Select language"}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search language..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No language found.</CommandEmpty>
                    <CommandGroup>
                      {languages.map((language) => (
                        <CommandItem
                          key={language.value}
                          value={language.value}
                          onSelect={() => setSourceLang(language.value)}
                        >
                          {language.label}
                          <Check
                            className={cn(
                              "ml-auto",
                              language.value === sourceLang
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label
              htmlFor="question"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Question
            </label>
            <input
              id="question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="mt-1 block w-full rounded-md border p-2"
              placeholder="Enter your question"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label
                htmlFor="answer"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Answer Editor
              </label>
              <FroalaEditor
                tag="textarea"
                model={answer}
                onModelChange={setAnswer}
                config={{
                  placeholderText: "Write your answer here...",
                }}
              />
            </div>

            <div className="flex-1 border border-gray-200 rounded-md p-4">
              <label
                htmlFor="preview"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Live Preview
              </label>
              <div
                id="preview"
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: answer }}
              />
            </div>
          </div>

          <Button
            onClick={handleCreate}
            disabled={creating}
            className="self-end"
          >
            {creating ? "Creating..." : "Create FAQ"}
          </Button>
        </Card>
      </div>
    </div>
  );
}