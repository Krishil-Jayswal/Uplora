import { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { LoginProps } from "@repo/validation";

const Login = () => {
  const { login, isLoggingIn } = useAuthStore();
  const [props, setProps] = useState<LoginProps>({
    email: "",
    password: "",
  });

  if (isLoggingIn) {
    return <div>Loading ...</div>;
  }

  return (
    <div>
      Login Page
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
      <button onClick={() => login(props.email, props.password)}>Login</button>
    </div>
  );
};

export default Login;
