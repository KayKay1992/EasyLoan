import React, { useState } from "react"; // Import React and useState hook
import AuthLayout from "../../Components/layouts/AuthLayout"; // Import auth layout component
import { Link, useNavigate } from "react-router-dom"; // Import routing utilities
import Input from "../../Components/inputs/Inputs"; // Import custom input component
import { validateEmail } from "../../utils/helper"; // Import email validation helper

// Login component handles user authentication
const Login = () => {
  const [email, setEmail] = useState(""); // State for email input
  const [password, setPassword] = useState(""); // State for password input
  const [error, setError] = useState(""); // State for error messages

  const navigate = useNavigate(); // Navigation hook for routing

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form behavior

    if (!validateEmail(email)) { // Validate email format
      setError("Please Enter a Valid Credential");
      return;
    }
    if (!password) { // Check password exists
      setError("Please Enter a Valid Credential");
      return;
    }
    setError(""); // Clear errors if validation passes

    // Login API call would go here
  };

  return ( // Render login form
    <AuthLayout> {/* Use authentication layout */}
      <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black ">Welcome Back</h3>
        <p className="text-xs text-slate-700 mt-[px] mb-6">
          Please enter your details to log in
        </p>

        <form onSubmit={handleLogin}> {/* Form with submit handler */}
          <Input // Email input field
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Email Address"
            placeholder="John@mgmail.com"
            type="text"
          />
          <Input // Password input field
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            label="Enter Password"
            placeholder="min 8 characters"
            type="password"
          />

          {error && <p className="text-red-600 text-xs pb-2.5">{error}</p>} {/* Error display */}

          <button type="submit" className="btn-primary"> {/* Submit button */}
            LOGIN
          </button>

          <p className="text-[13px] text-slate-800 mt-3 "> {/* Signup link */}
            Don't have an account?{" "}
            <Link className="font-medium text-primary underline" to="/signup">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login; // Export Login component