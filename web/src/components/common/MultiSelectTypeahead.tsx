import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface MultiSelectTypeaheadProps {
  /** Array of available options to select from */
  options: string[];
  /** Currently selected values */
  value: string[];
  /** Callback when selection changes */
  onChange: (value: string[]) => void;
  /** Optional label for the input field */
  label?: string;
  /** Optional placeholder text */
  placeholder?: string;
}

/**
 * A reusable multi-select typeahead component
 * Displays selected items as removable chips and provides filtered dropdown selection
 */
export default function MultiSelectTypeahead({
  options,
  value,
  onChange,
  label,
  placeholder = 'Type to filter...'
}: MultiSelectTypeaheadProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on input and exclude already selected values
  const filteredOptions = options.filter(
    option =>
      !value.includes(option) &&
      option.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleSelectOption = (option: string) => {
    if (!value.includes(option)) {
      onChange([...value, option]);
    }
    setInputValue('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRemoveValue = (optionToRemove: string) => {
    onChange(value.filter(v => v !== optionToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && e.key !== 'Escape') {
      setIsOpen(true);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelectOption(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'Backspace':
        if (inputValue === '' && value.length > 0) {
          e.preventDefault();
          handleRemoveValue(value[value.length - 1]);
        }
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {label && <label className="label">{label}</label>}
      
      <div className="relative">
        {/* Selected values as chips */}
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map(item => (
            <span
              key={item}
              className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300"
            >
              {item}
              <button
                type="button"
                onClick={() => handleRemoveValue(item)}
                className="ml-1 hover:text-primary-900 dark:hover:text-primary-100 focus:outline-none"
                aria-label={`Remove ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="input"
          aria-label={label}
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="typeahead-listbox"
        />

        {/* Dropdown list */}
        {isOpen && (
          <div
            id="typeahead-listbox"
            role="listbox"
            className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No matches
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={index === highlightedIndex}
                  onClick={() => handleSelectOption(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    index === highlightedIndex
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-900 dark:text-primary-100'
                      : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
