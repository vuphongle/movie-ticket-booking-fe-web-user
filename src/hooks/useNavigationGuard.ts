import { useEffect, useContext, useRef } from "react";
import { UNSAFE_NavigationContext as NavigationContext } from "react-router-dom";
import type { Navigator, To, NavigateOptions } from "react-router-dom";

/**
 * Hook chặn điều hướng và hiển thị modal xác nhận.
 * @param when true = bật chặn
 * @param confirmFunc hàm trả về Promise<boolean>, true = cho phép đi tiếp
 */
export function useNavigationGuard(
  when: boolean,
  confirmFunc: () => Promise<boolean>
) {
  const { navigator } = useContext(NavigationContext) as { navigator: Navigator };
  const confirmedRef = useRef(false);

  useEffect(() => {
    const originalPush = navigator.push;

    // ✅ Ghi đè push
    navigator.push = async (to: To, state?: any, opts?: NavigateOptions) => {
      if (confirmedRef.current || !when) {
        originalPush(to, state, opts);
        return;
      }

      // Gọi confirm modal
      const result = await confirmFunc();

      if (result) {
        confirmedRef.current = true;
        originalPush(to, state, opts);
      }
    };

    return () => {
      navigator.push = originalPush;
    };
  }, [when, confirmFunc, navigator]);
}
