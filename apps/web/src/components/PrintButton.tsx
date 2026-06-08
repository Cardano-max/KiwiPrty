"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print rounded-lg bg-kiwi-600 px-4 py-2 text-sm font-semibold text-white hover:bg-kiwi-700"
    >
      🖨️ Print / Save as PDF
    </button>
  );
}
