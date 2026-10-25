/* ============================================================================
   CARDIOPOLY — Satirical Cardiology Monopoly Game
   ============================================================================
   All key game & bot behavior parameters are hardcoded as UPPERCASE constants
   at the very top of this script so they can be easily adjusted later.
   ============================================================================ */

// --- BOT BEHAVIOR & AUCTION CONSTANTS ---
const PROBABILITY_OF_TRADE_CREATE = 0.05;          // Per roll of dice chance a bot initiates a trade
const PROBABILITY_OF_TRADE_ACCEPT = 0.5;           // Probability a bot accepts a trade offer received
const PROBABILITY_OF_PROP_PURCHASE = 0.5;          // Probability a bot buys an unowned property it lands on
const PROB_ACCEPT_PROP_AUCTION_PER_SECOND = 0.10;  // Per-second probability each bot buys during an auction (doubled to 0.10)
const AUCTION_DURATION = 10;                       // Seconds for auction counter to run from start price to max price
const AUCTION_MAX_PRICE = 1000;                    // Maximum WP price when bidding stops & original lander gets assigned it

// --- TOKEN MOVEMENT SPEED CONSTANTS (Milliseconds per sequential tile hop) ---
const USER_TOKEN_STEP_MS = 1400;                   // Slow movement for user token to allow reading property names in close-up
const BOT_TOKEN_STEP_MS = 105;                     // Faster movement for the 3 bot tokens

// --- BOT TURN PACING CONSTANTS ---
const BOT_PRE_ROLL_DELAY_MS = 550;                 // Pause before a bot taps the dice box to roll
const BOT_POST_TURN_DELAY_MS = 650;                // Pause after a bot finishes its turn actions
const SPLASH_DURATION_MS = 4200;                   // Splash screen display time (3x longer / 1/3 progress bar speed)

// --- BACKEND DICE CONTROL CONSTANTS ---
const PROBABILITY_OF_CARD_TILE_ROLL = 0.10;        // 10% chance roll lands on the first Chance/Community chest tile within 12 steps
const DEFAULT_DICE_CONTROL_MODE = "DIRECTOR";      // Backend roll control mode
const SCRIPTED_DICE_QUEUE = [];                    // Optional array of [die1, die2] pairs, e.g. [[3,4], [2,5]]

// --- INITIAL PLAYER PHYSIOLOGICAL & WASTE METRICS ---
const INITIAL_SBP = 120;                           // Starting Systolic Blood Pressure (mmHg)
const INITIAL_BMI = 24.0;                          // Starting Body Mass Index (kg/m²)
const INITIAL_WP = 0;                              // Starting Waste Points (WP)

// --- CLINICAL / BILLING IMPACT CONSTANTS ---
const BASE_PROPERTY_PRICE_WP = 400;                // Default base price tag in Waste Points (WP)
const PURCHASE_SBP_INCREASE = 2;                   // SBP rise when acquiring a hospital property
const PURCHASE_BMI_INCREASE = 0.4;                 // BMI rise when celebrating a new department acquisition
const OWNED_PROPERTY_VISIT_WP = 100;               // Waste points added when landing on a property owned by another player
const RENT_SBP_INCREASE = 4;                       // SBP spike when billed by a rival's department
const RENT_BMI_INCREASE = 0.5;                     // BMI uptick from stress-eating in rival unit
const PASS_GO_WP_ADDED = 200;                      // WP added when completing a full hospital circuit (routine defensive labs)
const PASS_GO_SBP_ADDED = 2;                       // SBP change on passing GO
const PASS_GO_BMI_ADDED = 0.3;                     // BMI change on passing GO (cafeteria donuts)

// --- CLINICAL MILESTONES DATA (Hardcoded from Milestones.csv) ---
// Each milestone triggers individually per player (Scope: Individual)
// Terminal milestones with Significance == "GameEnds" conclude the game.
const FALLBACK_MILESTONES_CSV = `Metric,Cutoff,Scope,Significance,Text,SBP,BMI,WP
WP,3500,Individual,GameOn,"At 3,500 points, X wins the annual waste award and hospital management decides to hold a party.",2,2,200
BMI,35,Individual,GameOn,New record set for BMI: X now exceeds 35 and the hospital gives out free burritos to celebrate. ,2,2,200
SBP,150,Individual,GameOn,X reaches a new all-time-high systolic blood pressure and celebrates with a high-sodium meal in the cafeteria. Well done!,2,2,200
WP,4500,Individual,GameOn,"At 4,000 the current waste trajectory exceeds all expectatons – well done X – free donuts!",2,2,200
BMI,40,Individual,GameOn,Well done X on attaining morbid obesity status – next stop Burger King!,2,2,200
SBP,165,Individual,GameOn,Blood pressure is now so high for X that the doctor restricts this player from exercise! Double whammy! ,2,2,200
WP,5500,Individual,GameOn,"Waste reaches a new all-time high for X at > 5,500 points – such a champion! ",2,2,200
BMI,50,Individual,GameOn,X now meets WHO criteria for super obesity – keep dialing up that CPAP pressure! ,2,2,200
SBP,180,Individual,GameOn,"With BP now exceeding 180 mmHg, the whites of the eyes are a pulsating pink color! Well done X!",2,2,200
WP,6500,Individual,GameOn,"This year’s waste award goes to X for attaining a new milestone of 6,500 points – not bad! ",2,2,200
BMI,60,Individual,GameOn,X reaches an astonishing level of obesity at a BMI of 60 kg/m2 – the sky is the limit! ,2,2,200
SBP,200,Individual,GameEnds,X wins the game by finally crossing the finish line at a SBP exceeding 200 mmHg – a true champion! Time to celebrate with chips and soda! ,2,2,200
WP,10000,Individual,GameEnds,X wins the game by finally crossing the finish line at 10k waste points – a true champion! Time to celebrate – fancy another stent?,2,2,200
BMI,70,Individual,GameEnds,X wins the game by reaching the final milestone at a BMI of 70 – a new all-time high for the hospital and a huge accomplishment. Time to celebrate with a redo gastric bypass?,2,2,200`;

const MILESTONES_DATA = [
  {
    id: "WP_3500",
    metric: "WP",
    cutoff: 3500,
    scope: "Individual",
    significance: "GameOn",
    text: "At 3,500 points, X wins the annual waste award and hospital management decides to hold a party.",
    sbp: 2,
    bmi: 2,
    wp: 200
  },
  {
    id: "BMI_35",
    metric: "BMI",
    cutoff: 35,
    scope: "Individual",
    significance: "GameOn",
    text: "New record set for BMI: X now exceeds 35 and the hospital gives out free burritos to celebrate.",
    sbp: 2,
    bmi: 2,
    wp: 200
  },
  {
    id: "SBP_150",
    metric: "SBP",
    cutoff: 150,
    scope: "Individual",
    significance: "GameOn",
    text: "X reaches a new all-time-high systolic blood pressure and celebrates with a high-sodium meal in the cafeteria. Well done!",
    sbp: 2,
    bmi: 2,
    wp: 200
  },
  {
    id: "WP_4500",
    metric: "WP",
    cutoff: 4500,
    scope: "Individual",
    significance: "GameOn",
    text: "At 4,000 the current waste trajectory exceeds all expectatons – well done X – free donuts!",
    sbp: 2,
    bmi: 2,
    wp: 200
  },
  {
    id: "BMI_40",
    metric: "BMI",
    cutoff: 40,
    scope: "Individual",
    significance: "GameOn",
    text: "Well done X on attaining morbid obesity status – next stop Burger King!",
    sbp: 2,
    bmi: 2,
    wp: 200
  },
  {
    id: "SBP_165",
    metric: "SBP",
    cutoff: 165,
    scope: "Individual",
    significance: "GameOn",
    text: "Blood pressure is now so high for X that the doctor restricts this player from exercise! Double whammy!",
    sbp: 2,
    bmi: 2,
    wp: 200
  },
  {
    id: "WP_5500",
    metric: "WP",
    cutoff: 5500,
    scope: "Individual",
    significance: "GameOn",
    text: "Waste reaches a new all-time high for X at > 5,500 points – such a champion!",
    sbp: 2,
    bmi: 2,
    wp: 200
  },
  {
    id: "BMI_50",
    metric: "BMI",
    cutoff: 50,
    scope: "Individual",
    significance: "GameOn",
    text: "X now meets WHO criteria for super obesity – keep dialing up that CPAP pressure!",
    sbp: 2,
    bmi: 2,
    wp: 200
  },
  {
    id: "SBP_180",
    metric: "SBP",
    cutoff: 180,
    scope: "Individual",
    significance: "GameOn",
    text: "With BP now exceeding 180 mmHg, the whites of the eyes are a pulsating pink color! Well done X!",
    sbp: 2,
    bmi: 2,
    wp: 200
  },
  {
    id: "WP_6500",
    metric: "WP",
    cutoff: 6500,
    scope: "Individual",
    significance: "GameOn",
    text: "This year’s waste award goes to X for attaining a new milestone of 6,500 points – not bad!",
    sbp: 2,
    bmi: 2,
    wp: 200
  },
  {
    id: "BMI_60",
    metric: "BMI",
    cutoff: 60,
    scope: "Individual",
    significance: "GameOn",
    text: "X reaches an astonishing level of obesity at a BMI of 60 kg/m2 – the sky is the limit!",
    sbp: 2,
    bmi: 2,
    wp: 200
  },
  {
    id: "SBP_200",
    metric: "SBP",
    cutoff: 200,
    scope: "Individual",
    significance: "GameEnds",
    text: "X wins the game by finally crossing the finish line at a SBP exceeding 200 mmHg – a true champion! Time to celebrate with chips and soda!",
    sbp: 2,
    bmi: 2,
    wp: 200
  },
  {
    id: "WP_10000",
    metric: "WP",
    cutoff: 10000,
    scope: "Individual",
    significance: "GameEnds",
    text: "X wins the game by finally crossing the finish line at 10k waste points – a true champion! Time to celebrate – fancy another stent?",
    sbp: 2,
    bmi: 2,
    wp: 200
  },
  {
    id: "BMI_70",
    metric: "BMI",
    cutoff: 70,
    scope: "Individual",
    significance: "GameEnds",
    text: "X wins the game by reaching the final milestone at a BMI of 70 – a new all-time high for the hospital and a huge accomplishment. Time to celebrate with a redo gastric bypass?",
    sbp: 2,
    bmi: 2,
    wp: 200
  }
];

// ============================================================================
// EMBEDDED CSV FALLBACKS (Used if opened directly via file:// without HTTP)
// Dynamically overridden by fetch('Properties.csv') and fetch('Cards.csv')
// when hosted on GitHub Pages or a local web server.
// ============================================================================
const FALLBACK_PROPERTIES_CSV = `Property,GroupOrder,GroupProperties,GroupName,GroupColor,PropertyName,CorrespondsTo
1,1,2,Clinic,Brown,ECG room,Mediterranean avenue
2,1,2,Clinic,Brown,Consultation room,Baltic avenue
3,2,3,Cardiac rehab,Light blue,Treadmill room,Oriental avenue
4,2,3,Cardiac rehab,Light blue,CPET lab,Vermont avenue
5,2,3,Cardiac rehab,Light blue,6-minute walk test,Connecticut avenue
6,3,3,Observation area,Pink,Troponin cubicle,St. Charles Place
7,3,3,Observation area,Pink,Telemetry bed,States avenue
8,3,3,Observation area,Pink,Syncope surveillance,Virginia avenue
9,4,3,Short-stay unit,Orange,Femoral sandbag space,St. James Place
10,4,3,Short-stay unit,Orange,Radial recovery lounge,Tennessee avenue
11,4,3,Short-stay unit,Orange,Hydration cubicle,New York avenue
12,5,3,Nuclear lab,Red,Diaphragmatic artifact area,Kentucky avenue
13,5,3,Nuclear lab,Red,SPECT gantry,Indiana avenue
14,5,3,Nuclear lab,Red,Attenuation area,Illinois avenue
15,6,3,Echo lab,Yellow,Saline bubble room,Atlantic avenue
16,6,3,Echo lab,Yellow,Diastolic confusion area,Ventnor avenue
17,6,3,Echo lab,Yellow,Cold gel space,Marvin gardens
18,7,3,Cath lab,Green,Full metal jacket room,Pacific avenue
19,7,3,Cath lab,Green,Oculostenotic space,North Carolina avenue
20,7,3,Cath lab,Green,Eyeball area,Pennsylvania avenue
21,8,2,Coronary care unit,Dark blue,Triple-pressor area,Park place
22,8,2,Coronary care unit,Dark blue,Palliative reality room,Boardwalk
23,9,4,ACS pipeline,Transparent,UA area,Reading railroad
24,9,4,ACS pipeline,Transparent,Spasm lounge ,Pennsylvania railroad
25,9,4,ACS pipeline,Transparent,NSTEMI sidetrack,B and O railroad
26,9,4,ACS pipeline,Transparent,STEMI expressway,Short line
27,10,2,Quick-Fix Service,Transparent,Cardioversion Company,Electric company
28,10,2,Quick-Fix Service,Transparent,Lasix Works,Water works`;

const FALLBACK_CARDS_CSV = `CardType,SBP,BMI,WP,Text
Chance,-10,-5,-500,You undergo bariatric surgery. Ouch! Your diabetes goes away and you lose a ton of weight. Sad!
Chance,5,3,400,You run out of Wegovy and immediately put on all the weight you had lost. Success at last! 
Chance,2,1,400,Angiogram finds stable disease in the distal circumflex artery which is stented on sight! Cosmetic triumph!
Chance,3,0,75,You ditch atorvastatin for cinnamon bark capsules after watching a clip on natural remedies in TikTok. So liberating! 
Chance,4,2,0,Your angiogram showed only minor disease and you celebrate with a bucket of extra crispy fried chicken.
Chance,3,0,600,Your neighbor tells you statins are harmful and when you stop that tablet you have a stroke leading to admission for a week. Way to go!
Chance,-5,3,250,You quit smoking (oh no!) but put on a huge amount of weight instead. Keep it coming! 
Chance,5,0.5,500,Your whole-body CT scan shows a 2 mm lung freckle. The panic sends your BP soaring and you suffer a TIA in the process. Well done! 
Chance,0,2,400,Your weight makes you breathless but doctors orders you to have an angiogram just to be safe. Health comes first! 
Chance,3,0,350,Your smartwatch tells you the rhythm is irregular and you end up monitored for 2 days in the telemetry area. Not bad! 
Chance,2,2,350,"Your chest feels uneasy watching a horror movie on Netflix and you call 911, leading to 3 troponins for Movie Panic! "
Chance,3,3,150,You try celery detox but only last 45 minutes before your craving for pizza takes over and you decides to order delivery. Thadda boy! 
Chance,2,3,150,You find walking too much work but your doctor gets you a medically prescribed mobility scooter. Pure relaxation! 
Chance,4,0,400,Your coronary calcium score comes back as 12 and your doctor arranges an urgent cath. Stat! 
Chance,-4,0,-250,You realize that you actually feel better after sleeping with the CPAP machine your doctor recommended. Ouch! 
Chance,4,0,150,Your CPAP machine breaks down but that’s fine you never liked the damn thing much anyway.
Chance,3,0,150,Your wife tells you the CPAP machine you’re using makes her think she has Darth Vader sleeping next to her. Oh no! 
Chance,2,2,400,You discover that vanilla ice cream is the perfect consistency to slip through your gastric bypass. Caloric loophole unlocked! 
Chance,3,2,200,It’s been 6 weeks since your last stent and you celebrate with a 24 oz ribeye and double loaded baked potato. Yummy!
Chance,0,0,300,Your cardiologist needs to amortize the new 3D echo machine and you get booked in for an unnecessary surveillance scan. Just to be safe! 
Chance,3,0.5,350,"You eat two bananas and watch a clip on Instagram warning you of fatal hyperkalemia. After rushing to the ER, you get a hefty bill – but hey better safe than sorry! "
Chance,2,0,150,Doctors office BP is through the roof but you are adamant it’s the stress of finding parking in front – because how are you supposed to walk to the office from the far corners of the parking lot!?
Chance,2,1,150,The medical team tell strict NPO prior to a test but you secretly sneak a jelly donut in the bathroom before starting the procedure. Well done! 
Chance,5,0,600,"Your cardiologist brings up ORBITA trial and you fire them for gaslighting you, and hire an interventionist instead who isn’t afraid of balloons and stents. Finally! "
Chance,2,2,500,Your angiogram has to be postponed because the cath lab team is busy eating free burritos brought by a device rep. It’s worth the wait! 
Chance,3,3,350,"When doctor tells you to exercise, you get a passive foot vibration pad instead that, after seeing on Instagram that it’s better than exercise. Smart move! "
Chance,2,2,400,Your home BP recording machine tells you the rhythm is “irregular”. You panic and end up admitted for telemetry and troponins “just to be safe”. Close call! 
Chance,-5,0,200,You pop 3 nitroglycerins for heartburn after eating a few spicy burritos and your BP collapses – you hit the carpet! 
Chance,2,0,325,Your Holter electrode peels off in the bath. Hospital orders a 30-day wireless telemetry patch to protect revenue! 
Chance,3,3,75,You buy “Heart Smart” oat clusters packed with 42 grams of high-fructose corn syrup. Eating clean!
Chance,5,0,700,You break the strict 6-hour bedrest after a femoral access cath to use the real toilet. Say hello to a grapefruit-sized hematoma! 
Chance,4,0.5,50,You quit smoking by switching to an industrial-strength nicotine vape you bought online. Your BP reaches an all-time high! 
Chance,2,0,800,First doctor suggested lifestyle change – outrageous! Second doctor agrees to insert two drug-eluting stents right away. That’s the spirit! 
Chance,2,3,150,You buy EDTA online which you mix in your coffee to clean out the coros. The hypocalcemia doesn’t kill you but the hospital bill almost does! Oops! 
Community chest,-2,-2,-200,"Generic Ozempic is flowing into the country from Brazil and India – oh no, prices come down! "
Community chest,4,2,300,Lobby groups in Washington circumvents the trans fat ban by calling them “partially hydrogenated oils” – you celebrate with cookies
Community chest,5,1,100,"Hospital kitchen bans fruits and vegetables to cut costs, replacing them with salted ham broth. Arteries clamp shut! "
Community chest,1,0,650,Cath lab procedural volume is down 18% this quarter. Elective diagnostic cath suddenly approved for all patients and indications! 
Community chest,3,1,250,"Pharma rep brings the cath lab 6 dozen gourmet glazed donuts to promote a \$2,000/month lipid drug. Breakfast is served! "
Community chest,4,0,400,Smartwatch firmware update flags normal breathing variation in HR as “arrhythmia” and suddenly patients are lining up outside clinic! 
Community chest,5,1.5,150,Salt lobby in Washington finally manages to block sodium warnings on food. Vascular trees all over America tighten in solidarity! 
Community chest,1,0,750,Annual cardiology meeting agrees to ignore ISCHEMIA trial entirely. Full metal jackets for everyone! 
Community chest,1,1.5,100,New outpatient clinic offers complimentary valet parking 12 feet from the door. Daily steps drop to single digits! 
Community chest,2,0,600,Hospital lab upgrades to the 8th UDMI with femtogram-sensitive troponin assays. Suddenly everyone has myocardial injury! 
Community chest,3,1.5,50,Hospital cafeteria installs bottomless 44 oz fountain soda dispensers and suddenly patients are refusing all fasting blood tests! 
Community chest,-2,0,550,"Generic statin prices drop to \$3 / month but fortunately Big Pharma fights back by launching proprietary injectables at \$2,000 per dose! "
Community chest,-5,-4,1000,Hospital opens a fast-track bariatric surgery center. Everyone’s behavioral metabolic excess is fixed with laparoscopic staplers! 
Community chest,0,0,450,Equipment lease needs extending so an administrative memo mandates routine screening echo for all – in and outpatients! 
Community chest,5,0,225,Pharmacy automated BP cuff reads 178 / 102 after hauling 3 cases of soda. Walk-in clinic reaps the windfall! 
Community chest,3,4,225,Agricultural subsidies make high-fructose corn syrup cheaper than tap water. Snack aisles across the nation overflow! 
Community chest,1,0,500,Hospital risk managers mandate continuous telemetry for all admissions – zero beds left for STEMIs! 
Community chest,-1,-0.5,0,Hospital prints glossy Mediterranean Diet pamphlets and stacks them right next to those yummy deep-fried cafeteria nuggets. Terrible! 
Community chest,3,0,750,Health system launches a door-to-balloon speed competition. Patients are ballooned in 22 min before anyone takes a medical history! 
Community chest,-2,0,-300,"Online supply chain shortage wipes out non-prescription red yeast rice. Patients are forced to take cheap, proven statins. Tragic! "
Community chest,4,2,100,Local burger franchise sponsors the hospital 5k healthy run. Free bacon double cheeseburgers for participants at the finish line! 
Community chest,2,0.5,650,"Utilization committee masters 23-hour observation billing. Mild acid reflux successfully billed \$7,500 in facility fees. "
Community chest,3,1.5,200,Hospital terminates the outpatient cardiac rehab program to finance an executive mahogany boardroom. 
Community chest,2,0,450,Direct-to-consumer TV ads convince the nation that stairs causing breathlessness is a balloon emergency. ER volume explodes! 
Community chest,4,3,200,Local city council repeals restrictions on commercial trans fats. Industrial bakeries celebrate with hydrogenated bliss! 
Community chest,2,0,350,"New consensus finally brings down normal blood pressure to 100 / 60 mmHg, and the whole nation is hypertensive overnight! "
Community chest,3,0,400,CCU fills 100% of its beds with stable stent checks. Critical STEMI and shock cases need to be diverted elsewhere! `;

// ============================================================================
// STANDARD 40-TILE MONOPOLY PERIMETER TEMPLATE
// Maps original Monopoly tile names ("CorrespondsTo") to board indices 0..39
// ============================================================================
const CLASSIC_BOARD_SLOTS = [
  { index: 0,  type: "GO",              name: "GO (ER Triage)",          shortLabel: "GO" },
  { index: 1,  type: "PROPERTY",        correspondsTo: "mediterranean avenue" },
  { index: 2,  type: "COMMUNITY_CHEST", name: "Community Chest",         shortLabel: "CC" },
  { index: 3,  type: "PROPERTY",        correspondsTo: "baltic avenue" },
  { index: 4,  type: "TAX",             name: "Prior Authorization Penalty", shortLabel: "TAX", wp: 300, sbp: 5, bmi: 0.5 },
  { index: 5,  type: "PROPERTY",        correspondsTo: "reading railroad" },
  { index: 6,  type: "PROPERTY",        correspondsTo: "oriental avenue" },
  { index: 7,  type: "CHANCE",          name: "Chance",                  shortLabel: "?" },
  { index: 8,  type: "PROPERTY",        correspondsTo: "vermont avenue" },
  { index: 9,  type: "PROPERTY",        correspondsTo: "connecticut avenue" },
  { index: 10, type: "CORNER",          name: "M&M Peer Review",         shortLabel: "M&M" },
  { index: 11, type: "PROPERTY",        correspondsTo: "st. charles place" },
  { index: 12, type: "PROPERTY",        correspondsTo: "electric company" },
  { index: 13, type: "PROPERTY",        correspondsTo: "states avenue" },
  { index: 14, type: "PROPERTY",        correspondsTo: "virginia avenue" },
  { index: 15, type: "PROPERTY",        correspondsTo: "pennsylvania railroad" },
  { index: 16, type: "PROPERTY",        correspondsTo: "st. james place" },
  { index: 17, type: "COMMUNITY_CHEST", name: "Community Chest",         shortLabel: "CC" },
  { index: 18, type: "PROPERTY",        correspondsTo: "tennessee avenue" },
  { index: 19, type: "PROPERTY",        correspondsTo: "new york avenue" },
  { index: 20, type: "CORNER",          name: "Doctors' Lounge",         shortLabel: "REST" },
  { index: 21, type: "PROPERTY",        correspondsTo: "kentucky avenue" },
  { index: 22, type: "CHANCE",          name: "Chance",                  shortLabel: "?" },
  { index: 23, type: "PROPERTY",        correspondsTo: "indiana avenue" },
  { index: 24, type: "PROPERTY",        correspondsTo: "illinois avenue" },
  { index: 25, type: "PROPERTY",        correspondsTo: "b and o railroad" },
  { index: 26, type: "PROPERTY",        correspondsTo: "atlantic avenue" },
  { index: 27, type: "PROPERTY",        correspondsTo: "ventnor avenue" },
  { index: 28, type: "PROPERTY",        correspondsTo: "water works" },
  { index: 29, type: "PROPERTY",        correspondsTo: "marvin gardens" },
  { index: 30, type: "AUDIT",           name: "CMS Billing Audit",       shortLabel: "AUDIT", wp: 350, sbp: 6, bmi: 0.5 },
  { index: 31, type: "PROPERTY",        correspondsTo: "pacific avenue" },
  { index: 32, type: "PROPERTY",        correspondsTo: "north carolina avenue" },
  { index: 33, type: "COMMUNITY_CHEST", name: "Community Chest",         shortLabel: "CC" },
  { index: 34, type: "PROPERTY",        correspondsTo: "pennsylvania avenue" },
  { index: 35, type: "PROPERTY",        correspondsTo: "short line" },
  { index: 36, type: "CHANCE",          name: "Chance",                  shortLabel: "?" },
  { index: 37, type: "PROPERTY",        correspondsTo: "park place" },
  { index: 38, type: "TAX",             name: "Pharma Rep Steak Dinner", shortLabel: "VIP", wp: 450, sbp: 6, bmi: 1.2 },
  { index: 39, type: "PROPERTY",        correspondsTo: "boardwalk" }
];

// Color CSS lookup matching GroupColor column in Properties.csv
const GROUP_COLOR_HEX = {
  "brown": "#7c4727",
  "light blue": "#38bdf8",
  "pink": "#ec4899",
  "orange": "#f97316",
  "red": "#ef4444",
  "yellow": "#eab308",
  "green": "#22c55e",
  "dark blue": "#1d4ed8",
  "transparent": "transparent"
};

// Sub-tile offsets (in % of board width/height) so 2, 3, or 4 tokens on the same tile never overlap
const MULTI_TOKEN_OFFSETS = {
  1: [{ dx: 0, dy: 0 }],
  2: [{ dx: -1.7, dy: -1.4 }, { dx: 1.7, dy: 1.4 }],
  3: [{ dx: -1.8, dy: -1.6 }, { dx: 1.8, dy: -1.6 }, { dx: 0, dy: 1.8 }],
  4: [{ dx: -1.8, dy: -1.8 }, { dx: 1.8, dy: -1.8 }, { dx: -1.8, dy: 1.8 }, { dx: 1.8, dy: 1.8 }]
};

// Standard 3x3 pip positions for dice faces 1..6 (indices 0..8 in a 3x3 grid)
const DIE_PIP_PATTERNS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8]
};

// ============================================================================
// GAME STATE
// ============================================================================
const gameState = {
  tiles: [],                 // 40 board tiles with x, y coordinates and property metadata
  cards: {
    chance: [],
    communityChest: [],
    chanceIdx: 0,
    communityChestIdx: 0
  },
  players: [
    { id: 0, name: "You",          shortName: "You",          possessive: "your", colorClass: "token-blue",   hex: "#2563eb", isBot: false, position: 0, sbp: INITIAL_SBP, bmi: INITIAL_BMI, wp: INITIAL_WP },
    { id: 1, name: "Fat Slob",     shortName: "Fat Slob",     possessive: "his",  colorClass: "token-red",    hex: "#dc2626", isBot: true,  position: 0, sbp: INITIAL_SBP, bmi: INITIAL_BMI, wp: INITIAL_WP },
    { id: 2, name: "Lazy Larry",   shortName: "Lazy Larry",   possessive: "his",  colorClass: "token-yellow", hex: "#eab308", isBot: true,  position: 0, sbp: INITIAL_SBP, bmi: INITIAL_BMI, wp: INITIAL_WP },
    { id: 3, name: "Sloppy Susan", shortName: "Sloppy Susan", possessive: "her",  colorClass: "token-green",  hex: "#16a34a", isBot: true,  position: 0, sbp: INITIAL_SBP, bmi: INITIAL_BMI, wp: INITIAL_WP }
  ],
  currentPlayerIndex: 0,
  phase: "LOADING",          // "LOADING" | "RULES" | "WAIT_FOR_ROLL" | "MOVING" | "ACTION" | "AUCTION"
  diceMode: DEFAULT_DICE_CONTROL_MODE,
  lastDice: [1, 1],
  userBoardSide: 0,          // 0=South (0°), 1=West (90°), 2=North (180°), 3=East (270°)
  activeAuction: null,       // { tile, basePrice, currentPrice, startTime, landerId, intervalId, resolveCallback }
  pendingTrade: null,        // { fromPlayerId, toPlayerId, offeredTileIndex, requestedTileIndex }
  triggeredMilestones: {},   // Maps milestoneId (Scope Everyone) or milestoneId_playerId (Scope Individual) -> boolean
  milestonesData: null,      // Loaded from Milestones.csv / MILESTONES_DATA
  botTurnTimeout: null
};

// ============================================================================
// CSV PARSING & BOARD INITIALIZATION
// ============================================================================

async function fetchTextWithFallback(url, fallbackText) {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    if (text && text.trim().length > 10) {
      return text;
    }
  } catch (_err) {
    // Fallback used when running locally via file:// protocol
  }
  return fallbackText;
}

function parsePropertiesCSV(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  const propertiesByCorrespondsTo = {};

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(",");
    if (parts.length < 7) continue;

    const propIndex = parseInt(parts[0].trim(), 10);
    const groupOrder = parseInt(parts[1].trim(), 10);
    const groupProperties = parseInt(parts[2].trim(), 10);
    const groupName = parts[3].trim();
    const groupColor = parts[4].trim();
    const propertyName = parts[5].trim();
    const correspondsTo = parts.slice(6).join(",").trim().toLowerCase();

    // Price tag in WP: defaults around 400 WP (scaled gently by group so all are ~300-600 WP, with 400 WP prominent)
    const priceWP = computePropertyPriceWP(groupOrder);

    propertiesByCorrespondsTo[correspondsTo] = {
      propIndex,
      groupOrder,
      groupProperties,
      groupName,
      groupColor,
      colorHex: GROUP_COLOR_HEX[groupColor.toLowerCase()] || "transparent",
      propertyName,
      correspondsTo,
      priceWP
    };
  }
  return propertiesByCorrespondsTo;
}

function computePropertyPriceWP(groupOrder) {
  // Base price tag is 400 WP, with slight clinical tiering by group
  const groupPrices = {
    1: 300,
    2: 350,
    3: 400,
    4: 400,
    5: 450,
    6: 500,
    7: 550,
    8: 650,
    9: 400,
    10: 350
  };
  return groupPrices[groupOrder] || BASE_PROPERTY_PRICE_WP;
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

function parseCardsCSV(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  const chance = [];
  const communityChest = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split only first 4 commas so card Text can safely contain commas
    const firstComma = line.indexOf(",");
    const secondComma = line.indexOf(",", firstComma + 1);
    const thirdComma = line.indexOf(",", secondComma + 1);
    const fourthComma = line.indexOf(",", thirdComma + 1);
    if (firstComma === -1 || secondComma === -1 || thirdComma === -1 || fourthComma === -1) continue;

    const cardType = line.slice(0, firstComma).trim().toLowerCase();
    const sbp = parseFloat(line.slice(firstComma + 1, secondComma).trim()) || 0;
    const bmi = parseFloat(line.slice(secondComma + 1, thirdComma).trim()) || 0;
    const wp = parseFloat(line.slice(thirdComma + 1, fourthComma).trim()) || 0;
    let text = line.slice(fourthComma + 1).trim();
    if (text.startsWith('"') && text.endsWith('"')) {
      text = text.slice(1, -1).replace(/""/g, '"').trim();
    }

    const cardObj = { cardType, sbp, bmi, wp, text };
    if (cardType.includes("chance")) {
      chance.push(cardObj);
    } else {
      communityChest.push(cardObj);
    }
  }

  return {
    chance: shuffleArray(chance),
    communityChest: shuffleArray(communityChest)
  };
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseMilestonesCSV(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length <= 1) return MILESTONES_DATA;
  const milestones = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = parseCSVLine(line);
    if (parts.length < 8) continue;
    const metric = parts[0].trim().toUpperCase();
    const cutoff = parseFloat(parts[1]);
    const scope = parts[2].trim();
    const significance = parts[3].trim();
    const text = parts[4].trim();
    const sbp = parseFloat(parts[5]) || 0;
    const bmi = parseFloat(parts[6]) || 0;
    const wp = parseFloat(parts[7]) || 0;
    milestones.push({
      id: `${metric}_${cutoff}`,
      metric,
      cutoff,
      scope,
      significance,
      text,
      sbp,
      bmi,
      wp
    });
  }
  return milestones.length > 0 ? milestones : MILESTONES_DATA;
}

/**
 * Computes the 11x11 grid position (gridX: 0..10, gridY: 0..10)
 * and percentage coordinates (xPercent, yPercent) for any board tile index 0..39.
 * Tile 0 ("GO") is at bottom-right (10, 10), moving clockwise around the perimeter.
 */
function getTileCoordinates(tileIndex) {
  let gridX = 0;
  let gridY = 0;
  let side = "bottom";

  if (tileIndex >= 0 && tileIndex <= 10) {
    // Bottom edge: right (10,10) to left (0,10)
    gridX = 10 - tileIndex;
    gridY = 10;
    side = "bottom";
  } else if (tileIndex >= 11 && tileIndex <= 20) {
    // Left edge: bottom (0,9) to top (0,0)
    gridX = 0;
    gridY = 10 - (tileIndex - 10);
    side = "left";
  } else if (tileIndex >= 21 && tileIndex <= 30) {
    // Top edge: left (1,0) to right (10,0)
    gridX = tileIndex - 20;
    gridY = 0;
    side = "top";
  } else {
    // Right edge: top (10,1) to bottom (10,9)
    gridX = 10;
    gridY = tileIndex - 30;
    side = "right";
  }

  // Normalized X and Y center coordinates (0% to 100% of board container)
  const x = ((gridX + 0.5) / 11) * 100;
  const y = ((gridY + 0.5) / 11) * 100;

  return {
    gridX,
    gridY,
    gridCol: gridX + 1, // 1-based for CSS Grid
    gridRow: gridY + 1,
    side,
    x,
    y
  };
}

function buildBoardTiles(propertiesByCorrespondsTo) {
  return CLASSIC_BOARD_SLOTS.map((slot) => {
    const coords = getTileCoordinates(slot.index);
    if (slot.type === "PROPERTY") {
      const prop = propertiesByCorrespondsTo[slot.correspondsTo];
      if (prop) {
        return {
          index: slot.index,
          type: "PROPERTY",
          name: prop.propertyName,
          groupName: prop.groupName,
          groupColor: prop.groupColor,
          colorHex: prop.colorHex,
          groupOrder: prop.groupOrder,
          groupProperties: prop.groupProperties,
          propIndex: prop.propIndex,
          correspondsTo: prop.correspondsTo,
          priceWP: prop.priceWP,
          ownerId: null,
          ...coords
        };
      }
    }

    return {
      index: slot.index,
      type: slot.type,
      name: slot.name,
      shortLabel: slot.shortLabel || "",
      groupName: slot.type === "CHANCE" || slot.type === "COMMUNITY_CHEST" ? "Card Draw" : "Hospital Zone",
      groupColor: "None",
      colorHex: "transparent",
      priceWP: slot.wp || 0,
      sbpImpact: slot.sbp || 0,
      bmiImpact: slot.bmi || 0,
      ownerId: null,
      ...coords
    };
  });
}

// ============================================================================
// UI RENDERING: DICE, THUMBNAIL BOARD, CLOSE-UP, SCORES, OWNED, TRADES
// ============================================================================

function initDieElement(dieEl) {
  dieEl.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const pip = document.createElement("span");
    pip.className = "pip";
    dieEl.appendChild(pip);
  }
}

function renderDieFace(dieEl, value) {
  const pips = dieEl.querySelectorAll(".pip");
  const activeIndices = DIE_PIP_PATTERNS[value] || DIE_PIP_PATTERNS[1];
  pips.forEach((pip, idx) => {
    if (activeIndices.includes(idx)) {
      pip.classList.add("visible");
    } else {
      pip.classList.remove("visible");
    }
  });
  dieEl.dataset.value = String(value);
}

function renderDiceBox(d1, d2, rollerName) {
  const die1El = document.getElementById("die-1");
  const die2El = document.getElementById("die-2");
  renderDieFace(die1El, d1);
  renderDieFace(die2El, d2);

  const sumBadge = document.getElementById("dice-sum-badge");
  sumBadge.textContent = `${rollerName ? rollerName + ": " : ""}${d1} + ${d2} = ${d1 + d2}`;

  const diceBox = document.getElementById("dice-click-box");
  diceBox.classList.add("rolling-flash");
  setTimeout(() => diceBox.classList.remove("rolling-flash"), 180);
}

function renderThumbnailBoard() {
  const boardEl = document.getElementById("thumbnail-board");
  // Remove any old tiles while preserving .board-center and #board-tokens-layer
  boardEl.querySelectorAll(".thumb-tile").forEach((el) => el.remove());

  const centerEl = boardEl.querySelector(".board-center");

  gameState.tiles.forEach((tile) => {
    const tileEl = document.createElement("div");
    tileEl.className = `thumb-tile side-${tile.side}`;
    tileEl.id = `thumb-tile-${tile.index}`;
    tileEl.style.gridColumn = String(tile.gridCol);
    tileEl.style.gridRow = String(tile.gridRow);

    if (tile.index === 0) {
      tileEl.classList.add("tile-go");
      tileEl.innerHTML = `<span>GO</span><span class="go-arrow">←</span>`;
    } else if (tile.type === "PROPERTY") {
      const colorBar = document.createElement("div");
      colorBar.className = "thumb-color-bar";
      if (tile.colorHex !== "transparent") {
        colorBar.style.background = tile.colorHex;
      } else {
        // Transparent group (ACS pipeline / Quick-Fix Service): subtle clinical hatch
        colorBar.style.background =
          "repeating-linear-gradient(45deg, rgba(15,23,42,0.18), rgba(15,23,42,0.18) 2px, transparent 2px, transparent 4px)";
      }
      tileEl.appendChild(colorBar);
    } else {
      const sym = document.createElement("span");
      sym.className = "thumb-mini-symbol";
      sym.textContent = tile.shortLabel;
      tileEl.appendChild(sym);
    }

    boardEl.insertBefore(tileEl, centerEl);
  });

  // Create the 4 token dots in #board-tokens-layer
  const tokensLayer = document.getElementById("board-tokens-layer");
  tokensLayer.innerHTML = "";
  gameState.players.forEach((player) => {
    const tokenEl = document.createElement("div");
    tokenEl.id = `board-token-${player.id}`;
    tokenEl.className = `board-token ${player.colorClass} ${player.id === 0 ? "token-user" : ""}`;
    tokensLayer.appendChild(tokenEl);
  });

  updateThumbnailOwnershipFrames();
  updateThumbnailTokenPositions(USER_TOKEN_STEP_MS);
}

function updateThumbnailOwnershipFrames() {
  gameState.tiles.forEach((tile) => {
    const tileEl = document.getElementById(`thumb-tile-${tile.index}`);
    if (!tileEl) return;
    tileEl.classList.remove("owned-by-0", "owned-by-1", "owned-by-2", "owned-by-3");
    if (tile.ownerId !== null && tile.ownerId !== undefined) {
      tileEl.classList.add(`owned-by-${tile.ownerId}`);
    }
  });
}

function updateThumbnailTokenPositions(stepDurationMs) {
  // Group players by their current tile index so multiple tokens on the same tile don't overlap
  const occupantsByTile = {};
  gameState.players.forEach((p) => {
    if (!occupantsByTile[p.position]) occupantsByTile[p.position] = [];
    occupantsByTile[p.position].push(p);
  });

  gameState.players.forEach((player) => {
    const tile = gameState.tiles[player.position];
    const group = occupantsByTile[player.position];
    const slotIdx = group.indexOf(player);
    const offsets = MULTI_TOKEN_OFFSETS[group.length] || MULTI_TOKEN_OFFSETS[1];
    const { dx, dy } = offsets[slotIdx] || { dx: 0, dy: 0 };

    const tokenEl = document.getElementById(`board-token-${player.id}`);
    if (tokenEl && tile) {
      tokenEl.style.setProperty("--token-step-ms", `${stepDurationMs}ms`);
      tokenEl.style.left = `${(tile.x + dx).toFixed(2)}%`;
      tokenEl.style.top = `${(tile.y + dy).toFixed(2)}%`;
    }
  });
}

/**
 * Renders the Close-Up Magnified View centered on the User's token (players[0]),
 * showing 2 surrounding tiles on each side (-2, -1, 0, +1, +2) with horizontal
 * property names and rotating when the user passes a corner.
 */
function renderUserCloseup() {
  const user = gameState.players[0];
  const centerIndex = user.position;

  // Determine which side of the board the user is currently on (0..3)
  const newSide = Math.floor(centerIndex / 10) % 4;
  const sideNames = [
    "South Wing • 0°",
    "West Wing • 90°",
    "North Wing • 180°",
    "East Wing • 270°"
  ];

  const badgeEl = document.getElementById("closeup-orientation-badge");
  badgeEl.textContent = sideNames[newSide];

  // Trigger corner rotation animation when user passes a corner onto a new side
  if (newSide !== gameState.userBoardSide) {
    gameState.userBoardSide = newSide;
    const rotator = document.getElementById("closeup-rotator");
    rotator.classList.remove("corner-rotating-cw");
    void rotator.offsetWidth; // Reflow to restart animation cleanly
    rotator.classList.add("corner-rotating-cw");
  }

  const trackEl = document.getElementById("closeup-track");
  trackEl.innerHTML = "";

  // Show surrounding 2 properties on each side: offsets -2, -1, 0, +1, +2
  const offsets = [-2, -1, 0, 1, 2];
  offsets.forEach((offset) => {
    const tileIdx = (centerIndex + offset + 40) % 40;
    const tile = gameState.tiles[tileIdx];

    const card = document.createElement("div");
    card.className = `closeup-tile ${offset === 0 ? "is-center-tile" : ""}`;
    if (tile.ownerId !== null) {
      card.classList.add(`owned-by-${tile.ownerId}`);
    }

    // Header color bar
    const header = document.createElement("div");
    header.className = "closeup-color-header";
    if (tile.type === "PROPERTY") {
      if (tile.colorHex !== "transparent") {
        header.style.background = tile.colorHex;
      } else {
        header.style.background = "#64748b";
      }
      header.innerHTML = `<span>#${tile.propIndex}</span><span>${tile.ownerId !== null ? "OWNED" : ""}</span>`;
    } else {
      header.style.background = "#334155";
      header.innerHTML = `<span>TILE</span><span>${tile.shortLabel || ""}</span>`;
    }

    // Body with horizontal readable property name and group name
    const body = document.createElement("div");
    body.className = "closeup-tile-body";
    const nameEl = document.createElement("div");
    nameEl.className = "closeup-prop-name";
    nameEl.textContent = tile.name;

    const groupEl = document.createElement("div");
    groupEl.className = "closeup-group-name";
    groupEl.textContent = tile.groupName || "";

    body.appendChild(nameEl);
    body.appendChild(groupEl);

    // Footer with WP price tag and any tokens currently on this tile
    const footer = document.createElement("div");
    footer.className = "closeup-tile-footer";

    if (tile.priceWP > 0) {
      const priceTag = document.createElement("div");
      priceTag.className = "closeup-price-tag";
      priceTag.textContent = `${tile.priceWP} WP`;
      footer.appendChild(priceTag);
    }

    const tokensRow = document.createElement("div");
    tokensRow.className = "closeup-tokens-row";
    gameState.players.forEach((p) => {
      if (p.position === tileIdx) {
        const dot = document.createElement("span");
        dot.className = `closeup-token-dot ${p.colorClass} ${p.id === 0 ? "is-user" : ""}`;
        dot.title = p.name;
        tokensRow.appendChild(dot);
      }
    });
    footer.appendChild(tokensRow);

    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);
    trackEl.appendChild(card);
  });

  // Update active tile readout bar beneath the 5-tile strip
  const currentTile = gameState.tiles[centerIndex];
  const detailEl = document.getElementById("closeup-current-detail");
  const ownerText =
    currentTile.ownerId !== null
      ? ` • Owned by ${gameState.players[currentTile.ownerId].shortName}`
      : currentTile.type === "PROPERTY"
      ? ` • Unowned (${currentTile.priceWP} WP)`
      : "";
  detailEl.innerHTML = `Your Token: <strong>${currentTile.name}</strong> (${currentTile.groupName})${ownerText}`;
}

function renderScores() {
  const gridEl = document.getElementById("scores-grid");
  gridEl.innerHTML = "";

  gameState.players.forEach((player) => {
    const ownedCount = gameState.tiles.filter((t) => t.ownerId === player.id).length;
    const card = document.createElement("div");
    card.className = `player-score-card ${gameState.currentPlayerIndex === player.id ? "active-turn" : ""}`;

    card.innerHTML = `
      <div class="player-card-header">
        <div class="player-name-wrap">
          <span class="token-dot ${player.colorClass}"></span>
          <span>${player.name}</span>
        </div>
        <span class="player-owned-pill">${ownedCount} prop${ownedCount === 1 ? "" : "s"}</span>
      </div>
      <div class="player-metrics-row">
        <div class="metric-box">
          <span class="metric-label">SBP</span>
          <span class="metric-val">${Math.round(player.sbp)}</span>
        </div>
        <div class="metric-box">
          <span class="metric-label">BMI</span>
          <span class="metric-val">${player.bmi.toFixed(1)}</span>
        </div>
        <div class="metric-box">
          <span class="metric-label">Waste (WP)</span>
          <span class="metric-val">${Math.round(player.wp)}</span>
        </div>
      </div>
    `;
    gridEl.appendChild(card);
  });
}

function renderOwnedProperties() {
  const userProps = gameState.tiles.filter((t) => t.type === "PROPERTY" && t.ownerId === 0);
  const totalOwned = gameState.tiles.filter((t) => t.type === "PROPERTY" && t.ownerId !== null).length;

  document.getElementById("user-prop-count").textContent = String(userProps.length);
  document.getElementById("all-owned-summary").textContent = `Total Claimed: ${totalOwned}/28`;

  const listEl = document.getElementById("user-properties-list");
  if (userProps.length === 0) {
    listEl.innerHTML = `<div class="empty-hint">No hospital units acquired yet. Roll the dice to claim departments!</div>`;
    return;
  }

  listEl.innerHTML = "";
  userProps.forEach((prop) => {
    const item = document.createElement("div");
    item.className = "owned-prop-item";
    const swatchBg =
      prop.colorHex !== "transparent"
        ? prop.colorHex
        : "repeating-linear-gradient(45deg, #cbd5e1, #cbd5e1 3px, #ffffff 3px, #ffffff 6px)";
    item.innerHTML = `
      <div class="owned-prop-left">
        <span class="prop-color-swatch" style="background: ${swatchBg}"></span>
        <div>
          <span class="owned-prop-title">${prop.name}</span>
          <span class="owned-prop-group">(${prop.groupName})</span>
        </div>
      </div>
      <span class="owned-prop-wp">${prop.priceWP} WP</span>
    `;
    listEl.appendChild(item);
  });
}

function setBoardTicker(message) {
  const ticker = document.getElementById("board-ticker-text");
  if (ticker) ticker.textContent = message;
}

function updateTurnIndicator() {
  const player = gameState.players[gameState.currentPlayerIndex];
  const dotEl = document.getElementById("turn-token-dot");
  const textEl = document.getElementById("turn-status-text");
  const promptSub = document.getElementById("dice-prompt-sub");
  const diceBox = document.getElementById("dice-click-box");
  const sumBadge = document.getElementById("dice-sum-badge");

  dotEl.className = `token-dot ${player.colorClass}`;

  if (player.id === 0 && gameState.phase === "WAIT_FOR_ROLL") {
    textEl.textContent = "Your Turn — Tap Dice Box to Roll";
    promptSub.textContent = "Tap dice or surrounding box to roll";
    if (sumBadge) sumBadge.textContent = "Your turn!";
    diceBox.classList.remove("disabled-roll");
  } else if (player.isBot) {
    textEl.textContent = `${player.name}'s Turn`;
    promptSub.textContent = `${player.shortName} is rolling...`;
    diceBox.classList.add("disabled-roll");
  } else {
    textEl.textContent = `${player.name} — Resolving Event`;
    promptSub.textContent = "Complete action below to continue";
    diceBox.classList.add("disabled-roll");
  }
}

function refreshAllViews() {
  updateThumbnailOwnershipFrames();
  renderUserCloseup();
  renderScores();
  renderOwnedProperties();
  updateTurnIndicator();
}

// ============================================================================
// DICE ROLL CONTROLLER (Supports Random, Story Director, Scripted, & Manual)
// ============================================================================

/**
 * Finds the distance (in steps, up to 12) to the first available Chance or
 * Community chest tile ahead of the given position that can be reached by two dice (2..12).
 */
function findFirstAvailableCardTileDistance(currentPosition) {
  for (let dist = 2; dist <= 12; dist++) {
    const destIdx = (currentPosition + dist) % 40;
    const destTile = gameState.tiles[destIdx];
    if (destTile && (destTile.type === "CHANCE" || destTile.type === "COMMUNITY_CHEST")) {
      return dist;
    }
  }
  return null;
}

function computeNextDiceRoll(player) {
  // 1. Check if scripted roll queue at top of file has pairs queued
  if (SCRIPTED_DICE_QUEUE.length > 0) {
    const pair = SCRIPTED_DICE_QUEUE.shift();
    if (Array.isArray(pair) && pair.length === 2) {
      return [clampDie(pair[0]), clampDie(pair[1])];
    }
  }

  // 2. Check if user selected Manual Cheat in the UI
  if (gameState.diceMode === "MANUAL") {
    const d1 = parseInt(document.getElementById("manual-die-1").value, 10) || 3;
    const d2 = parseInt(document.getElementById("manual-die-2").value, 10) || 4;
    return [clampDie(d1), clampDie(d2)];
  }

  // 3. Backend card-tile targeting: check if there is a Chance or Community chest tile
  // within the next 12 steps, note the distance to the first available one, and with
  // 10% probability (PROBABILITY_OF_CARD_TILE_ROLL = 0.10) generate a roll that lands on it.
  const firstCardDist = findFirstAvailableCardTileDistance(player.position);
  if (firstCardDist !== null && Math.random() < PROBABILITY_OF_CARD_TILE_ROLL) {
    const validPairs = [];
    for (let d1 = 1; d1 <= 6; d1++) {
      for (let d2 = 1; d2 <= 6; d2++) {
        if (d1 + d2 === firstCardDist) {
          validPairs.push([d1, d2]);
        }
      }
    }
    if (validPairs.length > 0) {
      return validPairs[Math.floor(Math.random() * validPairs.length)];
    }
  }

  // 4. Standard random roll
  return [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1
  ];
}

function clampDie(val) {
  return Math.max(1, Math.min(6, Math.round(val)));
}

// ============================================================================
// TURN FLOW & SEQUENTIAL TILE HOPPING
// ============================================================================

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function executeTurnRoll() {
  if (gameState.phase !== "WAIT_FOR_ROLL") return;

  const player = gameState.players[gameState.currentPlayerIndex];
  gameState.phase = "MOVING";
  updateTurnIndicator();

  // Check if a bot initiates a trade on this roll of the dice (PROBABILITY_OF_TRADE_CREATE = 0.05)
  maybeTriggerBotTradeOnRoll();

  // Determine dice values
  const [d1, d2] = computeNextDiceRoll(player);
  gameState.lastDice = [d1, d2];
  const totalSteps = d1 + d2;

  renderDiceBox(d1, d2, player.shortName);
  setBoardTicker(`${player.shortName} rolled ${d1} + ${d2} = ${totalSteps}!`);

  const stepDelay = player.isBot ? BOT_TOKEN_STEP_MS : USER_TOKEN_STEP_MS;

  // Move sequentially tile-by-tile with distinct stops on each tile
  for (let s = 1; s <= totalSteps; s++) {
    player.position = (player.position + 1) % 40;

    // Check if passing or landing on GO (Tile 0)
    if (player.position === 0) {
      player.wp += PASS_GO_WP_ADDED;
      player.sbp += PASS_GO_SBP_ADDED;
      player.bmi = roundOneDecimal(player.bmi + PASS_GO_BMI_ADDED);
      setBoardTicker(`${player.shortName} passed GO (+${PASS_GO_WP_ADDED} WP routine admission labs)!`);
    }

    updateThumbnailTokenPositions(Math.max(60, stepDelay - 25));
    if (player.id === 0) {
      renderUserCloseup();
    } else {
      // Even when bots move, if they enter/leave the user's 5-tile close-up window, show their token dot
      renderUserCloseup();
    }
    renderScores();

    await sleep(stepDelay);
  }

  // Resolve tile landing
  gameState.phase = "ACTION";
  updateTurnIndicator();
  const landedTile = gameState.tiles[player.position];
  await resolveLandedTile(player, landedTile);
}

function formatConsequences(sbpDelta, bmiDelta, wpDelta) {
  const fmt = (n, unit) => `${n >= 0 ? "+" : ""}${n}${unit}`;
  return `SBP: ${fmt(sbpDelta, " mmHg")}, BMI: ${fmt(bmiDelta, " units")}, and Waste: ${fmt(wpDelta, " WP")}`;
}

async function resolveLandedTile(player, tile) {
  if (tile.type === "PROPERTY") {
    if (tile.ownerId === null) {
      await handleUnownedPropertyLanding(player, tile);
      return;
    } else if (tile.ownerId !== player.id) {
      await handleOwnedPropertyVisit(player, tile);
      return;
    } else {
      setBoardTicker(`${player.shortName} ${player.id === 0 ? "inspect your" : "inspects " + player.possessive} ${tile.name}.`);
      await finishPlayerTurn();
      return;
    }
  }

  if (tile.type === "CHANCE" || tile.type === "COMMUNITY_CHEST") {
    await handleCardDraw(player, tile.type);
    return;
  }

  if (tile.type === "TAX" || tile.type === "AUDIT") {
    player.wp += tile.priceWP;
    player.sbp += tile.sbpImpact;
    player.bmi = roundOneDecimal(player.bmi + tile.bmiImpact);
    const msg = `${player.shortName} hit ${tile.name}: +${tile.priceWP} WP!`;
    setBoardTicker(msg);
    refreshAllViews();

    const consequences = formatConsequences(tile.sbpImpact, tile.bmiImpact, tile.priceWP);
    await showEventPopupModal(
      "HOSPITAL SURCHARGE",
      player,
      `${player.name} landed on <strong>${tile.name}</strong>!`,
      consequences,
      "event-theme"
    );
    await finishPlayerTurn();
    return;
  }

  // Corner tiles (GO, M&M Peer Review, Doctors' Lounge)
  setBoardTicker(`${player.shortName} ${player.id === 0 ? "rest" : "rests"} at ${tile.name}.`);
  refreshAllViews();
  await finishPlayerTurn();
}

// ============================================================================
// PROPERTY PURCHASE & 10-SECOND ESCALATING AUCTION
// ============================================================================

async function handleUnownedPropertyLanding(player, tile) {
  if (player.isBot) {
    await sleep(BOT_POST_TURN_DELAY_MS / 2);
    // Bot decides whether to buy based on PROBABILITY_OF_PROP_PURCHASE (0.5)
    if (Math.random() < PROBABILITY_OF_PROP_PURCHASE) {
      assignPropertyToPlayer(player, tile, tile.priceWP, "purchased");
      const consequences = formatConsequences(PURCHASE_SBP_INCREASE, PURCHASE_BMI_INCREASE, tile.priceWP);
      await showEventPopupModal(
        "PROPERTY PURCHASED",
        player,
        `<strong>${player.name}</strong> purchased <strong>${tile.name}</strong> (${tile.groupName}) for <strong>${tile.priceWP} WP</strong>!`,
        consequences,
        "event-theme"
      );
      await finishPlayerTurn();
    } else {
      setBoardTicker(`${player.shortName} declined ${tile.name} (${tile.priceWP} WP) — AUCTION STARTING!`);
      await runPropertyAuction(tile, player);
      await finishPlayerTurn();
    }
    return;
  }

  // User landed on unowned property: show Buy or Pass (Auction) prompt
  return new Promise((resolve) => {
    const banner = document.getElementById("action-banner");
    const tag = document.getElementById("action-tag");
    const title = document.getElementById("action-title");
    const body = document.getElementById("action-body");
    const controls = document.getElementById("action-controls");

    banner.className = "panel action-banner";
    tag.textContent = "UNOWNED SUITE";
    title.textContent = `${tile.name} (${tile.groupName})`;
    body.innerHTML = `
      Price Tag: <strong>${tile.priceWP} WP</strong> (+${PURCHASE_SBP_INCREASE} SBP, +${PURCHASE_BMI_INCREASE} BMI).<br/>
      If you pass, it goes to a ${AUCTION_DURATION}-second group auction counting up to ${AUCTION_MAX_PRICE} WP!
    `;
    controls.innerHTML = `
      <button id="prop-buy-now-btn" class="btn btn-primary btn-sm" type="button">
        Buy (${tile.priceWP} WP)
      </button>
      <button id="prop-pass-auction-btn" class="btn btn-secondary btn-sm" type="button">
        Pass (Start Auction)
      </button>
    `;

    document.getElementById("prop-buy-now-btn").onclick = async () => {
      banner.classList.add("hidden");
      assignPropertyToPlayer(player, tile, tile.priceWP, "purchased");
      const consequences = formatConsequences(PURCHASE_SBP_INCREASE, PURCHASE_BMI_INCREASE, tile.priceWP);
      await showEventPopupModal(
        "PROPERTY PURCHASED",
        player,
        `You purchased <strong>${tile.name}</strong> (${tile.groupName}) for <strong>${tile.priceWP} WP</strong>!`,
        consequences,
        "event-theme"
      );
      await finishPlayerTurn();
      resolve();
    };

    document.getElementById("prop-pass-auction-btn").onclick = async () => {
      setBoardTicker(`You passed on ${tile.name} — Group Auction started!`);
      await runPropertyAuction(tile, player);
      await finishPlayerTurn();
      resolve();
    };
  });
}

function assignPropertyToPlayer(player, tile, wpCost, reasonLabel) {
  tile.ownerId = player.id;
  player.wp += Math.round(wpCost);
  player.sbp += PURCHASE_SBP_INCREASE;
  player.bmi = roundOneDecimal(player.bmi + PURCHASE_BMI_INCREASE);

  setBoardTicker(`${player.shortName} ${reasonLabel} ${tile.name} for ${Math.round(wpCost)} WP!`);
  refreshAllViews();
}

/**
 * Runs the live property auction when a player decides not to buy a property they land on.
 * - Counter starts at tile.priceWP (e.g. 400 WP) and counts up to AUCTION_MAX_PRICE (1,000 WP)
 *   over AUCTION_DURATION (10) seconds.
 * - Bots have PROB_ACCEPT_PROP_AUCTION_PER_SECOND (0.10) per second chance to step in and buy.
 * - User has a live "Buy" button to step in at any moment.
 * - If counter reaches AUCTION_MAX_PRICE (1,000 WP), bidding stops and the player who first
 *   landed on the property gets assigned the property at 1,000 WP.
 */
function runPropertyAuction(tile, originalLander) {
  return new Promise((resolve) => {
    gameState.phase = "AUCTION";
    const startPrice = tile.priceWP || BASE_PROPERTY_PRICE_WP;
    const maxPrice = AUCTION_MAX_PRICE;
    const durationMs = AUCTION_DURATION * 1000;
    const startTime = performance.now();
    let lastTickTime = startTime;
    let settled = false;

    const banner = document.getElementById("action-banner");
    const tag = document.getElementById("action-tag");
    const title = document.getElementById("action-title");
    const body = document.getElementById("action-body");
    const controls = document.getElementById("action-controls");

    banner.className = "panel action-banner auction-mode";
    tag.textContent = "LIVE 10s AUCTION";
    title.textContent = `Bidding Open: ${tile.name}`;
    body.innerHTML = `
      <div><strong>${originalLander.shortName}</strong> declined to buy at ${startPrice} WP! Price is rising toward <strong>${maxPrice.toLocaleString()} WP</strong>:</div>
      <div id="auction-counter-box" class="auction-counter-box">
        <div class="auction-counter-top">
          <span id="auction-live-wp" class="auction-wp-readout">⬆ ${startPrice} WP</span>
          <span id="auction-live-timer" class="auction-timer-readout">0.0s / ${AUCTION_DURATION.toFixed(1)}s</span>
        </div>
        <div class="auction-progress-track">
          <div id="auction-progress-fill" class="auction-progress-fill"></div>
        </div>
      </div>
    `;
    controls.innerHTML = `
      <button id="auction-user-buy-btn" class="btn btn-danger btn-large" type="button">
        Buy (${startPrice} WP)
      </button>
    `;

    const counterBoxEl = document.getElementById("auction-counter-box");
    const wpReadoutEl = document.getElementById("auction-live-wp");
    const timerReadoutEl = document.getElementById("auction-live-timer");
    const progressFillEl = document.getElementById("auction-progress-fill");
    const userBuyBtn = document.getElementById("auction-user-buy-btn");

    const concludeAuction = async (buyerPlayer, finalWP, summaryNote) => {
      if (settled) return;
      settled = true;
      clearInterval(intervalId);
      gameState.activeAuction = null;

      const roundedWP = Math.round(finalWP);
      assignPropertyToPlayer(buyerPlayer, tile, roundedWP, summaryNote);
      banner.classList.add("hidden");

      const consequences = formatConsequences(PURCHASE_SBP_INCREASE, PURCHASE_BMI_INCREASE, roundedWP);
      const outcomeMsg =
        summaryNote === "assigned at max auction cap"
          ? `Nobody stepped in before the counter hit <strong>${maxPrice.toLocaleString()} WP</strong>! <strong>${buyerPlayer.name}</strong> (who first landed on it) was assigned <strong>${tile.name}</strong> for <strong>${roundedWP.toLocaleString()} WP</strong>!`
          : `<strong>${buyerPlayer.name}</strong> stepped in and bought <strong>${tile.name}</strong> in the auction for <strong>${roundedWP.toLocaleString()} WP</strong>!`;

      await showEventPopupModal(
        "AUCTION RESULT",
        buyerPlayer,
        outcomeMsg,
        consequences,
        "auction-theme"
      );
      resolve();
    };

    userBuyBtn.onclick = () => {
      if (settled) return;
      const elapsed = Math.min(durationMs, performance.now() - startTime);
      const progress = elapsed / durationMs;
      const currentWP = Math.round(startPrice + (maxPrice - startPrice) * progress);
      concludeAuction(gameState.players[0], currentWP, "bought in auction");
    };

    const bots = gameState.players.filter((p) => p.isBot);

    const intervalId = setInterval(() => {
      if (settled) return;
      const now = performance.now();
      const dtSeconds = (now - lastTickTime) / 1000;
      lastTickTime = now;

      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const currentWP = Math.round(startPrice + (maxPrice - startPrice) * progress);
      const pct = Math.round(progress * 100);

      // Dynamically shift hue from amber/yellow (45 deg) down to crimson red (0 deg) as counter rises
      const hue = Math.round(45 * (1 - progress));
      if (counterBoxEl) {
        counterBoxEl.style.background = `hsl(${hue}, 95%, 94%)`;
        counterBoxEl.style.borderColor = `hsl(${hue}, 85%, 42%)`;
      }
      if (wpReadoutEl) {
        wpReadoutEl.style.color = `hsl(${hue}, 88%, 36%)`;
        wpReadoutEl.textContent = `⬆ ${currentWP.toLocaleString()} WP`;
      }
      if (progressFillEl) {
        progressFillEl.style.width = `${pct}%`;
      }

      timerReadoutEl.textContent = `${(Math.min(durationMs, elapsed) / 1000).toFixed(1)}s / ${AUCTION_DURATION.toFixed(1)}s`;
      userBuyBtn.textContent = `Buy (${currentWP.toLocaleString()} WP)`;

      // Check if any bot steps in during this time slice:
      // Each bot has PROB_ACCEPT_PROP_AUCTION_PER_SECOND (0.10) per second.
      const probThisSlice = 1 - Math.pow(1 - PROB_ACCEPT_PROP_AUCTION_PER_SECOND, dtSeconds);
      for (const bot of bots) {
        if (Math.random() < probThisSlice) {
          concludeAuction(bot, currentWP, "stepped into auction");
          return;
        }
      }

      // If counter reaches AUCTION_MAX_PRICE (1,000 WP), bidding stops and originalLander gets it at 1,000 WP
      if (progress >= 1) {
        concludeAuction(originalLander, maxPrice, "assigned at max auction cap");
      }
    }, 50);

    gameState.activeAuction = { tile, intervalId };
  });
}

async function handleOwnedPropertyVisit(visitor, tile) {
  const owner = gameState.players[tile.ownerId];
  // Check if owner owns all properties in this group (rent doubles!)
  const groupTiles = gameState.tiles.filter(
    (t) => t.type === "PROPERTY" && t.groupOrder === tile.groupOrder
  );
  const ownsFullGroup = groupTiles.length > 0 && groupTiles.every((t) => t.ownerId === owner.id);

  const consultWP = ownsFullGroup ? OWNED_PROPERTY_VISIT_WP * 2 : OWNED_PROPERTY_VISIT_WP;
  const sbpDelta = ownsFullGroup ? RENT_SBP_INCREASE * 2 : RENT_SBP_INCREASE;
  const bmiDelta = roundOneDecimal(ownsFullGroup ? RENT_BMI_INCREASE * 2 : RENT_BMI_INCREASE);

  visitor.wp += consultWP;
  visitor.sbp += sbpDelta;
  visitor.bmi = roundOneDecimal(visitor.bmi + bmiDelta);

  // Format ticker & event message with proper grammar when owned by "You"
  const tickerMsg =
    owner.id === 0
      ? `${visitor.shortName} landed on your property ${tile.name}: +${consultWP} WP!`
      : `${visitor.shortName} landed on ${owner.shortName}'s ${tile.name}: +${consultWP} WP!`;

  setBoardTicker(tickerMsg);
  refreshAllViews();

  const doubleNote = ownsFullGroup ? " (Full Group Owned — Double Rent!)" : "";
  const popupBody =
    owner.id === 0
      ? `<strong>${visitor.name}</strong> landed on your property <strong>${tile.name}</strong>${doubleNote}!`
      : visitor.id === 0
      ? `You landed on <strong>${owner.name}</strong>'s property <strong>${tile.name}</strong>${doubleNote}!`
      : `<strong>${visitor.name}</strong> landed on <strong>${owner.name}</strong>'s property <strong>${tile.name}</strong>${doubleNote}!`;

  const consequences = formatConsequences(sbpDelta, bmiDelta, consultWP);
  await showEventPopupModal(
    ownsFullGroup ? "DOUBLE RENT!" : "OWNED PROPERTY",
    visitor,
    popupBody,
    consequences,
    "event-theme"
  );

  await finishPlayerTurn();
}

// ============================================================================
// CHANCE & COMMUNITY CHEST CARDS (Loaded from Cards.csv)
// ============================================================================

async function handleCardDraw(player, tileType) {
  const isChance = tileType === "CHANCE";
  const deck = isChance ? gameState.cards.chance : gameState.cards.communityChest;
  if (!deck || deck.length === 0) {
    await finishPlayerTurn();
    return;
  }

  const cardIndex = isChance ? gameState.cards.chanceIdx : gameState.cards.communityChestIdx;
  const card = deck[cardIndex % deck.length];
  if (isChance) {
    gameState.cards.chanceIdx = (cardIndex + 1) % deck.length;
  } else {
    gameState.cards.communityChestIdx = (cardIndex + 1) % deck.length;
  }

  const baseConsequences = formatConsequences(card.sbp, card.bmi, card.wp);
  let impactSummary = baseConsequences;

  if (isChance) {
    // Chance card impacts the player who picked it up
    player.sbp += card.sbp;
    player.bmi = roundOneDecimal(player.bmi + card.bmi);
    player.wp += card.wp;
  } else {
    // Community chest cards impact everyone!
    gameState.players.forEach((p) => {
      p.sbp += card.sbp;
      p.bmi = roundOneDecimal(p.bmi + card.bmi);
      p.wp += card.wp;
    });
    impactSummary = `All players get ${baseConsequences}`;
  }

  setBoardTicker(`${player.shortName} drew ${isChance ? "Chance" : "Community Chest"}: ${impactSummary}`);
  refreshAllViews();

  // Show modal window that must be acknowledged and closed ("Game on!") before game proceeds
  await showEventPopupModal(
    isChance ? "CHANCE" : "COMMUNITY CHEST",
    player,
    card.text,
    impactSummary,
    isChance ? "chance-theme" : "chest-theme"
  );

  await finishPlayerTurn();
}

function showEventPopupModal(
  headerTitle,
  player,
  messageHtml,
  consequencesText,
  themeClass = "event-theme",
  buttonText = "Game on!",
  isLarge = false
) {
  return new Promise((resolve) => {
    const modal = document.getElementById("card-modal");
    const windowEl = document.getElementById("card-modal-window");
    const header = document.getElementById("card-modal-header");
    const typeEl = document.getElementById("card-modal-type");
    const playerEl = document.getElementById("card-modal-player");
    const textEl = document.getElementById("card-modal-text");
    const impactsEl = document.getElementById("card-modal-impacts");
    const closeBtn = document.getElementById("card-modal-close-btn");

    if (isLarge) {
      windowEl.classList.add("game-end-modal");
    } else {
      windowEl.classList.remove("game-end-modal");
    }

    header.className = `card-modal-header ${themeClass}`;
    typeEl.textContent = headerTitle;
    playerEl.innerHTML = `<span class="token-dot ${player.colorClass}"></span><span>${player.name}</span>`;
    textEl.innerHTML = messageHtml;
    impactsEl.textContent = consequencesText;
    closeBtn.textContent = buttonText;

    modal.classList.add("active");

    closeBtn.onclick = () => {
      modal.classList.remove("active");
      windowEl.classList.remove("game-end-modal");
      closeBtn.textContent = "Game on!";
      resolve();
    };
  });
}

function getPlayerMetricValue(player, metric) {
  const m = String(metric).trim().toUpperCase();
  if (m === "WP") return player.wp;
  if (m === "BMI") return player.bmi;
  if (m === "SBP") return player.sbp;
  return 0;
}

function formatMilestoneText(rawText, player) {
  let text = rawText.trim();
  if (player.id === 0) {
    // Player is "You"
    text = text.replace(/\bX wins\b/g, "You win");
    text = text.replace(/\bX now exceeds\b/g, "You now exceed");
    text = text.replace(/\bX reaches\b/g, "You reach");
    text = text.replace(/\bcelebrates\b/g, "celebrate");
    text = text.replace(/for X that the doctor restricts (thiis|this) player from exercise/gi, "for you that the doctor restricts you from exercise");
    text = text.replace(/\bfor X\b/g, "for you");
    text = text.replace(/\bgoes to X\b/g, "goes to you");
    text = text.replace(/\bX now meets\b/g, "You now meet");
    text = text.replace(/\bX\b/g, "You");
  } else {
    // Player is a bot
    text = text.replace(/thiis player/g, "this player");
    text = text.replace(/\bX\b/g, player.name);
  }
  return text;
}

function resetGameToRules() {
  clearTimeout(gameState.botTurnTimeout);
  if (gameState.activeAuction && gameState.activeAuction.intervalId) {
    clearInterval(gameState.activeAuction.intervalId);
  }
  gameState.activeAuction = null;
  gameState.pendingTrade = null;

  // Reset all 4 players to initial vitals & properties
  gameState.players = [
    { id: 0, name: "You",          shortName: "You",          possessive: "your", colorClass: "token-blue",   hex: "#2563eb", isBot: false, position: 0, sbp: INITIAL_SBP, bmi: INITIAL_BMI, wp: INITIAL_WP, properties: [] },
    { id: 1, name: "Fat Slob",     shortName: "Fat Slob",     possessive: "his",  colorClass: "token-red",    hex: "#dc2626", isBot: true,  position: 0, sbp: INITIAL_SBP, bmi: INITIAL_BMI, wp: INITIAL_WP, properties: [] },
    { id: 2, name: "Lazy Larry",   shortName: "Lazy Larry",   possessive: "his",  colorClass: "token-yellow", hex: "#eab308", isBot: true,  position: 0, sbp: INITIAL_SBP, bmi: INITIAL_BMI, wp: INITIAL_WP, properties: [] },
    { id: 3, name: "Sloppy Susan", shortName: "Sloppy Susan", possessive: "her",  colorClass: "token-green",  hex: "#16a34a", isBot: true,  position: 0, sbp: INITIAL_SBP, bmi: INITIAL_BMI, wp: INITIAL_WP, properties: [] }
  ];

  // Unown all board tiles
  if (gameState.tiles && gameState.tiles.length) {
    gameState.tiles.forEach((t) => {
      t.ownerId = null;
    });
  }

  gameState.currentPlayerIndex = 0;
  gameState.turnNumber = 1;
  gameState.lastDice = [1, 1];
  gameState.userBoardSide = 0;
  gameState.triggeredMilestones = {};
  gameState.phase = "RULES";

  // Hide action & trade cards
  const actionBanner = document.getElementById("action-banner");
  if (actionBanner) actionBanner.classList.add("hidden");
  const tradeActions = document.getElementById("trade-response-actions");
  if (tradeActions) tradeActions.classList.add("hidden");
  const tradeCreator = document.getElementById("trade-creator-form");
  if (tradeCreator) tradeCreator.classList.add("hidden");
  const tradeStatus = document.getElementById("trade-status-msg");
  if (tradeStatus) {
    tradeStatus.textContent = 'No pending trade offer. Tap "Create trade" to swap a property with a bot, or wait for a bot offer.';
  }

  // Re-render UI
  const die1 = document.getElementById("die-1");
  const die2 = document.getElementById("die-2");
  if (die1) renderDieFace(die1, 1);
  if (die2) renderDieFace(die2, 1);
  renderThumbnailBoard();
  refreshAllViews();

  // Hide popup modal if active
  const cardModal = document.getElementById("card-modal");
  if (cardModal) cardModal.classList.remove("active");

  // Show rules screen
  const rulesScreen = document.getElementById("rules-screen");
  if (rulesScreen) rulesScreen.classList.add("active");
  const startBtn = document.getElementById("start-game-btn");
  if (startBtn) startBtn.textContent = "Start game";
}

/**
 * Evaluates clinical milestones defined in Milestones.csv / MILESTONES_DATA.
 * Scope == "Everyone": Triggers once globally for the first player who hits cutoff, impacts all players.
 * Scope == "Individual": Triggers once per player who hits cutoff, impacts that individual player.
 * Significance == "GameEnds": Concludes the game with a large pop-up stating the milestone text,
 * button labeled "Okay", and redirects to the rules page on dismissal.
 *
 * @returns {Promise<boolean>} true if game ended, false otherwise
 */
async function checkAndTriggerMilestones() {
  const orderedPlayers = [
    gameState.players[gameState.currentPlayerIndex],
    ...gameState.players.filter((_, idx) => idx !== gameState.currentPlayerIndex)
  ];

  const milestonesList = gameState.milestonesData || MILESTONES_DATA;

  let triggeredAny = true;
  while (triggeredAny) {
    triggeredAny = false;

    for (const milestone of milestonesList) {
      if (milestone.scope === "Everyone") {
        if (!gameState.triggeredMilestones[milestone.id]) {
          const triggeringPlayer = orderedPlayers.find(
            (p) => getPlayerMetricValue(p, milestone.metric) >= milestone.cutoff
          );
          if (triggeringPlayer) {
            gameState.triggeredMilestones[milestone.id] = true;
            triggeredAny = true;

            // Apply metric consequences to all players
            gameState.players.forEach((p) => {
              p.sbp += milestone.sbp;
              p.bmi = roundOneDecimal(p.bmi + milestone.bmi);
              p.wp += milestone.wp;
            });

            const formattedMsg = formatMilestoneText(milestone.text, triggeringPlayer);
            const baseConsequences = formatConsequences(milestone.sbp, milestone.bmi, milestone.wp);
            const impactSummary = `All players get ${baseConsequences}`;

            setBoardTicker(formattedMsg);
            refreshAllViews();

            if (milestone.significance === "GameEnds") {
              await showEventPopupModal(
                "GAME OVER — CLINICAL MILESTONE",
                triggeringPlayer,
                formattedMsg,
                impactSummary,
                "game-end-theme",
                "Okay",
                true
              );
              resetGameToRules();
              return true;
            } else {
              await showEventPopupModal(
                "CLINICAL MILESTONE",
                triggeringPlayer,
                formattedMsg,
                impactSummary,
                "chest-theme",
                "Game on!"
              );
            }
            break; // Restart evaluation loop to check updated scores
          }
        }
      } else {
        // Scope === "Individual"
        for (const p of orderedPlayers) {
          const key = `${milestone.id}_${p.id}`;
          if (!gameState.triggeredMilestones[key]) {
            if (getPlayerMetricValue(p, milestone.metric) >= milestone.cutoff) {
              gameState.triggeredMilestones[key] = true;
              triggeredAny = true;

              // Apply metric consequences to this individual player
              p.sbp += milestone.sbp;
              p.bmi = roundOneDecimal(p.bmi + milestone.bmi);
              p.wp += milestone.wp;

              const formattedMsg = formatMilestoneText(milestone.text, p);
              const consequences = formatConsequences(milestone.sbp, milestone.bmi, milestone.wp);
              const impactSummary = p.id === 0 ? `You get ${consequences}` : `${p.name} gets ${consequences}`;

              setBoardTicker(formattedMsg);
              refreshAllViews();

              if (milestone.significance === "GameEnds") {
                await showEventPopupModal(
                  "GAME OVER — CLINICAL MILESTONE",
                  p,
                  formattedMsg,
                  impactSummary,
                  "game-end-theme",
                  "Okay",
                  true
                );
                resetGameToRules();
                return true;
              } else {
                await showEventPopupModal(
                  "CLINICAL MILESTONE",
                  p,
                  formattedMsg,
                  impactSummary,
                  "chance-theme",
                  "Game on!"
                );
              }
              break; // Break player loop and recheck
            }
          }
        }
        if (triggeredAny) break; // Restart while loop
      }
    }
  }

  return false;
}

async function finishPlayerTurn() {
  const gameEnded = await checkAndTriggerMilestones();
  if (gameEnded) {
    return;
  }

  gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
  gameState.phase = "WAIT_FOR_ROLL";
  refreshAllViews();

  const nextPlayer = gameState.players[gameState.currentPlayerIndex];
  if (nextPlayer.isBot) {
    clearTimeout(gameState.botTurnTimeout);
    gameState.botTurnTimeout = setTimeout(() => {
      executeTurnRoll();
    }, BOT_PRE_ROLL_DELAY_MS);
  }
}

// ============================================================================
// BACKROOM PROPERTY TRADES (Bot-initiated & User-initiated)
// ============================================================================

function getPlayerProperties(playerId) {
  return gameState.tiles.filter((t) => t.type === "PROPERTY" && t.ownerId === playerId);
}

/**
 * Per roll of dice, with probability PROBABILITY_OF_TRADE_CREATE (0.05),
 * a bot with properties asks a randomly chosen opponent with properties
 * to swap a randomly chosen property of theirs.
 */
function maybeTriggerBotTradeOnRoll() {
  if (gameState.pendingTrade) return;
  if (Math.random() >= PROBABILITY_OF_TRADE_CREATE) return;

  // Find bots that own at least 1 property
  const eligibleBots = gameState.players.filter(
    (p) => p.isBot && getPlayerProperties(p.id).length > 0
  );
  if (eligibleBots.length === 0) return;

  const initiatingBot = eligibleBots[Math.floor(Math.random() * eligibleBots.length)];
  const botProps = getPlayerProperties(initiatingBot.id);

  // Find opponents (user or other bots) who own at least 1 property
  const eligibleOpponents = gameState.players.filter(
    (p) => p.id !== initiatingBot.id && getPlayerProperties(p.id).length > 0
  );
  if (eligibleOpponents.length === 0) return;

  const targetOpponent = eligibleOpponents[Math.floor(Math.random() * eligibleOpponents.length)];
  const opponentProps = getPlayerProperties(targetOpponent.id);

  const offeredProp = botProps[Math.floor(Math.random() * botProps.length)];
  const requestedProp = opponentProps[Math.floor(Math.random() * opponentProps.length)];

  if (targetOpponent.id === 0) {
    // Offer is to the User: display in Trade Area with Accept trade / Decline trade buttons!
    presentTradeOfferToUser(initiatingBot, offeredProp, requestedProp);
  } else {
    // Bot-to-bot trade: target bot accepts with PROBABILITY_OF_TRADE_ACCEPT (0.5)
    const accepted = Math.random() < PROBABILITY_OF_TRADE_ACCEPT;
    const statusMsg = document.getElementById("trade-status-msg");
    if (accepted) {
      offeredProp.ownerId = targetOpponent.id;
      requestedProp.ownerId = initiatingBot.id;
      statusMsg.innerHTML = `<strong>Bot Trade Completed:</strong> ${initiatingBot.shortName} swapped <em>${offeredProp.name}</em> with ${targetOpponent.shortName} for <em>${requestedProp.name}</em>!`;
      refreshAllViews();
    } else {
      statusMsg.innerHTML = `<strong>Bot Trade Declined:</strong> ${targetOpponent.shortName} rejected ${initiatingBot.shortName}'s offer of <em>${offeredProp.name}</em> for <em>${requestedProp.name}</em>.`;
    }
  }
}

function presentTradeOfferToUser(botPlayer, offeredProp, requestedProp) {
  gameState.pendingTrade = {
    initiatedBy: "BOT",
    fromPlayerId: botPlayer.id,
    toPlayerId: 0,
    offeredTileIndex: offeredProp.index,
    requestedTileIndex: requestedProp.index
  };

  // Bot-initiated trade: take-it-or-leave-it (no dropdowns!)
  document.getElementById("trade-creator-form").classList.add("hidden");
  const statusMsg = document.getElementById("trade-status-msg");
  statusMsg.innerHTML = `${botPlayer.name} requests your <strong>${requestedProp.name}</strong> (${requestedProp.groupName}) in return for ${botPlayer.possessive || "their"} <strong>${offeredProp.name}</strong> (${offeredProp.groupName}). Do you accept?`;

  const acceptBtn = document.getElementById("accept-trade-btn");
  const declineBtn = document.getElementById("decline-trade-btn");
  acceptBtn.textContent = "Accept proposed trade";
  declineBtn.textContent = "Reject";

  document.getElementById("trade-response-actions").classList.remove("hidden");
}

function resolvePendingTrade(accepted) {
  const trade = gameState.pendingTrade;
  if (!trade) return;

  const creatorForm = document.getElementById("trade-creator-form");
  const statusMsg = document.getElementById("trade-status-msg");
  document.getElementById("trade-response-actions").classList.add("hidden");
  creatorForm.classList.add("hidden");

  if (trade.initiatedBy === "USER") {
    const userTileIdx = parseInt(document.getElementById("trade-user-prop-select").value, 10);
    const botTileIdx = parseInt(document.getElementById("trade-bot-prop-select").value, 10);
    const userTile = gameState.tiles[userTileIdx];
    const botTile = gameState.tiles[botTileIdx];

    gameState.pendingTrade = null;

    if (!accepted) {
      statusMsg.textContent = "Trade proposal cancelled.";
      return;
    }

    if (!userTile || !botTile || userTile.ownerId !== 0 || botTile.ownerId === null || botTile.ownerId === 0) {
      statusMsg.textContent = "Selected properties are no longer available for trade.";
      return;
    }

    const targetBot = gameState.players[botTile.ownerId];
    // Bot decides whether to accept based on PROBABILITY_OF_TRADE_ACCEPT (0.5)
    if (Math.random() < PROBABILITY_OF_TRADE_ACCEPT) {
      userTile.ownerId = targetBot.id;
      botTile.ownerId = 0;
      statusMsg.innerHTML = `<strong>${targetBot.name} Accepted Trade!</strong> You swapped your <em>${userTile.name}</em> for <em>${botTile.name}</em>.`;
      setBoardTicker(`Trade completed with ${targetBot.shortName}: got ${botTile.name}!`);
      refreshAllViews();
    } else {
      statusMsg.innerHTML = `<strong>${targetBot.name} Declined Trade!</strong> ${targetBot.shortName} refused your offer of <em>${userTile.name}</em> for <em>${botTile.name}</em>.`;
    }
    return;
  }

  // Bot-initiated trade offer to user
  const offeredTile = gameState.tiles[trade.offeredTileIndex];
  const requestedTile = gameState.tiles[trade.requestedTileIndex];
  const fromPlayer = gameState.players[trade.fromPlayerId];
  const toPlayer = gameState.players[trade.toPlayerId];

  if (accepted && offeredTile.ownerId === fromPlayer.id && requestedTile.ownerId === toPlayer.id) {
    offeredTile.ownerId = toPlayer.id;
    requestedTile.ownerId = fromPlayer.id;
    statusMsg.innerHTML = `<strong>Trade Accepted!</strong> You acquired <em>${offeredTile.name}</em> and gave <em>${requestedTile.name}</em> to ${fromPlayer.shortName}.`;
    setBoardTicker(`Trade completed: ${offeredTile.name} ⇄ ${requestedTile.name}`);
  } else {
    statusMsg.innerHTML = `Trade offer from ${fromPlayer.shortName} was rejected.`;
  }

  gameState.pendingTrade = null;
  refreshAllViews();
}

function updateDraftTradeSummary() {
  const userTileIdx = parseInt(document.getElementById("trade-user-prop-select").value, 10);
  const botTileIdx = parseInt(document.getElementById("trade-bot-prop-select").value, 10);
  const userTile = gameState.tiles[userTileIdx];
  const botTile = gameState.tiles[botTileIdx];
  if (!userTile || !botTile) return;

  const botOwner = gameState.players[botTile.ownerId];
  const statusMsg = document.getElementById("trade-status-msg");
  statusMsg.innerHTML = `Would you like to suggest a trade to ${botOwner ? botOwner.name : "Bot"}:<br/>Offer your <strong>${userTile.name}</strong> in return for their <strong>${botTile.name}</strong>?`;
}

function openUserTradeCreator() {
  const userProps = getPlayerProperties(0);
  const botProps = gameState.tiles.filter(
    (t) => t.type === "PROPERTY" && t.ownerId !== null && t.ownerId !== 0
  );

  const statusMsg = document.getElementById("trade-status-msg");
  const creatorForm = document.getElementById("trade-creator-form");
  const responseActions = document.getElementById("trade-response-actions");

  if (userProps.length === 0 || botProps.length === 0) {
    creatorForm.classList.add("hidden");
    responseActions.classList.add("hidden");
    gameState.pendingTrade = null;
    statusMsg.innerHTML =
      userProps.length === 0
        ? "You don't own any properties to trade yet. Claim a property on the board first!"
        : "None of the bot opponents own any properties yet. Roll a few more turns first!";
    return;
  }

  const userSelect = document.getElementById("trade-user-prop-select");
  const botSelect = document.getElementById("trade-bot-prop-select");

  userSelect.innerHTML = userProps
    .map((p) => `<option value="${p.index}">${p.name} (${p.groupName} • ${p.priceWP} WP)</option>`)
    .join("");

  botSelect.innerHTML = botProps
    .map((p) => {
      const owner = gameState.players[p.ownerId];
      return `<option value="${p.index}">${p.name} — ${owner.shortName} (${p.groupName})</option>`;
    })
    .join("");

  // Pick a random initial pair to propose
  const randUserProp = userProps[Math.floor(Math.random() * userProps.length)];
  const randBotProp = botProps[Math.floor(Math.random() * botProps.length)];
  userSelect.value = String(randUserProp.index);
  botSelect.value = String(randBotProp.index);

  gameState.pendingTrade = {
    initiatedBy: "USER",
    fromPlayerId: 0,
    toPlayerId: randBotProp.ownerId,
    offeredTileIndex: randUserProp.index,
    requestedTileIndex: randBotProp.index
  };

  const acceptBtn = document.getElementById("accept-trade-btn");
  const declineBtn = document.getElementById("decline-trade-btn");
  acceptBtn.textContent = "Offer!";
  declineBtn.textContent = "Forget it!";

  updateDraftTradeSummary();
  creatorForm.classList.remove("hidden");
  responseActions.classList.remove("hidden");
}

// ============================================================================
// INITIALIZATION & EVENT LISTENERS
// ============================================================================

function roundOneDecimal(val) {
  return Math.round(val * 10) / 10;
}

function wireEventListeners() {
  // Start Game button on Rules screen
  document.getElementById("start-game-btn").addEventListener("click", () => {
    document.getElementById("rules-screen").classList.remove("active");
    if (gameState.phase === "RULES") {
      gameState.phase = "WAIT_FOR_ROLL";
      refreshAllViews();
    }
  });

  // Re-open Rules button
  document.getElementById("rules-reopen-btn").addEventListener("click", () => {
    document.getElementById("rules-screen").classList.add("active");
    const startBtn = document.getElementById("start-game-btn");
    if (startBtn) startBtn.textContent = (gameState.phase === "RULES") ? "Start game" : "Resume game";
  });

  // Dice Box click / tap to roll
  const diceBox = document.getElementById("dice-click-box");
  diceBox.addEventListener("click", () => {
    if (gameState.phase === "WAIT_FOR_ROLL" && gameState.currentPlayerIndex === 0) {
      executeTurnRoll();
    } else if (gameState.phase === "WAIT_FOR_ROLL" && gameState.players[gameState.currentPlayerIndex].isBot) {
      // If user taps the dice box during a bot's pre-roll pause, trigger the bot roll immediately
      clearTimeout(gameState.botTurnTimeout);
      executeTurnRoll();
    }
  });

  diceBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      diceBox.click();
    }
  });

  // Dice Roll Control ("Director" / "Random" / "Manual Cheat")
  const rigToggleBtn = document.getElementById("rig-toggle-btn");
  const rigDrawer = document.getElementById("dice-rig-drawer");
  const modeSelect = document.getElementById("dice-mode-select");
  const manualPicker = document.getElementById("manual-dice-picker");
  const modeLabel = document.getElementById("rig-mode-label");

  rigToggleBtn.addEventListener("click", () => {
    rigDrawer.classList.toggle("hidden");
  });

  modeSelect.addEventListener("change", () => {
    gameState.diceMode = modeSelect.value;
    const labelMap = { DIRECTOR: "Director", RANDOM: "Random", MANUAL: "Manual" };
    modeLabel.textContent = labelMap[gameState.diceMode] || "Director";
    if (gameState.diceMode === "MANUAL") {
      manualPicker.classList.remove("hidden");
    } else {
      manualPicker.classList.add("hidden");
    }
  });

  // Trade buttons & selectors
  document.getElementById("create-trade-btn").addEventListener("click", openUserTradeCreator);
  document.getElementById("trade-user-prop-select").addEventListener("change", updateDraftTradeSummary);
  document.getElementById("trade-bot-prop-select").addEventListener("change", updateDraftTradeSummary);
  document.getElementById("accept-trade-btn").addEventListener("click", () => resolvePendingTrade(true));
  document.getElementById("decline-trade-btn").addEventListener("click", () => resolvePendingTrade(false));
}

async function initGame() {
  initDieElement(document.getElementById("die-1"));
  initDieElement(document.getElementById("die-2"));
  renderDieFace(document.getElementById("die-1"), 1);
  renderDieFace(document.getElementById("die-2"), 1);

  wireEventListeners();

  // Animate splash screen progress bar at one-third speed while loading assets
  const progressBar = document.getElementById("splash-progress-bar");
  const statusText = document.getElementById("splash-status-text");

  const [propsText, cardsText, milestonesText] = await Promise.all([
    fetchTextWithFallback("Properties.csv", FALLBACK_PROPERTIES_CSV),
    fetchTextWithFallback("Cards.csv", FALLBACK_CARDS_CSV),
    fetchTextWithFallback("Milestones.csv", FALLBACK_MILESTONES_CSV)
  ]);

  const propertiesMap = parsePropertiesCSV(propsText);
  gameState.tiles = buildBoardTiles(propertiesMap);
  const parsedCards = parseCardsCSV(cardsText);
  gameState.cards.chance = parsedCards.chance;
  gameState.cards.communityChest = parsedCards.communityChest;
  gameState.milestonesData = parseMilestonesCSV(milestonesText);

  renderThumbnailBoard();
  refreshAllViews();

  // Fill progress bar steadily over SPLASH_DURATION_MS (1/3 of original speed)
  const steps = 20;
  const stepWait = Math.round(SPLASH_DURATION_MS / steps);
  for (let i = 1; i <= steps; i++) {
    const pct = Math.round((i / steps) * 100);
    progressBar.style.width = `${pct}%`;
    if (pct === 40) {
      statusText.textContent = "Stocking Wegovy & Oculostenotic Stents...";
    } else if (pct === 85) {
      statusText.textContent = "Ready for Admission!";
    }
    await sleep(stepWait);
  }

  // Transition from Splash Screen -> Rules of the Game Screen
  document.getElementById("splash-screen").classList.remove("active");
  document.getElementById("rules-screen").classList.add("active");
  gameState.phase = "RULES";
}

window.addEventListener("DOMContentLoaded", initGame);
