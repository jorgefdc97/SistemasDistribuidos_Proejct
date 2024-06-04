
const kvStore = {
  store: {},

  createKeyValuePair: (key, value) => {
    kvStore.store[key] = value;
    return { key, value };
  },

  readValueByKey: (key) => {
    return kvStore.store[key] || null;
  },

  updateValueByKey: (key, value) => {
    if (kvStore.store[key]) {
      kvStore.store[key] = value;
      return { key, value };
    }
    return null;
  },

  deleteKeyValuePair: (key) => {
    if (kvStore.store[key]) {
      delete kvStore.store[key];
      return true;
    }
    return false;
  },
};

module.exports = kvStore;
