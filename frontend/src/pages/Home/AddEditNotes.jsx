import React, { useState } from "react";
import { MdClose } from "react-icons/md";
import TagInput from "../../components/Input/TagInput";
import api from "../../utils/api";
import { toast } from "react-toastify";

const AddEditNotes = ({ onClose, noteData, type, getAllNotes }) => {
  const [formData, setFormData] = useState({
    title: noteData?.title || "",
    content: noteData?.content || "",
    tags: noteData?.tags || []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!formData.content.trim()) {
      setError("Content is required");
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = type === "edit" 
        ? `/api/note/edit/${noteData._id}`
        : "/api/note/add";

      const method = type === "edit" ? "put" : "post";

      const { data } = await api[method](endpoint, formData);

      if (!data.success) {
        throw new Error(data.message || "Operation failed");
      }

      toast.success(data.message || (type === "edit" ? "Note updated!" : "Note added!"));
      await getAllNotes();
      onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 
                     error.message || 
                     `Failed to ${type === "edit" ? "update" : "add"} note`;
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative p-6 bg-white rounded-lg shadow-xl max-w-md w-full">
      {/* Close Button */}
      <button
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        onClick={onClose}
        aria-label="Close modal"
        disabled={isLoading}
      >
        <MdClose className="text-2xl" />
      </button>

      <h2 className="text-xl font-bold mb-6 text-gray-800">
        {type === "edit" ? "Edit Note" : "Add New Note"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Note title"
            value={formData.title}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        {/* Content Field */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]"
            placeholder="Write your note here..."
            value={formData.content}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        {/* Tags Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <TagInput
            tags={formData.tags}
            setTags={(tags) => setFormData(prev => ({ ...prev, tags }))}
            disabled={isLoading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-sm mt-2">
            {error}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            type === "edit" ? "Update Note" : "Add Note"
          )}
        </button>
      </form>
    </div>
  );
};

export default AddEditNotes;