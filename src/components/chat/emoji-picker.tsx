import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

const EMOJI_CATEGORIES = {
  Smileys: [
    "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃",
    "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙",
    "🥲", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫",
    "🤔", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌",
    "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🥴",
    "😵", "🤯", "🤠", "🥳", "🥸", "😎", "🤓", "🧐", "😕", "😟",
    "🙁", "😮", "😯", "😲", "😳", "🥺", "😦", "😧", "😨", "😰",
    "😥", "😢", "😭", "😱", "😖", "😣", "😞", "😓", "😩", "😫",
  ],
  People: [
    "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞",
    "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍",
    "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝",
    "🙏", "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃", "👶",
    "👧", "🧒", "👦", "👩", "🧑", "👨", "👩‍🦱", "🧑‍🦱", "👨‍🦱", "👩‍🦰",
    "🧑‍🦰", "👨‍🦰", "👱‍♀️", "👱", "👱‍♂️", "👩‍🦳", "🧑‍🦳", "👨‍🦳", "👩‍🦲", "🧑‍🦲",
  ],
  Animals: [
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐻‍❄️", "🐨",
    "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒",
    "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇",
    "🐺", "🐗", "🐴", "🦄", "🐝", "🪱", "🐛", "🦋", "🐌", "🐞",
    "🐜", "🪰", "🪲", "🪳", "🦟", "🦗", "🕷️", "🦂", "🐢", "🐍",
    "🦎", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬",
  ],
  Food: [
    "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈",
    "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦",
    "🥬", "🥒", "🌶️", "🫑", "🌽", "🥕", "🫒", "🧄", "🧅", "🥔",
    "🍠", "🥐", "🥖", "🍞", "🥨", "🥯", "🧀", "🥚", "🍳", "🧈",
    "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🌭", "🍔", "🍟", "🍕",
    "🫔", "🌮", "🌯", "🫕", "🥘", "🍝", "🍜", "🍲", "🍛", "🍣",
  ],
  Travel: [
    "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐",
    "🛻", "🚚", "🚛", "🚜", "🏍️", "🛵", "🚲", "🛴", "🛺", "🚔",
    "🚍", "🚘", "🚖", "✈️", "🛫", "🛬", "🚀", "🛸", "🚁", "⛵",
    "🚤", "🛥️", "🛳️", "⛴️", "🚢", "🏠", "🏡", "🏢", "🏣", "🏥",
    "🏦", "🏨", "🏩", "🏪", "🏫", "🏬", "🗼", "🗽", "⛪", "🕌",
    "🛕", "🕍", "⛩️", "🏰", "🏯", "🗻", "⛰️", "🌋", "🏕", "🏖️",
  ],
  Objects: [
    "⌚", "📱", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️", "💾", "💿",
    "📀", "🎥", "📷", "📸", "📹", "📼", "🔍", "🔎", "🕯️", "💡",
    "🔦", "🏮", "📔", "📕", "📖", "📗", "📘", "📙", "📚", "📓",
    "📒", "📃", "📜", "📄", "📰", "📑", "🔖", "💰", "🪙", "💴",
    "💵", "💶", "💷", "💸", "💳", "🧾", "✉️", "📧", "📨", "📩",
    "📦", "📫", "📪", "📬", "📭", "📮", "🎁", "🎀", "🎊", "🎉",
  ],
  Symbols: [
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
    "❤️‍🔥", "❤️‍🩹", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟",
    "☮️", "✝️", "☪️", "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️",
    "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑",
    "♒", "♓", "⛎", "🔀", "🔁", "🔂", "▶️", "⏩", "⏭️", "⏯️",
    "⏪", "⏮️", "🔼", "⏫", "🔽", "⏬", "⏸️", "⏹️", "⏺️", "⏏️",
    "✅", "❌", "❓", "❗", "💯", "🔥", "⭐", "🌟", "✨", "💫",
  ],
} as const

const CATEGORY_ICONS: Record<string, string> = {
  Smileys: "😀",
  People: "👋",
  Animals: "🐶",
  Food: "🍎",
  Travel: "🚗",
  Objects: "💻",
  Symbols: "❤️",
}

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [open, setOpen] = useState(false)
  const categories = Object.keys(EMOJI_CATEGORIES)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="text-muted-foreground hover:text-foreground"
        >
          <span className="text-base leading-none">😊</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-80 p-0">
        <Tabs defaultValue="Smileys" className="gap-0">
          <div className="border-b border-border px-1 pt-1">
            <TabsList variant="line" className="w-full">
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat} className="px-1.5" title={cat}>
                  <span className="text-sm leading-none">{CATEGORY_ICONS[cat]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {categories.map((cat) => (
            <TabsContent key={cat} value={cat} className="mt-0">
              <ScrollArea className="h-52">
                <div className="grid grid-cols-8 gap-0.5 p-2">
                  {EMOJI_CATEGORIES[cat as keyof typeof EMOJI_CATEGORIES].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-lg hover:bg-muted transition-colors"
                      onClick={() => onEmojiSelect(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
