import { QRCodeSVG } from 'qrcode.react';

export function QRPreview() {
  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="w-full flex flex-col items-center space-y-4 mb-12">
        <h1 className="text-6xl font-bold text-[#FFD700]">Barkle</h1>
        <p className="text-xl text-zinc-400 tracking-wide">Test your trivia skills 🐾 🐶</p>
      </div>

      {/* QR Code */}
      <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-[#4CAF50]">
        <QRCodeSVG 
          value="https://barkle.vercel.app"
          size={300}
          level="H"
          includeMargin={true}
        />
      </div>

      {/* URL Display */}
      <div className="mt-8">
        <a 
          href="https://barkle.vercel.app" 
          className="inline-block px-6 py-3 bg-[#4CAF50]/20 backdrop-blur-sm rounded-full border-2 border-[#FFD700] hover:bg-[#4CAF50]/30 transition-all duration-200"
        >
          <p className="text-xl text-[#FFD700] font-bold">barkle.vercel.app 🐶</p>
        </a>
      </div>
    </div>
  );
}