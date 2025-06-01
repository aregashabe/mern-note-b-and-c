import React, { useState } from "react";
import PasswordInput from "../../components/Input/PasswordInput";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail } from "../../utils/helper";
import { useDispatch } from "react-redux";
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "../../redux/user/userSlice";
import axios from "axios";
import { toast } from "react-toastify";

// Set axios defaults for all requests
axios.defaults.baseURL = "https://backendnotes-taupe.vercel.app";
axios.defaults.withCredentials = true;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setError("Please enter the password");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      dispatch(signInStart());

      const { data } = await axios.post("/api/auth/signin", { email, password });

      if (data.success === false) {
        toast.error(data.message);
        dispatch(signInFailure(data.message));
        return;
      }

      toast.success("Login successful!");
      dispatch(signInSuccess(data));
      navigate("/");
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         "Login failed. Please try again.";
      toast.error(errorMessage);
      dispatch(signInFailure(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center mt-28">
      <div className="w-96 border rounded bg-white px-7 py-10">
        <form onSubmit={handleLogin}>
          <h4 className="text-2xl mb-7">Login</h4>

          <input
            type="text"
            placeholder="Email"
            className="input-box"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-red-500 text-sm pb-1">{error}</p>}

          <button 
            type="submit" 
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "LOGIN"}
          </button>

          <p className="text-sm text-center mt-4">
            Not registered yet?{" "}
            <Link
              to="/signup"
              className="font-medium text-[#2B85FF] underline"
            >
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;