import React, { useState } from "react";
import AuthLayout from "../../Components/layouts/AuthLayout";
import ProfilePhotoSelector from "../../Components/inputs/ProfilePhotoSelector";
import Input from "../../Components/inputs/Inputs";
import { Link } from "react-router-dom";

const SignUp = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminInviteToken, setAdminInviteToken] = useState("");
  const [error, setError] = useState(null);

  //handle signUp form submit
  const handleSingUp = async (e) => {
    e.preventDefault();

    if (!fullName) {
      setError("Please Enter your fullname");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please Enter valid email address");
      return;
    }
    if (!password) {
      setError("Please Enter password");
      return;
    }
    setError("");

    //SignUp API call
  };
  return (
    <AuthLayout>
      <div className="lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center ">
        <h3 className="text-xl font-semibold text-black">Create an Account</h3>
        <p className="text-xs text-slate-700 mt-[5px] mb-6">
          Join Us Today by Entering Your Details Below
        </p>

        <form onSubmit={handleSingUp}>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />
          <div className="grid grid-col-1 md:grid-cols-2 gap-4 ">
            <Input
              value={fullName}
              onChange={({ target }) => setFullName(target.value)}
              label="Full Name"
              placeholder="John Doe"
              type="text"
            />

            <Input
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              label="Email Address"
              placeholder="John@mgmail.com"
              type="text"
            />
            <Input
              value={password}
              onChange={({ target }) => setPassword(target.value)}
              label="Enter Password"
              placeholder="min 8 characters"
              type="password"
            />

            <Input
              value={adminInviteToken}
              onChange={({ target }) => setAdminInviteToken(target.value)}
              label="Admin Invite Token"
              placeholder="6 digit code"
              type="text"
            />
             </div>
            {error && <p className="text-red-600 text-xs pb-2.5">{error}</p>}

            <button type="submit" className="btn-primary">
              SIGN UP
            </button>

            <p className="text-[13px] text-slate-800 mt-3 ">
              Already have an account?{" "}
              <Link className="font-medium text-primary underline" to="/login">
                Login
              </Link>
            </p>
         
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
