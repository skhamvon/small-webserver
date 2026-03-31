import { Navigate, Route, Routes } from "react-router-dom";
import { SiteLayout } from "@/layout/SiteLayout";
import { HomePage } from "@/pages/HomePage";
import { FastPage } from "@/pages/FastPage";
import { HeavyPage } from "@/pages/HeavyPage";

export function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/demo/fast" element={<FastPage />} />
        <Route path="/demo/heavy" element={<HeavyPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
