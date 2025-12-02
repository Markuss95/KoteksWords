import { useMemo, useState } from 'react'
import './App.css'

type WordEntry = {
  croatian: string
  english: string
  category: 'Safety' | 'Tools & equipment' | 'Materials' | 'Actions & site talk' | 'Logistics'
  usage?: string
  note?: string
}

const words: WordEntry[] = [
  {
    croatian: 'šljem',
    english: 'helmet',
    category: 'Safety',
    usage: 'Stavi šljem prije ulaska na gradilište.',
    note: 'SHLYEM',
  },
  {
    croatian: 'rukavice',
    english: 'gloves',
    category: 'Safety',
    usage: 'Trebaš rukavice za rad s armaturom.',
    note: 'roo-KAH-vee-tseh',
  },
  {
    croatian: 'sigurnosni pojas',
    english: 'safety harness',
    category: 'Safety',
    usage: 'Veži sigurnosni pojas na skelu.',
  },
  {
    croatian: 'zaštitne naočale',
    english: 'safety goggles',
    category: 'Safety',
    usage: 'Za rezanje moraš imati zaštitne naočale.',
  },
  {
    croatian: 'ljestve',
    english: 'ladder',
    category: 'Tools & equipment',
    usage: 'Drži ljestve dok penjem.',
    note: 'LYEST-veh',
  },
  {
    croatian: 'bušilica',
    english: 'drill',
    category: 'Tools & equipment',
    usage: 'Pripremi bušilicu i burgije.',
  },
  {
    croatian: 'kutna brusilica',
    english: 'angle grinder',
    category: 'Tools & equipment',
    usage: 'Koristi kutnu brusilicu za rezanje cijevi.',
  },
  {
    croatian: 'mjerač trake',
    english: 'measuring tape',
    category: 'Tools & equipment',
    usage: 'Dodaj mi mjerač trake od pet metara.',
  },
  {
    croatian: 'beton',
    english: 'concrete',
    category: 'Materials',
    usage: 'Beton stiže u deset sati.',
  },
  {
    croatian: 'armatura',
    english: 'rebar / reinforcement',
    category: 'Materials',
    usage: 'Armatura ide u temelj.',
    note: 'ahr-mah-TOO-rah',
  },
  {
    croatian: 'cigla',
    english: 'brick',
    category: 'Materials',
    usage: 'Složi cigle na paletu.',
  },
  {
    croatian: 'žbuka',
    english: 'plaster',
    category: 'Materials',
    usage: 'Nanesi žbuku tanko u jednom potezu.',
  },
  {
    croatian: 'pazi',
    english: 'watch out / be careful',
    category: 'Actions & site talk',
    usage: 'Pazi na kablove.',
    note: 'PAH-zee',
  },
  {
    croatian: 'nosimo zajedno',
    english: 'carry together',
    category: 'Actions & site talk',
    usage: 'Ovaj nosač nosimo zajedno.',
  },
  {
    croatian: 'istovar',
    english: 'unload',
    category: 'Logistics',
    usage: 'Istovar materijala je kod rampe.',
  },
  {
    croatian: 'dovoz',
    english: 'delivery / arrival',
    category: 'Logistics',
    usage: 'Dovoz betona kasni petnaest minuta.',
  },
]

const categories: Array<WordEntry['category'] | 'All'> = [
  'All',
  ...Array.from(new Set(words.map((word) => word.category))),
]

function App() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>('All')

  const filteredWords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return words.filter((word) => {
      const matchesCategory = activeCategory === 'All' || word.category === activeCategory
      if (!normalizedQuery) return matchesCategory

      const searchable = [word.croatian, word.english, word.usage, word.note]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return matchesCategory && searchable.includes(normalizedQuery)
    })
  }, [activeCategory, query])

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Osijek-KOTEKS d.d.</p>
          <h1>Core Croatian construction site words</h1>
          <p className="lede">
            Quick, friendly glossary for foreign workers on our construction sites. Filter by topic,
            learn the sound, and share a short usage line for faster onboarding.
          </p>
        </div>
      </header>

      <section className="panel">
        <div className="controls">
          <div className="search-box">
            <label htmlFor="search">Search Croatian or English</label>
            <input
              id="search"
              type="search"
              placeholder="Try “ljestve”, “ladder”, or “safety”"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="filters">
            <p className="filter-label">Topics</p>
            <div className="category-pills">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`pill ${activeCategory === category ? 'pill-active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="word-grid">
          {filteredWords.map((word) => (
            <article key={word.croatian} className="word-card">
              <div className="card-head">
                <span className="badge">{word.category}</span>
                <span className="hint">{word.note ?? 'Clear and simple'}</span>
              </div>
              <h3>{word.croatian}</h3>
              <p className="english">{word.english}</p>
              {word.usage && <p className="usage">{word.usage}</p>}
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
