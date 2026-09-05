import type { Assessment, Question } from '../types';

// High-entropy salt for obfuscating trainee answer keys
const INTEGRITY_SALT = "CC_SECURE_INTEGRITY_SALT_v9284!#9x";

/**
 * Generates a deterministic high-entropy salted hash for a given question and correct answer index.
 */
export function generateAnswerHash(questionId: string, correctIndex: number): string {
  const payload = `${INTEGRITY_SALT}:${questionId}:ans_${correctIndex}:${INTEGRITY_SALT}`;
  
  // 32-bit FNV-1a hash pass
  let h1 = 0x811c9dc5;
  for (let i = 0; i < payload.length; i++) {
    h1 ^= payload.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
  }

  // DJB2 hash pass for secondary entropy
  let h2 = 5381;
  for (let i = 0; i < payload.length; i++) {
    h2 = ((h2 << 5) + h2) ^ payload.charCodeAt(i);
  }

  const p1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const p2 = (h2 >>> 0).toString(16).padStart(8, '0');

  return `ah_${p1}${p2}`;
}

/**
 * Validates whether the trainee's selected answer index matches the question's answerHash or fallback index.
 */
export function verifyAnswerHash(
  questionId: string,
  selectedIndex: number,
  answerHash?: string,
  fallbackCorrectIndex?: number
): boolean {
  if (selectedIndex === undefined || selectedIndex < 0) return false;

  // 1. Primary check: match cryptographic hash
  if (answerHash) {
    const candidateHash = generateAnswerHash(questionId, selectedIndex);
    return candidateHash === answerHash;
  }

  // 2. Fallback check: trainer preview or legacy question
  if (fallbackCorrectIndex !== undefined) {
    return selectedIndex === fallbackCorrectIndex;
  }

  return false;
}

/**
 * Sanitizes an assessment before delivering to the trainee client.
 * Completely removes `correctIndex` and `explanation` so answer keys cannot
 * be inspected via browser Developer Tools or React Component state.
 */
export function sanitizeAssessmentForTrainee(raw: Assessment): Assessment {
  return {
    ...raw,
    questions: raw.questions.map((q) => {
      // Calculate hash if not already attached
      const hash = q.answerHash || (q.correctIndex !== undefined ? generateAnswerHash(q.id, q.correctIndex) : undefined);
      
      // Strip correctIndex and explanation from the trainee payload
      const { correctIndex, explanation, ...sanitized } = q;
      return {
        ...sanitized,
        answerHash: hash
      };
    })
  };
}
