/**
 * Build a textual context block from product rows for RAG.
 * Each product is rendered in a consistent, easy-to-read format.
 */
function buildProductContext(products) {
  if (!products || !products.length) {
    return 'No matching products found.';
  }

  return products
    .map(
      (p) =>
        `Product: ${p.name}\nDescription: ${p.description}\nPrice: ${p.price}`
    )
    .join('\n\n');
}

module.exports = { buildProductContext };
