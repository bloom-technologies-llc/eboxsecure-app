import Image from "next/image";
import { SignUp } from "@clerk/nextjs";
import Logo from "public/images/logos/eboxsecure-logo.png";

export default function Page() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center gap-8 bg-blue-100 py-12 pt-24">
      <Image src={Logo} alt="EboxSecure logo" height={200} draggable={false} />
      <SignUp forceRedirectUrl="/payment" />
    </div>
  );
}
