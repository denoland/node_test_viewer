export const isDarktheme = () => {
  // deno-lint-ignore no-window
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};
