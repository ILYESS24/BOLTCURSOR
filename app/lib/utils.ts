import { classNames } from "~/utils/classNames"

export function cn(...inputs: (string | undefined | null | false)[]) {
  return classNames(...inputs.filter(Boolean))
}

