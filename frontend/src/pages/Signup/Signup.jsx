import React, { useState } from "react";
import PasswordInput from "../../components/Input/PasswordInput";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail } from "../../utils/helper";
import axios from "axios";
import { toast } from "react-toastify";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!formData.password) {
      setError("Please enter the password");
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/signup`,
        {
          username: formData.name,
          email: formData.email,
          password: formData.password
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (!data.success) {
        throw new Error(data.message || "Registration failed");
      }

      toast.success("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      const errorMsg = error.response?.data?.message || 
                     error.message || 
                     "Registration failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center mt-28">
      <div className="w-96 border rounded bg-white px-7 py-10">
        <form onSubmit={handleSignUp}>
          <h4 className="text-2xl mb-7">Sign Up</h4>

          <input
            name="name"
            type="text"
            placeholder="Name"
            className="input-box"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            className="input-box"
            value={formData.email}
            onChange={handleChange}
          />

          <PasswordInput
  name="password"  // This was missing
  value={formData.password}
  onChange={handleChange}
/>

          {error && (
            <p className="text-red-500 text-sm pb-1">
              {error}
            </p>
          )}

          <button 
            type="submit" 
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "SIGN UP"}
          </button>

          <p className="text-sm text-center mt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-[#2B85FF] underline"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;