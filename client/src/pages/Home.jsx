
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authUtils';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to VroomVault</h1>
      <p className="text-xl mb-8">Find your perfect car or sell your vehicle with ease.</p>
      {user ? (
        <Link 
          to={`/${user.role}-dashboard`}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700"
        >
          Go to Dashboard
        </Link>
      ) : (
        <div className="space-x-4">
          <Link 
            to="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700"
          >
            Login
          </Link>
          <Link 
            to="/register"
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg text-lg hover:bg-gray-300"
          >
            Register
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;

