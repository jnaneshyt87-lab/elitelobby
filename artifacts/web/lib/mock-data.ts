const _BASE = new Date("2026-05-28T20:00:00.000Z").getTime();
const _T = (offsetMs: number) => new Date(_BASE + offsetMs).toISOString();

export const CS_TIME_SLOTS = [
  { label: "6:00 PM",  ist: "18:00" },
  { label: "7:00 PM",  ist: "19:00" },
  { label: "8:00 PM",  ist: "20:00" },
  { label: "9:00 PM",  ist: "21:00" },
  { label: "10:00 PM", ist: "22:00" },
  { label: "11:00 PM", ist: "23:00" },
];

export const CS_RULES = [
  {
    icon: "🏠",
    title: "Custom Room by Host",
    desc: "All matches are played in custom rooms created by the host. Room ID and password are shared via the platform 10 minutes before your selected time slot.",
  },
  {
    icon: "🚫",
    title: "No Hacks / Emulators / Cheats / Panels",
    desc: "Any use of hacks, cheat panels, emulators, macros, or third-party tools results in immediate disqualification and a permanent platform ban. Entry fee is forfeited.",
  },
  {
    icon: "📱",
    title: "Mobile Only",
    desc: "All players must use a mobile device. Emulator users are detected and disqualified with no refund. No exceptions under any circumstances.",
  },
  {
    icon: "💬",
    title: "Join WhatsApp / Discord Group",
    desc: "Team captain must join the WhatsApp or Discord group shared after registration. Room IDs, updates, and result confirmations are all communicated through this group.",
  },
  {
    icon: "📸",
    title: "Screenshot of Result Mandatory",
    desc: "A clear screenshot of the final match result screen must be shared in the group within 10 minutes of match end. No screenshot = no prize claim, no exceptions.",
  },
  {
    icon: "🏆",
    title: "Winner Takes All — 80% of Pot",
    desc: "The winning team receives 80% of the total pot (both teams' stakes combined). A 20% platform fee is deducted. Prize is credited to your EliteLobby wallet immediately after result verification.",
  },
  {
    icon: "⏰",
    title: "Join Within 5 Minutes of Slot Time",
    desc: "You must be in the custom room within 5 minutes of your selected time slot. Late arrivals forfeit their slot — no refunds for no-shows.",
  },
  {
    icon: "📋",
    title: "Admin Decision Is Final",
    desc: "All disputes must be raised within 15 minutes of result announcement with screenshot proof. EliteLobby admin decisions are final and binding.",
  },
];

export const BR_GENERAL_RULES = [
  { icon: "🚫", title: "No Hacks / Scripts / Mod APKs", desc: "No Hacks, Scripts, Mod APKs, Config Files, or Third-Party Applications. Violators are permanently banned and entry fee is forfeited." },
  { icon: "💻", title: "No PC Players or Emulators", desc: "PC Players and Emulator users are strictly prohibited. Mobile devices only — no exceptions. Emulator detection leads to immediate disqualification." },
  { icon: "📱", title: "Mobile Devices Only", desc: "All participants must play on a mobile device. Any evidence of emulator or PC play results in disqualification with no refund." },
  { icon: "⏰", title: "No Late Join Requests", desc: "Late Join Requests will not be accepted under any circumstances. Be in the room before match start or your slot is forfeited." },
  { icon: "🔑", title: "Room ID 10 Minutes Before", desc: "Room ID & Password will be shared 10 minutes before match start via the platform. Keep notifications on and monitor your lobby page." },
  { icon: "🎮", title: "Registered UID Only", desc: "Players must join using their registered Free Fire UID. Joining with a different account results in disqualification." },
  { icon: "⚡", title: "Zero Tolerance for Cheating", desc: "Any form of cheating results in immediate disqualification, prize forfeiture, and a permanent platform ban. All reports are reviewed." },
  { icon: "🏛️", title: "Host Decisions Are Final", desc: "All admin and host decisions are final and binding. Disputes must be raised within 15 minutes of result announcement with screenshot proof." },
  { icon: "🤝", title: "Respectful Behavior Required", desc: "Players must maintain respectful behavior throughout the event. Toxic conduct, harassment, or abuse leads to disqualification." },
  { icon: "🌐", title: "Internet Is Player's Responsibility", desc: "Internet connectivity issues are entirely the player's responsibility. Disconnections do not warrant re-entry, refunds, or rematches." },
];

export const BR_SPECIFIC_RULES = [
  { icon: "🗺️", title: "Random Map Selection", desc: "Map will be randomly selected by the host before each match. Players have no control over map selection — all maps are in the pool." },
  { icon: "🤜", title: "No Teaming with Other Teams", desc: "Intentional teaming with other teams is strictly prohibited and monitored. Any confirmed teaming leads to a permanent ban from the platform." },
  { icon: "👁️", title: "No Spectator Information Sharing", desc: "Sharing game information while spectating (calls, messages, screen share) is cheating. Violators are disqualified immediately." },
  { icon: "📢", title: "Follow Host Instructions", desc: "Players must follow all host instructions at all times. Failure to comply with host directives results in removal from the tournament." },
  { icon: "💀", title: "Kill + Placement Points System", desc: "Winners are determined by combined Kill Points and Placement Points. Final point table will be shared by the host after match conclusion." },
  { icon: "🔥", title: "Intentional Teaming = Permanent Ban", desc: "Intentional teaming is taken extremely seriously. Confirmed cases result in a permanent ban with no possibility of appeal." },
];

export const MOCK_TOURNAMENTS = [
  {
    id: "clash-squad",
    title: "Clash Squad",
    game: "Free Fire",
    game_mode: "Clash Squad",
    entry_fee: 100,
    prize_pool: 1600,
    stake_min: 100,
    stake_max: 1000,
    winner_pct: 80,
    max_slots: 200,
    filled_slots: 47,
    match_time: _T(17.5 * 3600000),
    map_name: "Host Pick",
    status: "live",
    banner_url: null,
    rules: "Choose your format (4v4, 3v3, 2v2, or 1v1). Set your team stake (₹100–₹1,000). Pick a daily time slot (6 PM–11 PM). The winning team takes 80% of the total pot. Mobile only, no hacks, no emulators, screenshot mandatory.",
  },

  // ── Battle Royale (single entry — mode selected inside detail page) ──────
  {
    id: "battle-royale",
    title: "Battle Royale",
    game: "Free Fire",
    game_mode: "Battle Royale",
    tournament_type: "battle-royale",
    entry_fee: 100,
    prize_pool: 80000,
    max_slots: 100,
    filled_slots: 67,
    match_time: _T(90.5 * 3600000),
    map_name: "Random",
    status: "live",
    banner_url: null,
    rules: "Battle Royale — Solo, Duo, or Squad. Choose your mode and entry fee. Kill + placement points determine winners. Mobile only, no hacks, no emulators.",
  },
];

export const BR_MODES = [
  { key: "Solo",  label: "Solo",  teamSize: 1, desc: "Solo Grind", slots: "50 players", maxSlots: 50 },
  { key: "Duo",   label: "Duo",   teamSize: 2, desc: "Duo Clash",  slots: "12 teams",   maxSlots: 12 },
  { key: "Squad", label: "Squad", teamSize: 4, desc: "Squad War",  slots: "12 squads",  maxSlots: 12 },
];

export const MOCK_BGMI_TOURNAMENTS = [
  {
    id: "bgmi-t1",
    title: "BGMI Pro League Season 1",
    game: "BGMI",
    game_mode: "Squad",
    entry_fee: 100,
    prize_pool: 15000,
    max_slots: 25,
    filled_slots: 0,
    match_time: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
    map_name: "Erangel",
    status: "upcoming",
    banner_url: null,
    rules: "Standard BGMI tournament rules.",
  },
  {
    id: "bgmi-t2",
    title: "BGMI Solo Ranked Cup",
    game: "BGMI",
    game_mode: "Solo",
    entry_fee: 50,
    prize_pool: 8000,
    max_slots: 48,
    filled_slots: 0,
    match_time: new Date(Date.now() + 10 * 24 * 3600000).toISOString(),
    map_name: "Miramar",
    status: "upcoming",
    banner_url: null,
    rules: "Solo survival. Top 5 win prizes.",
  },
  {
    id: "bgmi-t3",
    title: "BGMI Duo Clash",
    game: "BGMI",
    game_mode: "Duo",
    entry_fee: 80,
    prize_pool: 10000,
    max_slots: 24,
    filled_slots: 0,
    match_time: new Date(Date.now() + 14 * 24 * 3600000).toISOString(),
    map_name: "Vikendi",
    status: "upcoming",
    banner_url: null,
    rules: "Duo format. Most placement + kills wins.",
  },
];

export const MOCK_COD_TOURNAMENTS = [
  {
    id: "cod-t1",
    title: "COD Mobile Battle Royale",
    game: "COD Mobile",
    game_mode: "Squad",
    entry_fee: 120,
    prize_pool: 20000,
    max_slots: 25,
    filled_slots: 0,
    match_time: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
    map_name: "Isolated",
    status: "upcoming",
    banner_url: null,
    rules: "Standard COD Mobile BR rules.",
  },
  {
    id: "cod-t2",
    title: "COD Mobile Multiplayer Cup",
    game: "COD Mobile",
    game_mode: "Squad",
    entry_fee: 75,
    prize_pool: 12000,
    max_slots: 16,
    filled_slots: 0,
    match_time: new Date(Date.now() + 12 * 24 * 3600000).toISOString(),
    map_name: "Nuketown",
    status: "upcoming",
    banner_url: null,
    rules: "5v5 multiplayer format. Best of 3.",
  },
  {
    id: "cod-t3",
    title: "COD Mobile Solo Ranked",
    game: "COD Mobile",
    game_mode: "Solo",
    entry_fee: 50,
    prize_pool: 6000,
    max_slots: 32,
    filled_slots: 0,
    match_time: new Date(Date.now() + 9 * 24 * 3600000).toISOString(),
    map_name: "Crash",
    status: "upcoming",
    banner_url: null,
    rules: "Solo ranked format. Top 3 win prizes.",
  },
];

export const MOCK_LEADERBOARD = [
  { rank: 1,  username: "Team MBG",    game: "Free Fire", wins: 14, kills: 890, earnings: 8500, avatar: null, trend: "up" },
  { rank: 2,  username: "Rex Gaming",  game: "Free Fire", wins: 11, kills: 720, earnings: 6200, avatar: null, trend: "up" },
  { rank: 3,  username: "777 Official",game: "Free Fire", wins: 9,  kills: 650, earnings: 4800, avatar: null, trend: "down" },
  { rank: 4,  username: "Jarvis",      game: "Free Fire", wins: 8,  kills: 580, earnings: 3500, avatar: null, trend: "up" },
  { rank: 5,  username: "DFG",         game: "Free Fire", wins: 7,  kills: 510, earnings: 2900, avatar: null, trend: "same" },
  { rank: 6,  username: "NG Smooth",   game: "Free Fire", wins: 6,  kills: 450, earnings: 2200, avatar: null, trend: "down" },
  { rank: 7,  username: "DGF Smoke",   game: "Free Fire", wins: 5,  kills: 390, earnings: 1800, avatar: null, trend: "up" },
  { rank: 8,  username: "JS Kicks",    game: "Free Fire", wins: 4,  kills: 340, earnings: 1400, avatar: null, trend: "up" },
  { rank: 9,  username: "MBG Rakesh",  game: "Free Fire", wins: 3,  kills: 280, earnings: 900,  avatar: null, trend: "down" },
  { rank: 10, username: "TGFF Warner", game: "Free Fire", wins: 3,  kills: 230, earnings: 600,  avatar: null, trend: "same" },
];

export const MOCK_RECENT_WINNERS = [
  { username: "Team MBG",    tournament: "CS 4v4 Team Battle — 8 PM Slot", prize: 1600, position: 1, game: "Free Fire" },
  { username: "Rex Gaming",  tournament: "CS 1v1 Solo Showdown — 7 PM Slot", prize: 800,  position: 1, game: "Free Fire" },
  { username: "777 Official",tournament: "CS 3v3 Trio Clash — 9 PM Slot",    prize: 600,  position: 1, game: "Free Fire" },
  { username: "Jarvis",      tournament: "CS 2v2 Duo Duel — 6 PM Slot",      prize: 500,  position: 1, game: "Free Fire" },
];

export const MOCK_STATS = {
  totalPlayers: 5820,
  totalPrizePool: 125000,
  tournamentsThisMonth: 38,
  activeTournaments: 4,
};

export const MOCK_USER = {
  id: "demo-user",
  username: "DemoPlayer",
  game_id: "FF123456789",
  wallet_balance: 1250,
  total_winnings: 8500,
  kills: 342,
  rank_points: 4820,
  rank: "Gold",
  tournaments_played: 18,
  tournaments_won: 3,
};

export const MOCK_NOTIFICATIONS = [
  { id: "n1", title: "Room ID Released", message: "Room ID for CS 4v4 8 PM slot is now available!", read: false, created_at: new Date(Date.now() - 300000).toISOString() },
  { id: "n2", title: "Payment Approved", message: "Your ₹100 deposit has been approved.", read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: "n3", title: "Match Result", message: "You won CS 1v1 Solo Showdown! ₹160 credited.", read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
];

export const MOCK_TRANSACTIONS = [
  { id: "tx1", type: "deposit", amount: 500, status: "completed", created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: "tx2", type: "entry_fee", amount: -100, status: "completed", created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "tx3", type: "winning", amount: 1600, status: "completed", created_at: new Date(Date.now() - 43200000).toISOString() },
  { id: "tx4", type: "entry_fee", amount: -250, status: "completed", created_at: new Date(Date.now() - 21600000).toISOString() },
];

export const MOCK_REGISTRATIONS = [
  { id: "r1",  tournament_id: "clash-squad", username: "Team MBG",    game_uid: "FF-88241", email: "mbg@example.com",      format: "4v4", fee_paid: 200, registered_at: new Date(Date.now() - 5 * 3600000).toISOString(),  payment_status: "confirmed" },
  { id: "r2",  tournament_id: "clash-squad", username: "Rex Gaming",  game_uid: "FF-72910", email: "rex@example.com",      format: "4v4", fee_paid: 200, registered_at: new Date(Date.now() - 4 * 3600000).toISOString(),  payment_status: "confirmed" },
  { id: "r3",  tournament_id: "clash-squad", username: "MBG Rakesh",  game_uid: "FF-10023", email: "rakesh@example.com",   format: "4v4", fee_paid: 200, registered_at: new Date(Date.now() - 3 * 3600000).toISOString(),  payment_status: "confirmed" },
  { id: "r4",  tournament_id: "clash-squad", username: "TGFF Warner", game_uid: "FF-33891", email: "warner@example.com",   format: "3v3", fee_paid: 200, registered_at: new Date(Date.now() - 2 * 3600000).toISOString(),  payment_status: "confirmed" },
  { id: "r5",  tournament_id: "clash-squad", username: "777 Official",game_uid: "FF-55001", email: "777@example.com",      format: "3v3", fee_paid: 200, registered_at: new Date(Date.now() - 90 * 60000).toISOString(),   payment_status: "confirmed" },
  { id: "r6",  tournament_id: "clash-squad", username: "DFG",         game_uid: "FF-91004", email: "dfg@example.com",      format: "2v2", fee_paid: 100, registered_at: new Date(Date.now() - 3 * 3600000).toISOString(),  payment_status: "confirmed" },
  { id: "r7",  tournament_id: "clash-squad", username: "NG Smooth",   game_uid: "FF-77321", email: "ngsmooth@example.com", format: "2v2", fee_paid: 100, registered_at: new Date(Date.now() - 2 * 3600000).toISOString(),  payment_status: "confirmed" },
  { id: "r8",  tournament_id: "clash-squad", username: "DGF Smoke",   game_uid: "FF-48871", email: "dgfsmoke@example.com", format: "1v1", fee_paid: 500, registered_at: new Date(Date.now() - 80 * 60000).toISOString(),   payment_status: "confirmed" },
  { id: "r9",  tournament_id: "clash-squad", username: "JS Kicks",    game_uid: "FF-30012", email: "jskicks@example.com",  format: "1v1", fee_paid: 500, registered_at: new Date(Date.now() - 45 * 60000).toISOString(),   payment_status: "confirmed" },
  { id: "r10", tournament_id: "clash-squad", username: "Jarvis",      game_uid: "FF-20938", email: "jarvis@example.com",   format: "4v4", fee_paid: 250, registered_at: new Date(Date.now() - 30 * 60000).toISOString(),   payment_status: "confirmed" },
];

export const BR_SERIES_MATCHES = [
  { number: 1, label: "Match 1 — Bermuda Classic",  map: "Bermuda",  time_ist: "8:00 PM",  isFinal: false },
  { number: 2, label: "Match 2 — Kalahari Clash",   map: "Kalahari", time_ist: "8:45 PM",  isFinal: false },
  { number: 3, label: "Match 3 — Purgatory Rush",   map: "Purgatory",time_ist: "9:30 PM",  isFinal: false },
  { number: 4, label: "Match 4 — Bermuda Storm",    map: "Bermuda",  time_ist: "10:15 PM", isFinal: false },
  { number: 5, label: "Grand Final — Kalahari",     map: "Kalahari", time_ist: "11:00 PM", isFinal: true  },
];
