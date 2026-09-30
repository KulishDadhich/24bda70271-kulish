/**
 * Model Adapter Facade
 * Dynamically proxies calls between Mongoose Schemas and In-Memory Data Store.
 */

const store = require('../config/inMemoryStore');

const createModelAdapter = (collectionName, mongooseModel) => {
  return new Proxy(mongooseModel, {
    get(target, prop) {
      if (!store.isMemoryMode) {
        return target[prop];
      }

      // Memory Store Handlers
      if (prop === 'create') {
        return async function (data) {
          if (Array.isArray(data)) {
            return data.map(d => store.createDoc(collectionName, d));
          }
          return store.createDoc(collectionName, data);
        };
      }

      if (prop === 'insertMany') {
        return async function (arr) {
          return arr.map(d => store.createDoc(collectionName, d));
        };
      }

      if (prop === 'find') {
        return function (filter) {
          return store.query(collectionName, filter);
        };
      }

      if (prop === 'findOne') {
        return function (filter) {
          const chain = store.query(collectionName, filter);
          return {
            select(fields) {
              return this;
            },
            populate() {
              return this;
            },
            then(resolve, reject) {
              resolve(chain._results[0] || null);
            },
          };
        };
      }

      if (prop === 'findById') {
        return function (id) {
          const item = store.collections[collectionName].get(String(id));
          return {
            select(fields) {
              return this;
            },
            populate() {
              return this;
            },
            then(resolve, reject) {
              resolve(item || null);
            },
          };
        };
      }

      if (prop === 'findByIdAndUpdate') {
        return async function (id, update, options) {
          const existing = store.collections[collectionName].get(String(id));
          if (!existing) return null;
          const updated = { ...existing, ...update, updatedAt: new Date() };
          store.collections[collectionName].set(String(id), updated);
          return updated;
        };
      }

      if (prop === 'distinct') {
        return async function (field) {
          const list = Array.from(store.collections[collectionName].values());
          const set = new Set();
          list.forEach(item => {
            const val = item[field];
            if (Array.isArray(val)) val.forEach(v => set.add(v));
            else if (val) set.add(val);
          });
          return Array.from(set);
        };
      }

      if (prop === 'countDocuments') {
        return async function (filter) {
          if (!filter || Object.keys(filter).length === 0) {
            return store.collections[collectionName].size;
          }
          return store.query(collectionName, filter)._results.length;
        };
      }

      if (prop === 'deleteMany') {
        return async function () {
          store.collections[collectionName].clear();
          return { acknowledged: true, deletedCount: 0 };
        };
      }

      return target[prop];
    },
  });
};

module.exports = { createModelAdapter };
