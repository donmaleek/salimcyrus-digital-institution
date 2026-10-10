// Content transcribed/adapted directly from the "Parental Guidance" curriculum
// blueprint (Salim Cyrus / Halisi Hub Connect). Every module's teaching,
// practice, resource name and reflection question below is the document's
// own content, reformatted into a single lesson's plain-text notes (the
// CoursePlayer renders `content` with whitespace-pre-wrap, no markdown).
// Nothing here is invented: where the source document did not name a
// downloadable resource for a lesson, that lesson has none (resourceLabel
// left undefined rather than guessed).

const CATEGORY = 'Parental Guidance'

function lessonText({ objective, teach, practice, reflection }) {
  return [
    `LEARNING OBJECTIVE\n${objective}`,
    `WHAT THIS COVERS\n${teach}`,
    `PRACTICE THIS WEEK\n${practice}`,
    `REFLECTION QUESTION\n${reflection}`,
  ].join('\n\n')
}

const modules = [
  {
    title: '01. Understanding Child Development',
    description:
      'Help parents adjust expectations to a child’s stage, abilities and circumstances, so correction targets a missing skill instead of assumed defiance.',
    outcomes: [
      'Tell apart a skill a child has not yet learned from a child refusing to cooperate.',
      'Observe one recurring conflict and name what support the task actually requires.',
    ],
    resourceLabel: 'Age-based expectations and observation worksheet',
    lesson: {
      objective: 'Help parents adjust expectations to a child’s stage, abilities and circumstances.',
      teach:
        'Broad developmental stages, language and attention differences, emotional/social development, temperament, and the difference between a skill not yet learned and refusal to cooperate.',
      practice:
        'Choose one recurring conflict. Write what the child is expected to do, what skills the task requires, what support has been provided and what might make it difficult.',
      reflection: 'Am I asking for behaviour the child has been taught and is developmentally able to perform?',
    },
  },
  {
    title: '02. Parenting Self-Awareness',
    description:
      'Help parents identify how stress, upbringing and beliefs influence their responses, so correction comes from judgment rather than an inherited reflex.',
    outcomes: [
      'Notice a personal trigger before it drives a reaction.',
      'Acknowledge a mistake to a child without abandoning the boundary that mattered.',
    ],
    resourceLabel: 'Personal trigger map and parent reset plan',
    lesson: {
      objective: 'Help parents identify how stress, upbringing and beliefs influence their responses.',
      teach:
        'Triggers, escalation, inherited family patterns, shame, pausing before responding and acknowledging a mistake without abandoning a boundary.',
      practice: 'Record a difficult moment: What happened? What did I feel? What did I do? What could I try next time?',
      reflection: 'Which behaviours in my child activate a fear, memory or expectation in me?',
    },
  },
  {
    title: '03. Attachment, Trust and Connection',
    description:
      'Build practices that help children feel seen, safe and able to seek guidance, so authority is heard inside a relationship a child trusts.',
    outcomes: [
      'Run a short, distraction-free connection routine suited to the child’s age.',
      'Recognize whether a child expects to be listened to, or expects immediate anger when they disclose a mistake.',
    ],
    resourceLabel: 'Connection routine and weekly check-in questions',
    lesson: {
      objective: 'Build practices that help children feel seen, safe and able to seek guidance.',
      teach:
        'Attentive listening, predictable care, age-appropriate affection, keeping promises, repair after conflict and respectful privacy.',
      practice: 'Schedule ten minutes of child-led, distraction-free conversation or play, suitable to the child’s age.',
      reflection: 'Does my child expect me to listen, or expect immediate anger when they disclose a mistake?',
    },
  },
  {
    title: '04. Emotional Intelligence',
    description:
      'Help parents coach emotions rather than dismiss or fear them, so a child learns to manage frustration instead of just suppress it.',
    outcomes: [
      'Separate a feeling from the action it provoked, in the moment.',
      'Run a simple four-step sequence: name it, allow safe expression, set a limit, choose the next step.',
    ],
    resourceLabel: 'Feelings vocabulary and family coping plan',
    lesson: {
      objective: 'Help parents coach emotions rather than dismiss or fear them.',
      teach:
        'Feelings versus actions, naming emotions, calm adult presence, grounding, problem-solving after calm returns and signs of persistent distress.',
      practice: 'Name the feeling; allow safe expression; set a limit; choose the next step.',
      reflection: 'Do I teach my child how to manage anger, or only tell them not to be angry?',
    },
  },
  {
    title: '05. Discipline, Boundaries and Accountability',
    description:
      'Establish boundaries that teach responsibility while protecting dignity and safety, replacing vague rules with clear, proportionate ones.',
    outcomes: [
      'Turn a vague rule into a clear, specific expectation.',
      'Choose a consequence that is connected to the behaviour, proportionate, and explained.',
    ],
    resourceLabel: 'Family rules planner and consequence review sheet',
    lesson: {
      objective: 'Establish boundaries that teach responsibility while protecting dignity and safety.',
      teach:
        'Clear rules, predictable consequences, natural/logical consequences where safe, positive reinforcement, restitution and the risks of physical punishment and humiliation.',
      practice:
        'Rewrite a vague rule like "behave yourself" as a clear expectation such as "put your shoes on the rack when you come in."',
      reflection: 'Is the consequence connected to the behaviour, proportionate and explained?',
    },
  },
  {
    title: '06. Communication and Conflict',
    description: 'Improve listening, instructions, disagreement and repair, so conflict stays a place where learning can happen.',
    outcomes: [
      'Replace a character attack ("you never listen") with a description of the action, its impact, and the requested change.',
      'Notice when a child’s view is being corrected before it has actually been understood.',
    ],
    resourceLabel: 'Parent-child conversation cards',
    lesson: {
      objective: 'Improve listening, instructions, disagreement and repair.',
      teach: 'Open questions, reflective listening, short specific instructions, avoiding labels, calm disagreement and apology.',
      practice: 'Replace "You never listen" with a description of the action, its impact and the requested change.',
      reflection: 'Do I correct the child’s view before I have understood it?',
    },
  },
  {
    title: '07. Character, Values and Responsibility',
    description: 'Translate values into observable daily habits that a child can actually see modelled at home.',
    outcomes: [
      'Define three visible behaviours that demonstrate one chosen family value.',
      'Recognize what a child learns about respect by watching a parent under frustration.',
    ],
    resourceLabel: 'Family values-to-actions chart',
    lesson: {
      objective: 'Translate values into observable daily habits.',
      teach: 'Modelling, honesty, empathy, respect, chores, accountability, commitments, making amends and cultural sensitivity.',
      practice: 'Select one value and define three visible behaviours that demonstrate it at home.',
      reflection: 'What does my child learn about respect by watching me when I am frustrated?',
    },
  },
  {
    title: '08. Learning, Talent and Purpose',
    description: 'Support achievement without making a child’s identity depend on grades or comparison.',
    outcomes: [
      'Ask about effort and strategy, not only results.',
      'Tell apart helping a child discover their own strengths from pushing them toward a parent’s ambitions.',
    ],
    resourceLabel: 'Interests, strengths and goals journal',
    lesson: {
      objective: 'Support achievement without making a child’s identity depend on grades or comparison.',
      teach: 'Curiosity, effort and strategy, responding to failure, strengths, realistic goals and age-appropriate autonomy.',
      practice: 'Ask the child what they enjoyed learning, what felt difficult and what they want to practise next.',
      reflection: 'Am I helping my child discover strengths or pushing them to fulfil my ambitions?',
    },
  },
  {
    title: '09. Digital Safety and Media Literacy',
    description: 'Build a practical family approach to safe and responsible technology use.',
    outcomes: [
      'Write a family digital agreement covering privacy, device routines and supervision.',
      'Confirm the child knows what to do if someone online asks for secrecy, private images, money, or a meeting.',
    ],
    resourceLabel: 'Digital safety agreement and incident response checklist',
    lesson: {
      objective: 'Build a practical family approach to safe and responsible technology use.',
      teach: 'Privacy, online contact, cyberbullying, scams, digital footprints, device routines, supervision and reporting concerns.',
      practice: 'Create a family digital agreement and identify a trusted adult the child can approach without fear.',
      reflection: 'Does my child know what to do if someone online asks for secrecy, private images, money or a meeting?',
    },
  },
  {
    title: '10. Adolescence, Identity and Relationships',
    description: 'Guide teenagers while respecting growing autonomy, so disagreement does not have to cost the relationship.',
    outcomes: [
      'Hold a calm, factual, age-appropriate conversation on a sensitive topic.',
      'Recognize whether a teenager can disagree respectfully and still feel secure in the relationship.',
    ],
    resourceLabel: 'Adolescent conversation guide',
    lesson: {
      objective: 'Guide teenagers while respecting growing autonomy.',
      teach:
        'Peer influence, belonging, body changes, identity, boundaries, consent, healthy relationships, privacy and signs a young person needs support.',
      practice: 'Have a calm conversation about one sensitive topic using open questions and factual, age-appropriate information.',
      reflection: 'Can my teenager disagree respectfully and still feel secure in our relationship?',
    },
  },
  {
    title: '11. Money and Life Skills',
    description: 'Prepare children for age-appropriate practical independence, one habit at a time.',
    outcomes: [
      'Run an age-appropriate budgeting, saving, or household-task challenge and review what was learned.',
      'Tell apart doing a task for a child because it is faster from teaching a skill they will need later.',
    ],
    resourceLabel: 'Financial literacy tracker and life-skills checklist',
    lesson: {
      objective: 'Prepare children for age-appropriate practical independence.',
      teach: 'Needs/wants, saving, spending, budgeting, household contribution, hygiene, cooking basics, planning and value creation.',
      practice: 'Give an age-appropriate budget challenge, household task or savings goal and review what was learned.',
      reflection: 'Am I doing every task because it is faster, or teaching skills needed later?',
    },
  },
  {
    title: '12. Co-Parenting and Family Systems',
    description: 'Reduce avoidable conflict and create stable guidance across caregivers, where safe and feasible.',
    outcomes: [
      'Agree on three core expectations caregivers can communicate consistently.',
      'Recognize when a child is being asked to carry messages, choose sides, or manage adult emotions.',
    ],
    resourceLabel: 'Co-parenting communication planner',
    lesson: {
      objective: 'Reduce avoidable conflict and create stable guidance across caregivers where safe.',
      teach:
        'Shared rules, respectful communication, adult conflict boundaries, transitions between homes, extended family and avoiding triangulation.',
      practice: 'Agree on three core expectations caregivers can communicate consistently, where safe and feasible.',
      reflection: 'Am I asking my child to carry messages, choose sides or manage adult emotions?',
    },
  },
]

const flagship = {
  title: 'The Foundations of Intentional Parenting',
  subtitle: 'The first paid course on the Parental Guidance platform',
  description:
    'Help parents understand their role, observe behaviour thoughtfully, establish clear expectations and practise constructive communication. Six lessons, built from the full Parental Guidance curriculum, meant to be worked through in order over roughly six weeks.',
  outcomes: [
    'Understand parenting as preparation for a child’s independent life, not just provision.',
    'Adjust expectations to a child’s developmental stage before correcting behaviour.',
    'Recognize a personal trigger before it drives a reaction.',
    'Combine connection and authority instead of treating them as opposites.',
    'Correct behaviour with a proportionate boundary that protects dignity.',
    'Leave with a concrete 30-day family learning plan.',
  ],
  lessons: [
    {
      title: '1. Parenting Beyond Provision: Preparing a Child for Life',
      content: lessonText({
        objective:
          'Understand why loving a child is essential but not sufficient on its own, and what Parental Guidance means by intentional parenting.',
        teach:
          'Parental Guidance is a structured learning environment that helps parents understand child development, build stronger relationships, establish healthy boundaries, teach responsibility and prepare children for increasingly independent lives.\n\n' +
          'Loving a child is essential, but love alone does not automatically provide the knowledge or skills required to parent effectively. Parenting also requires observation, emotional regulation, consistency, humility, practical knowledge and a willingness to keep learning.\n\n' +
          'The aim is not to produce perfect parents or perfectly obedient children. It is to help adults become more intentional, capable and responsive while helping children develop judgment and life skills.\n\n' +
          'Central question: What is this child learning from my response, beyond the instruction I intended to give?\n\n' +
          'Core commitments guiding every lesson in this course: child dignity (correct behaviour without reducing a child to labels such as "bad," "lazy," or "hopeless"); developmental understanding (adapt expectations to the child’s age, abilities, and circumstances); connection and boundaries (combine warmth and listening with clear expectations and accountability); parent responsibility (examine your own patterns and model the behaviour you expect); evidence-informed practice; and practical application (every lesson gives you something specific to practise at home).',
        practice:
          'Before moving to Lesson 2, write down the central question in your own words, in a place you will actually see it this week: "What is my child learning from my response, beyond the instruction I intended to give?"',
        reflection:
          'Which of the five core commitments (child dignity, developmental understanding, connection and boundaries, parent responsibility, practical application) is hardest for me right now, and why?',
      }),
    },
    {
      title: '2. Understanding Development Before Setting Expectations',
      content: lessonText(modules[0].lesson),
      resourceLabel: modules[0].resourceLabel,
    },
    {
      title: '3. How Parental Triggers Shape a Response',
      content: lessonText(modules[1].lesson),
      resourceLabel: modules[1].resourceLabel,
    },
    {
      title: '4. Connection and Authority: Why Children Need Both',
      content: lessonText({
        objective: 'Use one simple framework to hold connection and authority together instead of treating them as a trade-off.',
        teach:
          'CONNECT → UNDERSTAND → GUIDE → PREPARE: use the same framework every time, so it holds up under pressure.\n\n' +
          '1. Connect: Establish enough safety and trust for the child to communicate. Connection does not mean agreeing with every choice; it means showing the child can be heard while the adult remains responsible for guidance.\n\n' +
          '2. Understand: Observe what happened, the developmental capacity required, the context and the possible trigger. Avoid assuming every difficult behaviour is deliberate disrespect.\n\n' +
          '3. Guide: State the expectation, explain the reason briefly, set a boundary, apply a proportionate consequence where needed, and help the child practise a better response.\n\n' +
          '4. Prepare: Turn the incident into learning. Ask what can be done next time, how harm can be repaired and what support would make success more likely.\n\n' +
          'Example, a child refuses to put away a device: less helpful is "You are always rude. Give it to me now!" and arguing for twenty minutes without a clear boundary, or taking the device indefinitely without explanation, or treating the incident as proof the child is bad. More instructive is "Screen time is finished. Please put the device on the table," stating the rule and following through consistently, using a known proportionate consequence and explaining how privileges are earned back, and reviewing the routine, transition warning, sleep, and task expectations.\n\n' +
          'The goal is not to avoid every conflict. It is to make conflict a setting where safety, accountability and learning remain possible.',
        practice:
          'The next time a conflict comes up at home, run it through all four steps out loud in your head before responding: Connect, Understand, Guide, Prepare. Notice which step you tend to skip.',
        reflection: modules[2].lesson.reflection,
      }),
      resourceLabel: modules[2].resourceLabel,
    },
    {
      title: '5. Boundaries, Consequences and Teaching Responsibility',
      content: lessonText({
        objective:
          'Correct a specific behaviour while protecting dignity, maintaining an appropriate boundary, and identifying the skill the child needs to practise.',
        teach:
          'A child can make a poor choice without being a bad person. Labels such as "lazy," "useless," or "selfish" can turn a correctable action into an identity. A constructive response describes the behaviour, explains its impact, sets a limit, and gives a path toward repair.\n\n' +
          'The five-step correction sequence:\n' +
          '1. Regulate yourself. If safe, pause long enough to avoid reacting from uncontrolled anger.\n' +
          '2. Name the behaviour. Describe what happened without exaggeration or character attacks.\n' +
          '3. Explain the boundary. State why the action matters and what needs to change.\n' +
          '4. Apply a proportionate response. Use a known, related consequence where appropriate; do not use violence, threats or humiliation.\n' +
          '5. Practise repair. Ask what can be done to correct harm and what the child can try next time.\n\n' +
          'Example script: "You took your sister’s item without asking. She needs to know her belongings are safe. Please return it and ask before using it next time. We will talk about how you can rebuild trust."',
        practice:
          'Write down a recurring behaviour that frustrates you. Separate observable facts from assumptions about the child’s intentions. Identify the rule and the skill the child needs to learn. Choose a calm, proportionate response, then review whether the child understood the expectation and what support would help next time.',
        reflection:
          'Was I trying to teach, or simply discharge anger? Did I address the action without humiliating the child? Was my response proportionate and connected to the issue? Did I leave a practical path toward repair?',
      }),
      resourceLabel: modules[4].resourceLabel,
    },
    {
      title: '6. Building a Family Learning Plan for the Next 30 Days',
      content: lessonText({
        objective: 'Turn the five lessons so far into one concrete 30-day plan, and close with the standard this course holds parenting to.',
        teach:
          'A 30-day application plan: practise one skill each week, in this order: connection, clear expectations, emotional regulation, and reflection. This is a learning exercise, not a guarantee of outcomes.\n\n' +
          'The transformation pathway this whole course has been building toward: Awareness (notice personal triggers and inherited patterns; can you describe a recurring situation without only blaming the child?); Understanding (consider age, context, skill and emotional needs; can you identify multiple possible explanations for a behaviour?); Skill building (practise listening, boundaries and repair; do you use a planned response rather than relying only on impulse?); Consistency (repeat routines and expectations over time; are expectations clearer and more predictable?); Reflection (review what helped and what needs adjustment; can you change approach when a method is not working?); Independence (transfer suitable decisions to the child; does the child gradually demonstrate age-appropriate skills?).\n\n' +
          'Children do not need parents who pretend to know everything. They need adults who take responsibility for learning, set boundaries without destroying dignity, apologize without abandoning leadership, and understand that development is a process rather than a performance.\n\n' +
          'A child who is corrected but never understood may learn to hide mistakes. A child protected from every consequence may struggle to develop responsibility. A child controlled in every decision may have little opportunity to practise judgment. Intentional parenting seeks a wiser balance: protection and independence, warmth and boundaries, guidance and accountability.\n\n' +
          'The most meaningful measure of parenting is not simply whether a child obeys while watched. It is whether, over time and with appropriate support, the child develops the skills and judgment to do what is right when no one is watching.',
        practice:
          'Write your own 30-day plan: name one thing you will practise each week for the next four weeks (connection, clear expectations, emotional regulation, reflection), and one way you will know whether it is working.',
        reflection:
          'Looking back across all six lessons, which single change would make the biggest difference in my home over the next 30 days?',
      }),
    },
  ],
}

module.exports = { CATEGORY, modules, flagship, lessonText }
