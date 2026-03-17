import React from "react";
import { ThemeToggle } from "./components/ThemeToggle";
import { UpdateBanner } from "./components/UpdateBanner";

export default function App() {
  return (
    <div>
      <ThemeToggle />
      <UpdateBanner />
      New Version
    </div>
  );
}
