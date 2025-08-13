import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const Navbar = () => {
  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
      <Container className="h-full">
        <div className="h-full flex items-center justify-between">
          <h1 className="text-xl font-bold text-black">SML Tavern</h1>
          <Link href="/login" passHref>
            <Button asChild>
              <span>Login</span>
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
};
