import { useEffect } from "react";
import { useLocation } from "react-router";

const PageTitle = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Define page titles based on routes
    const getTitleFromPath = (path: string): string => {
      switch (path) {
        case "/":
          return "Home | Legal Matters";
        case "/customers":
          return "Customers | Legal Matters";
        case "/matters":
          return "Matters | Legal Matters";
        case "/login":
          return "Login | Legal Matters";
        case "/signup":
          return "Sign Up | Legal Matters";
        default:
          return "Legal Matters";
      }
    };
    
    // Update document title
    document.title = getTitleFromPath(location.pathname);
  }, [location.pathname]);
  
  // This component doesn't render anything
  return null;
};

export default PageTitle;
