export const formatDate = (dateInput) => {
  if (!dateInput) return "N/A";
  return new Date(dateInput).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const splitByComma = (text = "") =>
  text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
