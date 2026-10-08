import { redirect } from "next/navigation";
import { paths } from "@/routes/paths";

export default function LoginPage() {
  redirect(paths.signIn);
}
