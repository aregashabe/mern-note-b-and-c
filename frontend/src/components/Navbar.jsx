import React, { useState } from "react";
import SearchBar from "./SearchBar/SearchBar";
import ProfileInfo from "./Cards/ProfileInfo";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  signInSuccess,
  signoutFailure,
  signoutStart,
  signoutSuccess
} from "../redux/user/userSlice";
import axios from "axios";

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.withCredentials = true;

const Navbar = ({ userInfo, onSearchNote, handleClearSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearchNote(searchQuery);
    }
  };

  const onClearSearch = () => {
    setSearchQuery("");
    handleClearSearch();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

 const onLogout = async () => {
  try {
    dispatch(signoutStart());
    
    const { data } = await axios.post("/api/auth/signout", {}, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    if (data.success === false) {
      throw new Error(data.message);
    }

    // Client-side cleanup
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    
    dispatch(signoutSuccess());
    toast.success("Logged out successfully");
    navigate("/login");
    
  } catch (error) {
    console.error("Logout error:", error);
    // Fallback cleanup
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    dispatch(signoutSuccess());
    navigate("/login");
    toast.error(error.response?.data?.message || "Logout failed");
  }
};

  return (
    <div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow sticky top-0 z-10">
      <Link to={"/"}>
        <h2 className="text-xl font-medium text-black py-2">
          <span className="text-slate-500">Good</span>
          <span className="text-slate-900">Notes</span>
        </h2>
      </Link>

      <SearchBar
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        handleSearch={handleSearch}
        onClearSearch={onClearSearch}
      />

      <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
    </div>
  );
};

export default Navbar;