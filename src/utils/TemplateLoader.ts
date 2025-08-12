import dynamic from "next/dynamic";
import setiLoader from "seti-ramesesv1/lib/loaders/setiLoader";

export const templateLoaders: Record<string, (name: string) => React.ComponentType<any> | null> = {
  seti: setiLoader,
  default: (name) => dynamic(() => import(`@/templates/${name}`)),
};