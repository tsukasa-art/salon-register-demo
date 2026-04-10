export type Category = 'haircut' | 'color' | 'perm' | 'option' | 'offer'

export interface CategoryInfo {
  title: string
  subtitle: string
  note: string
}

export const CATEGORY_ORDER: Category[] = ['haircut', 'color', 'perm', 'option', 'offer']

export function getCategoryInfo(category: string): CategoryInfo {
  const map: Record<Category, CategoryInfo> = {
    haircut: { title: 'Hair Cut',     subtitle: 'ヘアカット', note: '' },
    color:   { title: 'Hair Color',   subtitle: 'ヘアカラー', note: 'カラー施術時はカット料金 ¥2,800' },
    perm:    { title: 'Hair Perm',    subtitle: 'ヘアパーマ', note: 'パーマ料金にカット込み' },
    option:  { title: 'Option',       subtitle: 'オプション', note: '' },
    offer:   { title: 'Special Offer', subtitle: '特別割',   note: '' },
  }
  return map[category as Category] ?? { title: category, subtitle: '', note: '' }
}
