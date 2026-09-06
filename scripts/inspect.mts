/**
 * Prints the ranking for a sample student against the full catalogue, so scoring changes
 * can be eyeballed without clicking through the app.
 *
 * Usage: npx tsx scripts/inspect.mts
 */
import { RagEngine } from "../src/lib/rag/engine";
import { OCCUPATIONS, BASE_OPPORTUNITIES } from "../src/lib/data";
import type { StudentProfile } from "../src/lib/types";

const students: StudentProfile[] = [
  {
    name: "Alex Tan",
    degree: "Computer Science",
    courses: ["Machine Learning", "Data Structures", "Statistics"],
    skills: ["Python", "SQL", "Machine Learning", "Data Analysis"],
    projects: [
      "Predictive maintenance model using Python and machine learning",
      "Student performance analytics dashboard",
    ],
    interests: ["Artificial Intelligence", "Data Analytics", "Manufacturing Technology"],
    aspiration: "Data Scientist",
  },
  {
    name: "Jamie Lee",
    degree: "Mechanical Engineering",
    courses: ["Robotics", "Control Systems", "Manufacturing Systems"],
    skills: ["Python", "CAD", "Robotics", "Data Analysis"],
    projects: [
      "Vision-based robotic inspection prototype",
      "Automated manufacturing cell design",
    ],
    interests: ["Robotics", "Automation", "Manufacturing"],
    aspiration: "Automation Engineer",
  },
];

const engine = new RagEngine(OCCUPATIONS, BASE_OPPORTUNITIES);
const pct = (x: number) => `${Math.round(x * 100)}%`.padStart(4);

for (const student of students) {
  const { ranked } = engine.rank(student, { topK: 6 });
  console.log(`\n=== ${student.name} — aspiring ${student.aspiration} ===`);
  console.log("  #  score  req  pref  occ  career  role / mapped occupation");
  ranked.forEach((r, i) => {
    console.log(
      `  ${String(i + 1).padStart(2)} ${pct(r.score)} ${pct(r.required_fit)} ${pct(
        r.preferred_fit,
      )} ${pct(r.occupation_fit)} ${pct(r.career_alignment)}   ${r.opportunity.title}` +
        `  [${r.linked_occupation?.title ?? "unmapped"}]`,
    );
  });
}
