import { Button } from "./components/ui/button";

export default function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-svh">
      <Button
        onClick={async () => {
          console.log("button clicked");
          console.log("bridge:", window.desktopBridge);
          await window.desktopBridge?.showNotification("Hello", "World");
          console.log("done");
        }}
      >
        Click me
      </Button>
    </div>
  );
}
