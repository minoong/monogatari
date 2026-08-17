/**
 * Stackflow는 액티비티마다 자체 스크롤 컨테이너를 만들기 때문에
 * ScrollTrigger나 스크롤 리스너를 붙이려면 window가 아니라 이 컨테이너를 찾아야 한다.
 */
export const findScrollContainer = (element: HTMLElement | null) => {
  let parent = element?.parentElement ?? null;

  while (parent) {
    const { overflowY } = window.getComputedStyle(parent);
    if ((overflowY === "auto" || overflowY === "scroll") && parent.scrollHeight > parent.clientHeight) {
      return parent;
    }
    parent = parent.parentElement;
  }

  return undefined;
};
