import { useContext, useEffect } from "react";
import { UNSAFE_NavigationContext as NavigationContext } from "react-router-dom";
import type { NavigateOptions, To } from "react-router-dom";

/**
 * Hook dùng để chặn hành động điều hướng (push) trong React Router
 */
export function useBlocker(blocker: () => boolean) {
  const { navigator } = useContext(NavigationContext) as any;

  useEffect(() => {
    const originalPush = navigator.push;

    navigator.push = (to: To, state?: any, opts?: NavigateOptions) => {
      const allow = blocker();
      if (allow) originalPush(to, state, opts);
    };

    return () => {
      navigator.push = originalPush;
    };
  }, [blocker, navigator]);
}
