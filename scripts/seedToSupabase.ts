import { supabase } from "../src/services/supabase";
import {
  initialUsers,
  initialCourses,
  initialAssessments,
  initialNotifications,
} from "../src/data/seed";

async function main() {
  console.log("🚀 Starting Supabase Database Migration...");

  // 1. Sync Users
  console.log(`\n📦 Syncing ${initialUsers.length} Users...`);
  for (const user of initialUsers) {
    const res = await supabase.insert("users", user);
    console.log(`   User [${user.email}] -> ${res ? "✅ OK" : "⚠️ Skipped/Failed"}`);
  }

  // 2. Sync Courses
  console.log(`\n📦 Syncing ${initialCourses.length} Courses...`);
  for (const course of initialCourses) {
    const { videoUrl, ...courseData } = course as any;
    const res = await supabase.insert("courses", courseData);
    console.log(`   Course [${course.title}] -> ${res ? "✅ OK" : "⚠️ Skipped/Failed"}`);
  }

  // 3. Sync Assessments
  console.log(`\n📦 Syncing ${initialAssessments.length} Assessments...`);
  for (const a of initialAssessments) {
    const res = await supabase.insert("assessments", a);
    console.log(`   Assessment [${a.title}] -> ${res ? "✅ OK" : "⚠️ Skipped/Failed"}`);
  }

  // 4. Sync Notifications
  console.log(`\n📦 Syncing ${initialNotifications.length} Notifications...`);
  for (const n of initialNotifications) {
    const res = await supabase.insert("notifications", n);
    console.log(`   Notification [${n.title}] -> ${res ? "✅ OK" : "⚠️ Skipped/Failed"}`);
  }

  console.log("\n🎉 Supabase Migration Completed!");
}

main().catch(console.error);
