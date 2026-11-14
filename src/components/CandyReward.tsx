import { ICONS } from '../lib/icons'
import { Icon } from './Icon'

export function CandyReward({ amount = 1 }: { amount?: number }) {
  return (
    <p className="hint candy-reward">
      +{amount} <Icon icon={ICONS.candy} size={16} /> i godissäcken
    </p>
  )
}
