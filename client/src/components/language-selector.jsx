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
  import { cn } from "@/lib/utils";
  import { Check, ChevronsUpDown } from "lucide-react";
  import { Button } from "@/components/ui/button";

  const languages = [
    { label: "English", value: "en" },
    { label: "French", value: "fr" },
    { label: "German", value: "de" },
    { label: "Spanish", value: "es" },
    { label: "Portuguese", value: "pt" },
    { label: "Russian", value: "ru" },
    { label: "Japanese", value: "ja" },
    { label: "Korean", value: "ko" },
    { label: "Chinese", value: "zh" },
    { label: "Hindi", value: "hi" },
  ];

export default function LanguageSelector({ selected, onSelect }) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn("w-full justify-between", !selected && "text-muted-foreground")}
          >
            {selected ? languages.find(l => l.value === selected)?.label : "Select language"}
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0">
          <Command>
            <CommandInput placeholder="Search language..." />
            <CommandList>
              <CommandEmpty>No language found.</CommandEmpty>
              <CommandGroup>
                {languages.map(language => (
                  <CommandItem
                    key={language.value}
                    value={language.value}
                    onSelect={() => onSelect(language.value)}
                  >
                    {language.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        language.value === selected ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }