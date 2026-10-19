import { Routes, Route } from "react-router-dom";
import { PublicLayout, AdminLayout, ScrollTop } from "./components/Layout";
import Home from "./pages/Home";
import Services from "./pages/Services";
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import FichePage from "./pages/admin/Fiche";
import FicheView from "./pages/admin/FicheView";
import Rdvs from "./pages/admin/Rdvs";
import Rappels from "./pages/admin/Rappels";

export default function App() {
  return (
    <>
      <ScrollTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/a-propos" element={<About />} />
          <Route path="/galerie" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="fiches/nouvelle" element={<FichePage />} />
          <Route path="fiches/:id" element={<FicheView />} />
          <Route path="fiches/:id/modifier" element={<FichePage />} />
          <Route path="rendez-vous" element={<Rdvs />} />
          <Route path="rappels" element={<Rappels />} />
        </Route>
      </Routes>
    </>
  );
}
