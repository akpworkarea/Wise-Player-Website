import React from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "../layout/MainLayout";

// Pages
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import UserManagement from "../pages/UserManagement";
import Reseller from "../pages/Reseller";
import Login from "../pages/login";
import Register from "../pages/Ragister/Ragister";
import ContactUs from "../pages/Contact";
import RequestManagement from "../pages/RequestManagement";
import SubReseller from "../pages/Subreseller";
import PurchaseCredit from "../pages/PurchaseCredit";
import TransitionHistory from "../pages/TransactionHistory";
import PaymentStatus from "../pages/PaymentStatus";
import RegisterSuccess from "../pages/ragistersuccess";
import WisePlayerActivation from "../pages/Activation";
import WisePlayerUploadList from "../pages/UploadList";
import WisePlayerUploadPlayList from "../pages/UploadPlayList";

const AppRoutes = () => {
  return (
    <MainLayout>
      <Routes>

        {/* ✅ PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/reseller" element={<Reseller />} /> {/* ✅ PUBLIC NOW */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/register-success" element={<RegisterSuccess />} />
        <Route path="/activation" element={<WisePlayerActivation />} />
        <Route path="/upload-list" element={<WisePlayerUploadList />} />
        <Route path="/upload-playlist" element={<WisePlayerUploadPlayList />} />

        {/* ✅ ADMIN ONLY */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/requests" element={<RequestManagement />} />
        <Route path="/subreseller" element={<SubReseller />} />
        <Route path="/purchase-credit" element={<PurchaseCredit />} />
        <Route path="/transition-history" element={<TransitionHistory />} />
        <Route path="/payment-status" element={<PaymentStatus />} />

        <Route path="*" element={<Home />} />
      </Routes>
    </MainLayout>
  );
};

export default AppRoutes;