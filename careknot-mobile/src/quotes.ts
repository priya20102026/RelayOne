import { LoadStatus } from "./types";

const steadyQuotes = [
  "You're keeping things running — that counts for more than you know.",
  "A steady day is still a day well cared for. Nice work.",
  "Small routines add up. Thanks for showing up today.",
];

const elevatedQuotes = [
  "It's okay to ask for help today — that's what the circle is for.",
  "You're carrying a lot right now. One task at a time.",
  "Caregiving is heavy some days. Be as kind to yourself as you are to others.",
];

const highQuotes = [
  "This is a lot right now. Please lean on the people around you today.",
  "Your wellbeing matters too — consider asking someone in your circle to take a task off your plate.",
  "You don't have to do this alone. Reach out — that's not a failure, it's teamwork.",
];

const banks: Record<LoadStatus, string[]> = {
  steady: steadyQuotes,
  elevated: elevatedQuotes,
  high: highQuotes,
};

/** Picks a quote from the bank matching today's load status. Plain
 * rotating text — no AI involved. */
export function pickDailyQuote(status: LoadStatus): string {
  const bank = banks[status] ?? steadyQuotes;
  return bank[Math.floor(Math.random() * bank.length)];
}
