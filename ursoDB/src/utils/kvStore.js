// kvStore.js
const store = {};

const createKeyValuePair = (key, value) => {
  store[key] = value;
  return { key, value };
};

const readValueByKey = (key) => {
  return store[key] || null;
};

const updateValueByKey = (key, value) => {
  if (store[key]) {
    store[key] = value;
    return { key, value };
  }
  return null;
};

const deleteKeyValuePair = (key) => {
  if (store[key]) {
    delete store[key];
    return true;
  }
  return false;
};

module.exports = {
  createKeyValuePair,
  readValueByKey,
  updateValueByKey,
  deleteKeyValuePair
};
