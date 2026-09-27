# SmartAdvisor Prototype

SmartAdvisor is an AI- Assisted academic planning application designed to help improve the advising and registration system for students and advisors.

This prototype is a simplified individual implementation based on the SmartAdvisor senior design project. It demonstrates the requirements for the assignent and the three main features of SmartAdvisior: scheduling conflict detection, course-load compatibility evaluation, and preliminary online override recommendations.

## Live Application

SmartAdvisor is deployed with Netlify:

https://tubular-alfajores-26ab30.netlify.app/

## Features

### User Authentication
Users can:
- Create an account
- Log in
- Log out
- Access course-plan information associated with their authenticated account

### Course Plan
Students can add courses to their academic plan and record:
- Course code
- Course name
- Semester
- Course status
- Meeting day
- Start time
- End time

Courses can be marked as:
- Planned
- In Progress
- Completed

Users can create, view, update, and delete course-plan records.

### Course Compatibility
SmartAdvisor compares a student's planned course load with previous completed semesters stored in the application.

Instead of assuming that the same course load is appropriate for every student, the prototype uses the student's own course history to provide a preliminary personalized assessment.

This feature is a planning estimate and is not a substitute for academic advising.

### Scheduling Conflict Resolver
SmartAdvisor checks planned and in-progress courses within the same semester for overlapping meeting times.

If two courses overlap on the same day, the application identifies the scheduling conflict for the student.

### Online Override Recommendation
Students can provide a brief description of circumstances that may affect their ability to attend an in-person course.

The prototype includes circumstances such as:
- Active-duty military obligations
- Hospitalization or illness
- Exceptional transportation circumstances
- Other circumstances

SmartAdvisor provides a preliminary recommendation about whether the circumstances should be submitted for advising review.

The application does not approve or deny online override requests. Final decisions are made by advising staff.

## Technologies Used

- React
- Vite
- JavaScript
- CSS
- Supabase
- Git
- GitHub
- Netlify

## Database and Authentication

Supabase is used for authentication and database storage.

The `course_plan` table stores course information associated with authenticated users. Row Level Security policies are used so users can access and modify their own course-plan records.

Supabase configuration values are provided to the application through environment variables and are not stored directly in the source code.

## Local Setup

1. Clone the repository.

```bash
git clone https://github.com/bgil2020/SmartAdvisor-Prototype.git
```

2. Open the project directory.

```bash
cd SmartAdvisor-Prototype
```

3. Install the required dependencies.

```bash
npm install
```

4. Create a `.env.local` file in the project root and add:

```text
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

5. Start the development server.

```bash
npm run dev
```

6. Open the local URL provided by Vite in a web browser.

## Project Structure

- `src/App.jsx` - Main SmartAdvisor interface and application logic
- `src/App.css` - Application styling
- `src/supabaseClient.js` - Supabase client configuration
- `public/` - Static application assets

## Deployment

The application is deployed through Netlify from the public GitHub repository. Netlify builds the Vite project using:

```text
npm run build
```

The production files are generated in the `dist` directory.

## Demo Video

Unlisted YouTube demonstration:
https://youtu.be/nlidHwzbaus
## Best viewed in 1080p HD quality

**Video link **

## Purpose

The purpose of this prototype is to demonstrate how a student-centered academic planning system could combine course-plan management with preliminary decision-support tools.

SmartAdvisor is intended to support the academic planning process while leaving official academic and advising decisions with university staff.

Then Ctrl+S.

Don't commit it yet. We still need to replace the video placeholder after you record, so we can make the final README commit once everything is complete.

One important thing: do not put your actual Supabase URL or publishable key into the README. The placeholders I used above are intentional.

Once you've saved this, your README will cover the app name/description, deployed link, purpose, technologies, setup, database functionality, and project structure that the assignment asks for.

After you save it, we're essentially down to the video/demo and final submission checks.
