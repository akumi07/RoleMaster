import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HeroSection from './components/HeroSection'
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Register from "./components/Register";
import UserManagement from "./components/userManagement";
import { LoginProvider } from "./context/LoginContext";
import AddUserForm from "./components/AddUser";
import Update from "./components/Update";
import UpdateUser from "./components/Update";
import Pricing from "./components/Pricing";
import Leadership from "./components/Leadership";
import ContactUS from "./components/ContactUS";

  function App() {
  return (
    <LoginProvider>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register/>}/>
        <Route path="/userManagement" element={<UserManagement/>}/>
        <Route path="/add-user" element={<AddUserForm/>}/>
        <Route path="/update-user"element={<UpdateUser/>}/>
        <Route path="/pricing" element={<Pricing/>}/>
        <Route path="/leadership" element={<Leadership/>}/>
        <Route path="/contact" element={<ContactUS/>}/>
      </Routes>
    </Router>
    </LoginProvider>
  )
}

export default App
