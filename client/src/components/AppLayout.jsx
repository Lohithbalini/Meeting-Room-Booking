import { Navbar } from "./Navbar";

export function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page">{children}</main>
    </div>
  );
}
