function processWholesaleOrder(order) {
  const lines = order.items || [];
  let total = 0;
  for (const line of lines) total += (line.qty || 0) * (line.price || 0);
  if (order.discountCode === "SAVE10") total *= 0.9;
  return { channel: "wholesale", total };
}
module.exports = { processWholesaleOrder };
