import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PUT(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  
  // Handle batch updates for task positions
  const { tasks } = body as { tasks: { id: string; column_id: string; position: number }[] }
  
  if (!tasks || !Array.isArray(tasks)) {
    return NextResponse.json({ error: "Invalid tasks array" }, { status: 400 })
  }
  
  // Update each task's position and column
  const updates = tasks.map(task => 
    supabase
      .from("tasks")
      .update({ column_id: task.column_id, position: task.position })
      .eq("id", task.id)
  )
  
  const results = await Promise.all(updates)
  const errors = results.filter(r => r.error)
  
  if (errors.length > 0) {
    return NextResponse.json({ error: "Some updates failed" }, { status: 500 })
  }
  
  return NextResponse.json({ success: true })
}
