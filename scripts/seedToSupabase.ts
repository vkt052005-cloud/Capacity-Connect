import { supabase } from "../src/services/supabase";
import {
  initialUsers,
  initialCourses,
  initialAssessments,
  initialNotifications,
  initialCompetencyMatrix,
  initialLeaderboard,
  initialBadges,
  initialDiscussions,
} from "../src/data/seed";

async function main() {
  console.log("🚀 Starting Complete 360 Supabase Database Seed...");

  // 1. Sync Users (Zero mock users - only official & verified users)
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

  // 5. Sync Subject Competencies
  console.log(`\n📦 Syncing ${initialCompetencyMatrix.length} Subject Competencies...`);
  for (let i = 0; i < initialCompetencyMatrix.length; i++) {
    const comp = initialCompetencyMatrix[i];
    const compData = {
      id: (comp as any).id || `comp-${i + 1}`,
      ...comp
    };
    const res = await supabase.insert("subject_competencies", compData);
    console.log(`   Competency [${comp.subject}] -> ${res ? "✅ OK" : "⚠️ Skipped/Failed"}`);
  }

  // 6. Sync Leaderboard
  console.log(`\n📦 Syncing ${initialLeaderboard.length} Leaderboard Entries...`);
  for (const entry of initialLeaderboard) {
    const res = await supabase.insert("leaderboard", entry);
    console.log(`   Leaderboard [${entry.name}] -> ${res ? "✅ OK" : "⚠️ Skipped/Failed"}`);
  }

  // 7. Sync Badges
  console.log(`\n📦 Syncing ${initialBadges.length} Badges...`);
  for (const badge of initialBadges) {
    const res = await supabase.insert("badges", badge);
    console.log(`   Badge [${badge.name}] -> ${res ? "✅ OK" : "⚠️ Skipped/Failed"}`);
  }

  // 8. Sync Discussions
  console.log(`\n📦 Syncing ${initialDiscussions.length} Discussions...`);
  for (const disc of initialDiscussions) {
    const res = await supabase.insert("discussion_threads", disc);
    console.log(`   Discussion [${disc.title.substring(0, 30)}...] -> ${res ? "✅ OK" : "⚠️ Skipped/Failed"}`);
  }

  console.log("\n🎉 Complete 360 Supabase Migration Completed!");
}

main().catch(console.error);
