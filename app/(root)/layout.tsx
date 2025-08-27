import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/actions/auth.actions";

async function AppLayout({ children }: { children: ReactNode }) {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    redirect("/sign-in");
  }

  return (
    <div className="root-layout">
      <nav className="">
        <Link href={"/"} className="flex items-center gap-2">
          <Image src={"/logo.svg"} alt="logo" height={28} width={38} />
          <h2 className="text-primary-100">PerpMe</h2>
        </Link>
      </nav>
      {children}
    </div>
  );
}

export default AppLayout;
