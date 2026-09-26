import { createFileRoute } from "@tanstack/react-router";
import { ControlCenter } from "@/components/control-center";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main>
      <ControlCenter />
    </main>
  );
}
