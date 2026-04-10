/**
 * IndexedDB: レシート（会計履歴）の保存・取得。デモ用・サーバーなし。
 */

export interface ReceiptItem {
  name: string
  price: number
  category: string
}

export interface Receipt {
  id: number
  items: ReceiptItem[]
  total: number
  created_at: string
}

export interface ExportData {
  version: number
  exportedAt: string
  receipts: Receipt[]
}

type ReceiptPayload = Omit<Receipt, 'id'>

const DB_NAME = 'salon_register_demo'
const DB_VERSION = 1
const STORE_RECEIPTS = 'receipts'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result as IDBDatabase)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_RECEIPTS)) {
        const store = db.createObjectStore(STORE_RECEIPTS, { keyPath: 'id', autoIncrement: true })
        store.createIndex('created_at', 'created_at', { unique: false })
      }
    }
  })
}

export async function saveReceipt(payload: ReceiptPayload): Promise<IDBValidKey> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_RECEIPTS, 'readwrite')
    const store = tx.objectStore(STORE_RECEIPTS)
    const record: ReceiptPayload = { ...payload, created_at: payload.created_at || new Date().toISOString() }
    const req = store.add(record)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/** 直近 N 日分のレシートを取得（日付グループ用） */
export async function getReceiptsLastDays(days = 7): Promise<Receipt[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_RECEIPTS, 'readonly')
    const store = tx.objectStore(STORE_RECEIPTS)
    const index = store.index('created_at')
    const req = index.openCursor(null, 'prev')
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffStr = cutoff.toISOString()
    const list: Receipt[] = []
    req.onsuccess = () => {
      const cursor = req.result
      if (!cursor) {
        resolve(list)
        return
      }
      const value = cursor.value as Receipt
      if (value.created_at < cutoffStr) {
        resolve(list)
        return
      }
      list.push(value)
      cursor.continue()
    }
    req.onerror = () => reject(req.error)
  })
}

/** 本日分のレシートを取得 */
export async function getReceiptsToday(): Promise<Receipt[]> {
  const today = new Date().toDateString()
  const all = await getReceiptsLastDays(1)
  return all.filter((r) => new Date(r.created_at).toDateString() === today)
}

/** 指定IDのレシートを削除 */
export async function deleteReceipt(id: number): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_RECEIPTS, 'readwrite')
    const store = tx.objectStore(STORE_RECEIPTS)
    const req = store.delete(id)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function clearAllReceipts(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_RECEIPTS, 'readwrite')
    const store = tx.objectStore(STORE_RECEIPTS)
    const req = store.clear()
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

/** 全データをJSON形式でエクスポート */
export async function exportData(): Promise<ExportData> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_RECEIPTS, 'readonly')
    const store = tx.objectStore(STORE_RECEIPTS)
    const req = store.getAll()
    req.onsuccess = () => {
      resolve({
        version: DB_VERSION,
        exportedAt: new Date().toISOString(),
        receipts: req.result as Receipt[],
      })
    }
    req.onerror = () => reject(req.error)
  })
}

/** JSONデータをインポート */
export async function importData(data: ExportData): Promise<number> {
  if (!data || !data.receipts || !Array.isArray(data.receipts)) {
    throw new Error('無効なデータ形式です')
  }

  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_RECEIPTS, 'readwrite')
    const store = tx.objectStore(STORE_RECEIPTS)

    store.clear()

    let count = 0
    data.receipts.forEach((receipt) => {
      const { id: _id, ...receiptData } = receipt
      store.add(receiptData)
      count++
    })

    tx.oncomplete = () => resolve(count)
    tx.onerror = () => reject(tx.error)
  })
}
