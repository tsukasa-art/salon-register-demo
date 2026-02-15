/**
 * Supabase 未取得時のフォールバックメニュー（税込価格・10%）
 */
function tax(priceIncludingTax) {
  const excluding = Math.round(priceIncludingTax / 1.1)
  return { price_including_tax: priceIncludingTax, price_excluding_tax: excluding, tax_amount: priceIncludingTax - excluding }
}

export const fallbackMenus = [
  { name: 'カット', category: 'haircut', display_order: 1, ...tax(4800) },
  { name: '前髪カット', category: 'haircut', display_order: 2, ...tax(1000) },
  { name: 'おしゃれ染め', category: 'color', display_order: 10, ...tax(6600) },
  { name: '白髪染め', category: 'color', display_order: 11, ...tax(5900) },
  { name: 'ナチュラルパーマ', category: 'perm', display_order: 20, ...tax(8200) },
  { name: '縮毛矯正', category: 'perm', display_order: 21, ...tax(13500) },
  { name: 'オプションA', category: 'option', display_order: 30, ...tax(500) },
]
