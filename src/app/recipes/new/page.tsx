import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { RecipeForm } from "@/components/RecipeForm";
import { getT } from "@/i18n/translations";

export default async function NewRecipePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const t = getT(cookies().get("locale")?.value);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink mb-6">{t.newRecipe}</h1>
      <RecipeForm />
    </div>
  );
}
