// Vercel Serverless Function: Authoritative Assessment Grading
// Validates trainee submitted answers against securely stored question answer hashes

const INTEGRITY_SALT = "CC_SECURE_INTEGRITY_SALT_v9284!#9x";

function generateAnswerHash(questionId, correctIndex) {
  const payload = `${INTEGRITY_SALT}:${questionId}:ans_${correctIndex}:${INTEGRITY_SALT}`;
  let h1 = 0x811c9dc5;
  for (let i = 0; i < payload.length; i++) {
    h1 ^= payload.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
  }
  let h2 = 5381;
  for (let i = 0; i < payload.length; i++) {
    h2 = ((h2 << 5) + h2) ^ payload.charCodeAt(i);
  }
  const p1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const p2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `ah_${p1}${p2}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { questions, answers, passingScore = 70 } = req.body || {};

    if (!Array.isArray(questions) || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, error: 'Malformed assessment submission payload' });
    }

    let earnedScore = 0;
    let totalScore = 0;

    questions.forEach((q, idx) => {
      const selected = answers[idx];
      const pts = Number(q.points) || 20;
      totalScore += pts;

      if (selected !== undefined && selected >= 0) {
        if (q.answerHash) {
          const candidateHash = generateAnswerHash(q.id, selected);
          if (candidateHash === q.answerHash) {
            earnedScore += pts;
          }
        } else if (q.correctIndex !== undefined && selected === q.correctIndex) {
          earnedScore += pts;
        }
      }
    });

    const percentage = totalScore > 0 ? Math.round((earnedScore / totalScore) * 100) : 0;
    const passed = percentage >= passingScore;

    return res.status(200).json({
      success: true,
      score: earnedScore,
      totalPoints: totalScore,
      percentage,
      passed,
      evaluatedAt: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Evaluation failed', details: err.message });
  }
}
