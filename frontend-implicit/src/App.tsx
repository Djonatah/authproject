import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Login } from "./Login";
import { Logout } from "./Logout";
import { Callback } from "./Callback";
import { AuthProvider } from "./AuthProvider";
import { PrivateRoute } from "./PrivateRoute";
import Admin from "./Admin";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/logout",
    element: <Logout />,
  },
  {
    path: "/callback",
    element: <Callback />,
  },
  {
    path: "/admin",
    element: (
      <PrivateRoute>
        <Admin />
      </PrivateRoute>
    ),
  },
]);
function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;