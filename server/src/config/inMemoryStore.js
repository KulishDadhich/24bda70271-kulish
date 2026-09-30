/**
 * FoodVerse Ultra-Fast In-Memory Data Store & Query Engine
 * 
 * Provides zero-dependency, zero-download in-memory MongoDB-compatible operations
 * so the entire backend, seed scripts, authentication, and REST APIs work 100% out-of-the-box
 * instantly without waiting for a 500MB download or local MongoDB installation!
 */

const bcrypt = require('bcryptjs');

class InMemoryStore {
  constructor() {
    this.collections = {
      users: new Map(),
      restaurants: new Map(),
      dishes: new Map(),
      orders: new Map(),
      coupons: new Map(),
    };
    this.isMemoryMode = false;
  }

  generateId() {
    return Math.random().toString(16).substring(2, 10) +
           Math.random().toString(16).substring(2, 10) +
           Math.random().toString(16).substring(2, 10);
  }

  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  createDoc(collectionName, data) {
    const id = data._id ? data._id.toString() : this.generateId();
    const doc = {
      ...this.clone(data),
      _id: id,
      id: id,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    };

    // Attach Mongoose helper methods
    doc.save = async function () {
      doc.updatedAt = new Date();
      store.collections[collectionName].set(id, doc);
      return doc;
    };

    doc.deleteOne = async function () {
      store.collections[collectionName].delete(id);
      return true;
    };

    doc.toObject = function () {
      return { ...doc };
    };

    if (collectionName === 'users') {
      doc.matchPassword = async function (enteredPassword) {
        if (!doc.password) return false;
        if (doc.password === enteredPassword) return true;
        try {
          return await bcrypt.compare(enteredPassword, doc.password);
        } catch (e) {
          return doc.password === enteredPassword;
        }
      };
    }

    this.collections[collectionName].set(id, doc);
    return doc;
  }

  // Generic Query Builder
  query(collectionName, filter = {}) {
    let list = Array.from(this.collections[collectionName].values());

    // Apply Filter Matching
    list = list.filter(item => {
      for (const key of Object.keys(filter)) {
        const targetVal = filter[key];

        if (key === '$or' && Array.isArray(targetVal)) {
          const orMatch = targetVal.some(condition => {
            const condKey = Object.keys(condition)[0];
            const condVal = condition[condKey];
            const itemVal = item[condKey];
            if (condVal instanceof RegExp) {
              if (Array.isArray(itemVal)) return itemVal.some(v => condVal.test(v));
              return condVal.test(String(itemVal || ''));
            }
            return itemVal === condVal;
          });
          if (!orMatch) return false;
          continue;
        }

        if (key === 'cuisines' && targetVal?.$in) {
          const regexList = targetVal.$in;
          const hasCuisine = (item.cuisines || []).some(c =>
            regexList.some(r => (r instanceof RegExp ? r.test(c) : r === c))
          );
          if (!hasCuisine) return false;
          continue;
        }

        if (key === 'rating' && targetVal?.$gte !== undefined) {
          if ((item.rating || 0) < targetVal.$gte) return false;
          continue;
        }

        if (key === 'deliveryTimeMinutes' && targetVal?.$lte !== undefined) {
          if ((item.deliveryTimeMinutes || 30) > targetVal.$lte) return false;
          continue;
        }

        if (key === 'orderStatus' && targetVal?.$in) {
          if (!targetVal.$in.includes(item.orderStatus)) return false;
          continue;
        }

        if (key === 'expiryDate' && targetVal?.$gte !== undefined) {
          if (new Date(item.expiryDate) < targetVal.$gte) return false;
          continue;
        }

        // Nested key match (e.g. 'customer.user', 'restaurant.restaurantId')
        if (key.includes('.')) {
          const parts = key.split('.');
          let nested = item;
          for (const p of parts) nested = nested?.[p];
          if (String(nested) !== String(targetVal)) return false;
          continue;
        }

        // Direct key match
        const itemVal = item[key];
        if (targetVal instanceof RegExp) {
          if (!targetVal.test(String(itemVal || ''))) return false;
        } else if (itemVal !== targetVal && String(itemVal) !== String(targetVal)) {
          return false;
        }
      }
      return true;
    });

    // Query Chain Object
    const chain = {
      _results: list,
      sort(sortOptions) {
        if (sortOptions) {
          chain._results.sort((a, b) => {
            for (const [sKey, order] of Object.entries(sortOptions)) {
              const valA = a[sKey] ?? 0;
              const valB = b[sKey] ?? 0;
              if (valA !== valB) {
                return order === -1 || order === 'desc'
                  ? valB > valA ? 1 : -1
                  : valA > valB ? 1 : -1;
              }
            }
            return 0;
          });
        }
        return chain;
      },
      limit(n) {
        chain._results = chain._results.slice(0, n);
        return chain;
      },
      select(fields) {
        return chain;
      },
      populate(field, selectFields) {
        return chain;
      },
      then(resolve, reject) {
        resolve(chain._results);
      },
    };

    return chain;
  }
}

const store = new InMemoryStore();
module.exports = store;
