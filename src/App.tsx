import { useMemo, useState } from 'react'
import wordsData from '../words.json'
import './App.css'

type WordEntry = {
  id: string
  en: string
  hr: string
  hi: string
  category: string
  level?: number
}

const formatCategoryLabel = (category: string) =>
  category.replace(/\b\w/g, (char) => char.toUpperCase())

const words: WordEntry[] = wordsData

const categories = [
  { value: 'All', label: 'All' },
  ...Array.from(
    new Map(words.map((word) => [word.category, formatCategoryLabel(word.category)])).entries(),
  ).map(([value, label]) => ({ value, label })),
]

const translationOptions = [
  { key: 'en', label: 'English' },
  { key: 'hi', label: 'Hindi' },
] as const

type TranslationKey = (typeof translationOptions)[number]['key']

function App() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]['value']>('All')
  const [translation, setTranslation] = useState<TranslationKey>('en')

  const filteredWords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return words.filter((word) => {
      const matchesCategory = activeCategory === 'All' || word.category === activeCategory
      if (!normalizedQuery) return matchesCategory

      const searchable = [word.hr, word.en, word.hi]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return matchesCategory && searchable.includes(normalizedQuery)
    })
  }, [activeCategory, query])

  return (
    <div className="page">
      <header className="hero">
        <div className="brand-row">
          <div>
            <p className="eyebrow">Osijek-KOTEKS d.d.</p>
            <h1>Core Croatian construction site words</h1>
          </div>
        </div>
      </header>

      <section className="panel">
        <div className="controls">
          <div className="search-box">
            <label htmlFor="search">Search Croatian or translation</label>
            <input
              id="search"
              type="search"
              placeholder='Try "ljestve", "ladder", or "safety"'
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="filters">
            <p className="filter-label">Topics</p>
            <div className="category-pills">
              {categories.map((category) => (
                <button
                  key={category.value}
                  className={`pill ${activeCategory === category.value ? 'pill-active' : ''}`}
                  onClick={() => setActiveCategory(category.value)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          <div className="translation-row">
            <div className="translation-meta">
              <p className="filter-label">Translation language</p>
            </div>
            <select
              value={translation}
              onChange={(event) => setTranslation(event.target.value as TranslationKey)}
              className="select"
            >
              {translationOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="word-grid">
          {filteredWords.map((word) => (
            <article key={word.id} className="word-card">
              <div className="card-head">
                <span className="badge">{formatCategoryLabel(word.category)}</span>
              </div>
              <h3>{word.hr}</h3>
              <p className="english">{word[translation]}</p>
            </article>
          ))}
        </div>

        {filteredWords.length === 0 && (
          <p className="empty">No matches yet. Try another word or switch topics.</p>
        )}
      </section>
    </div>
  )
}

export default App
