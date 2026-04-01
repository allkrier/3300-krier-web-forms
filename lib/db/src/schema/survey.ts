import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const surveyResponsesTable = pgTable("survey_responses", {
  id: serial("id").primaryKey(),
  age: integer("age").notNull(),
  major: text("major").notNull(),
  hoursPerWeek: text("hours_per_week").notNull(),
  freeTimeHobbies: text("free_time_hobbies").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSurveyResponseSchema = createInsertSchema(surveyResponsesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;
export type SurveyResponse = typeof surveyResponsesTable.$inferSelect;
