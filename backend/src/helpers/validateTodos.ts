export const validateDueDate = (dueDate: string) => {
  if (!dueDate) return false;

  const currentDate = new Date();
  const dueDateObj = new Date(dueDate);
  if (dueDateObj < currentDate) return false;

  return true;
};
