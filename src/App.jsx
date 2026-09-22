import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [authMode, setAuthMode] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const [courses, setCourses] = useState([])
  const [courseCode, setCourseCode] = useState('')
  const [courseName, setCourseName] = useState('')
  const [semester, setSemester] = useState('')
  const [status, setStatus] = useState('Planned')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchCourses() {
    if (!session?.user) return

    const { data, error } = await supabase
      .from('course_plan')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error loading courses:', error.message)
    } else {
      setCourses(data)
    }
  }

  useEffect(() => {
    if (session) {
      fetchCourses()
    } else {
      setCourses([])
    }
  }, [session])

  async function handleAddCourse(event) {
    event.preventDefault()

    if (!session?.user) return

    const { error } = await supabase
      .from('course_plan')
      .insert([
        {
          user_id: session.user.id,
          course_code: courseCode,
          course_name: courseName,
          semester: semester,
          status: status,
        },
      ])

    if (error) {
      setMessage(`Error adding course: ${error.message}`)
    } else {
      setCourseCode('')
      setCourseName('')
      setSemester('')
      setStatus('Planned')
      setMessage('Course added successfully!')
      fetchCourses()
    }
  }

  async function handleUpdateCourse(courseId, newStatus) {
    const { error } = await supabase
      .from('course_plan')
      .update({ status: newStatus })
      .eq('id', courseId)

    if (error) {
      setMessage(`Error updating course: ${error.message}`)
    } else {
      setCourses((currentCourses) =>
        currentCourses.map((course) =>
          course.id === courseId
            ? { ...course, status: newStatus }
            : course
        )
      )

      setMessage('Course updated successfully!')
    }
  }

  async function handleDeleteCourse(courseId) {
    const { error } = await supabase
      .from('course_plan')
      .delete()
      .eq('id', courseId)

    if (error) {
      setMessage(`Error deleting course: ${error.message}`)
    } else {
      setCourses((currentCourses) =>
        currentCourses.filter((course) => course.id !== courseId)
      )

      setMessage('Course deleted successfully!')
    }
  }

  async function handleSignUp(event) {
    event.preventDefault()
    setMessage('Creating account...')

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Account created successfully!')
      setEmail('')
      setPassword('')
    }
  }

  async function handleLogin(event) {
    event.preventDefault()
    setMessage('Logging in...')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('')
      setEmail('')
      setPassword('')
      setAuthMode(null)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setMessage('')
    setAuthMode(null)
  }

  if (session) {
    return (
      <div className="app">
        <header className="header">
          <h1>SmartAdvisor</h1>
          <p>Plan your courses with confidence.</p>
        </header>

        <main className="main-content">
          <section className="welcome-card">
            <h2>Student Dashboard</h2>

            <p>
              Signed in as <strong>{session.user.email}</strong>
            </p>

            <button onClick={handleLogout}>Log Out</button>
          </section>

          <section className="features">
            <h2>My Course Plan</h2>

            <p>
              Add completed, current, and planned courses to build your
              personalized academic plan.
            </p>

            <form onSubmit={handleAddCourse} className="auth-form">
              <label htmlFor="courseCode">Course Code</label>
              <input
                id="courseCode"
                type="text"
                placeholder="Example: COP4610"
                value={courseCode}
                onChange={(event) => setCourseCode(event.target.value)}
                required
              />

              <label htmlFor="courseName">Course Name</label>
              <input
                id="courseName"
                type="text"
                placeholder="Example: Operating Systems"
                value={courseName}
                onChange={(event) => setCourseName(event.target.value)}
                required
              />

              <label htmlFor="semester">Semester</label>
              <input
                id="semester"
                type="text"
                placeholder="Example: Spring 2026"
                value={semester}
                onChange={(event) => setSemester(event.target.value)}
                required
              />

              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <button type="submit">Add Course</button>

              {message && <p>{message}</p>}
            </form>

            <div className="course-list">
              <h3>Saved Courses</h3>

              {courses.length === 0 ? (
                <p>No courses have been added yet.</p>
              ) : (
                <div>
                  {courses.map((course) => (
                    <div className="course-item" key={course.id}>
                      <p>
                        <strong>{course.course_code}</strong>
                        {' — '}
                        {course.course_name}
                      </p>

                      <p>{course.semester}</p>

                      <select
                        value={course.status}
                        onChange={(event) =>
                          handleUpdateCourse(
                            course.id,
                            event.target.value
                          )
                        }
                      >
                        <option value="Planned">Planned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="features">
            <h2>Course Compatibility</h2>

            <p>
              SmartAdvisor can consider your previous semesters when evaluating
              whether a proposed course load may need additional review.
            </p>
          </section>

          <section className="features">
            <h2>Scheduling Conflict Resolver</h2>

            <p>
              Check planned courses for scheduling conflicts and identify
              possible alternatives.
            </p>
          </section>

          <section className="features">
            <h2>Online Override Evaluation</h2>

            <p>
              Review online override criteria and receive a preliminary result.
              Final override decisions are made by the appropriate university
              personnel.
            </p>
          </section>
        </main>
      </div>
    )
  }

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

          {!authMode ? (
            <div className="button-group">
              <button
                onClick={() => {
                  setAuthMode('login')
                  setMessage('')
                }}
              >
                Log In
              </button>

              <button
                onClick={() => {
                  setAuthMode('signup')
                  setMessage('')
                }}
              >
                Create Account
              </button>
            </div>
          ) : (
            <form
              onSubmit={
                authMode === 'signup' ? handleSignUp : handleLogin
              }
              className="auth-form"
            >
              <h3>
                {authMode === 'signup' ? 'Create Account' : 'Log In'}
              </h3>

              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />

              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength="6"
              />

              <div className="button-group">
                <button type="submit">
                  {authMode === 'signup'
                    ? 'Create Account'
                    : 'Log In'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(null)
                    setMessage('')
                    setEmail('')
                    setPassword('')
                  }}
                >
                  Cancel
                </button>
              </div>

              {message && <p>{message}</p>}
            </form>
          )}
        </section>

        <section className="features">
          <h2>What you can do</h2>

          <ul>
            <li>Build and update your academic course plan</li>
            <li>
              Evaluate course compatibility using previous semesters
            </li>
            <li>Identify scheduling conflicts</li>
            <li>Review preliminary online override eligibility</li>
          </ul>
        </section>
      </main>
    </div>
  )
}

export default App