import { Link } from "react-router";

const Index = () => {
  return (
    <div>
      Landing Page
      <br />
      <br />
      <Link to={"/login"}>Login</Link>
      <br /><br />
      <Link to={"/signup"}>Signup</Link>
    </div>
  );
};

export default Index;
