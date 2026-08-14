import { revalidatePath, revalidateTag } from "next/cache";

export function revalidateSite(paths: string[] = []) {
  revalidateTag("cms", "max");
  revalidatePath("/", "layout");
  for (const path of paths) {
    revalidatePath(path);
  }
}
