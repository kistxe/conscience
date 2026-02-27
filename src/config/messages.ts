/**
 * Motivational messages organized by guilt/progress ranges
 * Messages are non-shaming and supportive in tone
 */

import { MotivationalMessage } from '../types'

export const motivationalMessages: MotivationalMessage[] = [
  {
    minGuilt: 0,
    maxGuilt: 10,
    messages: [
      "🎉 You did it! Guilt-free and fabulous!",
      "✨ Amazing work! You've lifted all the weight!",
      "🏆 Project complete! Go celebrate!",
      "💪 Total victory! Time to rest and enjoy!",
    ],
  },
  {
    minGuilt: 10,
    maxGuilt: 25,
    messages: [
      "🌟 Nearly there! Just a few tasks left!",
      "📈 Incredible momentum! Keep it going!",
      "🚀 You're so close to the finish line!",
      "✅ Fantastic progress! Almost home!",
    ],
  },
  {
    minGuilt: 25,
    maxGuilt: 50,
    messages: [
      "💡 Great halfway point! You're crushing it!",
      "🎯 Solid progress! Keep the pace!",
      "🌱 You're building great momentum!",
      "⚡ Half the battle is done – keep going!",
    ],
  },
  {
    minGuilt: 50,
    maxGuilt: 75,
    messages: [
      "📍 You've got the hard work started – nice!",
      "🌊 Getting there, one task at a time!",
      "🎪 Progress is happening! Stay focused!",
      "💼 Good start! Let's build on this!",
    ],
  },
  {
    minGuilt: 75,
    maxGuilt: 90,
    messages: [
      "👋 You've begun your journey – that's the first step!",
      "🔧 Every task matters. You've got this!",
      "🌅 Just getting warmed up. One step at a time!",
      "📚 Starting strong. Keep moving forward!",
    ],
  },
  {
    minGuilt: 90,
    maxGuilt: 100,
    messages: [
      "💭 Take a breath. You don't have to do it all today.",
      "🤝 This is a marathon, not a sprint. Begin when ready!",
      "🌿 Be gentle with yourself. Small steps count!",
      "📝 Ready to get started? Pick one task!",
    ],
  },
]

/**
 * Get a random motivational message based on guilt percentage
 */
export function getMotivationalMessage(guiltPercentage: number): string {
  const range = motivationalMessages.find(
    (msg) =>
      guiltPercentage >= msg.minGuilt && guiltPercentage <= msg.maxGuilt
  )

  if (!range) {
    return motivationalMessages[motivationalMessages.length - 1]!.messages[0]!
  }

  const randomIndex = Math.floor(Math.random() * range.messages.length)
  return range.messages[randomIndex]!
}

/**
 * Get the color for guilt meter based on guilt percentage
 */
export function getGuiltMeterColor(guiltPercentage: number): string {
  // Match the chrome/rainbow accents from the motivational card
  if (guiltPercentage >= 100) return '#a166d3' // bolder blend of pink and blue
  if (guiltPercentage <= 10) return '#d9d9d9' // soft silver
  if (guiltPercentage <= 25) return '#98fb98' // pastel mint
  if (guiltPercentage <= 50) return '#87ceeb' // sky blue
  if (guiltPercentage <= 75) return '#ffd700' // warm gold
  return '#ff69b4' // soft pink
}
