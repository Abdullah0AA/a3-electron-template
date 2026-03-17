import React from "react";
import { ThemeToggle } from "./components/ThemeToggle";
import { UpdateNotification } from "./components/UpdateNotification";

export default function App() {
  return (
    <div>
      <ThemeToggle />
      <UpdateNotification />
      New Version
    </div>
  );
}
