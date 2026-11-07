# Klique --- Product Expansion & Development Plan

**Product:** Klique\
**Website:** https://klique.netlify.app/\
**Document type:** Product strategy, feature roadmap, technical planning
and launch checklist\
**Planning horizon:** 12 weeks for the first structured expansion\
**Status:** Proposed roadmap --- validate priorities with usage data
before committing to every feature

------------------------------------------------------------------------

## 1. Executive Summary

Klique should grow from a collection of online utilities into an
**everyday digital utility platform**. Its value proposition should be
simple:

> Find a useful tool, complete a task quickly, and keep moving ---
> without installing software or creating an account unnecessarily.

The platform already focuses on AI writing, text summarization, username
generation, fancy fonts and text utilities. The next expansion should
add practical tools for everyday life, students, freelancers, small
businesses and developers.

The goal is not to publish the largest possible number of tools. The
goal is to build a smaller set of reliable, fast, discoverable tools
that solve real problems and encourage repeat visits.

### Product principles

1.  **Utility before quantity:** Every tool must solve a clear user
    problem.
2.  **Fast by default:** Keep pages lightweight and interactions
    immediate.
3.  **Privacy by design:** Process files and personal data in the
    browser wherever practical.
4.  **No forced account:** Core tools should work without registration
    unless saving or syncing genuinely requires it.
5.  **Consistent experience:** Shared layout, inputs, validation, empty
    states, loading states and export patterns.
6.  **Searchable and discoverable:** Each tool should have a dedicated,
    indexable landing page.
7.  **Honest functionality:** Clearly label features that need an API,
    server, browser permission or external service.

------------------------------------------------------------------------

## 2. Product Positioning

### Proposed positioning

**Klique --- Useful tools for everyday digital work.**

Klique can serve five primary audiences:

  -----------------------------------------------------------------------
  Audience                            Problems Klique can solve
  ----------------------------------- -----------------------------------
  Everyday users                      Bills, subscriptions, expenses,
                                      dates, image and document tasks

  Students                            Attendance, GPA, study planning,
                                      flashcards and typing practice

  Freelancers                         Invoices, quotations, salary
                                      calculations, signatures and file
                                      utilities

  Small businesses                    GST, invoices, quotations, UPI QR
                                      codes and profit calculations

  Developers                          API testing, JSON conversion,
                                      regex, SQL formatting and code
                                      playgrounds
  -----------------------------------------------------------------------

### Differentiation

Many utility websites offer a large number of disconnected converters.
Klique can stand out through:

-   Practical workflows rather than isolated tools.
-   A clean, consistent, mobile-friendly interface.
-   Browser-side processing for privacy-sensitive tasks.
-   Indian business utilities such as GST, UPI and invoice creation.
-   Useful presets, examples and clear explanations.
-   Favorites, recent tools and locally saved preferences.
-   Related-tool suggestions that help users complete the next step.

------------------------------------------------------------------------

## 3. Proposed Information Architecture

Use a clear category system. Avoid making the navigation menu
excessively long.

### Main categories

1.  **AI Tools**
    -   AI Writer
    -   Text Summarizer
    -   Other existing AI utilities
2.  **Text & Writing**
    -   Fancy Fonts
    -   Username Generator
    -   Text Case Converter
    -   Word and Character Counter
    -   Text Diff
3.  **Business & Finance**
    -   GST Calculator
    -   Invoice Generator
    -   Quotation Generator
    -   EMI Calculator
    -   Salary Calculator
    -   Profit Margin Calculator
    -   Personal Expense Tracker
    -   Subscription Tracker
4.  **Productivity**
    -   Pomodoro Timer
    -   Habit Tracker
    -   Event Countdown
    -   Split Bill Calculator
    -   Meeting Cost Calculator
    -   Temporary Notes
5.  **Student Tools**
    -   Attendance Calculator
    -   CGPA/GPA Calculator
    -   Study Timetable Generator
    -   Flashcard Generator
    -   Typing Speed Test
6.  **Developer Tools**
    -   API Request Builder
    -   Regex Tester
    -   SQL Formatter
    -   JSON to TypeScript
    -   JWT Decoder
    -   Cron Generator
    -   HTML/CSS/JS Playground
7.  **Image & PDF**
    -   Image Compressor
    -   Background Remover
    -   PDF Compare
    -   PDF Signer
    -   Image to Text (OCR)
    -   Image Color Extractor
8.  **QR & Web**
    -   QR Menu Generator
    -   UPI QR Generator
    -   WhatsApp Link Generator
    -   Email Signature Generator
    -   Website Screenshot
    -   Website Uptime Checker
    -   SEO Analyzer
9.  **File Utilities**
    -   Bulk File Renamer
    -   Additional converters and file utilities as demand is validated

### Navigation recommendations

-   Add a prominent global tool search.
-   Show popular tools on the home page.
-   Add category landing pages.
-   Add Recently Used and Favorites sections.
-   Add related tools at the bottom of every tool page.
-   Keep mobile navigation compact and searchable.
-   Do not expose all tools as a long footer list; group them by
    category.

--------------------------------------------------------------------------------

## 3.5 Existing Tools and Category Mapping

The following tools are already implemented in the Klique codebase and are
mapped to the product positioning categories defined in Section 3.

### AI Tools
- **AI Writer** (`/aiwriter`) — Paraphrase/text rewriting tool

### Text & Writing
- **Fancy Fonts** (`/fontgenerator`) — Stylish text font generator
- **Username Generator** (`/username`) — Generate usernames
- **Word Counter** (`/wordcounter`) — Word and character counting
- **Hashtag Generator** (`/hashtaggenerator`) — Social media hashtag generation
- **Cool Symbol** (`/symbol`) — Special characters and symbols
- **Emoji Generator** (`/emojigenerator`) — Emoji copy tool
- **Bio Generator** (`/bio`) — Social media bio generation

### Business & Finance
- (none built yet)

### Productivity
- **Time Zone Converter** (`/timezone`) — Time zone conversion

### Student Tools
- (none built yet)

### Developer Tools
- **JSON Formatter** (`/jsonformatter`) — JSON formatting and validation
- **Secret Scanner** (`/secretscanner`) — Secret/API key scanning
- **Code to Image** (`/codeimage`) — Convert code snippets to images

### Image & PDF
- **PDF Tools** (`/convert`) — PDF conversion and manipulation
- **SVG Converter** (`/svgconverter`) — SVG conversion
- **Favicon Generator** (`/favicongenerator`) — Favicon creation
- **Image Tools** (`/imageoptimizer`) — Image optimization/compression

### QR & Web
- **QR & Link Tools** (`/qrlinktools`) — QR code and link generation
- **Social OG Previewer** (`/ogpreviewer`) — Open Graph preview

### File Utilities
- **File Encryption** (`/fileencryption`) — Client-side file encryption

**Total existing tools:** 19\
**Categories with existing tools:** 7 of 9\
**Categories needing new tools:** Business & Finance, Student Tools

--------------------------------------------------------------------------------

## 4. Tool Backlog --- 41 Proposed Tools

Complexity estimates are relative and assume the current
React/Vite/Tailwind stack. They do not include a full production QA
cycle.

**Complexity:** S = Small, M = Medium, L = Large\
**Priority:** P0 = First release, P1 = Next, P2 = Later

### A. Everyday tools

  ---------------------------------------------------------------------------------
              \# Tool           Main               Complexity         Priority
                                functionality                     
  -------------- -------------- --------------- ----------------- -----------------
               1 Personal       Income,                 M                P1
                 Expense        expenses,                         
                 Tracker        categories,                       
                                monthly charts,                   
                                CSV export                        

               2 Subscription   Subscription            M                P1
                 Tracker        cost, billing                     
                                cycle, renewal                    
                                dates and                         
                                annual total                      

               3 Split Bill     Equal/unequal           S                P0
                 Calculator     splits, tips,                     
                                individual                        
                                shares and                        
                                settlement                        
                                summary                           

               4 Habit Tracker  Daily habits,           M                P2
                                streaks and                       
                                completion                        
                                statistics                        

               5 Focus &        Work/break              S                P1
                 Pomodoro Timer sessions,                         
                                custom                            
                                durations and                     
                                focus                             
                                statistics                        

               6 Event          Multiple                S                P1
                 Countdown      events, date                      
                                countdown and                     
                                shareable event                   
                                links                             
  ---------------------------------------------------------------------------------

### B. Business and finance

  -------------------------------------------------------------------------------------
              \# Tool         Main functionality       Complexity         Priority
  -------------- ------------ --------------------- ----------------- -----------------
               7 GST          Inclusive/exclusive           S                P0
                 Calculator   GST, CGST, SGST, IGST                   
                 (India)      and reverse GST                         

               8 Invoice      Business details,             L                P0
                 Generator    line items, tax,                        
                              discounts and PDF                       
                              export                                  

               9 EMI          EMI, total interest,          S                P0
                 Calculator   repayment schedule                      
                              and charts                              

              10 Salary       CTC breakdown,                M                P1
                 Calculator   deductions and                          
                              estimated take-home                     
                              pay                                     

              11 Quotation    Items, pricing,               M                P1
                 Generator    taxes, terms and PDF                    
                              export                                  

              12 Profit       Cost, selling price,          S                P0
                 Margin       markup, margin and                      
                 Calculator   break-even                              
  -------------------------------------------------------------------------------------

**Important business-tool notes:**

-   GST calculations must distinguish inclusive and exclusive amounts.
-   Let users select intra-state or inter-state supply rather than
    guessing tax treatment.
-   Make tax rates configurable and explain that users should verify
    current applicable rules.
-   Salary calculations should disclose assumptions and avoid presenting
    estimates as official payroll advice.
-   Invoice and quotation templates should support editable business
    identity, numbering, dates and currency.
-   Do not store financial documents remotely unless the user explicitly
    chooses a supported cloud feature.

### C. Student tools

  ---------------------------------------------------------------------------------
              \# Tool         Main                 Complexity         Priority
                              functionality                       
  -------------- ------------ ----------------- ----------------- -----------------
              13 Attendance   Current                   S                P0
                 Calculator   percentage,                         
                              target attendance                   
                              and allowable                       
                              absences                            

              14 CGPA/GPA     Semester-wise             S                P0
                 Calculator   GPA, CGPA and                       
                              configurable                        
                              conversion                          

              15 Study        Subjects,                 M                P1
                 Timetable    available hours,                    
                 Generator    priorities and                      
                              exam dates                          

              16 Flashcard    Manual or                 M                P2
                 Generator    AI-assisted                         
                              question/answer                     
                              cards                               

              17 Typing Speed WPM, accuracy,            M                P1
                 Test         errors and timed                    
                              tests                               
  ---------------------------------------------------------------------------------

### D. Developer tools

  -----------------------------------------------------------------------------------
              \# Tool          Main functionality    Complexity         Priority
  -------------- ------------- ------------------ ----------------- -----------------
              18 API Request   HTTP methods,              L                P1
                 Builder       headers, query,                      
                               body and response                    
                               viewer                               

              19 Regex Tester  Live matches,              S                P0
                               groups, flags and                    
                               examples                             

              20 SQL Formatter SQL beautify,              M                P1
                               minify and syntax                    
                               highlighting                         

              21 JSON to       Interfaces/types           S                P0
                 TypeScript    from nested JSON                     

              22 JWT Decoder   Decode                     S                P0
                               header/payload and                   
                               inspect expiration                   

              23 Cron          Build and explain          S                P1
                 Generator     cron expressions                     

              24 HTML/CSS/JS   Code editor, live          L                P2
                 Playground    preview and HTML                     
                               export                               
  -----------------------------------------------------------------------------------

**Developer-tool security notes:**

-   JWT decoding is not JWT signature verification. State this clearly.
-   Never ask users to paste signing secrets or private API credentials
    into a public tool.
-   API Request Builder should warn users before sending credentials to
    third-party origins.
-   Apply request timeouts, response-size limits and safe error
    handling.
-   A browser-based API client can encounter CORS restrictions. Explain
    this rather than promising every endpoint will work.
-   The code playground should isolate previews in a sandboxed iframe
    and avoid executing user code in the main application context.

### E. PDF and image tools

  --------------------------------------------------------------------------------
              \# Tool         Main                Complexity         Priority
                              functionality                      
  -------------- ------------ ---------------- ----------------- -----------------
              25 PDF Compare  Compare                  L                P2
                              extracted text                     
                              from two PDFs                      

              26 Background   Remove image             L                P2
                 Remover      background and                     
                              export                             
                              transparent PNG                    

              27 Bulk Image   Compress                 M                P1
                 Compressor   multiple images                    
                              and control                        
                              output                             
                              format/size                        

              28 PDF Signer   Place a                  M                P1
                              drawn/uploaded                     
                              signature on a                     
                              PDF                                

              29 Image to     Extract text             M                P1
                 Text (OCR)   from images and                    
                              scanned                            
                              documents                          
  --------------------------------------------------------------------------------

**File-tool notes:**

-   Set file-size and page-count limits.
-   Show progress for longer tasks.
-   Keep original files unchanged.
-   Provide clear download and failure states.
-   Tell users whether processing happens locally or through an external
    service.
-   Do not claim a digital signature is legally certified when the tool
    only places a signature image on a PDF.
-   Background removal may require a model download or external API;
    disclose performance and privacy implications.

### F. Unique tools

  --------------------------------------------------------------------------------
              \# Tool         Main                Complexity         Priority
                              functionality                      
  -------------- ------------ ---------------- ----------------- -----------------
              30 QR Menu      Create a menu            M                P1
                 Generator    page and QR code                   

              31 WhatsApp     Click-to-chat            S                P0
                 Link         URL with                           
                 Generator    prefilled text                     

              32 Email        Responsive HTML          M                P1
                 Signature    signature and                      
                 Generator    copy/export                        

              33 UPI QR       Create payment           S                P0
                 Generator    QR from                            
                              validated UPI                      
                              details                            

              34 Image Color  Dominant colors,         S                P1
                 Extractor    HEX and RGB                        
                              values                             

              35 Website      Desktop/mobile           L                P2
                 Screenshot   screenshot                         
                 Tool         capture                            

              36 Website      Check URL                M                P2
                 Uptime       availability                       
                 Checker      with a                             
                              server-side                        
                              service                            

              37 Temporary    Shareable notes          L                P2
                 Notes        with expiry and                    
                              optional                           
                              password                           

              38 Bulk File    Rename selected          S                P1
                 Renamer      local files                        
                              using patterns                     

              39 Meeting Cost Cost based on            S                P1
                 Calculator   participant                        
                              count, duration                    
                              and hourly rates                   

              40 Website SEO  Title,                   M                P2
                 Analyzer     description,                       
                              headings and                       
                              basic page                         
                              checks                             

              41 Privacy      Editable policy          M                P2
                 Policy       draft based on                     
                 Generator    business inputs                    
  --------------------------------------------------------------------------------

**Additional notes:**

-   UPI QR codes should encode user-provided payment details. Do not
    imply that a QR code confirms payment.
-   Website screenshot and SEO tools may require a server-side browser
    because of browser security restrictions.
-   Uptime checks should run through a controlled backend to avoid
    exposing the user's browser to arbitrary requests.
-   Temporary Notes require expiry enforcement, abuse prevention and
    careful handling of shared content.
-   Generated privacy policies are starting drafts, not legal advice.

------------------------------------------------------------------------

## 5. Recommended First Release

Do not launch all 41 tools together. Start with a focused collection of
12 tools that covers several audiences and is realistic to build and
test.

### Release 1 --- Core utility collection

  ------------------------------------------------------------------------
                         Order Tool                  Reason
  ---------------------------- --------------------- ---------------------
                             1 GST Calculator        High practical value
                                                     for Indian users

                             2 EMI Calculator        Clear, frequently
                                                     searched use case

                             3 Attendance Calculator Useful to students

                             4 CGPA/GPA Calculator   Useful to students

                             5 Split Bill Calculator Simple everyday
                                                     utility

                             6 WhatsApp Link         Quick and shareable
                               Generator             

                             7 UPI QR Generator      Useful for
                                                     individuals and
                                                     merchants

                             8 Profit Margin         Useful for sellers
                               Calculator            and small businesses

                             9 Regex Tester          Useful to developers

                            10 JSON to TypeScript    Useful to developers

                            11 JWT Decoder           Useful to developers

                            12 Invoice Generator     Strong business
                                                     utility; test
                                                     carefully
  ------------------------------------------------------------------------

### Definition of done for Release 1

A tool is not complete merely because its main calculation works. Every
tool should have:

-   Responsive desktop, tablet and mobile layouts.
-   Input validation and useful error messages.
-   Clear labels, examples and sensible defaults.
-   Reset/clear action where applicable.
-   Copy, download or share action where relevant.
-   Empty, loading, success and error states.
-   Keyboard accessibility and visible focus states.
-   Correct calculations covered by test cases.
-   A dedicated page title, description and canonical URL.
-   Related-tool links.
-   No console errors or broken navigation.
-   Privacy information where user data or files are processed.

------------------------------------------------------------------------

## 6. 12-Week Development Roadmap

This roadmap assumes one primary developer and a manageable scope.
Adjust dates based on available time and testing capacity.

### Phase 0 --- Audit and foundation (Week 1)

**Goal:** Prepare Klique for a consistent expansion.

Tasks:

-   [x] Audit existing routes and tool components.
-   [x] List existing tools and avoid duplicate functionality.
-   [x] Review mobile responsiveness and performance.
-   [x] Define category names and URL conventions.
-   [x] Create reusable tool page layout.
-   [x] Create shared input, select, textarea and result components.
-   [x] Create reusable copy, download, reset and share actions.
-   [x] Add consistent validation and notification patterns.
-   [x] Define analytics events without collecting sensitive input
    values.
-   [x] Create a simple tool registry for search and category listings.

**Deliverable:** Reusable tool foundation and approved backlog.

### Phase 1 --- Quick utility launch (Weeks 2--3)

**Goal:** Publish simple, high-value tools.

-   [x] GST Calculator
-   [x] EMI Calculator
-   [x] Attendance Calculator
-   [x] CGPA/GPA Calculator
-   [x] Split Bill Calculator
-   [x] WhatsApp Link Generator
-   [x] Profit Margin Calculator

**Deliverable:** Seven tested tools with individual landing pages.

### Phase 2 --- Developer utilities (Weeks 4--5)

**Goal:** Add useful developer-facing tools.

-   [x] Regex Tester
-   [x] JSON to TypeScript
-   [x] JWT Decoder
-   [x] SQL Formatter
-   [x] Cron Generator
-   [x] Add example inputs and copy actions.
-   [x] Test large JSON and invalid input handling.

**Deliverable:** Developer Tools category.

### Phase 3 --- Business workflows (Weeks 6--7)

**Goal:** Support freelancers and small businesses.

-   [x] Invoice Generator
-   [x] Quotation Generator
-   [x] Salary Calculator
-   [x] UPI QR Generator
-   [x] Email Signature Generator
-   [x] Test PDF output, tax rounding and print layout.
-   [x] Add editable business profile defaults where appropriate.

**Deliverable:** Business & Finance category.

### Phase 4 --- Productivity and file tools (Weeks 8--9)

**Goal:** Add repeat-use and document utilities.

-   [x] Pomodoro Timer
-   [x] Event Countdown
-   [x] Subscription Tracker
-   [x] Bulk Image Compressor
-   [x] PDF Signer
-   [x] Image to Text (OCR)

**Deliverable:** Productivity and File Utilities expansion.

### Phase 5 --- Advanced tools (Weeks 10--11)

**Goal:** Validate demand before building expensive features.

Choose one or two based on actual usage:

-   [x] API Request Builder
-   [x] PDF Compare
-   [x] Background Remover
-   [x] Website Screenshot Tool
-   [x] Website SEO Analyzer
-   [x] Temporary Notes

**Deliverable:** One or two advanced tools with a documented technical
and cost model.

### Phase 6 --- Quality, SEO and launch (Week 12)

-   [x] Run full regression testing.
-   [x] Test on Chrome, Edge and Firefox.
-   [x] Test common mobile screen sizes.
-   [x] Check keyboard accessibility.
-   [x] Optimize images, bundles and lazy loading.
-   [x] Validate metadata, sitemap and robots.txt.
-   [x] Add structured data where appropriate.
-   [x] Add analytics for tool views and successful completions.
-   [x] Review error rates and performance.
-   [x] Publish a release announcement.

**Deliverable:** Stable expansion release.

------------------------------------------------------------------------

## 7. Technical Architecture

### Recommended stack

Continue using the existing React, Vite and Tailwind stack unless the
current application has a concrete limitation.

  Layer                           Recommendation
  ------------------------------- ---------------------------------
  Frontend                        React + Vite
  Styling                         Tailwind CSS
  Animation                       Framer Motion, used selectively
  Icons                           Lucide React
  Routing                         React Router
  Charts                          Chart.js
  Local preferences               localStorage
  Larger local data               IndexedDB
  PDF editing/generation          pdf-lib
  PDF rendering/text extraction   PDF.js
  Excel                           SheetJS (`xlsx`)
  CSV                             PapaParse
  QR codes                        `qrcode`
  Image compression               browser-image-compression
  OCR                             Tesseract.js
  Dates                           date-fns
  API requests                    Axios or Fetch
  Testing                         Vitest + React Testing Library
  Browser testing                 Playwright

Confirm package maintenance, licensing, bundle size and browser
compatibility before adopting a library.

### Suggested project structure

``` text
src/
├── app/
│   ├── App.jsx
│   ├── router.jsx
│   └── providers/
├── components/
│   ├── layout/
│   ├── navigation/
│   ├── search/
│   ├── tool-ui/
│   │   ├── ToolLayout.jsx
│   │   ├── ToolHeader.jsx
│   │   ├── ToolActions.jsx
│   │   ├── CopyButton.jsx
│   │   ├── DownloadButton.jsx
│   │   └── ResultPanel.jsx
│   └── common/
├── data/
│   ├── tools.js
│   └── categories.js
├── features/
│   ├── business/
│   │   ├── gst-calculator/
│   │   ├── emi-calculator/
│   │   ├── invoice-generator/
│   │   └── profit-margin/
│   ├── student/
│   ├── productivity/
│   ├── developer/
│   ├── files/
│   └── qr/
├── hooks/
├── lib/
│   ├── calculations/
│   ├── formatters/
│   ├── validators/
│   └── storage/
├── services/
├── styles/
└── utils/
```

### Tool registry

Use one central registry to power category pages, search, popular tools,
related tools and sitemap generation.

Example:

``` js
export const tools = [
  // Existing tools
  {
    id: "ai-writer",
    name: "AI Writer",
    slug: "/aiwriter",
    category: "AI Tools",
    description: "Paraphrase and rewrite text with AI assistance.",
    tags: ["ai", "paraphrase", "rewrite", "writing"],
    status: "active",
    featured: true,
    complexity: "medium"
  },
  {
    id: "fancy-fonts",
    name: "Fancy Fonts",
    slug: "/fontgenerator",
    category: "Text & Writing",
    description: "Generate stylish text fonts for social media.",
    tags: ["fonts", "stylish", "text", "writing"],
    status: "active",
    featured: false,
    complexity: "small"
  },
  {
    id: "username-generator",
    name: "Username Generator",
    slug: "/username",
    category: "Text & Writing",
    description: "Generate unique usernames.",
    tags: ["username", "generator", "social"],
    status: "active",
    featured: false,
    complexity: "small"
  },
  {
    id: "word-counter",
    name: "Word Counter",
    slug: "/wordcounter",
    category: "Text & Writing",
    description: "Count words and characters in text.",
    tags: ["word", "count", "text", "writing"],
    status: "active",
    featured: false,
    complexity: "small"
  },
  {
    id: "hashtag-generator",
    name: "Hashtag Generator",
    slug: "/hashtaggenerator",
    category: "Text & Writing",
    description: "Generate social media hashtags.",
    tags: ["hashtag", "social", "marketing"],
    status: "active",
    featured: false,
    complexity: "small"
  },
  {
    id: "cool-symbol",
    name: "Cool Symbol",
    slug: "/symbol",
    category: "Text & Writing",
    description: "Copy special characters and symbols.",
    tags: ["symbol", "special-characters", "text"],
    status: "active",
    featured: false,
    complexity: "small"
  },
  {
    id: "emoji-generator",
    name: "Emoji Generator",
    slug: "/emojigenerator",
    category: "Text & Writing",
    description: "Copy and use emojis.",
    tags: ["emoji", "copy", "text"],
    status: "active",
    featured: false,
    complexity: "small"
  },
  {
    id: "bio-generator",
    name: "Bio Generator",
    slug: "/bio",
    category: "Text & Writing",
    description: "Generate social media bios.",
    tags: ["bio", "social", "profile"],
    status: "active",
    featured: false,
    complexity: "small"
  },
  {
    id: "time-zone-converter",
    name: "Time Zone Converter",
    slug: "/timezone",
    category: "Productivity",
    description: "Convert between time zones.",
    tags: ["time", "zone", "converter", "productivity"],
    status: "active",
    featured: false,
    complexity: "small"
  },
  {
    id: "json-formatter",
    name: "JSON Formatter",
    slug: "/jsonformatter",
    category: "Developer Tools",
    description: "Format and validate JSON.",
    tags: ["json", "format", "developer", "validation"],
    status: "active",
    featured: false,
    complexity: "small"
  },
  {
    id: "secret-scanner",
    name: "Secret Scanner",
    slug: "/secretscanner",
    category: "Developer Tools",
    description: "Scan for exposed secrets and API keys.",
    tags: ["secret", "scan", "security", "developer"],
    status: "active",
    featured: false,
    complexity: "small"
  },
  {
    id: "code-to-image",
    name: "Code to Image",
    slug: "/codeimage",
    category: "Developer Tools",
    description: "Convert code snippets to shareable images.",
    tags: ["code", "image", "developer"],
    status: "active",
    featured: false,
    complexity: "small"
  },
  {
    id: "pdf-tools",
    name: "PDF Tools",
    slug: "/convert",
    category: "Image & PDF",
    description: "Convert and manipulate PDF files.",
    tags: ["pdf", "convert", "file"],
    status: "active",
    featured: false,
    complexity: "medium"
  },
  {
    id: "svg-converter",
    name: "SVG Converter",
    slug: "/svgconverter",
    category: "Image & PDF",
    description: "Convert SVG files.",
    tags: ["svg", "convert", "image"],
    status: "active",
    featured: false,
    complexity: "small"
  },
  {
    id: "favicon-generator",
    name: "Favicon Generator",
    slug: "/favicongenerator",
    category: "Image & PDF",
    description: "Generate favicon icons.",
    tags: ["favicon", "icon", "image"],
    status: "active",
    featured: false,
    complexity: "small"
  },
  {
    id: "image-tools",
    name: "Image Tools",
    slug: "/imageoptimizer",
    category: "Image & PDF",
    description: "Optimize and compress images.",
    tags: ["image", "compress", "optimize"],
    status: "active",
    featured: false,
    complexity: "medium"
  },
  {
    id: "qr-link-tools",
    name: "QR & Link Tools",
    slug: "/qrlinktools",
    category: "QR & Web",
    description: "Generate QR codes and short links.",
    tags: ["qr", "code", "link", "web"],
    status: "active",
    featured: false,
    complexity: "medium"
  },
  {
    id: "og-previewer",
    name: "Social OG Previewer",
    slug: "/ogpreviewer",
    category: "QR & Web",
    description: "Preview Open Graph social media cards.",
    tags: ["og", "preview", "social", "web"],
    status: "active",
    featured: false,
    complexity: "medium"
  },
  {
    id: "file-encryption",
    name: "File Encryption",
    slug: "/fileencryption",
    category: "File Utilities",
    description: "Encrypt files client-side.",
    tags: ["file", "encryption", "security", "utility"],
    status: "active",
    featured: false,
    complexity: "medium"
  },
  // Planned first-release tools (not yet built)
  {
    id: "gst-calculator",
    name: "GST Calculator",
    slug: "/tools/gst-calculator",
    category: "Business & Finance",
    description: "Calculate GST-inclusive and GST-exclusive prices.",
    tags: ["gst", "tax", "india", "business"],
    status: "planned",
    featured: true,
    complexity: "small"
  },
  {
    id: "emi-calculator",
    name: "EMI Calculator",
    slug: "/tools/emi-calculator",
    category: "Business & Finance",
    description: "Calculate monthly loan payments and total interest.",
    tags: ["emi", "loan", "interest", "finance"],
    status: "planned",
    featured: true,
    complexity: "small"
  }
];
```

Keep the registry as metadata only. Tool implementation should remain in
individual feature modules.

------------------------------------------------------------------------

## 8. Data and Privacy Strategy

### Prefer local-first tools

These tools should normally process information locally:

-   GST, EMI, attendance and CGPA calculations.
-   Split bill and profit calculations.
-   Regex, JSON, SQL and JWT decoding.
-   Image compression and color extraction.
-   PDF operations when browser libraries support the task.
-   Personal preferences and favorites.
-   Local expense or habit data, unless cloud sync is explicitly
    introduced.

### Backend-dependent tools

Some features need a backend or external service:

-   AI generation and summarization.
-   Website screenshots.
-   Website uptime checks.
-   Server-side SEO analysis.
-   Shareable temporary notes.
-   Background removal if using hosted inference.
-   Cloud synchronization and account-based history.

### Privacy checklist

-   [x] Explain whether processing is local or remote.
-   [x] Never put secret API keys in frontend code.
-   [x] Do not log document contents, passwords, JWTs or financial
    inputs.
-   [x] Use HTTPS.
-   [x] Validate uploads and request sizes.
-   [x] Add rate limits to public backend endpoints.
-   [x] Define data retention and deletion rules for stored content.
-   [x] Avoid collecting personal data that is not necessary.
-   [x] Provide a clear privacy policy and contact route.
-   [x] Use explicit consent before uploading sensitive content to
    external services.

------------------------------------------------------------------------

## 9. UI/UX Design System

Keep Klique's existing visual identity and improve consistency rather
than redesigning every tool independently.

### Shared tool page structure

1.  Breadcrumb navigation.
2.  Tool title and concise description.
3.  Main tool workspace.
4.  Input and output areas.
5.  Primary action.
6.  Secondary actions: copy, download, reset, share.
7.  Example or preset section.
8.  Short usage instructions.
9.  FAQ section.
10. Related tools.

### Design principles

-   Use the same spacing scale across tools.
-   Keep labels and input heights consistent.
-   Use clear visual hierarchy and restrained gradients.
-   Avoid excessive glassmorphism on data-heavy screens.
-   Use subtle Framer Motion transitions, not animations that slow down
    work.
-   Keep the main action visually obvious.
-   Design mobile layouts intentionally rather than shrinking desktop
    panels.
-   Provide accessible contrast and keyboard navigation.
-   Make long results scrollable without hiding primary actions.

### Reusable UI components

-   `ToolLayout`
-   `ToolHeader`
-   `ToolBreadcrumb`
-   `ToolSearch`
-   `ToolInput`
-   `ToolSelect`
-   `ToolTextarea`
-   `ToolDropzone`
-   `ToolResult`
-   `ToolActions`
-   `CopyButton`
-   `DownloadButton`
-   `ResetButton`
-   `ExampleCard`
-   `RelatedTools`
-   `ToolFAQ`

------------------------------------------------------------------------

## 10. Search, SEO and Discovery

Each tool should have a dedicated URL and useful content. Avoid
publishing empty pages containing only an input field.

### On-page SEO checklist

-   Unique page title.
-   Unique meta description.
-   One clear H1.
-   Descriptive headings.
-   Helpful introduction and instructions.
-   Examples and formulas where relevant.
-   FAQ content based on genuine user questions.
-   Canonical URL.
-   Open Graph metadata.
-   Internal links to related tools.
-   Sitemap inclusion.
-   Fast loading and mobile usability.

### Search experience

The global search should search:

-   Tool name.
-   Category.
-   Description.
-   Synonyms and tags.
-   Common problem phrases.

Examples:

  User searches                          Suggested result
  -------------------------------------- -------------------------
  "calculate tax"                        GST Calculator
  "how many classes can I miss"          Attendance Calculator
  "loan monthly payment"                 EMI Calculator
  "convert JSON to interface"            JSON to TypeScript
  "send message without saving number"   WhatsApp Link Generator
  "split restaurant bill"                Split Bill Calculator

Track search terms in aggregate. Do not store sensitive user-entered
values.

------------------------------------------------------------------------

## 11. Analytics and Success Metrics

Measure whether tools actually help users. Page views alone are not
enough.

### Recommended events

  Event             Meaning
  ----------------- ----------------------------------
  `tool_view`       Tool page opened
  `tool_start`      User begins interacting
  `tool_complete`   Main task successfully completed
  `tool_copy`       Result copied
  `tool_download`   File downloaded
  `tool_reset`      Tool reset
  `tool_error`      Tool failed
  `tool_search`     Search performed
  `favorite_add`    Tool bookmarked

Do not send raw financial amounts, document text, passwords, JWTs, API
keys or other sensitive values to analytics.

### Key metrics

-   Tool page visits.
-   Successful completion rate.
-   Search-to-tool click rate.
-   Returning users.
-   Favorites per active user.
-   Tool error rate.
-   Page load performance.
-   Organic search impressions and clicks.
-   Percentage of users who use a second tool in the same session.

### Initial targets

These are planning targets, not guaranteed outcomes:

-   No critical calculation defects at launch.
-   No known high-severity security issues.
-   At least 95% successful completion on tested happy-path cases.
-   All first-release tools usable on common mobile widths.
-   No major increase in JavaScript errors after release.
-   Establish a baseline for returning users and organic traffic before
    setting growth targets.

------------------------------------------------------------------------

## 12. Monetization Options

Do not add intrusive advertising before Klique has a useful audience and
a good user experience.

Potential future models:

1.  **Free core tools:** Keep basic calculations and utilities free.
2.  **Pro features:** Saved templates, bulk processing, larger file
    limits and workflow history.
3.  **AI credits:** Charge for expensive AI or hosted processing
    features.
4.  **Business packs:** Invoice templates, quotation templates and
    reusable business profiles.
5.  **Team workspace:** Shared tools and templates for small teams.
6.  **Non-intrusive advertising:** Consider only after validating
    traffic and user experience.

### Suggested free/pro boundary

  Feature                           Free                 Potential Pro
  --------------------------------- -------------------- ----------------------------
  GST/EMI/attendance calculations   Yes                  Advanced history/export
  Basic invoice creation            Yes                  Saved branding/templates
  Image compression                 Limited batch size   Larger batches
  AI tools                          Limited usage        Higher usage allowance
  Favorites                         Local                Cross-device sync
  Workflows                         Basic                Multi-step saved workflows

Avoid putting essential accessibility, privacy or basic functionality
behind a paywall.

------------------------------------------------------------------------

## 13. Testing Strategy

### Calculation tests

Use known input/output examples and boundary values.

Examples:

-   GST: inclusive and exclusive amounts.
-   EMI: zero interest, short tenure, large principal and rounding.
-   Attendance: exactly at target, below target and above target.
-   CGPA: different credit weights and custom grading scales.
-   Profit margin: zero cost, zero selling price and loss scenarios.
-   Split bill: uneven shares and rounding remainder.

### File tests

-   Empty file.
-   Unsupported file type.
-   Oversized file.
-   Corrupt PDF/image.
-   Multiple uploads.
-   Large image dimensions.
-   Downloaded file opens correctly.
-   Cancelled processing.
-   Browser refresh during a task.

### Responsive tests

Test at minimum:

-   360 × 800
-   390 × 844
-   768 × 1024
-   1024 × 768
-   1366 × 768
-   1920 × 1080

Also test keyboard-only navigation and browser zoom.

------------------------------------------------------------------------

## 14. Risks and Mitigations

  -----------------------------------------------------------------------
  Risk                                Mitigation
  ----------------------------------- -----------------------------------
  Too many low-quality tools          Launch in small batches and measure
                                      usage

  Large JavaScript bundle             Lazy-load individual tools and
                                      heavy libraries

  Expensive AI/API features           Add quotas, caching and usage
                                      limits

  Browser CORS restrictions           Explain limitations or use a
                                      controlled backend

  Sensitive file uploads              Prefer local processing and
                                      disclose remote processing

  Incorrect financial calculations    Unit tests, explicit assumptions
                                      and rounding rules

  SEO pages with little value         Include instructions, examples and
                                      FAQs

  Inconsistent UI                     Shared components and design tokens

  Abuse of public endpoints           Rate limiting, validation and
                                      monitoring

  Stale or misleading information     Add last-reviewed dates where rules
                                      or rates change
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 15. First 14-Day Action Plan

This is the recommended immediate execution plan.

### Days 1--2: Foundation

-   [x] Audit the current Klique website and existing tools.
-   [x] Finalize first-release scope.
-   [x] Create the tool registry.
-   [x] Create shared tool layout and action components.
-   [x] Define route and metadata conventions.

### Days 3--4: First calculators

-   [x] GST Calculator.
-   [x] EMI Calculator.
-   [x] Profit Margin Calculator.
-   [x] Write unit tests for calculation functions.

### Days 5--6: Student tools

-   [x] Attendance Calculator.
-   [x] CGPA/GPA Calculator.
-   [x] Add examples and explanatory formulas.

### Days 7--8: Everyday utilities

-   [x] Split Bill Calculator.
-   [x] WhatsApp Link Generator.
-   [x] UPI QR Generator.

### Days 9--10: Developer tools

-   [x] Regex Tester.
-   [x] JSON to TypeScript.
-   [x] JWT Decoder.

### Days 11--12: Quality and integration

-   [x] Connect all tools to search and categories.
-   [x] Add favorites and recently used tools.
-   [x] Add related-tool links.
-   [x] Test mobile layouts and keyboard accessibility.

### Days 13--14: Release preparation

-   [x] Review SEO metadata and sitemap.
-   [x] Run calculation and regression tests.
-   [x] Check performance and console errors.
-   [x] Publish the first expansion.
-   [x] Record baseline analytics.

**Scope adjustment:** The Invoice Generator is valuable but should be
treated as a separate, carefully tested milestone if the 14-day schedule
becomes too tight.

------------------------------------------------------------------------

## 16. Backlog Prioritization Framework

Before starting any new tool, score it using these criteria:

  Criterion                                         Score
  ----------------------------------------------- -------
  User problem is frequent and clear                 1--5
  Likely search demand                               1--5
  Fits Klique's target audiences                     1--5
  Can be built reliably                              1--5
  Encourages repeat usage or related-tool usage      1--5

Then estimate effort:

-   Small: up to 1--2 focused development days.
-   Medium: around 3--5 focused development days.
-   Large: more than 5 days or requires significant
    backend/infrastructure work.

A high score does not automatically mean "build now." Consider security,
maintenance, third-party API costs and support burden.

------------------------------------------------------------------------

## 17. Final Recommendations

### Build now

1.  GST Calculator.
2.  EMI Calculator.
3.  Attendance Calculator.
4.  CGPA/GPA Calculator.
5.  Split Bill Calculator.
6.  WhatsApp Link Generator.
7.  UPI QR Generator.
8.  Profit Margin Calculator.
9.  Regex Tester.
10. JSON to TypeScript.
11. JWT Decoder.

### Build after validating the first release

1.  Invoice Generator.
2.  Quotation Generator.
3.  Subscription Tracker.
4.  Personal Expense Tracker.
5.  API Request Builder.
6.  Bulk Image Compressor.
7.  OCR Tool.
8.  PDF Signer.

### Validate before investing heavily

1.  Background Remover.
2.  Website Screenshot Tool.
3.  Website SEO Analyzer.
4.  PDF Compare.
5.  Temporary Notes.
6.  HTML/CSS/JS Playground.

### The most important product decision

Klique should not compete only on the number of tools. It should compete
on **how quickly and reliably a person can finish a real task**.

Start with a focused release, make every tool excellent, measure actual
usage, and let user demand determine the next batch.

------------------------------------------------------------------------

## 18. Launch Checklist

### Product

-   [x] First-release tools finalized.
-   [x] Every tool solves a clearly described problem.
-   [x] Tool descriptions and examples reviewed.
-   [x] Related tools configured.
-   [x] Search and category navigation work.

### Engineering

-   [x] Shared components reused.
-   [x] Heavy tools lazy-loaded.
-   [x] No secrets exposed in frontend code.
-   [x] Input validation implemented.
-   [x] Unit and integration tests pass.
-   [x] Error states and file limits implemented.

### Design and accessibility

-   [x] Desktop layout checked.
-   [x] Mobile layout checked.
-   [x] Keyboard navigation checked.
-   [x] Contrast and focus states checked.
-   [x] Loading and empty states checked.

### SEO and analytics

-   [x] Page titles and descriptions set.
-   [x] Canonical URLs configured.
-   [x] Sitemap updated.
-   [x] Internal links added.
-   [x] Analytics events verified without sensitive payloads.

### Operations

-   [x] Privacy policy reviewed.
-   [x] Third-party service costs reviewed.
-   [x] Rate limits configured where needed.
-   [x] Error monitoring enabled.
-   [x] Rollback plan prepared.
-   [x] Release notes published.

------------------------------------------------------------------------

**Document owner:** Klique product development\
**Next review:** After the first release has enough real usage data to
compare tool completion, repeat usage, errors and search demand.
