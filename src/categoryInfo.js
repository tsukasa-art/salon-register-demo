export const CATEGORY_ORDER = ['haircut', 'color', 'perm', 'option', 'offer']

export function getCategoryInfo(category) {
  const map = {
    haircut: { title: 'Hair Cut', subtitle: 'ヘアカット', note: '' },
    color: { title: 'Hair Color', subtitle: 'ヘアカラー', note: 'カラー施術時はカット料金 ¥2,800' },
    perm: { title: 'Hair Perm', subtitle: 'ヘアパーマ', note: 'パーマ料金にカット込み' },
    option: { title: 'Option', subtitle: 'オプション', note: '' },
    offer: { title: 'Special Offer', subtitle: '特別割', note: '' },
  }
  return map[category] || { title: category, subtitle: '', note: '' }
}
