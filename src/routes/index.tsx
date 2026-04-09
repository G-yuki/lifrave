// src/routes/index.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard } from "../features/auth/components/AuthGuard";
import { PairProvider } from "../contexts/PairContext";
import { PairSetupPage } from "../features/pair/pages/PairSetupPage";
import { HearingPage } from "../features/setup/pages/HearingPage";
import { SwipePage } from "../features/setup/pages/SwipePage";
import { PartnerWaitingPage } from "../features/setup/pages/PartnerWaitingPage";
import { PartnerSwipePage } from "../features/setup/pages/PartnerSwipePage";
import { HomePage } from "../features/items/pages/HomePage";
import { ItemDetailPage } from "../features/items/pages/ItemDetailPage";
import { SettingsPage } from "../features/settings/pages/SettingsPage";
import { InquiryPage } from "../features/settings/pages/InquiryPage";
import { SuggestPage } from "../features/suggest/pages/SuggestPage";
import { MemoryPage } from "../features/memory/pages/MemoryPage";

// Phase 4, 5, 6, 7 で実装するページのプレースホルダー
const Placeholder = ({ label }: { label: string }) => (
  <div className="flex items-center justify-center min-h-screen">
    <p style={{ color: "var(--color-text-soft)" }}>{label}（準備中）</p>
  </div>
);

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 認証不要 */}
      <Route path="/privacy" element={<Placeholder label="プライバシーポリシー" />} />
      <Route path="/terms" element={<Placeholder label="利用規約" />} />

      {/* 認証必要 */}
      <Route
        path="/*"
        element={
          <AuthGuard>
            <PairProvider>
            <Routes>
              <Route path="/" element={<PairSetupPage />} />
              <Route path="/setup" element={<HearingPage />} />
              <Route path="/setup/swipe" element={<SwipePage />} />
              <Route path="/setup/partner-waiting" element={<PartnerWaitingPage />} />
              <Route path="/setup/partner-swipe" element={<PartnerSwipePage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/home/:itemId" element={<ItemDetailPage />} />
              <Route path="/suggest" element={<SuggestPage />} />
              <Route path="/memory" element={<MemoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/inquiry" element={<InquiryPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </PairProvider>
          </AuthGuard>
        }
      />
    </Routes>
  );
};
