import { useCallback, useMemo, useState } from 'react'
import wordsData from '../words.json'
import './App.css'

type WordEntry = {
  id: string
  en: string
  hr: string
  hi?: string
  ta?: string
  te?: string
  bn?: string
  es?: string
  category: string
  level?: number
}

const formatCategoryLabel = (category: string) =>
  category.replace(/\b\w/g, (char) => char.toUpperCase())

const words: WordEntry[] = wordsData

const normalizeText = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLowerCase()

const audioModules = import.meta.glob('../assets/audio/*.mp3', { eager: true }) as Record<
  string,
  { default: string }
>

const audioMap = new Map<string, string>(
  Object.entries(audioModules).map(([path, mod]) => {
    const filename = path.split('/').pop()?.replace(/\.mp3$/i, '') ?? ''
    return [normalizeText(filename), mod.default]
  }),
)

const getAudioForWord = (word: WordEntry) => {
  const base = word.hr.split('/')[0].trim()
  return audioMap.get(normalizeText(base))
}

const categories = [
  { value: 'All', label: 'All' },
  ...Array.from(
    new Map(words.map((word) => [word.category, formatCategoryLabel(word.category)])).entries(),
  ).map(([value, label]) => ({ value, label })),
]

const translationOptions = [
  { key: 'en', label: 'English' },
  { key: 'es', label: 'Spanish' },
  { key: 'hi', label: 'Hindi' },
  { key: 'ta', label: 'Tamil' },
  { key: 'te', label: 'Telugu' },
  { key: 'bn', label: 'Bengali' },
] as const

type TranslationKey = (typeof translationOptions)[number]['key']

const getTranslationLabel = (key: TranslationKey) =>
  translationOptions.find((option) => option.key === key)?.label ?? 'selected language'

type QuizQuestion = {
  word: WordEntry
  options: string[]
  correctIndex: number
}

const getTranslationForQuiz = (word: WordEntry, key: TranslationKey) =>
  (word[key]?.trim() ?? word.en?.trim() ?? '').trim()

const shuffleArray = <T,>(values: T[]) => {
  const clone = [...values]
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[clone[i], clone[j]] = [clone[j], clone[i]]
  }
  return clone
}

const buildQuizQuestions = (language: TranslationKey): QuizQuestion[] => {
  const wordsWithTranslations = words.filter((word) => getTranslationForQuiz(word, language))
  const uniqueTranslations = Array.from(
    new Set(wordsWithTranslations.map((word) => getTranslationForQuiz(word, language)).filter(Boolean)),
  )

  if (wordsWithTranslations.length < 10 || uniqueTranslations.length < 4) {
    return []
  }

  const selectedWords = shuffleArray(wordsWithTranslations).slice(0, 10)

  return selectedWords.map((word) => {
    const correctAnswer = getTranslationForQuiz(word, language)
    const distractorPool = shuffleArray(uniqueTranslations.filter((text) => text !== correctAnswer))
    const options = shuffleArray([correctAnswer, ...distractorPool.slice(0, 3)])

    return {
      word,
      options,
      correctIndex: options.indexOf(correctAnswer),
    }
  })
}

function App() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]['value']>('All')
  const [translation, setTranslation] = useState<TranslationKey>('en')
  const [quizLanguage, setQuizLanguage] = useState<TranslationKey>('en')
  const [quizState, setQuizState] = useState<'idle' | 'active' | 'complete'>('idle')
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [quizIndex, setQuizIndex] = useState(0)
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  const [quizScore, setQuizScore] = useState(0)
  const [quizError, setQuizError] = useState<string | null>(null)
  const quizLanguageLabel = getTranslationLabel(quizLanguage)
  const playWordAudio = useCallback((word: WordEntry) => {
    const src = getAudioForWord(word)
    if (!src) return

    const audio = new Audio(src)
    audio.play().catch(() => {
      // Swallow play errors (e.g., user hasn't interacted yet)
    })
  }, [])

  const filteredWords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const filtered = words.filter((word) => {
      const matchesCategory = activeCategory === 'All' || word.category === activeCategory
      if (!normalizedQuery) return matchesCategory

      const searchable = [word.hr, word.en, word.es, word.hi, word.ta, word.te, word.bn]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return matchesCategory && searchable.includes(normalizedQuery)
    })

    return filtered.sort((a, b) =>
      a.hr.localeCompare(b.hr, 'hr', { sensitivity: 'base' }),
    )
  }, [activeCategory, query])

  const currentQuestion = quizQuestions[quizIndex]

  const startQuiz = useCallback(() => {
    const questions = buildQuizQuestions(quizLanguage)
    if (questions.length < 10) {
      setQuizError('Nije moguce napraviti kviz: nema dovoljno rijeci s odabranim prijevodom.')
      setQuizState('idle')
      return
    }

    setQuizQuestions(questions)
    setQuizIndex(0)
    setSelectedChoice(null)
    setQuizScore(0)
    setQuizError(null)
    setQuizState('active')
  }, [quizLanguage])

  const handleAnswer = (index: number) => {
    if (!currentQuestion || selectedChoice !== null) return

    setSelectedChoice(index)
    if (index === currentQuestion.correctIndex) {
      setQuizScore((prev) => prev + 1)
    }
  }

  const goToNext = () => {
    if (!currentQuestion) return

    if (quizIndex === quizQuestions.length - 1) {
      setQuizState('complete')
      return
    }

    setQuizIndex((prev) => prev + 1)
    setSelectedChoice(null)
  }

  const resetQuiz = () => {
    setQuizState('idle')
    setQuizQuestions([])
    setQuizIndex(0)
    setSelectedChoice(null)
    setQuizScore(0)
    setQuizError(null)
  }

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
        <div className="quiz-card">
          <div className="quiz-head">
            <div>
              <p className="filter-label">QUIZ</p>
              <h2>Test your knowledge</h2>
              <p className="quiz-subtitle">10 questions with A/B/C/D answers for randomly selected words.</p>
            </div>
            <div className="quiz-actions">
              <select
                value={quizLanguage}
                onChange={(event) => setQuizLanguage(event.target.value as TranslationKey)}
                className="select"
              >
                {translationOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="quiz-buttons">
                <button type="button" className="primary-btn" onClick={startQuiz}>
                  Start quiz
                </button>
                {quizState !== 'idle' && (
                  <button type="button" className="ghost-btn" onClick={resetQuiz}>
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {quizError && <p className="quiz-error">{quizError}</p>}

          {quizState === 'idle' && (
            <p className="quiz-empty"></p>
          )}

          {quizState === 'active' && currentQuestion && (
            <div className="quiz-body">
            <div className="quiz-meta">
              <span className="quiz-chip">Pitanje {quizIndex + 1} / {quizQuestions.length}</span>
              <span className="quiz-score">Bodovi: {quizScore}</span>
            </div>
            <h3 className="quiz-prompt">{currentQuestion.word.hr}</h3>
            <p className="quiz-instruction">Select a translation in {quizLanguageLabel}.</p>
              <div className="quiz-options">
                {currentQuestion.options.map((option, index) => {
                  const selected = selectedChoice === index
                  const isCorrect = selectedChoice !== null && index === currentQuestion.correctIndex
                  const isWrongSelection =
                    selectedChoice !== null && selectedChoice === index && !isCorrect

                  return (
                    <button
                      key={option}
                      type="button"
                      className={`option-button ${selected ? 'option-selected' : ''} ${isCorrect ? 'option-correct' : ''} ${isWrongSelection ? 'option-wrong' : ''}`}
                      onClick={() => handleAnswer(index)}
                      disabled={selectedChoice !== null}
                    >
                      <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                      <span className="option-text">{option}</span>
                    </button>
                  )
                })}
              </div>
              {selectedChoice !== null && (
                <div className="quiz-footer">
                  <p className="quiz-feedback">
                    {selectedChoice === currentQuestion.correctIndex
                      ? 'Tocno!'
                      : `Netocno. Tocan odgovor: ${currentQuestion.options[currentQuestion.correctIndex]}`}
                  </p>
                  <button type="button" className="primary-btn" onClick={goToNext}>
                    {quizIndex === quizQuestions.length - 1 ? 'End' : 'Next Question ->'}
                  </button>
                </div>
              )}
            </div>
          )}

          {quizState === 'complete' && (
            <div className="quiz-complete">
              <div>
                <p className="filter-label">Rezultat</p>
                <h3 className="quiz-prompt">
                  Ostvario si {quizScore} / {quizQuestions.length} bodova
                </h3>
                <p className="quiz-instruction">Ponovi kviz ili promijeni jezik i pokusaj ponovo.</p>
              </div>
              <div className="quiz-buttons">
                <button type="button" className="primary-btn" onClick={startQuiz}>
                  Ponovi kviz
                </button>
                <button type="button" className="ghost-btn" onClick={resetQuiz}>
                  Zatvori
                </button>
              </div>
            </div>
          )}
        </div>

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
              <div className="word-row">
                <h3>{word.hr}</h3>
                <button
                  type="button"
                  className="play-button"
                  onClick={() => playWordAudio(word)}
                  aria-label={`Play pronunciation for ${word.hr}`}
                  title="Listen"
                >
                  <span aria-hidden="true">🔊</span>
                </button>
              </div>
              <p className="english">
                {word[translation]?.trim()
                  ? word[translation]
                  : word.en?.trim()
                    ? word.en
                    : '—'}
              </p>
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
