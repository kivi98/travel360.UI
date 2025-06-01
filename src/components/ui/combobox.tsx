"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

export interface ComboboxOption {
  value: number
  label: string
  searchTerms?: string[]
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: number
  onValueChange?: (value: number) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  loading?: boolean
  className?: string
}

export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search options...",
  emptyMessage = "No options found.",
  disabled = false,
  loading = false,
  className,
}, ref) => {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  React.useImperativeHandle(ref, () => inputRef.current!)

  const selectedOption = options.find(option => option.value === value)

  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options

    return options.filter(option => {
      const searchLower = searchValue.toLowerCase()
      const labelMatches = option.label.toLowerCase().includes(searchLower)
      const termsMatch = option.searchTerms?.some(term => 
        term.toLowerCase().includes(searchLower)
      )
      return labelMatches || termsMatch
    })
  }, [options, searchValue])

  const handleSelect = (optionValue: number) => {
    onValueChange?.(optionValue)
    setOpen(false)
    setSearchValue("")
  }

  const handleInputFocus = () => {
    if (!disabled) {
      setOpen(true)
    }
  }

  const handleInputBlur = (e: React.FocusEvent) => {
    // Delay closing to allow for option selection
    setTimeout(() => {
      if (!listRef.current?.contains(e.relatedTarget as Node)) {
        setOpen(false)
        setSearchValue("")
      }
    }, 150)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false)
      setSearchValue("")
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={open ? searchValue : selectedOption?.label || ""}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={open ? searchPlaceholder : placeholder}
          disabled={disabled || loading}
          className={cn(
            "h-9 pr-10",
            selectedOption && !open && "text-foreground"
          )}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {loading ? (
            <div className="animate-spin h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full" />
          ) : (
            <ChevronDownIcon className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              open && "rotate-180"
            )} />
          )}
        </div>
      </div>

      {open && (
        <div 
          ref={listRef}
          className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-popover border border-border rounded-md shadow-md"
        >
          {filteredOptions.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              {emptyMessage}
            </div>
          ) : (
            <div className="p-1">
              {filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "relative flex cursor-pointer items-center rounded-sm px-2 py-2 text-sm outline-none select-none transition-colors hover:bg-accent hover:text-accent-foreground",
                    option.value === value && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleSelect(option.value)}
                  onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                >
                  <span className="flex-1">{option.label}</span>
                  {option.value === value && (
                    <CheckIcon className="h-4 w-4 ml-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
})

Combobox.displayName = "Combobox"