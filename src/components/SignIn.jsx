import { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function SignIn() {
  const { signIn } = useContext(AuthContext);
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    signIn(email);
  };

  return (
    <div className="container mt-5">
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit} className="w-50 mx-auto">
        <input
          type="email"
          className="form-control mb-3"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn btn-primary w-100">Sign In</button>
      </form>
    </div>
  );
}
