import { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { SignupProps } from "@repo/validation";

const Signup = () => {
  const { signup, isSigningUp } = useAuthStore();
  const [props, setProps] = useState<SignupProps>({
    name: "",
    email: "",
    password: "",
  });
  if (isSigningUp) {
    return <div>Loading ...</div>;
  }

  return (
    <div>
      Signup Page
      <br />
      <br />
      <br />
      <label>Name</label>
      <br />
      <input
        type="text"
        onChange={(e) => setProps({ ...props, name: e.target.value })}
      />
      <br />
      <br />
      <br />
      <label>Email</label>
      <br />
      <input
        type="email"
        onChange={(e) => setProps({ ...props, email: e.target.value })}
      />
      <br />
      <br />
      <br />
      <label>Password</label>
      <br />
      <input
        type="password"
        onChange={(e) => setProps({ ...props, password: e.target.value })}
      />
      <br />
      <br />
      <br />
      <button
        onClick={() => {
          signup(props.name, props.email, props.password);
        }}
      >
        Signup
      </button>
    </div>
  );
};

export default Signup;
