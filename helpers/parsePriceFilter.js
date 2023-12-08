
function parsePriceFilter(price) {
    const priceRange = price.split('-').map(Number);
    
      if (priceRange.length !== 2 || priceRange.some(isNaN)) {
        // Check if the value is "and above"
        if (price.endsWith("-and-above")) {
          const minPrice = parseInt(price, 10);
          if (!isNaN(minPrice)) {
            return { $gte: minPrice };
          }
        }
    
        throw new Error('Invalid price filter format');
      }
    
      const [minPrice, maxPrice] = priceRange;
    
      return { $gte: minPrice, $lte: maxPrice };
    }

module.exports = parsePriceFilter    
    