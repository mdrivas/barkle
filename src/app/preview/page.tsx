import { Suspense } from "react";
import { QRPreview } from "../components/QRPreview";

export default function PreviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QRPreview />
    </Suspense>
  );
} 