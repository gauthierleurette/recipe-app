import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { RecipeForm } from "@/components/RecipeForm";

export default async function NewRecipePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800 mb-6">New recipe</h1>
      <RecipeForm />
    </div>
  );
}
