"use client";

import API_URL from "@/lib/utils";
import axios from "axios";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
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
import { toast } from "./../../../hooks/use-toast";
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

export default function EditFAQ({ params }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sourceLang, setSourcelang] = useState("en");
  const [targetLang, setTargetlang] = useState("en");
  const [translatedData, setTranslatedData] = useState({question:"", answer:""});
  const router = useRouter();

  // Handle selection of a language
  function handleSelect(langValue, inputOne) {
    if(inputOne === true){
        setSourcelang(langValue);
    }
    else{  
        setTargetlang(langValue);
    }
    toast({
        title: "Language selected",
        description: `Language set to ${langValue}`,
    })
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = (await params).faqId;
        const result = await axios.get(`${API_URL}faqs/${id}`, {lang:"en"});
        setQuestion(result.data.question);
        setAnswer(result.data.answer);
      } catch (err) {
        console.error("Error fetching FAQ data: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
        const token = localStorage.getItem("authToken");
        const id = (await params).faqId;
        await axios.put(`${API_URL}faqs/${id}`, {
            question,
            answer,
        },{
            headers: {
            Authorization: `Bearer ${token}`
            }
        });
        const translateData = await axios.get(`${API_URL}faqs/${id}`, {
            params: {lang: targetLang}
        });
        setTranslatedData(() => {
            // console.log(translateData);
            return translateData.data
        });

        // alert("FAQ updated successfully!");
        } catch (err) {
        console.error("Error updating FAQ: ", err);
        alert("Error updating FAQ.");
        } finally {
        setSaving(false);
        }
  };

  const handleDelete = async () => {
    try{
        const token = localStorage.getItem("authToken");
        const id = (await params).faqId;
        await axios.delete(`${API_URL}faqs/${id}`, 
            {headers: {
                Authorization: `Bearer ${token}`
            }}
        );
        alert("FAQ deleted successfully!");
        router.push('/');
    }catch(err){
        console.error("Error deleting ", err);
    }
  }

  return (
    <div className="h-screen w-screen flex justify-center items-center p-4">
      {loading ? (
        <div>Loading...</div>
      ) : (
      <div>
        <Card className="p-4 flex flex-col gap-4 w-full max-w-4xl">
          {/* Edit Question */}

            <div className="flex justify-between items-center">
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                    />
                </div>
                <button onClick={handleDelete} className="bg-red-400 p-2 rounded">Delete FAQ</button>
            </div>

          {/* Two column layout for editor and live preview */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Left: Froala Editor for Answer */}
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
                onModelChange={(newContent) => setAnswer(newContent)}
                config={{
                  placeholderText: "Edit Answer Here...",
                  // Additional configuration options can be added here.
                }}
              />
            </div>
            {/* Right: Live Preview of Answer */}
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

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-4 self-end px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            {saving ? "Saving..." : "Save FAQ"}
          </button>
        </Card>
        <div>
                <p>Input Language</p>
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
                            value={language.label}
                            onSelect={() => handleSelect(language.value, true)}
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
                <p>Output Language</p>
                <Popover>
                <PopoverTrigger asChild>
                    <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                        "w-[200px] justify-between",
                        !targetLang && "text-muted-foreground"
                    )}
                    >
                    {targetLang
                        ? languages.find((lang) => lang.value === targetLang)?.label
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
                            value={language.label}
                            onSelect={() => handleSelect(language.value, false)}
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
        <Card>
            {/* Right: Live Preview of Answer */}
            <div className="flex-1 border border-gray-200 rounded-md p-4">
              <label
                htmlFor="newLang"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Translated to {languages.find(l => l.value === targetLang)?.label}  
              </label>
              <div 
              id="newLang" 
              className="prose max-w-none" 
              dangerouslySetInnerHTML={{__html: translatedData.question}}>
              </div>
              <div
                id="newLang"
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: translatedData.answer }}
              />
            </div>
        </Card>
        </div>
      )}
    </div>
  );
}
