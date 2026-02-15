/**
 * IndexedDB: レシート（会計履歴）の保存・取得。デモ用・サーバーなし。
 */
const DB_NAME = 'salon_register_demo'
const DB_VERSION = 1
const STORE_RECEIPTS = 'receipts'

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_RECEIPTS)) {
        const store = db.createObjectStore(STORE_RECEIPTS, { keyPath: 'id', autoIncrement: true })
        store.createIndex('created_at', 'created_at', { unique: false })
      }
    }
  })
}

/**
 * @param {{ items: Array<{name, price, category}>, total: number, created_at: string }} payload
 */
export async function saveReceipt(payload) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_RECEIPTS, 'readwrite')
    const store = tx.objectStore(STORE_RECEIPTS)
    const record = { ...payload, created_at: payload.created_at || new Date().toISOString() }
    const req = store.add(record)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/**
 * 直近 N 日分のレシートを取得（日付グループ用）
 */
export async function getReceiptsLastDays(days = 7) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_RECEIPTS, 'readonly')
    const store = tx.objectStore(STORE_RECEIPTS)
    const index = store.index('created_at')
    const req = index.openCursor(null, 'prev')
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffStr = cutoff.toISOString()
    const list = []
    req.onsuccess = () => {
      const cursor = req.result
      if (!cursor) {
        resolve(list)
        return
      }
      if (cursor.value.created_at < cutoffStr) {
        resolve(list)
        return
      }
      list.push({ id: cursor.value.id, ...cursor.value })
      cursor.continue()
    }
    req.onerror = () => reject(req.error)
  })
}

/**
 * 本日分のレシートを取得
 */
export async function getReceiptsToday() {
  const today = new Date().toDateString()
  const all = await getReceiptsLastDays(1)
  return all.filter((r) => new Date(r.created_at).toDateString() === today)
}

/**
 * 指定IDのレシートを削除
 */
export async function deleteReceipt(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_RECEIPTS, 'readwrite')
    const store = tx.objectStore(STORE_RECEIPTS)
    const req = store.delete(id)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function clearAllReceipts() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_RECEIPTS, 'readwrite')
    const store = tx.objectStore(STORE_RECEIPTS)
    const req = store.clear()
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}
