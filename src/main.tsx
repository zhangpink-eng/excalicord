import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App"
import { AuthProvider, ProjectProvider } from "./contexts"
import { initSupabase } from "./services/api/supabase"

// Initialize Supabase if credentials are available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (supabaseUrl && supabaseAnonKey) {
  initSupabase(supabaseUrl, supabaseAnonKey)
}

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <ProjectProvider>
      <App />
    </ProjectProvider>
  </AuthProvider>
)
