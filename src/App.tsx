import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚀 Flutter WebView React App</h1>
        <p>React + TypeScript + Vite로 만든 웹앱</p>
      </header>

      <main className="app-main">
        <section className="hero-section">
          <h2>✨ 환영합니다!</h2>
          <p>이 웹앱은 Flutter WebView에서 실행되고 있습니다.</p>
        </section>

        <section className="features-section">
          <div className="feature-card">
            <h3>📱 모바일 친화적</h3>
            <p>Flutter 앱에서 완벽하게 작동합니다.</p>
          </div>

          <div className="feature-card">
            <h3>⚡ 빠른 성능</h3>
            <p>Vite로 빌드되어 빠른 로딩 속도를 제공합니다.</p>
          </div>

          <div className="feature-card">
            <h3>🎨 모던 디자인</h3>
            <p>CSS Grid와 Flexbox를 활용한 반응형 디자인</p>
          </div>
        </section>

        <section className="interactive-section">
          <h3>🔄 인터랙티브 기능</h3>
          <div className="counter-section">
            <button
              className="counter-button"
              onClick={() => setCount(count + 1)}
            >
              카운터: {count}
            </button>
            <button
              className="reset-button"
              onClick={() => setCount(0)}
            >
              리셋
            </button>
          </div>
        </section>

        <section className="time-section">
          <h3>⏰ 실시간 시계</h3>
          <div className="clock">
            {currentTime.toLocaleTimeString()}
          </div>
        </section>

        <section className="links-section">
          <h3>🔗 유용한 링크</h3>
          <div className="links">
            <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
              React 공식 문서
            </a>
            <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
              Vite 공식 문서
            </a>
            <a href="https://flutter.dev" target="_blank" rel="noopener noreferrer">
              Flutter 공식 문서
            </a>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>© 2024 Flutter WebView React App</p>
        <p>Built with ❤️ using React + TypeScript + Vite</p>
      </footer>
    </div>
  )
}

export default App
