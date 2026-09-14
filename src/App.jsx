import './App.css'

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>SmartAdvisor</h1>
        <p>Plan your courses with confidence.</p>
      </header>

      <main className="main-content">
        <section className="welcome-card">
          <h2>Welcome to SmartAdvisor</h2>

          <p>
            SmartAdvisor is a prototype academic planning tool designed to help
            students organize completed, current, and planned courses.
          </p>

          <div className="button-group">
            <button>Log In</button>
            <button>Create Account</button>
          </div>
        </section>

        <section className="features">
          <h2>What you can do</h2>

          <ul>
            <li>Track completed courses</li>
            <li>Save courses you are currently taking</li>
            <li>Plan future courses</li>
            <li>Update your course plan as needed</li>
          </ul>
        </section>
      </main>
    </div>
  )
}

export default App