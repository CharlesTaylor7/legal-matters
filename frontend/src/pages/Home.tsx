import { Link } from "react-router";
import { useAuthQuery } from "../api/auth";

const Home = () => {
  const { data: user, isLoading } = useAuthQuery();

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          {isLoading ? (
            <div className="flex justify-center">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : user ? (
            <>
              <h1 className="text-5xl font-bold">Welcome back!</h1>
              <div className="mt-4 p-4 bg-base-100 rounded-lg shadow-md">
                <p className="text-xl">{user.email}</p>
                <p className="text-lg opacity-80">{user.firmName}</p>
              </div>
              <p className="py-6">Your legal matters dashboard is ready.</p>
              <div className="flex gap-4 justify-center">
                <Link to="/customers" className="btn btn-primary">
                  View Customers
                </Link>
                <Link to="/matters" className="btn btn-secondary">
                  View Matters
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-5xl font-bold">Legal Matters</h1>
              <p className="py-6">
                Manage your customers and their legal matters with ease.
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/login" className="btn btn-primary">
                  Login
                </Link>
                <Link to="/signup" className="btn btn-secondary">
                  Sign Up
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
