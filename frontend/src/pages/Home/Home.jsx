import React, { useEffect, useState } from "react";
import NoteCard from "../../components/Cards/NoteCard";
import { MdAdd } from "react-icons/md";
import Modal from "react-modal";
import AddEditNotes from "./AddEditNotes";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import axios from "axios";
import { toast } from "react-toastify";
import EmptyCard from "../../components/EmptyCard/EmptyCard";

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.withCredentials = true;

// Axios request interceptor to attach token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Axios response interceptor to handle 401 errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

const Home = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [allNotes, setAllNotes] = useState([]);
  const [isSearch, setIsSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else {
      getAllNotes();
    }
  }, [currentUser, navigate]);

  const getAllNotes = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get("/api/note/all");
      if (data.success === false) {
        throw new Error(data.message);
      }
      setAllNotes(data.notes || []);
    } catch (error) {
      console.error("Fetch notes error:", error);
      toast.error(error.response?.data?.message || "Failed to fetch notes");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNote = async (noteId) => {
    try {
      const { data } = await axios.delete(`/api/note/delete/${noteId}`);
      if (data.success === false) {
        throw new Error(data.message);
      }
      toast.success("Note deleted successfully");
      getAllNotes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete note");
    }
  };

  const onSearchNote = async (query) => {
    try {
      const { data } = await axios.get("/api/note/search", {
        params: { query },
      });
      if (data.success === false) {
        throw new Error(data.message);
      }
      setIsSearch(true);
      setAllNotes(data.notes || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Search failed");
    }
  };

  const updateIsPinned = async (noteId, currentPinnedStatus) => {
    try {
      const { data } = await axios.put(`/api/note/update-note-pinned/${noteId}`, {
        isPinned: !currentPinnedStatus,
      });
      if (data.success === false) {
        throw new Error(data.message);
      }
      toast.success(data.message);
      getAllNotes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update pin status");
    }
  };

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({ isShown: true, data: noteDetails, type: "edit" });
  };

  const handleClearSearch = () => {
    setIsSearch(false);
    getAllNotes();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        userInfo={currentUser?.rest}
        onSearchNote={onSearchNote}
        handleClearSearch={handleClearSearch}
      />

      <div className="container mx-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : allNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
            {allNotes.map((note) => (
              <NoteCard
                key={note._id}
                title={note.title}
                date={note.createdAt}
                content={note.content}
                tags={note.tags}
                isPinned={note.isPinned}
                onEdit={() => handleEdit(note)}
                onDelete={() => deleteNote(note._id)}
                onPinNote={() => updateIsPinned(note._id, note.isPinned)}
              />
            ))}
          </div>
        ) : (
          <EmptyCard
            imgSrc={
              isSearch
                ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtakcQoMFXwFwnlochk9fQSBkNYkO5rSyY9A&s"
                : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDCtZLuixBFGTqGKdWGLaSKiO3qyhW782aZA&s"
            }
            message={
              isSearch
                ? "Oops! No Notes found matching your search"
                : `Ready to capture your ideas? Click the 'Add' button to start noting down your thoughts, inspiration and reminders. Let's get started!`
            }
          />
        )}
      </div>

      <button
        className="fixed w-16 h-16 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 right-6 bottom-6 shadow-lg transition-all duration-200 hover:scale-105"
        onClick={() => setOpenAddEditModal({ isShown: true, type: "add", data: null })}
        aria-label="Add new note"
      >
        <MdAdd className="text-3xl text-white" />
      </button>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => setOpenAddEditModal({ isShown: false, type: "add", data: null })}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: 1000,
          },
          content: {
            maxWidth: "600px",
            margin: "2rem auto",
            padding: "1.5rem",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        }}
        ariaHideApp={false}
      >
        <AddEditNotes
          onClose={() => setOpenAddEditModal({ isShown: false, type: "add", data: null })}
          noteData={openAddEditModal.data}
          type={openAddEditModal.type}
          getAllNotes={getAllNotes}
        />
      </Modal>
    </div>
  );
};

export default Home;