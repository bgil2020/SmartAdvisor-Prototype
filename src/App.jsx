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
const [meetingDay, setMeetingDay] = useState('')
const [startTime, setStartTime] = useState('')
const [endTime, setEndTime] = useState('')

const [overrideCategory, setOverrideCategory] = useState('')
const [overrideDescription, setOverrideDescription] = useState('')
const [hasDocumentation, setHasDocumentation] = useState(false)
const [overrideResult, setOverrideResult] = useState('')
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
  meeting_day: meetingDay || null,
  start_time: startTime || null,
  end_time: endTime || null,
},
      ])

    if (error) {
      setMessage(`Error adding course: ${error.message}`)
    } else {
      setCourseCode('')
      setCourseName('')
      setSemester('')
      setStatus('Planned')
      setMeetingDay('')
      setStartTime('')
      setEndTime('')
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
function getCompatibilityResult() {
  const completedCourses = courses.filter(
    (course) => course.status === 'Completed'
  )

  const plannedCourses = courses.filter(
    (course) => course.status === 'Planned'
  )

  if (completedCourses.length === 0) {
    return 'Add completed courses from previous semesters to create a personalized compatibility estimate.'
  }

  if (plannedCourses.length === 0) {
    return 'Add planned courses to evaluate your proposed course load.'
  }

  const semesterCounts = {}

  completedCourses.forEach((course) => {
    if (!semesterCounts[course.semester]) {
      semesterCounts[course.semester] = 0
    }

    semesterCounts[course.semester] += 1
  })

  const previousLoads = Object.values(semesterCounts)
  const highestPreviousLoad = Math.max(...previousLoads)

  if (plannedCourses.length > highestPreviousLoad) {
    return `Your planned load contains ${plannedCourses.length} courses. Your highest completed semester in SmartAdvisor contains ${highestPreviousLoad}. This course load may benefit from additional review.`
  }

  return `Your planned load contains ${plannedCourses.length} courses, which is within the range of your previous completed semesters.`
}
function getScheduleConflicts() 
{
  const scheduledCourses = courses.filter(
    (course) =>
      (course.status === 'Planned' || course.status === 'In Progress') &&
      course.meeting_day &&
      course.start_time &&
      course.end_time
  )

  const conflicts = []

  for (let i = 0; i < scheduledCourses.length; i++) {
    for (let j = i + 1; j < scheduledCourses.length; j++) {
      const firstCourse = scheduledCourses[i]
      const secondCourse = scheduledCourses[j]

      const sameSemester =
        firstCourse.semester === secondCourse.semester

      const sameDay =
        firstCourse.meeting_day === secondCourse.meeting_day

      const timesOverlap =
        firstCourse.start_time < secondCourse.end_time &&
        secondCourse.start_time < firstCourse.end_time

      if (sameSemester && sameDay && timesOverlap) {
        conflicts.push(
          `${firstCourse.course_code} conflicts with ${secondCourse.course_code} on ${firstCourse.meeting_day}.`
        )
      }
    }
  }

  return conflicts
}
function handleOverrideEvaluation(event) {
  event.preventDefault()

  if (!overrideCategory || !overrideDescription.trim()) {
    setOverrideResult(
      'Please select a circumstance and provide a brief description before requesting a recommendation.'
    )
    return
  }

  if (overrideCategory === 'military') {
    setOverrideResult(
      hasDocumentation
        ? 'Recommendation: Submit for advising review. Active-duty military obligations may support an online override request. Include the available supporting documentation. Final decisions are made by advising staff.'
        : 'Recommendation: Gather supporting documentation and contact advising staff. Active-duty military obligations may support an online override request, but documentation may be required. Final decisions are made by advising staff.'
    )
    return
  }

  if (overrideCategory === 'medical') {
    setOverrideResult(
      hasDocumentation
        ? 'Recommendation: Submit for advising review. A documented hospitalization or illness that prevents in-person attendance may support an online override request. Final decisions are made by advising staff.'
        : 'Recommendation: Obtain supporting documentation before submitting for review. Medical circumstances may require documentation showing why in-person attendance is not possible. Final decisions are made by advising staff.'
    )
    return
  }

  if (overrideCategory === 'transportation') {
    setOverrideResult(
      'Recommendation: Contact advising staff for additional review. Transportation circumstances may require individual consideration and possible escalation. Supporting information should be provided when available. Final decisions are made by advising staff.'
    )
    return
  }

  setOverrideResult(
    'Recommendation: Contact advising staff to discuss your circumstances. The information entered does not clearly match one of the circumstances represented in this prototype. Final decisions are made by advising staff.'
  )
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
<label htmlFor="meetingDay">Meeting Day</label>
<select
  id="meetingDay"
  value={meetingDay}
  onChange={(event) => setMeetingDay(event.target.value)}
>
  <option value="">No meeting day</option>
  <option value="Monday">Monday</option>
  <option value="Tuesday">Tuesday</option>
  <option value="Wednesday">Wednesday</option>
  <option value="Thursday">Thursday</option>
  <option value="Friday">Friday</option>
</select>

<label htmlFor="startTime">Start Time</label>
<input
  id="startTime"
  type="time"
  value={startTime}
  onChange={(event) => setStartTime(event.target.value)}
/>

<label htmlFor="endTime">End Time</label>
<input
  id="endTime"
  type="time"
  value={endTime}
  onChange={(event) => setEndTime(event.target.value)}
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
    SmartAdvisor compares your planned course load with your previous
    completed semesters to provide a personalized preliminary assessment.
  </p>

  <div className="compatibility-result">
    <h3>Compatibility Result</h3>
    <p>{getCompatibilityResult()}</p>
  </div>

  <p>
    <small>
      This result is a prototype planning estimate and is not a substitute
      for academic advising.
    </small>
  </p>
</section>

          <section className="features">
  <h2>Scheduling Conflict Resolver</h2>

  <p>
    SmartAdvisor checks planned and in-progress courses in the same
    semester for overlapping meeting times.
  </p>

  <div className="conflict-result">
    <h3>Schedule Check</h3>

    {getScheduleConflicts().length === 0 ? (
      <p>No scheduling conflicts detected.</p>
    ) : (
      <ul>
        {getScheduleConflicts().map((conflict, index) => (
          <li key={index}>{conflict}</li>
        ))}
      </ul>
    )}
  </div>
</section>

          <section className="features">
  <h2>Online Override Recommendation</h2>

  <p>
    Describe the circumstances affecting your ability to attend an
    in-person course. SmartAdvisor will provide a preliminary recommendation
    about whether the situation should be submitted for advising review.
  </p>

  <form onSubmit={handleOverrideEvaluation} className="auth-form">
    <label htmlFor="overrideCategory">Circumstance</label>
    <select
      id="overrideCategory"
      value={overrideCategory}
      onChange={(event) => setOverrideCategory(event.target.value)}
      required
    >
      <option value="">Select a circumstance</option>
      <option value="military">Active-Duty Military Obligation</option>
      <option value="medical">Hospitalization or Illness</option>
      <option value="transportation">
        Exceptional Transportation Circumstances
      </option>
      <option value="other">Other Circumstances</option>
    </select>

    <label htmlFor="overrideDescription">
      Brief Description of Circumstances
    </label>
    <textarea
      id="overrideDescription"
      value={overrideDescription}
      onChange={(event) => setOverrideDescription(event.target.value)}
      placeholder="Briefly explain why attending an in-person course may not be possible."
      rows="4"
      required
    />

    <label>
      <input
        type="checkbox"
        checked={hasDocumentation}
        onChange={(event) => setHasDocumentation(event.target.checked)}
      />
      Supporting documentation is available
    </label>

    <button type="submit">Get Recommendation</button>
  </form>

  {overrideResult && (
    <div className="override-result">
      <h3>SmartAdvisor Recommendation</h3>
      <p>{overrideResult}</p>
    </div>
  )}

  <p>
    <small>
      SmartAdvisor provides a planning recommendation only. Online override
      requests are reviewed and decided by advising staff.
    </small>
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