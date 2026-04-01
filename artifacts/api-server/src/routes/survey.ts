import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, surveyResponsesTable } from "@workspace/db";
import {
  SubmitSurveyBody,
  GetSurveyResultsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const HOURS_ORDER = [
  "1-2 hours",
  "2-4 hours",
  "4-6 hours",
  "8-10 hours",
  "more than 10 hours",
];

router.post("/survey/submit", async (req, res): Promise<void> => {
  const parsed = SubmitSurveyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", details: parsed.error.message });
    return;
  }

  const { age, major, hoursPerWeek, freeTimeHobbies } = parsed.data;

  const [inserted] = await db
    .insert(surveyResponsesTable)
    .values({
      age,
      major,
      hoursPerWeek,
      freeTimeHobbies,
    })
    .returning({ id: surveyResponsesTable.id });

  res.status(201).json({ id: inserted.id, message: "Survey submitted successfully" });
});

router.get("/survey/results", async (req, res): Promise<void> => {
  const totalResult = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(surveyResponsesTable);
  const totalResponses = totalResult[0]?.count ?? 0;

  const ageRows = await db
    .select({
      age: surveyResponsesTable.age,
      count: sql<number>`cast(count(*) as integer)`,
    })
    .from(surveyResponsesTable)
    .groupBy(surveyResponsesTable.age)
    .orderBy(surveyResponsesTable.age);

  const majorRows = await db
    .select({
      major: sql<string>`lower(${surveyResponsesTable.major})`,
      count: sql<number>`cast(count(*) as integer)`,
    })
    .from(surveyResponsesTable)
    .groupBy(sql`lower(${surveyResponsesTable.major})`)
    .orderBy(sql`cast(count(*) as integer) desc`);

  const hoursRows = await db
    .select({
      hoursPerWeek: surveyResponsesTable.hoursPerWeek,
      count: sql<number>`cast(count(*) as integer)`,
    })
    .from(surveyResponsesTable)
    .groupBy(surveyResponsesTable.hoursPerWeek);

  const hobbiesRows = await db
    .select({
      hobby: sql<string>`lower(${surveyResponsesTable.freeTimeHobbies})`,
      count: sql<number>`cast(count(*) as integer)`,
    })
    .from(surveyResponsesTable)
    .groupBy(sql`lower(${surveyResponsesTable.freeTimeHobbies})`)
    .orderBy(sql`cast(count(*) as integer) desc`);

  const sortedHoursRows = hoursRows.sort((a, b) => {
    const ai = HOURS_ORDER.indexOf(a.hoursPerWeek);
    const bi = HOURS_ORDER.indexOf(b.hoursPerWeek);
    return b.count - a.count || ai - bi;
  });

  const capitalizeFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const response = GetSurveyResultsResponse.parse({
    totalResponses,
    ageDistribution: ageRows.map((r) => ({ age: r.age, count: r.count })),
    majorDistribution: majorRows.map((r) => ({
      major: capitalizeFirst(r.major),
      count: r.count,
    })),
    hoursDistribution: sortedHoursRows.map((r) => ({
      hoursPerWeek: r.hoursPerWeek,
      count: r.count,
    })),
    hobbyDistribution: hobbiesRows.map((r) => ({
      hobby: capitalizeFirst(r.hobby),
      count: r.count,
    })),
  });

  res.json(response);
});

export default router;
