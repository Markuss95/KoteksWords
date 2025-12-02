import { useMemo, useState } from 'react'
import './App.css'

type WordEntry = {
  croatian: string
  translations: {
    english: string
    hindi: string
  }
  category: 'Safety' | 'Tools & equipment' | 'Materials' | 'Actions & site talk' | 'Logistics'
  note?: string
}

const words: WordEntry[] = [
  {
    croatian: 'šljem',
    translations: {
      english: 'helmet',
      hindi: 'हेलमेट',
    },
    category: 'Safety',
    note: 'SHLYEM',
  },
  {
    croatian: 'rukavice',
    translations: {
      english: 'gloves',
      hindi: 'दस्ताने',
    },
    category: 'Safety',
    note: 'roo-KAH-vee-tseh',
  },
  {
    croatian: 'sigurnosni pojas',
    translations: {
      english: 'safety harness',
      hindi: 'सुरक्षा बेल्ट',
    },
    category: 'Safety',
  },
  {
    croatian: 'zaštitne naočale',
    translations: {
      english: 'safety goggles',
      hindi: 'सुरक्षा चश्मा',
    },
    category: 'Safety',
  },
  {
    croatian: 'ljestve',
    translations: {
      english: 'ladder',
      hindi: 'सीढ़ी',
    },
    category: 'Tools & equipment',
    note: 'LYEST-veh',
  },
  {
    croatian: 'bušilica',
    translations: {
      english: 'drill',
      hindi: 'ड्रिल मशीन',
    },
    category: 'Tools & equipment',
  },
  {
    croatian: 'kutna brusilica',
    translations: {
      english: 'angle grinder',
      hindi: 'एंगल ग्राइंडर',
    },
    category: 'Tools & equipment',
  },
  {
    croatian: 'mjerač trake',
    translations: {
      english: 'measuring tape',
      hindi: 'मापने का फीता',
    },
    category: 'Tools & equipment',
  },
  {
    croatian: 'beton',
    translations: {
      english: 'concrete',
      hindi: 'कंक्रीट',
    },
    category: 'Materials',
  },
  {
    croatian: 'armatura',
    translations: {
      english: 'rebar / reinforcement',
      hindi: 'सरिया / रिइनफोर्समेंट',
    },
    category: 'Materials',
    note: 'ahr-mah-TOO-rah',
  },
  {
    croatian: 'cigla',
    translations: {
      english: 'brick',
      hindi: 'ईंट',
    },
    category: 'Materials',
  },
  {
    croatian: 'žbuka',
    translations: {
      english: 'plaster',
      hindi: 'प्लास्टर',
    },
    category: 'Materials',
  },
  {
    croatian: 'pazi',
    translations: {
      english: 'watch out / be careful',
      hindi: 'सावधान',
    },
    category: 'Actions & site talk',
    note: 'PAH-zee',
  },
  {
    croatian: 'nosimo zajedno',
    translations: {
      english: 'carry together',
      hindi: 'एक साथ उठाते हैं',
    },
    category: 'Actions & site talk',
  },
  {
    croatian: 'istovar',
    translations: {
      english: 'unload',
      hindi: 'उतारना',
    },
    category: 'Logistics',
  },
  {
    croatian: 'dovoz',
    translations: {
      english: 'delivery / arrival',
      hindi: 'डिलीवरी / आगमन',
    },
    category: 'Logistics',
  },
]

const categories: Array<WordEntry['category'] | 'All'> = [
  'All',
  ...Array.from(new Set(words.map((word) => word.category))),
]

type TranslationKey = keyof WordEntry['translations']
const translationOptions: { key: TranslationKey; label: string }[] = [
  { key: 'english', label: 'English' },
  { key: 'hindi', label: 'Hindi' },
]

function App() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>('All')
  const [translation, setTranslation] = useState<TranslationKey>('english')

  const filteredWords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return words.filter((word) => {
      const matchesCategory = activeCategory === 'All' || word.category === activeCategory
      if (!normalizedQuery) return matchesCategory

      const searchable = [
        word.croatian,
        word.translations.english,
        word.translations.hindi,
        word.note,
      ]
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
                  key={category}
                  className={`pill ${activeCategory === category ? 'pill-active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
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
            <article key={word.croatian} className="word-card">
              <div className="card-head">
                <span className="badge">{word.category}</span>
              </div>
              <h3>{word.croatian}</h3>
              <p className="english">{word.translations[translation]}</p>
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
