const generateId = (prefix) => {
  const stamp = Date.now().toString().slice(-6);
  const random = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${stamp}${random}`;
};

export default generateId;
