# Product Requirements Document: FlickEd MVP

**Document Version:** 4.0  
**Product Name:** FlickEd  
**Tagline:** Flick. Learn. Unlock.

---

# 1. Product Vision

FlickEd transforms passive video consumption into structured learning.

Instead of asking parents to find educational content or asking children to sit through traditional lessons, FlickEd uses existing short-form video content to create **personalised learning journeys**.

A child tells FlickEd what they are interested in, or the parent selects their grade and interests.

FlickEd then:

1. Understands the child's profile and learning goals.
2. Finds relevant educational videos.
3. Organises them into logical sequences.
4. Presents them in a simple vertical feed.
5. Uses lightweight interactions to check understanding.
6. Builds progressively deeper understanding through a series of related videos.

The MVP is therefore **not about creating content**.

It is about making the enormous amount of existing educational video content significantly more useful.

---

# 2. The Problem

Parents increasingly use YouTube and other video platforms as educational resources for their children.

The problem is not a lack of content.

The problem is **choice, quality and structure**.

A parent searching for:

> "Fractions for Grade 5"

may find hundreds of videos.

But which one should the child watch first?

What should they watch next?

Does the next video build on what they just learned?

Has the child actually understood the concept?

Most video platforms optimise for **engagement and recommendation**, not learning outcomes.

FlickEd's job is to provide the missing learning layer.

### The core problem statement

> **Parents have access to enormous amounts of educational content, but no simple way to turn that content into a personalised, structured learning journey for their child.**

---

# 3. Target User

## 3.1 Primary User: Child

### MVP age group

**8-12 years**

The initial product should focus on this narrower age range rather than attempting to serve ages 6-14 from day one.

### Child characteristics

- Comfortable with short-form video.
- Curious about subjects beyond school.
- Has a relatively short attention span for traditional lessons.
- Enjoys discovering topics through video.
- May resist anything that feels like homework.
- Responds well to progress, discovery and small rewards.

### Child need

> "Show me something interesting and help me understand it without making it feel like studying."

---

# 4. Primary Decision Maker: Parent

Parents are the buyer and the person responsible for setting up the child's learning profile.

The parent wants:

- Safe educational screen time.
- Age-appropriate content.
- Minimal curation effort.
- Confidence that content is relevant.
- Visibility into what the child is learning.
- Evidence that screen time is producing something useful.

The parent should not have to search YouTube, watch videos beforehand, create playlists or manually decide what comes next.

### Parent value proposition

> **"Tell us what your child is interested in. We'll turn videos into a learning journey."**

---

# 5. Core Product Thesis

FlickEd's central hypothesis is:

> **A sequence of carefully selected short videos can teach a concept more effectively than a single recommended video, provided the videos are ordered around a defined learning outcome.**

This is the fundamental product hypothesis the MVP must validate.

---

# 6. The Core Learning Loop

The basic FlickEd experience should look like this:

### Step 1: Build the child's profile

Parent provides:

- Grade
- Age
- Curriculum, where applicable
- Subjects
- Interests
- Learning preferences
- Topics the child wants to explore

Example:

> Grade 5  
> Interests: Space, dinosaurs, coding  
> Current learning goal: Fractions

---

### Step 2: Choose a learning topic

The child or parent can select a topic.

Examples:

- Fractions
- Solar System
- Ancient Egypt
- Photosynthesis
- Electricity
- Volcanoes
- Python programming

The system should also proactively recommend topics based on the child's profile.

---

### Step 3: Define a learning outcome

FlickEd should think in terms of **outcomes**, not videos.

For example:

### Learning outcome

> "Understand how fractions represent parts of a whole and how equivalent fractions work."

The system then determines what concepts need to be covered to reach that outcome.

---

### Step 4: Build a learning sequence

Instead of recommending one video, FlickEd creates a sequence.

Example:

**Topic: Fractions**

**Video 1:**  
What is a fraction?

↓  

**Video 2:**  
Numerator and denominator

↓

**Video 3:**  
Fractions on a number line

↓

**Video 4:**  
Equivalent fractions

↓

**Video 5:**  
Comparing fractions

↓

**Video 6:**  
Real-world applications

The child experiences this as a continuous feed.

The system should make the transition between videos feel natural rather than like a traditional lesson plan.

---

# 7. The FlickEd Feed

The primary child experience is a vertical video feed.

However, unlike TikTok or YouTube Shorts, the feed is **not primarily engagement-driven**.

The ordering algorithm should optimise for:

> **Learning progression + relevance + engagement + age appropriateness**

rather than simply:

> Watch time.

### Each video should have metadata such as:

- Topic
- Subtopic
- Grade level
- Age suitability
- Difficulty
- Concepts covered
- Prerequisite concepts
- Estimated learning value
- Video duration
- Creator/source
- Language
- Content safety status

This metadata becomes the foundation of the recommendation and sequencing engine.

---

# 8. Smart Recommendation Engine

The recommendation engine is the heart of FlickEd.

It should consider:

### Child profile

- Age
- Grade
- Curriculum
- Interests
- Previous learning activity

### Learning context

- Current learning goal
- Concepts already encountered
- Concepts mastered
- Concepts requiring reinforcement
- Difficulty level

### Content characteristics

- Topic relevance
- Concept coverage
- Video length
- Age appropriateness
- Quality signals
- Creator/source quality
- Engagement signals

### Session context

- What the child just watched
- Whether they completed it
- Whether they interacted with questions
- Whether they appeared to understand the concept
- How much time they have spent learning in the current session

---

# 9. Learning Graph

A key MVP capability should be the concept of a **Learning Graph**.

Rather than treating videos as independent pieces of content, FlickEd should map them against concepts.

For example:

**Fractions**

→ Part of a whole  
→ Numerator / denominator  
→ Number line  
→ Equivalent fractions  
→ Comparing fractions  
→ Adding fractions  
→ Multiplying fractions

This allows FlickEd to determine:

> "The child has already seen the basics. The next useful video should introduce equivalent fractions."

This is the key intellectual property of the product.

**YouTube provides the content. FlickEd provides the intelligence and structure.**

---

# 10. Sequential Learning

A learning outcome can span multiple sessions.

For example:

### Outcome

> Understand the basics of the solar system.

### Learning Journey

**Stage 1: The Solar System**

What is the solar system?

↓

**Stage 2: The Sun**

Why is the Sun important?

↓

**Stage 3: The Planets**

How are planets different?

↓

**Stage 4: Planetary Orbits**

Why do planets orbit the Sun?

↓

**Stage 5: Earth**

Why is Earth suitable for life?

↓

**Stage 6: Check Understanding**

Interactive questions and recall.

The child should be able to leave and return later without losing their position.

---

# 11. Content Source: YouTube

The MVP should leverage existing YouTube videos rather than creating or licensing a large original content library.

FlickEd will discover and organise relevant videos and present them through the appropriate YouTube viewing/embedding experience.

### Content selection should prioritise:

1. Educational relevance
2. Age appropriateness
3. Concept coverage
4. Creator/source quality
5. Video clarity
6. Duration
7. Content safety
8. Language
9. Learning progression

### Important principle

FlickEd should **not simply embed YouTube's recommendation engine**.

The system must independently determine:

> "What should this child watch next to achieve this learning outcome?"

YouTube is the content supply.

FlickEd is the learning orchestration layer.

---

# 12. Content Quality and Safety

Because the underlying content comes from an external platform, FlickEd must have a content evaluation layer.

Before a video becomes part of a recommended learning sequence, FlickEd should evaluate available metadata and, where permitted, analyse the content for:

- Topic relevance
- Age suitability
- Educational quality
- Potentially inappropriate content
- Excessive commercialisation
- Misleading information
- Conceptual accuracy
- Learning objective alignment

The MVP should initially favour a **controlled set of trusted educational channels and creators**, while gradually expanding the content universe.

This creates a balance between:

**Discovery**

and

**Safety and quality.**

---

# 13. Lightweight Active Learning

The MVP should not attempt to build a complete learning management system.

Instead, FlickEd should introduce lightweight interactions around videos.

Examples:

### Before video

> "What do you think will happen?"

### During/after video

> "Which planet is the largest?"

### Recall

> "Can you remember why seasons happen?"

### Prediction

> "What do you think happens if...?"

These interactions serve two purposes:

1. Make the experience more engaging.
2. Generate signals about the child's understanding.

---

# 14. Learning Outcome Tracking

FlickEd should track progress at the **concept level**, not simply at the video level.

Instead of:

> "Agrima watched 7 videos."

The parent should see:

> **Fractions**
>
> Foundations: Completed  
> Equivalent fractions: Developing  
> Comparing fractions: Not started

This makes the product meaningfully different from a video playlist.

---

# 15. Parent Experience

The parent experience should remain extremely lightweight.

### Initial setup

Parent enters:

- Child profile
- Grade
- Interests
- Optional curriculum
- Learning goals

### Parent dashboard

Show:

**What they learned**

**What they're currently learning**

**Where they're progressing**

**Topics they're interested in**

**Suggested next learning journeys**

Avoid overwhelming parents with analytics.

The core question should be:

> **"What did my child learn today?"**

---

# 16. Parent Conversation Layer

FlickEd can generate a simple conversation starter based on the child's learning.

Example:

> "Ask your child why the Moon appears to change shape."

or:

> "Ask them to explain equivalent fractions using an example."

This turns screen consumption into a potential parent-child interaction.

This feature is lightweight enough to remain part of the MVP.

---

# 17. Rewards and Earned Screen Time

The original concept of earned entertainment time remains an important long-term differentiator.

However, it should **not be a dependency for the MVP**.

The technical feasibility of controlling device-level screen time remains uncertain, particularly across iOS and Android.

### MVP

Use simpler rewards:

- XP
- Streaks
- Badges
- Learning milestones
- Progress levels

Optionally:

> "You completed today's learning goal."

The parent can manually use this as the basis for their existing screen-time/reward system.

### Post-MVP

Investigate:

- OS-level screen-time integration
- Parent-confirmed unlocks
- Integration with parental-control platforms
- Automated earned entertainment time

The product should only commit to device-level rewards once technical feasibility is proven.

---

# 18. MVP Scope

## P0: Must Have

### Child

- Personalised video feed
- Vertical video experience
- Topic discovery
- Learning journeys
- Sequential video recommendations
- Resume learning journey
- Basic interactive questions
- XP/progress
- Basic child profile

### Recommendation Engine

- Grade-aware recommendations
- Age-aware recommendations
- Interest-aware recommendations
- Topic relevance
- Concept sequencing
- Video quality scoring
- Personalisation based on viewing history

### Parent

- Child profile creation
- Grade and interest selection
- Learning goal selection
- Basic progress dashboard
- Daily/weekly learning summary
- Conversation starters

### Content

- YouTube video discovery
- Trusted creator/channel allowlist
- Content metadata extraction
- Safety filtering
- Concept tagging
- Learning outcome mapping

---

# 19. Explicitly Out of MVP

The following should not be allowed to creep into the first release:

- Original video production
- AI-generated educational videos
- Creator marketplace
- District/school deployment
- Full teacher dashboard
- FERPA-focused school workflows
- Voice AI tutor
- Device-level automatic screen-time control
- Complex parental controls
- Social features
- Public leaderboards
- Advanced gamification
- Full curriculum management system
- Paid content marketplace

These can be evaluated after the core learning loop is validated.

---

# 20. The MVP Learning Journey Example

A complete MVP experience could look like this.

### Parent

Selects:

> Grade 5  
> Interest: Space  
> Goal: Understand the Solar System

FlickEd generates:

### Learning Journey: Our Solar System

**1. What is the Solar System?**  
2 min

**2. Meet the Sun**  
3 min

**3. The Eight Planets**  
4 min

**4. Why Do Planets Orbit the Sun?**  
3 min

**5. Inner vs Outer Planets**  
3 min

**6. Can You Remember?**  
Interactive questions

### Child

Opens FlickEd.

Sees video 1.

Swipes up.

Video 2 appears.

The child doesn't need to search.

After completing the sequence, FlickEd says:

> **"You've unlocked: Solar System Explorer"**

The parent receives:

> **Today, your child explored the Solar System. They completed 5 videos and demonstrated understanding of 4 concepts.**

This is the MVP.

---

# 21. Product Hypotheses

The MVP exists primarily to test these hypotheses.

### H1
Parents are willing to delegate educational video discovery to FlickEd.

### H2
Children will consume a sequence of related educational videos when presented through a familiar short-form feed.

### H3
Sequenced videos produce better learning outcomes than independently recommended videos.

### H4
Personalisation based on grade, interests and previous behaviour increases engagement.

### H5
Lightweight interactions improve recall and understanding.

### H6
Parents value knowing what their child learned more than knowing how much screen time they spent.

### H7
Children will voluntarily continue exploring learning journeys beyond the minimum required activity.

---

# 22. MVP Success Metrics

## Activation

- % of parents completing child profile
- % selecting first learning goal
- % of children starting first learning journey
- % completing first video

## Engagement

- Videos/session
- Learning journeys/session
- Journey completion rate
- Sessions/week
- Return rate after 7 days

## Learning

- Question accuracy
- Concept recall
- Concept mastery progression
- Completion of multi-video learning journeys

## Personalisation

- Recommendation acceptance rate
- Skip rate
- Parent content removal rate
- Child continuation rate from one video to the recommended next video

## Intrinsic Engagement

Most importantly:

> **% of children who voluntarily start another learning journey after completing their initial goal.**

This is a critical signal that FlickEd is becoming more than a reward-driven learning tool.

## Parent Value

- Parent satisfaction
- % of parents reporting reduced effort in finding educational content
- % of parents who view progress summaries
- % of parents who use conversation prompts

---

# 23. North Star Metric

The initial North Star should not be DAU.

A better metric is:

> **Completed Learning Journeys per Active Child per Week**

A learning journey represents:

**Intent → relevant content → sequential consumption → interaction → learning outcome**

This captures the actual value FlickEd is trying to create.

---

# 24. Technical Architecture: MVP

At a high level:

**Child Profile**

↓

**Learning Goal**

↓

**Learning Outcome Engine**

↓

**Concept / Learning Graph**

↓

**YouTube Content Discovery**

↓

**Content Evaluation & Safety Layer**

↓

**Recommendation + Sequencing Engine**

↓

**Personalised FlickEd Feed**

↓

**Interaction / Assessment**

↓

**Learning Progress**

↓

**Next Recommendation**

The critical intelligence sits between:

**YouTube's content universe**

and

**the child's personalised learning journey.**

---

# 25. Key Product Moat

The initial product does not own the content.

That is intentional.

The potential moat is the intelligence layer built around it:

### 1. Learning Graph

Understanding relationships between concepts.

### 2. Content Graph

Understanding which videos explain which concepts.

### 3. Child Learning Profile

Understanding what an individual child knows, likes and needs next.

### 4. Sequencing Engine

Determining the optimal progression through available content.

### 5. Outcome Data

Learning which sequences actually produce understanding and engagement.

Over time, these can become significantly more valuable than simply owning a video library.

---

# 26. Major Risks

| Risk | Impact | MVP Response |
|---|---|---|
| YouTube content quality varies | High | Start with trusted channels and strong content filtering |
| Recommendation is relevant but not educationally coherent | Very High | Build concept and prerequisite mapping |
| Child skips sequential content | High | Keep sequences short and optimise transitions |
| Children lose interest | High | Short videos, interaction and personalisation |
| Parents don't trust recommendations | High | Transparency and parent controls |
| YouTube availability/embedding/API constraints | High | Validate platform capabilities before architecture is locked |
| AI incorrectly evaluates content | High | Human-reviewed seed catalogue and conservative filtering |
| Child watches but doesn't learn | Very High | Measure concept understanding, not just completion |
| Reward mechanism isn't technically possible | Medium for MVP | Remove as MVP dependency |

---

# 27. Key Validation Experiments

Before investing heavily in the full platform, validate three things.

### Experiment 1: Can FlickEd create a better sequence?

Give the system:

> "Grade 5 + Fractions"

Generate a 5-video journey.

Have an educator review:

- Relevance
- Sequence
- Difficulty progression
- Concept coverage

### Experiment 2: Do children actually follow the sequence?

Compare:

**Random educational recommendations**

vs.

**FlickEd sequenced recommendations**

Measure:

- Completion
- Continuation
- Session length
- Recall

### Experiment 3: Do children learn?

Give a simple assessment before and after the journey.

Measure:

> **Concept understanding improvement**

This is the most important experiment.

---

# 28. Post-MVP Roadmap

Once the core learning engine works:

### Phase 2

- Voice AI tutor
- Better adaptive assessment
- More sophisticated learning graph
- Teacher-created learning journeys
- Teacher distribution
- More advanced gamification

### Phase 3

- Earned screen-time integrations
- Parent-controlled rewards
- School/B2B2C distribution
- Creator partnerships
- Curriculum alignment
- Premium subscription

### Phase 4

- Proprietary content
- Creator ecosystem
- Advanced adaptive learning
- Cross-platform parental control integrations

---

# 29. Strategic Positioning

FlickEd should not position itself as:

> **"YouTube for education."**

That is easy to copy and puts the product in direct comparison with YouTube Kids and existing educational platforms.

The stronger positioning is:

> **"The learning layer for the videos your child already watches."**

Or, more simply:

> **"Flick. Learn. Unlock."**

The product takes an enormous, unstructured content universe and turns it into something that has:

**Context → Sequence → Interaction → Progress → Outcome**

That is the core of FlickEd.