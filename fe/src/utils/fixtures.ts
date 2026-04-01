/**
 * Fixtures pool for dev/mock mode.
 * Each entry is tagged with a category id so getRandomFixture(categoryId)
 * returns a contextually relevant sentence.
 */
export const FIXTURE_POOL: Record<string, string[]> = {
  idea: [
    "What if the app could suggest the best time to review your ideas based on your activity patterns?",
    "Build a weekly digest that emails you a summary of all ideas captured that week",
    "Add a confidence score to each idea — how excited were you when you said it?",
    "Create a voice-based journaling mode where you just talk for two minutes every morning",
    "רעיון — לבנות ווידג'ט למסך הבית שמראה את הרעיון האחרון שנשמר",
    "What if ideas could be linked together into a mind map automatically?",
    "Add a feature to record ideas directly from AirPods with a double tap",
    "רעיון לאפליקציה שמתרגמת רעיונות בין עברית לאנגלית בזמן אמת",
  ],

  'work-task': [
    "Follow up with Yoni about the design feedback before Thursday",
    "Schedule a roadmap review meeting with the team for next week",
    "Send the updated proposal to the client by end of day Friday",
    "צריך לסיים את המצגת לפגישה עם המשקיעים עד מחר בצהריים",
    "Email the investor update by EOD — don't forget to attach the financials",
    "Prepare talking points for the 1:1 with Dana on Wednesday",
    "Review the pull request Avi opened this morning",
    "לתאם פגישת סטטוס עם הצוות לפני סוף השבוע",
  ],

  'home-task': [
    "Call the plumber about the kitchen sink — it's been leaking for a week",
    "לקנות נורות LED לסלון, הישנות התחילו לפוג",
    "Book a time slot for the electrician to check the fuse box",
    "Order a new shower curtain rod from Amazon",
    "לנקות את המקרר ולזרוק את כל מה שפג תוקפו",
    "Remind me to take the recycling out tonight before 9",
    "Fix the broken hinge on the bedroom wardrobe door",
    "לקבוע תור לרכב — טיפול שנתי בן 3 חודשים",
  ],

  shopping: [
    "Buy a birthday gift for Mom — she mentioned she wants a new book by Yuval Noah Harari",
    "לקנות קפה, חלב, ביצים, ולחם — נגמר הכל",
    "Order more printer paper and a new black ink cartridge",
    "Pick up a yoga mat and resistance bands from the sports store",
    "לקנות מתנה לחתונה של רוני ודנה — לבדוק מה יש ברשימה",
    "Restock the medicine cabinet — we're out of ibuprofen and band-aids",
    "Buy a new HDMI cable for the office monitor",
    "לקנות פרחים לאמא ביום שישי",
  ],

  'read-watch': [
    "Read the article on attention residue that Lior shared in Slack",
    "Watch the talk by Paul Graham on doing things that don't scale",
    "לקרוא את הספר Thinking Fast and Slow — עדיין מחכה על המדף",
    "Check out the new documentary on Netflix about the history of the internet",
    "Read the Stripe press book on business strategy — came highly recommended",
    "לראות את הסדרה Severance — כולם ממליצים עליה",
    "Go through the Design Systems Handbook — good reference for the project",
    "Watch the YC startup school lecture on product market fit",
  ],

  finance: [
    "Pay the electricity bill before the 28th — it's already overdue",
    "לבדוק את תנועות האשראי של החודש ולסמן הוצאות חריגות",
    "Transfer money to the emergency fund — aim for at least 3k this month",
    "Call the bank about the suspicious charge from last Tuesday",
    "לחדש את ביטוח הרכב — פג בחודש הבא",
    "Review the freelance invoice and send it to the client before Sunday",
    "Set up a monthly standing order for the gym membership",
    "לבדוק אם יש עמלות בחשבון שאפשר לבטל",
  ],

  travel: [
    "Look into flights to Lisbon for the long weekend in May",
    "לחפש מלון בברצלונה לנסיעה בפברואר — עדיף קרוב למרכז",
    "Book the Airbnb for the family trip to the north — we agreed on mid-July",
    "Check visa requirements for a trip to Japan — might need to apply early",
    "לחדש את הדרכון לפני הנסיעה — פג תוקף בעוד 6 חודשים",
    "Research the best areas to stay in Tokyo for first-time visitors",
    "Pack list for the camping trip — tent, sleeping bag, headlamp",
    "לקנות כרטיסים לרכבת מתל אביב לחיפה לסוף השבוע",
  ],

  other: [
    "I want to start waking up at 6am consistently — need to figure out a system",
    "לחשוב מחדש על החלוקה בין עבודה לזמן פנאי — משהו לא עובד",
    "Interesting conversation with Tamar today about the direction of the company",
    "The podcast on deep work by Cal Newport — worth revisiting the key ideas",
    "צריך לדבר עם גיא על מה שקרה בפגישה האחרונה",
    "Note to self: stop checking email in the first hour of the morning",
    "Want to learn the basics of Figma properly — keep hacking around it",
    "לחשוב על תוכנית ל-5 שנים הקרובות — מה אני רוצה להשיג",
  ],
};

/**
 * Returns a random fixture sentence for the given category.
 * Falls back to a random sentence from the full pool if category not found.
 */
export function getRandomFixture(categoryId: string | null): string {
  const pool = (categoryId && FIXTURE_POOL[categoryId]) ?? Object.values(FIXTURE_POOL).flat();
  return pool[Math.floor(Math.random() * pool.length)];
}
