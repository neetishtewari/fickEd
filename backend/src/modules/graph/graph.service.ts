import { query, isPostgresAvailable } from '../../db/index.js';
import { mockDb } from '../../db/mockStore.js';

export interface ConceptNode {
  id: string;
  code: string;
  subject: string;
  topic: string;
  subtopic: string | null;
  title: string;
  description: string | null;
  target_grade_min: number;
  target_grade_max: number;
  mastery_score?: number;
  depth?: number;
}

export class GraphService {
  static async getUnmasteredPrerequisites(goalConceptId: string, childId: string): Promise<ConceptNode[]> {
    if (!isPostgresAvailable()) {
      // Mock Fallback implementation for topological DAG search
      const goalConcept = mockDb.concepts.find(c => c.id === goalConceptId || c.code === goalConceptId);
      if (!goalConcept) {
        return mockDb.concepts.slice(0, 3).map(c => ({
          ...c,
          subtopic: c.subtopic || null,
          description: c.description || null,
          mastery_score: mockDb.child_mastery.find(m => m.concept_id === c.id)?.mastery_score || 0.0,
          depth: 1
        }));
      }

      // Collect prerequisite tree
      const unmastered: ConceptNode[] = [];
      const visited = new Set<string>();

      const traversePrereqs = (conceptId: string, currentDepth: number) => {
        if (visited.has(conceptId)) return;
        visited.add(conceptId);

        const prereqEdges = mockDb.concept_prerequisites.filter(p => p.child_concept_id === conceptId);
        for (const edge of prereqEdges) {
          traversePrereqs(edge.parent_concept_id, currentDepth + 1);
        }

        const concept = mockDb.concepts.find(c => c.id === conceptId);
        if (concept) {
          const mastery = mockDb.child_mastery.find(m => m.child_id === childId && m.concept_id === conceptId)?.mastery_score || 0.0;
          if (mastery < 0.80) {
            unmastered.push({
              ...concept,
              subtopic: concept.subtopic || null,
              description: concept.description || null,
              mastery_score: mastery,
              depth: currentDepth
            });
          }
        }
      };

      traversePrereqs(goalConcept.id, 1);
      return unmastered;
    }

    const sql = `
      WITH RECURSIVE ConceptPath AS (
          SELECT id AS concept_id, 1 AS depth
          FROM concepts
          WHERE id = $1

          UNION ALL

          SELECT cp.parent_concept_id AS concept_id, p.depth + 1
          FROM concept_prerequisites cp
          JOIN ConceptPath p ON cp.child_concept_id = p.concept_id
      )
      SELECT DISTINCT 
          c.id, 
          c.code, 
          c.subject, 
          c.topic, 
          c.subtopic, 
          c.title, 
          c.description, 
          c.target_grade_min, 
          c.target_grade_max, 
          COALESCE(cm.mastery_score, 0.00) AS mastery_score,
          MAX(cp.depth) OVER (PARTITION BY c.id) AS depth
      FROM ConceptPath cp
      JOIN concepts c ON c.id = cp.concept_id
      LEFT JOIN child_concept_mastery cm 
             ON cm.concept_id = c.id AND cm.child_id = $2
      WHERE COALESCE(cm.mastery_score, 0.00) < 0.80
      ORDER BY depth DESC, c.code ASC;
    `;

    try {
      const res = await query<ConceptNode & { mastery_score: string }>(sql, [goalConceptId, childId]);
      return res.rows.map(r => ({ ...r, mastery_score: parseFloat(r.mastery_score) }));
    } catch (err) {
      return mockDb.concepts.slice(0, 3).map(c => ({
        ...c,
        subtopic: c.subtopic || null,
        description: c.description || null,
        mastery_score: 0.0,
        depth: 1
      }));
    }
  }

  static async searchConcepts(subject?: string, topic?: string): Promise<ConceptNode[]> {
    if (!isPostgresAvailable()) {
      let filtered = mockDb.concepts;
      if (subject) {
        filtered = filtered.filter(c => c.subject.toLowerCase() === subject.toLowerCase());
      }
      if (topic) {
        filtered = filtered.filter(c => c.topic.toLowerCase().includes(topic.toLowerCase()));
      }
      return filtered.map(c => ({
        ...c,
        subtopic: c.subtopic || null,
        description: c.description || null
      }));
    }

    let sql = `SELECT * FROM concepts WHERE 1=1`;
    const params: any[] = [];

    if (subject) {
      params.push(subject);
      sql += ` AND LOWER(subject) = LOWER($${params.length})`;
    }
    if (topic) {
      params.push(`%${topic}%`);
      sql += ` AND LOWER(topic) LIKE LOWER($${params.length})`;
    }

    sql += ` ORDER BY subject, topic, code ASC;`;
    const res = await query<ConceptNode>(sql, params);
    return res.rows;
  }
}
