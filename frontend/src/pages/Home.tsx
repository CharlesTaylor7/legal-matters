import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';

interface User {
  id: string;
  email: string;
  firmName: string;
}

const Home = () => {
  // Query to fetch the current user
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated, but not an error
          return null;
        }
        throw new Error('Failed to fetch user data');
      }
      
      return response.json() as Promise<User>;
    },
  });

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
                <Link to="/customers" className="btn btn-primary">View Customers</Link>
                <Link to="/matters" className="btn btn-secondary">View Matters</Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-5xl font-bold">Legal Matters</h1>
              <p className="py-6">Manage your customers and their legal matters with ease.</p>
              <div className="flex gap-4 justify-center">
                <Link to="/login" className="btn btn-primary">Login</Link>
                <Link to="/signup" className="btn btn-secondary">Sign Up</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
