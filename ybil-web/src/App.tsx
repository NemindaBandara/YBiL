import { useEffect, useState } from "react";
import { db } from "./db/database";

export default function App() {
  const [dbStatus, setDbStatus] = useState("Initializing DB...");

  useEffect(() => {
    db.open()
      .then(() => setDbStatus("IndexedDB (YBiL_Database) is ready!"))
      .catch((err) => setDbStatus(`DB Error: ${err.message}`));
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center shadow-lg">
        <h1 className="text-xl font-bold text-blue-400">YBiL PWA Store</h1>
        <p className="mt-2 text-slate-300">{dbStatus}</p>
      </div>
    </div>
  );
}
