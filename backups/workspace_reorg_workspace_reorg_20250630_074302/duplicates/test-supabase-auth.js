const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://hntsrkacolpseqnyidis.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudHNya2Fjb2xwc2VxbnlpZGlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1ODA2NTMsImV4cCI6MjA2MDE1NjY1M30.zvEATQdgXB0hsX2PkDmcx8p55vcT4q-DQVQkfYLJ4C0"
);

(async () => {
  const { data, error } = await supabase.auth.signUp({
    email: "test@debug.com",
    password: "DebugTest123!",
  });
  console.log("DATA:", data);
  console.log("ERROR:", error);
})();
