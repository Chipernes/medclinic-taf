// Локатори винесені окремо від методів взаємодії: якщо зміниться верстка, правимо тільки цей файл.
export const CommonLocators = {
  alert: '[data-testid="alert"]',
  currentUser: '[data-testid="current-user"]',
  fieldError: (field) => `[data-testid="error-${field}"]`,
};
