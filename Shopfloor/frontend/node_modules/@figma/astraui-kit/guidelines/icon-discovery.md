# Icon Discovery

All icons are imported from `lucide-react`. Do NOT import icons from `@figma/astraui`.

```tsx
import { Home, Search, Settings } from 'lucide-react'
```

All lucide icons accept: `size` (default 24), `color` (default `"currentColor"`), `strokeWidth` (default 2), `className`.

IMPORTANT: Do NOT guess icon names. Verify every icon exists in this catalog or via the fallback method below before importing.

## Astra standard icons

These icons are used across the design system's built-in components and stories. Always prefer these for consistency.

| Icon | Import | Used in |
|---|---|---|
| Home | `Home` | SidebarNavigation primary nav |
| Film | `Film` | SidebarNavigation primary nav |
| Book | `Book` | SidebarNavigation primary nav |
| Folder | `Folder` | SidebarNavigation primary nav |
| Settings | `Settings` | SidebarNavigation footer |
| Search | `Search` | SearchComponent, InputField prefix |
| Send | `Send` | PromptInput |
| X | `X` | Close/dismiss actions |
| User | `User` | SecondaryNav (Profile) |
| CreditCard | `CreditCard` | SecondaryNav (Billing) |
| Bell | `Bell` | SecondaryNav (Notifications) |
| Star | `Star` | FavoriteButton |

## Available icons by category

### Navigation
- `ArrowUp` — up arrow
- `ArrowDown` — down arrow
- `ArrowLeft` — left arrow / back
- `ArrowRight` — right arrow / forward
- `ChevronDown` — dropdown caret
- `ChevronUp` — collapse caret
- `ChevronLeft` — navigate back
- `ChevronRight` — expand / navigate forward
- `ChevronsLeft` — skip back
- `ChevronsRight` — skip forward
- `Menu` — hamburger menu
- `Home` — home navigation
- `ExternalLink` — open in new window
- `CornerUpLeft` — reply / return

### Actions
- `Plus` — add / create
- `Minus` — remove / subtract
- `X` — close / dismiss
- `Check` — confirm / done
- `Pencil` — edit
- `Trash2` — delete
- `Search` — search
- `Settings` — settings / gear
- `Download` — download
- `Upload` — upload
- `Share` — share
- `Share2` — share (network style)
- `Copy` — copy / duplicate
- `Clipboard` — paste
- `Filter` — filter
- `SlidersHorizontal` — adjustments / filters
- `ArrowUpDown` — sort
- `RefreshCw` — refresh / reload
- `RotateCcw` — undo
- `RotateCw` — redo
- `Scissors` — cut / trim
- `Save` — save
- `Send` — send
- `LogOut` — sign out
- `LogIn` — sign in

### Status & feedback
- `Check` — success / complete
- `CheckCircle` — confirmed / approved
- `AlertTriangle` — warning
- `AlertCircle` — error / alert
- `Info` — information
- `HelpCircle` — help / question mark
- `Ban` — blocked / forbidden
- `ShieldCheck` — secure / verified
- `ShieldAlert` — security warning
- `Loader2` — loading spinner (animate with `animate-spin`)

### Content & files
- `File` — generic file
- `FileText` — text document
- `Folder` — folder
- `FolderOpen` — open folder
- `Image` — image / photo
- `Film` — video / film
- `Music` — audio / music
- `Link` — link / URL
- `Paperclip` — attachment
- `Calendar` — date / calendar
- `Clock` — time
- `Tag` — tag / label
- `Bookmark` — bookmark / save for later
- `Archive` — archive

### Media & playback
- `Play` — play
- `Pause` — pause
- `SkipBack` — skip backward
- `SkipForward` — skip forward
- `Volume2` — volume on
- `VolumeX` — volume muted
- `Maximize` — fullscreen
- `Minimize` — exit fullscreen
- `Monitor` — display / screen
- `Camera` — camera / capture
- `Mic` — microphone
- `MicOff` — microphone muted

### Communication
- `MessageSquare` — comment / chat
- `MessageCircle` — message bubble
- `Mail` — email
- `Bell` — notification
- `BellOff` — notifications muted
- `User` — user / person
- `Users` — group / team
- `UserPlus` — add user
- `Star` — favorite
- `Heart` — like
- `ThumbsUp` — approve
- `ThumbsDown` — reject

### Layout & UI
- `Grid3X3` — grid view
- `List` — list view
- `LayoutGrid` — dashboard layout
- `PanelLeft` — toggle left sidebar
- `PanelRight` — toggle right sidebar
- `Columns2` — two-column layout
- `MoreHorizontal` — overflow menu (horizontal dots)
- `MoreVertical` — overflow menu (vertical dots)
- `GripVertical` — drag handle
- `Eye` — visible / show
- `EyeOff` — hidden / hide
- `Lock` — locked / restricted
- `Unlock` — unlocked
- `Globe` — public / web
- `Zap` — AI / quick action

### Commerce & data
- `CreditCard` — payment / billing
- `DollarSign` — currency / price
- `BarChart3` — chart / analytics
- `TrendingUp` — growth / trending
- `PieChart` — pie chart
- `Activity` — activity / pulse

### Text & formatting
- `Type` — text / typography
- `Bold` — bold text
- `Italic` — italic text
- `AlignLeft` — align left
- `AlignCenter` — align center
- `AlignRight` — align right

## Fallback: verifying unlisted icons

If the icon you need is not in this catalog:
1. Check `node_modules/lucide-react/dist/esm/icons/` for available icons
2. Files are kebab-case: `arrow-up.js`
3. Imports are PascalCase: `ArrowUp`
4. If the icon doesn't exist, pick a different one from this catalog and verify
