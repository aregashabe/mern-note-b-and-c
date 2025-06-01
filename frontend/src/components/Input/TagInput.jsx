import React, { useState, useRef, useEffect, useCallback } from "react";
import { MdAdd, MdClose } from "react-icons/md";

const TagInput = ({ 
  tags = [], 
  setTags, 
  maxTags = 10,
  placeholder = "Add tags",
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

  // Focus input when component mounts or when tags change
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [tags.length, disabled]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const addNewTag = useCallback(() => {
    const trimmedValue = inputValue.trim();
    if (
      trimmedValue && 
      !tags.includes(trimmedValue) && 
      tags.length < maxTags &&
      !disabled
    ) {
      setTags([...tags, trimmedValue]);
      setInputValue("");
    }
  }, [inputValue, tags, maxTags, disabled, setTags]);

  const handleKeyDown = (e) => {
    if (["Enter", "Tab", ","].includes(e.key)) {
      e.preventDefault();
      addNewTag();
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      e.preventDefault();
      setTags(tags.slice(0, -1));
    }
  };

  const handleRemoveTag = useCallback((tagToRemove) => {
    if (!disabled) {
      setTags(tags.filter((tag) => tag !== tagToRemove));
    }
  }, [tags, disabled, setTags]);

  const isMaxTagsReached = tags.length >= maxTags;

  return (
    <div className="space-y-2">
      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2" data-testid="tags-container">
          {tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className={`inline-flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full ${
                disabled 
                  ? "bg-gray-100 text-gray-500" 
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              #{tag}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-blue-500 hover:text-blue-700 focus:outline-none"
                  aria-label={`Remove tag ${tag}`}
                  disabled={disabled}
                >
                  <MdClose size={16} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Input Area */}
      {!isMaxTagsReached && !disabled && (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            placeholder={placeholder}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={disabled || isMaxTagsReached}
            aria-label="Tag input"
            data-testid="tag-input"
          />
          
          <button
            type="button"
            onClick={addNewTag}
            className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            aria-label="Add tag"
            disabled={disabled || !inputValue.trim()}
          >
            <MdAdd size={18} />
          </button>
        </div>
      )}

      {/* Helper Text */}
      <p className={`text-xs ${
        isMaxTagsReached ? "text-green-600" : "text-gray-500"
      }`}>
        {isMaxTagsReached 
          ? "Maximum tags reached" 
          : `${tags.length}/${maxTags} tags • Press Enter, Tab or comma to add`}
      </p>
    </div>
  );
};

export default TagInput;