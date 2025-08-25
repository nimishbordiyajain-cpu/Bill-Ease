'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized savings tips based on user's tracked expenses.
 *
 * - generateSavingTips - A function that calls the GenerateSavingTipsFlow.
 * - GenerateSavingTipsInput - The input type for the generateSavingTips function.
 * - GenerateSavingTipsOutput - The return type for the generateSavingTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSavingTipsInputSchema = z.object({
  expenseData: z
    .string()
    .describe(
      'A string containing the user expenses in a structured format, e.g., JSON or CSV.'
    ),
  spendingLimit: z.number().describe('The user specified spending limit.'),
  currentSpending: z.number().describe('The user current spending.'),
});
export type GenerateSavingTipsInput = z.infer<typeof GenerateSavingTipsInputSchema>;

const GenerateSavingTipsOutputSchema = z.object({
  savingsTips: z
    .string()
    .describe('Personalized savings tips based on the user expenses.'),
});
export type GenerateSavingTipsOutput = z.infer<typeof GenerateSavingTipsOutputSchema>;

export async function generateSavingTips(input: GenerateSavingTipsInput): Promise<GenerateSavingTipsOutput> {
  return generateSavingTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSavingTipsPrompt',
  input: {schema: GenerateSavingTipsInputSchema},
  output: {schema: GenerateSavingTipsOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the user's expense data and provide personalized saving tips.

  The user has a spending limit of {{spendingLimit}} and is currently spending {{currentSpending}}.

  Here is the user's expense data:
  {{expenseData}}

  Provide specific, actionable tips to help the user reduce spending and save money.
  Focus on the highest spending areas and suggest practical ways to cut costs.
  Format the tips as a bulleted list.
  Keep the tips concise and easy to understand.
  Limit the total length of tips under 200 words.
  Do not tell them to simply reduce spending, but give concrete suggestions.
  For example, instead of saying "Reduce your eating out budget", tell them "Try eating out only once a week to save money."
  The tips must be personalized to the user's expense data, for example:

  "Consider switching to a cheaper internet plan by calling your internet provider."
  "Pack lunch three times a week instead of buying lunch to save on food costs."
  "Look at reducing your transportation costs such as biking to work instead of driving."
  `, // Added Handlebars syntax for expenseData
});

const generateSavingTipsFlow = ai.defineFlow(
  {
    name: 'generateSavingTipsFlow',
    inputSchema: GenerateSavingTipsInputSchema,
    outputSchema: GenerateSavingTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
