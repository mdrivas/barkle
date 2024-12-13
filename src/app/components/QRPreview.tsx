import { QRCodeSVG } from "qrcode.react";

export function QRPreview() {
  return (
    <div className="mb-[300px] flex min-h-screen flex-col items-center justify-center bg-zinc-900 p-8">
      {/* Header */}
      <div className="mb-12 flex w-full flex-col items-center space-y-4">
        <h1 className="text-6xl font-bold text-[#FFD700]">Barkle</h1>
        <p className="text-xl tracking-wide text-zinc-400">
          Test your pup knowledge 🐾 🐶
        </p>
      </div>

      {/* QR Code */}
      <div className="rounded-3xl border-4 border-[#4CAF50] bg-white p-8 shadow-2xl">
        <QRCodeSVG
          value="https://barkle.vercel.app"
          size={200}
          level="H"
          includeMargin={true}
        />
      </div>

      {/* URL Display */}
      <div className="mt-8">
        <a
          href="https://barkle.vercel.app"
          className="inline-block rounded-full border-2 border-[#FFD700] bg-[#4CAF50]/20 px-6 py-3 backdrop-blur-sm transition-all duration-200 hover:bg-[#4CAF50]/30"
        >
          <p className="text-xl font-bold text-[#FFD700]">
            barkle.vercel.app 🐶
          </p>
        </a>
      </div>
    </div>
  );
}
