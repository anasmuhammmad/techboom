const trimProperties = (data) => {
    const trimmedData = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (typeof data[key] === 'string') {
          trimmedData[key] = data[key].trim();
        } else {
          trimmedData[key] = data[key];
        }
      }
    }
    return trimmedData;
  };

module.exports = trimProperties;