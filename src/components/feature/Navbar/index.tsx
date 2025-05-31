import { Container } from "@/components/ui/container";
import { DarkModeToggle } from "./components/DarkModeToggle";

export const Navbar = () => {
  return (
    <div className="h-[72px] bg-white/60 ">
      <Container className="h-full">
        <div className="h-full flex items-center justify-between">
          <p className="text-3xl font-semibold italic">SML</p>
          <p className="text-3xl font-semibold">SML Nom Market</p>
          <DarkModeToggle />
        </div>
      </Container>
    </div>
  );
};
