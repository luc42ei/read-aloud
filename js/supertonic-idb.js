
const supertonicIdb = (() => {
  const DB_NAME = "supertonic-tts"
  const DB_VERSION = 1

  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains("models")) db.createObjectStore("models")
        if (!db.objectStoreNames.contains("voices")) db.createObjectStore("voices")
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  function get(storeName, key) {
    return openDB().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly")
      const req = tx.objectStore(storeName).get(key)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    }))
  }

  function put(storeName, key, value) {
    return openDB().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite")
      const req = tx.objectStore(storeName).put(value, key)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    }))
  }

  function getAllKeys(storeName) {
    return openDB().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly")
      const req = tx.objectStore(storeName).getAllKeys()
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    }))
  }

  function clearStore(storeName) {
    return openDB().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite")
      const req = tx.objectStore(storeName).clear()
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    }))
  }

  const MODEL_FILES = [
    "duration_predictor.onnx",
    "text_encoder.onnx",
    "vector_estimator.onnx",
    "vocoder.onnx",
    "tts.json",
    "unicode_indexer.json"
  ]

  return {
    getCachedModel: key => get("models", key),
    putCachedModel: (key, data) => put("models", key, data),
    getCachedVoice: key => get("voices", key),
    putCachedVoice: (key, data) => put("voices", key, data),

    async isModelSetComplete() {
      const keys = await getAllKeys("models")
      return MODEL_FILES.every(f => keys.includes(f))
    },

    async clearModelCache() {
      await clearStore("models")
      await clearStore("voices")
    },

    MODEL_FILES
  }
})()
