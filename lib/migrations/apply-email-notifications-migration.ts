import { createClient } from "@/utils/supabase/server"
import fs from "fs"
import path from "path"

export async function applyEmailNotificationsMigration() {
  try {
    const supabase = await createClient()

    // Read the SQL file
    const sqlPath = path.join(process.cwd(), "migrations", "add_email_notification_fields.sql")
    const sql = fs.readFileSync(sqlPath, "utf8")

    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", { sql })

    if (error) {
      console.error("Error applying email notifications migration:", error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in applyEmailNotificationsMigration:", error)
    return { success: false, error }
  }
}
