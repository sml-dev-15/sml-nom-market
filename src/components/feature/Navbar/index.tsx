import { Container } from "@/components/ui/container";
import { DarkModeToggle } from "./components/DarkModeToggle";
import { NomMarketLogo } from "@/components/icons/NomMarketLogo";

export const Navbar = () => {
  return (
    <div className="sticky top-0 z-50 h-[72px] bg-white/90 ">
      <Container className="h-full">
        <div className="h-full flex items-center justify-between">
          <NomMarketLogo />
          <DarkModeToggle />
        </div>
      </Container>
    </div>
  );
};
