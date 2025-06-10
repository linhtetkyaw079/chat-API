"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { countryCodes } from "@/lib/country-codes"

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  countryCode: string
  onCountryCodeChange: (code: string) => void
}

export default function PhoneInput({ value, onChange, countryCode, onCountryCodeChange }: PhoneInputProps) {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus the input when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <div className="flex">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[110px] justify-between rounded-r-none border-r-0"
          >
            {countryCode}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search country code..." />
            <CommandList>
              <CommandEmpty>No country code found.</CommandEmpty>
              <CommandGroup className="max-h-[200px] overflow-y-auto">
                {countryCodes.map((code) => (
                  <CommandItem
                    key={code.code}
                    value={code.code}
                    onSelect={(currentValue) => {
                      onCountryCodeChange(currentValue)
                      setOpen(false)
                      if (inputRef.current) {
                        inputRef.current.focus()
                      }
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", countryCode === code.code ? "opacity-100" : "opacity-0")} />
                    {code.code} {code.country}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        ref={inputRef}
        type="tel"
        placeholder="Phone number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-l-none"
      />
    </div>
  )
}
