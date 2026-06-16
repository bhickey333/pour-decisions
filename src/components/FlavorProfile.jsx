import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'

export default function FlavorProfile({ bourbon }) {
  const data = [
    { axis: 'Sweet', value: bourbon.sweetness },
    { axis: 'Spice', value: bourbon.spice },
    { axis: 'Smoke', value: bourbon.smoke },
    { axis: 'Fruit', value: bourbon.fruit },
    { axis: 'Oak', value: bourbon.oak },
  ]

  return (
    <ResponsiveContainer width="100%" height={160}>
      <RadarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
        <PolarGrid stroke="#E8A84C" strokeOpacity={0.4} />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: '#6B5E52', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
        />
        <Radar
          dataKey="value"
          stroke="#C8791A"
          fill="#C8791A"
          fillOpacity={0.25}
          strokeWidth={2}
          dot={{ fill: '#C8791A', r: 3 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
