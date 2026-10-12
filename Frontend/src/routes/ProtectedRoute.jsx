import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/authContext.js";

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if(loading){
        return(
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                    <p className="mt-4 text-gray-600">Checking your session</p>
                </div>
            </div>
        );
    }

    if(!isAuthenticated){
        return(
            <Navigate 
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }
    return <Outlet />
}

export default ProtectedRoute;