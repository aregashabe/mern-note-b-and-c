import React, { useState, useRef, useEffect } from "react";
import { MdAdd, MdClose } from "react-icons/md";

const TagInput = ({ tags = [], setTags, maxTags = 10 }) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const addNewTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue) && tags.length < maxTags) {
      setTags([...tags, trimmedValue]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (["Enter", "Tab", ","].includes(e.key)) {
      e.preventDefault();
      addNewTag();
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      e.preventDefault();
      setTags(tags.slice(0, -1));
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="inline-flex items-center gap-1 text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-blue-500 hover:text-blue-700 focus:outline-none"
                aria-label={`Remove tag ${tag}`}
              >
                <MdClose size={16} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={tags.length >= maxTags ? "Maximum tags reached" : "Add tags (press Enter)"}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={tags.length >= maxTags}
        />
        
        {tags.length < maxTags && (
          <button
            type="button"
            onClick={addNewTag}
            className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Add tag"
          >
            <MdAdd size={18} />
          </button>
        )}
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-500">
        {tags.length}/{maxTags} tags • Press Enter, Tab or comma to add
      </p>
    </div>
  );
};

export default TagInput;