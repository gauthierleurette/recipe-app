export type Locale = "en" | "fr";

const en = {
  // App
  appName: "Our Recipes",

  // Navbar
  addRecipe: "+ Add recipe",
  signOut: "Sign out",

  // Home page
  noRecipesYet: "No recipes yet",
  recipes: (n: number) => `${n} recipe${n > 1 ? "s" : ""}`,
  startBuilding: "Start building your recipe collection.",
  addFirstRecipe: "Add your first recipe",

  // RecipeCard meta
  min: "min",
  servings: (n: number) => `${n} serving${n > 1 ? "s" : ""}`,
  ingredientsCount: (n: number) => `${n} ingredient${n > 1 ? "s" : ""}`,
  madeOnLabel: "Made",

  // RecipeGrid
  searchPlaceholder: "Search recipes…",
  allCuisines: "All",
  noResults: "No recipes match your filters.",

  // Recipe detail
  by: "by",
  edit: "Edit",
  prepTime: "Prep:",
  cookTime: "Cook:",
  totalTime: "Total:",
  ingredientsSection: "Ingredients",
  stepsSection: "Steps",

  // RecipeForm sections
  basicInfo: "Basic info",
  titleField: "Title *",
  descriptionField: "Description",
  cuisineField: "Cuisine",
  cuisinePlaceholder: "e.g. Italian, Japanese, French…",
  prepField: "Prep (min)",
  cookField: "Cook (min)",
  servingsField: "Servings",
  firstMadeField: "First made",
  tagsSection: "Tags",
  tagInputPlaceholder: "Type a tag and press Enter…",
  ingredientsForm: "Ingredients",
  qtyPlaceholder: "Qty",
  unitPlaceholder: "Unit",
  ingredientNamePlaceholder: "Ingredient name",
  addIngredient: "+ Add ingredient",
  stepsForm: "Steps",
  stepPlaceholder: (n: number) => `Step ${n}`,
  photosSection: "Photos",
  createRecipe: "Create recipe",
  saveChanges: "Save changes",
  saving: "Saving…",
  cancel: "Cancel",
  errorGeneric: "Something went wrong. Please try again.",

  // DeleteRecipeButton
  deleteConfirm: "Delete this recipe? This cannot be undone.",
  delete: "Delete",
  deleting: "Deleting…",

  // Login
  emailField: "Email",
  passwordField: "Password",
  invalidCredentials: "Invalid email or password.",
  signingIn: "Signing in…",
  signIn: "Sign in",

  // Page headings
  newRecipe: "New recipe",
  editRecipe: "Edit recipe",

  // TagPicker
  existingTags: "Existing tags",
  noTagsYet: "No tags yet — type one above",

  // RecipeForm image management
  existingPhotos: "Current photos",
  addMorePhotos: "Add more photos",

  // Profile page
  profile: "Profile",
  accountInfo: "Account info",
  changePassword: "Change password",
  currentPassword: "Current password",
  newPassword: "New password",
  confirmNewPassword: "Confirm new password",
  passwordChanged: "Password changed successfully!",
  incorrectPassword: "Current password is incorrect.",
  passwordMismatch: "Passwords do not match.",
  passwordTooShort: "Password must be at least 8 characters.",

  // Registration
  registerTitle: "Create an account",
  nameField: "Name",
  registering: "Creating account…",
  createAccount: "Create account",
  alreadyHaveAccount: "Already have an account?",
  noAccount: "No account yet?",
  emailTaken: "This email is already in use.",

  // Tag category labels (tag names stay in English for DB consistency)
  tagCategories: {
    diet:   { label: "Diet",   tags: ["vegan", "vegetarian", "pescatarian", "gluten-free", "dairy-free"] },
    meal:   { label: "Meal",   tags: ["breakfast", "lunch", "dinner", "dessert", "snack", "appetizer", "brunch"] },
    taste:  { label: "Taste",  tags: ["sweet", "savory", "spicy", "mild"] },
    method: { label: "Method", tags: ["baked", "fried", "grilled", "steamed", "raw", "slow-cooked"] },
  },

  // Localized display labels for predefined tags (key = DB/stored value in English)
  tagLabels: {
    "vegan": "Vegan", "vegetarian": "Vegetarian", "pescatarian": "Pescatarian",
    "gluten-free": "Gluten-free", "dairy-free": "Dairy-free",
    "breakfast": "Breakfast", "lunch": "Lunch", "dinner": "Dinner",
    "dessert": "Dessert", "snack": "Snack", "appetizer": "Appetizer", "brunch": "Brunch",
    "sweet": "Sweet", "savory": "Savory", "spicy": "Spicy", "mild": "Mild",
    "baked": "Baked", "fried": "Fried", "grilled": "Grilled",
    "steamed": "Steamed", "raw": "Raw", "slow-cooked": "Slow-cooked",
  } as Record<string, string>,
};

const fr = {
  // App
  appName: "Nos Recettes",

  // Navbar
  addRecipe: "+ Ajouter",
  signOut: "Se déconnecter",

  // Home page
  noRecipesYet: "Aucune recette pour l'instant",
  recipes: (n: number) => `${n} recette${n > 1 ? "s" : ""}`,
  startBuilding: "Commencez à construire votre collection de recettes.",
  addFirstRecipe: "Ajouter votre première recette",

  // RecipeCard meta
  min: "min",
  servings: (n: number) => `${n} portion${n > 1 ? "s" : ""}`,
  ingredientsCount: (n: number) => `${n} ingrédient${n > 1 ? "s" : ""}`,
  madeOnLabel: "Faite le",

  // RecipeGrid
  searchPlaceholder: "Rechercher des recettes…",
  allCuisines: "Tout",
  noResults: "Aucune recette ne correspond à vos filtres.",

  // Recipe detail
  by: "par",
  edit: "Modifier",
  prepTime: "Prépa. :",
  cookTime: "Cuisson :",
  totalTime: "Total :",
  ingredientsSection: "Ingrédients",
  stepsSection: "Étapes",

  // RecipeForm sections
  basicInfo: "Informations",
  titleField: "Titre *",
  descriptionField: "Description",
  cuisineField: "Cuisine",
  cuisinePlaceholder: "ex. Italienne, Japonaise, Française…",
  prepField: "Prépa. (min)",
  cookField: "Cuisson (min)",
  servingsField: "Portions",
  firstMadeField: "Première fois",
  tagsSection: "Étiquettes",
  tagInputPlaceholder: "Tapez une étiquette et appuyez sur Entrée…",
  ingredientsForm: "Ingrédients",
  qtyPlaceholder: "Qté",
  unitPlaceholder: "Unité",
  ingredientNamePlaceholder: "Nom de l'ingrédient",
  addIngredient: "+ Ajouter un ingrédient",
  stepsForm: "Étapes",
  stepPlaceholder: (n: number) => `Étape ${n}`,
  photosSection: "Photos",
  createRecipe: "Créer la recette",
  saveChanges: "Enregistrer",
  saving: "Enregistrement…",
  cancel: "Annuler",
  errorGeneric: "Une erreur s'est produite. Veuillez réessayer.",

  // DeleteRecipeButton
  deleteConfirm: "Supprimer cette recette ? Cette action est irréversible.",
  delete: "Supprimer",
  deleting: "Suppression…",

  // Login
  emailField: "E-mail",
  passwordField: "Mot de passe",
  invalidCredentials: "E-mail ou mot de passe invalide.",
  signingIn: "Connexion…",
  signIn: "Se connecter",

  // Page headings
  newRecipe: "Nouvelle recette",
  editRecipe: "Modifier la recette",

  // TagPicker
  existingTags: "Étiquettes existantes",
  noTagsYet: "Pas encore d'étiquettes — tapez-en une ci-dessus",

  // RecipeForm image management
  existingPhotos: "Photos actuelles",
  addMorePhotos: "Ajouter des photos",

  // Profile page
  profile: "Profil",
  accountInfo: "Informations du compte",
  changePassword: "Changer le mot de passe",
  currentPassword: "Mot de passe actuel",
  newPassword: "Nouveau mot de passe",
  confirmNewPassword: "Confirmer le nouveau mot de passe",
  passwordChanged: "Mot de passe modifié avec succès !",
  incorrectPassword: "Le mot de passe actuel est incorrect.",
  passwordMismatch: "Les mots de passe ne correspondent pas.",
  passwordTooShort: "Le mot de passe doit contenir au moins 8 caractères.",

  // Registration
  registerTitle: "Créer un compte",
  nameField: "Nom",
  registering: "Création du compte…",
  createAccount: "Créer un compte",
  alreadyHaveAccount: "Vous avez déjà un compte ?",
  noAccount: "Pas encore de compte ?",
  emailTaken: "Cet e-mail est déjà utilisé.",

  // Tag category labels (tag names stay in English for DB consistency)
  tagCategories: {
    diet:   { label: "Régime",  tags: ["vegan", "vegetarian", "pescatarian", "gluten-free", "dairy-free"] },
    meal:   { label: "Repas",   tags: ["breakfast", "lunch", "dinner", "dessert", "snack", "appetizer", "brunch"] },
    taste:  { label: "Goût",    tags: ["sweet", "savory", "spicy", "mild"] },
    method: { label: "Méthode", tags: ["baked", "fried", "grilled", "steamed", "raw", "slow-cooked"] },
  },

  // Localized display labels for predefined tags (key = DB/stored value in English)
  tagLabels: {
    "vegan": "Végétalien", "vegetarian": "Végétarien", "pescatarian": "Pescatarien",
    "gluten-free": "Sans gluten", "dairy-free": "Sans lactose",
    "breakfast": "Petit-déjeuner", "lunch": "Déjeuner", "dinner": "Dîner",
    "dessert": "Dessert", "snack": "En-cas", "appetizer": "Entrée", "brunch": "Brunch",
    "sweet": "Sucré", "savory": "Salé", "spicy": "Épicé", "mild": "Doux",
    "baked": "Au four", "fried": "Frit", "grilled": "Grillé",
    "steamed": "À la vapeur", "raw": "Cru", "slow-cooked": "Mijoté",
  } as Record<string, string>,
};

export type T = typeof en;

const translations: Record<Locale, T> = { en, fr };

export function getT(locale?: string | null): T {
  return translations[(locale as Locale) ?? "en"] ?? translations.en;
}
