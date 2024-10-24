import Image from "next/image";
import { SignIn } from "@clerk/nextjs";
import Logo from "public/images/logos/eboxsecure-logo.png";

export default function Page() {
  return (
    <div className="flex h-screen w-full flex-col items-center gap-8 bg-blue-100 pt-24">
      <Image src={Logo} alt="EboxSecure logo" height={200} draggable={false} />
      <SignIn />
    </div>
  );
}
