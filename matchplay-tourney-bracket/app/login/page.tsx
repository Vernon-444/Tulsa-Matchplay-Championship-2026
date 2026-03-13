import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border-2 border-[#EBAD21] bg-[#162B49]/90 p-6 shadow-xl">
        <h2 className="text-center text-lg font-semibold text-[#F8F1E0]">
          Log in / Sign up
        </h2>
        <p className="mt-2 text-center text-sm text-[#F8F1E0]/90">
          Admin authentication will be connected here (e.g. Supabase Auth).
        </p>
        <Link
          href="/"
          className="mt-4 block w-full rounded-lg border-2 border-[#EBAD21] py-2 text-center text-sm font-medium text-[#F8F1E0] transition-colors hover:bg-[#EBAD21] hover:text-[#162B49]"
        >
          Back to bracket
        </Link>
      </div>
    </div>
  );
}
