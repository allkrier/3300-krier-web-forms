import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const HOURS_OPTIONS = [
  "1-2 hours",
  "2-4 hours",
  "4-6 hours",
  "8-10 hours",
  "more than 10 hours",
] as const;

const surveySchema = z.object({
  age: z.coerce
    .number({ required_error: "Please select an age." })
    .min(18, "Age must be at least 18")
    .max(24, "Age must be at most 24"),
  major: z.string().min(1, "Major is required."),
  hoursPerWeek: z.enum(HOURS_OPTIONS, {
    required_error: "Please select hours per week.",
  }),
  freeTimeHobbies: z.string().min(1, "Please tell us what you do in your free time."),
});

type SurveyFormValues = z.infer<typeof surveySchema>;

export default function SurveyPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<SurveyFormValues | null>(null);

  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      age: undefined,
      major: "",
      hoursPerWeek: undefined,
      freeTimeHobbies: "",
    },
  });

  async function onSubmit(data: SurveyFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);

    const { error } = await supabase.from("survey_responses").insert({
      age: data.age,
      major: data.major,
      hours_per_week: data.hoursPerWeek,
      free_time_hobbies: data.freeTimeHobbies,
    });

    setIsSubmitting(false);

    if (error) {
      setSubmitError(
        error.code === "42P01"
          ? "The database table does not exist yet. Please run the setup SQL in your Supabase SQL Editor first."
          : "There was a problem submitting your survey. Please try again."
      );
      return;
    }

    setSubmittedData(data);
    setIsSuccess(true);
  }

  if (isSuccess && submittedData) {
    return (
      <Layout>
        <div className="py-12 max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-3xl font-bold mb-4" data-testid="heading-thank-you">
              Thank you for your response!
            </h2>
            <p className="text-gray-600 mb-8" data-testid="text-success-message">
              Your survey has been successfully submitted and recorded.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 text-left mb-8" aria-label="Response summary">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Response Summary
              </h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-gray-500">Age</dt>
                  <dd className="font-medium" data-testid="summary-age">{submittedData.age}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Major</dt>
                  <dd className="font-medium" data-testid="summary-major">{submittedData.major}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Hours dedicated to hobbies</dt>
                  <dd className="font-medium" data-testid="summary-hours">{submittedData.hoursPerWeek}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Free time activities</dt>
                  <dd className="font-medium" data-testid="summary-hobbies">{submittedData.freeTimeHobbies}</dd>
                </div>
              </dl>
            </div>

            <Button asChild size="lg" className="w-full sm:w-auto" data-testid="button-view-results-success">
              <Link href="/results">View Results</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-survey">
              Survey Form
            </h1>
            <p className="text-gray-500 mt-1">Please answer all the questions below.</p>
          </div>
          <Button asChild variant="outline" size="sm" data-testid="button-view-results-header">
            <Link href="/results">View Results</Link>
          </Button>
        </div>

        {submitError && (
          <Alert variant="destructive" className="mb-8" data-testid="alert-error" role="alert">
            <AlertTitle>Submission Error</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>

              <FormField
                control={form.control}
                name="age"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel htmlFor="select-age">1. What is your age?</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(parseInt(val))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger
                          id="select-age"
                          className="w-full max-w-xs"
                          autoFocus
                          data-testid="select-age"
                          aria-describedby={fieldState.error ? "error-age" : undefined}
                          aria-invalid={!!fieldState.error}
                        >
                          <SelectValue placeholder="Select your age" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[18, 19, 20, 21, 22, 23, 24].map((age) => (
                          <SelectItem key={age} value={age.toString()} data-testid={`option-age-${age}`}>
                            {age}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage id="error-age" data-testid="error-age" role="alert" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="major"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel htmlFor="input-major">2. What is your major?</FormLabel>
                    <FormControl>
                      <Input
                        id="input-major"
                        placeholder="your major"
                        {...field}
                        data-testid="input-major"
                        aria-describedby={fieldState.error ? "error-major" : undefined}
                        aria-invalid={!!fieldState.error}
                      />
                    </FormControl>
                    <FormMessage id="error-major" data-testid="error-major" role="alert" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hoursPerWeek"
                render={({ field, fieldState }) => (
                  <FormItem className="space-y-3">
                    <FormLabel as="legend">3. How many hours per week do you dedicate to hobbies?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                        data-testid="radio-group-hours"
                        aria-describedby={fieldState.error ? "error-hours" : undefined}
                        aria-invalid={!!fieldState.error}
                      >
                        {HOURS_OPTIONS.map((option) => (
                          <div className="flex items-center space-x-3" key={option}>
                            <RadioGroupItem
                              value={option}
                              id={`hours-${option}`}
                              data-testid={`radio-hours-${option.replace(/\s+/g, "-")}`}
                            />
                            <Label htmlFor={`hours-${option}`} className="font-normal cursor-pointer">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage id="error-hours" data-testid="error-hours" role="alert" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="freeTimeHobbies"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel htmlFor="input-hobbies">4. What do you do in your free time?</FormLabel>
                    <FormControl>
                      <Input
                        id="input-hobbies"
                        placeholder="free time hobbies"
                        {...field}
                        data-testid="input-hobbies"
                        aria-describedby={fieldState.error ? "error-hobbies" : undefined}
                        aria-invalid={!!fieldState.error}
                      />
                    </FormControl>
                    <FormMessage id="error-hobbies" data-testid="error-hobbies" role="alert" />
                  </FormItem>
                )}
              />

              <div className="pt-4 border-t border-gray-100">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                  data-testid="button-submit-survey"
                >
                  {isSubmitting ? "Submitting..." : "Submit Survey"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}
