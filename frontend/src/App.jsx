import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout";
import HomePage from "./pages/HomePage.jsx"
import SignUpPage from "./pages/auth/SignUpPage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx"
import { Toaster } from "react-hot-toast";

function App() {

  return (
    <Layout>
      <Routes>
        <Route path={"/"} element={<HomePage/>}/>
        <Route path={"/signup"} element={<SignUpPage/>}/>
        <Route path={"/login"} element={<LoginPage/>}/>
      </Routes>
      <Toaster/>
    </Layout>
  )
}

export default App
