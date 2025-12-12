"use client";

import { FiBarChart2, FiArrowLeft } from "react-icons/fi";

export default function ReportViewer({ tile, onBack }) {
  const hasReport = !!tile?.reportUrl;

  return (
    <div className="flex flex-col w-full h-screen bg-white">

      <div className="flex justify-between items-center px-6 py-4 border-b bg-slate-50 shadow-sm">

        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs
             bg-blue-100 text-blue-800 border border-blue-200
             shadow-sm hover:bg-blue-200 hover:border-blue-300 transition"
        >
          <FiArrowLeft />
          Back to dashboard
        </button>

        <div className="flex items-center gap-2 text-slate-800 font-semibold text-lg">
          <FiBarChart2 className="text-blue-600" />
          {tile.label}
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {hasReport ? (
          <iframe
            src={tile.reportUrl}
            allowFullScreen
            className="w-full h-full border-none"
            style={{
              minHeight: "100%",
              height: "100%",
              display: "block",
            }}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center
                          text-center text-slate-400 px-4">
            <p className="text-sm font-medium">
              Power BI report link not configured.
            </p>
            <p className="mt-1 text-xs max-w-md">
              Once assigned, the analytics view will render here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
