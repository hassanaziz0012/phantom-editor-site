// Generates index.html from the content below. Run: node build.mjs
// The page is static; Vercel serves the committed index.html as is.
import { writeFileSync } from 'node:fs';

const GITHUB = 'https://github.com/hassanaziz0012/phantom-editor';
const YOUTUBE = 'https://www.youtube.com/@itshassanaziz?sub_confirmation=1';
const X = 'https://x.com/intent/user?screen_name=nothassanaziz';
const SITE = 'https://www.hassandev.me';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const c = (cls, s) => `<span class="t-${cls}">${esc(s)}</span>`;

/* ------------------------------------------------------------------ hero: status readout */

const STAGES = ['New', 'Script', 'Thumb', 'Rec', 'Proc', 'Rev', 'Ready', 'Sched', 'Upload'];
const pipelineLine = (n) => {
  const parts = STAGES.map((name, i) => {
    const k = i + 1;
    if (n > 9 || k < n) return c('ok', `✓${k}`);
    if (k === n) return `<b>${c('ok', `[${k}:${name}]`)}</b>`;
    return c('dim', `${k}:${name}`);
  });
  if (n > 9) parts.push(`<b>${c('bad', '[10:Repack]')}</b>`);
  return parts.join(' ➔ ');
};
const file = (ok, label) => `[${c(ok ? 'ok' : 'dim', `${ok ? '✓' : '✗'} ${label}`)}]`;

const heroProjects = [
  {
    title: 'Why I script before I record', n: 2, label: 'Scripted', tone: 'dim', state: 'pending',
    next: 'Design the thumbnail (e.g. thumbnail.png)',
    files: [file(1, 'outline.md'), '[No raw files]', file(0, 'to-review.mp4'), file(0, 'final.mp4'), file(0, 'metadata.json'), file(0, 'thumbnail')],
  },
  {
    title: 'My new app changes YouTube forever', n: 5, label: 'Processed', tone: 'warn', state: 'pending',
    next: 'Review video and export final.mp4',
    files: [file(1, 'outline.md'), '[1 raw file(s)]', file(1, 'to-review.mp4'), file(0, 'final.mp4'), file(0, 'metadata.json'), file(1, 'thumbnail (thumbnail.png)')],
  },
  {
    title: 'Terminals are easy, actually', n: 7, label: 'Ready to Schedule', tone: 'info', state: 'pending',
    next: 'Upload video to YouTube (`phantom publish yt`) or set publishDate in metadata.json',
    files: [file(1, 'outline.md'), '[2 raw file(s)]', file(1, 'to-review.mp4'), file(1, 'final.mp4'), file(1, 'metadata.json'), file(1, 'thumbnail (thumbnail.png)')],
  },
  {
    title: 'Six weeks of content in one sitting', n: 9, label: 'Uploaded', tone: 'ok', state: 'finished',
    next: 'Pipeline complete!',
    files: [file(1, 'outline.md'), '[1 raw file(s)]', file(1, 'to-review.mp4'), file(1, 'final.mp4'), file(1, 'metadata.json (Uploaded: 2026-10-20)'), file(1, 'thumbnail (thumbnail.png)')],
  },
];
const rule = (ch) => c('dim', ch.repeat(78));
const heroReadout = [
  `<span class="full">${c('info', '='.repeat(78))}\n<b> YOUTUBE CONTENT PIPELINE SUMMARY</b>\n${c('dim', ' Directory: ~/Videos/YT Projects')}\n${c('info', '='.repeat(78))}\n</span>`,
  ...heroProjects.map((p, i) =>
    `<span class="proj" data-state="${p.state}">` +
    `<span class="full"><b>${i + 1}. ${esc(p.title)}</b>\n   Stage ${p.n}/9: <b>${c(p.tone, `[${p.label}]`)}</b>\n   Pipeline: ${pipelineLine(p.n)}\n   <b>➜ Next Step:</b> ${esc(p.next)}\n   Files: ${p.files.join(' | ')}\n${rule('-')}\n</span>` +
    `<span class="less">${String(p.n).padStart(2)}/9 ${c(p.tone, `[${p.label}]`.padEnd(20))} ${esc(p.title)}\n      ${c('dim', '➜ ' + p.next)}\n</span>` +
    `</span>`),
].join('');

/* ------------------------------------------------------------------ pipeline stages */

const stages = [
  { name: 'New', clause: 'First, name<br>the video', label: 'New',
    text: 'One command makes the project folder that every later step reads from and writes to.',
    next: 'Write outline.md', cmd: 'phantom projects newvideo "My new app changes YouTube forever"' },
  { name: 'Scripted', clause: 'Second, write<br>the outline', label: 'Scripted',
    text: 'outline.md counts as a script once it has a hook, an outline and a marker for where the video asks for the like.',
    next: 'Design the thumbnail (e.g. thumbnail.png)', cmd: 'phantom projects status --scripted' },
  { name: 'Thumbnail', clause: 'Third, design<br>the thumbnail', label: 'Added Thumbnail',
    text: 'The thumbnail comes before the camera. It is easier to record a video that delivers on a strong thumbnail than the reverse.',
    next: 'Record raw footage that delivers on the thumbnail', cmd: 'phantom meta titles --thumbnail "before and after"' },
  { name: 'Recorded', clause: 'Fourth, record<br>the footage', label: 'Recorded',
    text: 'One pre-composed recording goes in the folder. Bad takes go in cuts.txt, one time range per line.',
    next: 'Run phantom projects process', cmd: 'phantom projects process raw.mp4 --bgm lofi-chill' },
  { name: 'Processed', clause: 'Fifth, run<br>one command', label: 'Processed',
    text: 'Seven steps: transcribe, trim the silences, clean the audio, encode once, verify, review, write the metadata.',
    next: 'Review video and export final.mp4', cmd: 'phantom edit inspect-video to-review.mp4' },
  { name: 'Reviewed', clause: 'Sixth, watch<br>it back', label: 'Reviewed',
    text: 'You watch the cut. Phantom has already scanned it for black frames, frozen frames and bad audio.',
    next: 'Fill in the missing keys of metadata.json', cmd: 'phantom meta approve-title "My new app changes YouTube forever" 2' },
  { name: 'Ready', clause: 'Seventh, pick<br>a title', label: 'Ready to Schedule',
    text: 'Titles arrive scored and ranked. Nothing uploads until one is approved and every promised link has a URL.',
    next: 'Upload to YouTube or set publishDate in metadata.json', cmd: 'phantom meta read --json' },
  { name: 'Scheduled', clause: 'Eighth, set<br>the date', label: 'Scheduled',
    text: 'A publishDate in metadata.json uploads the video private and lets YouTube make it public on the day.',
    next: 'Upload video to YouTube, scheduled for 2026-11-12', cmd: 'phantom publish yt final.mp4 --playlist "Automation Tips"' },
  { name: 'Uploaded', clause: 'Ninth, publish<br>everywhere', label: 'Uploaded',
    text: 'The upload sets the thumbnail and playlist, then sends the tweet, the Substack note and the email. One failing never skips the rest.',
    next: 'Pipeline complete!', cmd: 'phantom projects status --finished' },
];
const stageFiles = [
  ['outline.md', 2], ['thumbnail.png', 3], ['raw.mp4', 4], ['to-review.mp4', 5],
  ['final.mp4', 6], ['metadata.json', 7], ['publishDate', 8], ['YouTube URL', 9],
];
const START = 5;

/* ------------------------------------------------------------------ outputs carousel */

const outputs = [
  {
    file: 'cuts.txt', name: 'Bad takes, cut from a text file',
    text: 'One start and end per line, on the raw recording’s timeline. The ranges come out in the same single encode, so they cost nothing extra.',
    pre: `${c('dim', '# the coughing fit')}\n00:27-00:35\n${c('dim', '# said the wrong model name')}\n06:25-06:35\n02:05-02:17.5`,
  },
  {
    file: 'summary.md', name: 'One command, seven steps',
    text: 'The run report for a real 7 minute video. The video is encoded once, at the end, straight from the source. A finished step is skipped on the next run.',
    pre: `<b># phantom pipeline</b>\nInput: raw.mp4 (1920x1080, 30fps) -> final.mp4 (07:31)\nCuts (cuts.txt): 00:27-00:35, 06:25-06:35\n\n<b>## Review flags</b>\n${c('ok', 'none')}\n\n<b>## Timing</b>\nTranscription              8.1s\nSpeech Extraction          5.4s\nAudio Processing          1m03s\nFinal Encode & Multiplex  4m00s\nVerify Final               0.2s\nAudio & Video Review      39.6s\nAuto Create Metadata      2m21s\n<b>total                     7m29s</b>`,
  },
  {
    file: 'process_audio.sh', name: 'Every video at the same loudness',
    text: 'DeepFilterNet takes the room noise out, then loudnorm brings the voice to −16 LUFS with a true peak of −1.5 dB. The video stream is copied, never re-encoded.',
    pre: `${c('dim', '# 1. extract   2. denoise   3. normalise   4. remux')}\ndeep-filter raw-audio.wav\nffmpeg -i filtered.wav \\\n  -af ${c('ok', '"loudnorm=I=-16:TP=-1.5:LRA=11"')} \\\n  -ar 48000 processed-audio.wav`,
  },
  {
    file: 'phantom edit inspect-video', name: 'A check before anyone sees it',
    text: 'ffmpeg’s blackdetect and freezedetect scan the final file and print the exact timestamp of anything wrong, ready to find in an editor.',
    pre: `${'='.repeat(52)}\n<b>VIDEO QUALITY CONTROL INSPECTION REPORT</b>\n${'='.repeat(52)}\nResolution:      1920x1080 (1080p Full HD)\nAspect Ratio:    16:9 [Ratio: 1.78]\nDuration:        00:07:31.000\nFrame Rate:      30.00 fps\n${'-'.repeat(52)}\n  • Black Detect:  min_duration=0.1s\n  • Freeze Detect: min_duration=0.5s\n${'-'.repeat(52)}\n${c('ok', 'SUCCESS: No video glitches or bad frames detected')}`,
  },
  {
    file: 'phantom meta approve-title', name: 'Titles, scored out of sixteen',
    text: 'Claude drafts the titles and scores each on eight counts, from clarity to honesty. The top one is a placeholder until a person approves it.',
    pre: `<b>My new app changes YouTube forever</b>\n   Current title ${c('warn', '(not approved)')}\n   1. ${c('ok', '[14/16]')} I Built the App YouTube Should Have Shipped  ${c('dim', '(44 chars)')}\n   2. ${c('ok', '[13/16]')} This App Replaced My Video Editor  ${c('dim', '(33 chars)')}\n   3. [13/16] Why I Stopped Editing My Own Videos  ${c('dim', '(35 chars)')}\n   4. [12/16] One Command Now Edits My Whole Video  ${c('dim', '(36 chars)')}\n   5. [12/16] My Editing Workflow Is a Terminal Now  ${c('dim', '(37 chars)')}`,
  },
  {
    file: 'metadata.json', name: 'Everything YouTube asks for',
    text: 'Description, chapters, tweet, next-video picks and resource links, all written from the trimmed captions so a cut take never reaches them.',
    pre: `{\n  ${c('info', '"title"')}: "How Semantic Caching Works and How to Use It",\n  ${c('info', '"titleReviewed"')}: true,\n  ${c('info', '"timestamps"')}: [\n    { "timestamp": "00:00", "topic": "The Repeat Question Problem" },\n    { "timestamp": "00:40", "topic": "Who Should Use Semantic Caching" },\n    { "timestamp": "01:35", "topic": "Semantic Caching Flow Example" }\n  ],\n  ${c('info', '"tweetTemplate"')}: "... {url}",\n  ${c('info', '"resources"')}: [ ... ],\n  ${c('info', '"recommendations"')}: [ ... ]\n}`,
  },
  {
    file: 'phantom projects status --repackage', name: 'A second look after 48 hours',
    text: 'Two days after publishing, the video’s click-through rate is read from YouTube Studio and set against the channel’s 28-day figure. A weak one is flagged for a new title and thumbnail.',
    pre: `<b>Six weeks of content in one sitting</b>\n   Stage 10: <b>${c('bad', '[Needs Repackaging]')}</b>\n   <b>➜ Next Step:</b> Rework the title & thumbnail:\n     CTR 2.1% in its first 2 days\n     < channel's 28-day 3.4%\n   Files: [${c('ok', '✓ final.mp4')}] | [${c('ok', '✓ metadata.json')}]`,
  },
];

/* ------------------------------------------------------------------ b-roll */

const D = '--var theme=dark';
const broll = [
  { id: 'step', name: 'step-card', head: 'A numbered point, on cue',
    text: 'Step 2 of 7, red flag number 3, tip number 7. The label is a pattern and the title fits itself to the frame, from 112 pixels down to 56.',
    cmd: 'phantom broll clip step-card -o step-2.mp4 \\\n  --cue "so number two" --until "every single pause" \\\n  --var number=2 --var total=7 \\\n  --var "title=Trim every silence"' },
  { id: 'stat', name: 'big-stat', head: 'One number, counted up',
    text: 'Write the value the way it should read. The digits roll up like an odometer, and the words around them sit small on the same baseline.',
    cmd: 'phantom broll clip big-stat -o stat.mp4 \\\n  --cue "forty eight hours" \\\n  --var "value=48 hours" \\\n  --var "label=before a weak title gets flagged"' },
  { id: 'term', name: 'terminal', head: 'A command, typed out',
    text: 'Typed with a human rhythm that is the same on every render. Output lines can print on the beat of the words that mention them.',
    cmd: 'phantom broll clip terminal -o run.mp4 \\\n  --cue "you run one command" \\\n  --var "command=phantom projects process raw.mp4 --bgm lofi-chill" \\\n  --var "output=[dim]Trimming silences...\\n[green]final.mp4 written"' },
  { id: 'flow', name: 'flow', head: 'Boxes that light in turn',
    text: 'Two to six steps joined by arrows: the agent loop, a request on its way to a database, or this whole pipeline in four words.',
    cmd: 'phantom broll clip flow -o flow.mp4 \\\n  --cue "the whole thing is four steps" \\\n  --var "steps=Record|Fix mistakes|Process|Publish"' },
  { id: 'check', name: 'checklist', head: 'A list that ticks itself',
    text: 'Items get a tick or a cross as each one is said. Good for what to review, what never to automate, and what counts as done.',
    cmd: 'phantom broll clip checklist -o ready.mp4 \\\n  --cue "ready to schedule when" \\\n  --var "title=Ready to schedule when" \\\n  --var "items=final.mp4 exists|metadata.json is complete|a thumbnail is there"' },
];

/* ------------------------------------------------------------------ videos */

const videos = [
  ['PoWbjNE51hM', 'Got blocked on X for this AI take', '8:03', '7 Nov'],
  ['3gU_BA_19f0', 'How Semantic Caching Works and How to Use It', '13:00', '6 Nov'],
  ['dG2Qt2qaDeA', '7 everyday tasks worth automating with AI agents in 2026', '7:31', '3 Nov'],
  ['oEJuPIljJ3k', 'How Prompt Caching works and how to use it', '12:58', '2 Nov'],
  ['n8GsW6R1Jw8', 'This one trick fixed my Claude prompts', '2:32', '26 Oct'],
  ['s3v5FbTtvTI', 'Everything is falling apart', '6:52', '23 Oct'],
  ['hmfv85pG-ec', 'Watch me edit 6 weeks of content in 3m48s', '3:48', '20 Oct'],
  ['1J6pajNZRvs', 'Terminal Fundamentals For Vibe Coders In 20 Minutes', '20:19', '17 Oct'],
  ['GloEbjj45Oo', 'How I Would Learn To Code In 2026', '12:49', '14 Oct'],
];

/* ------------------------------------------------------------------ commands */

const groups = [
  ['projects', 'The pipeline', [
    ['status', 'See every video and its next step', '[--pending] [--finished] [--less] [--json]', 'Google Sheets'],
    ['process', 'Turn a raw recording into final.mp4', '<raw_video> [--bgm <track>] [--force]', 'ffmpeg, Silero VAD'],
    ['newvideo', 'Create a project folder', '<project_name>', ''],
    ['cleanup', 'Archive everything but the media', '[<project_path>] [--full]', ''],
  ]],
  ['edit', 'Audio and video', [
    ['trim-silences', 'Cut the pauses out of a recording', '<video_path>', 'Silero VAD'],
    ['process-audio', 'Denoise and normalise to −16 LUFS', '[-R|--recursive] <path>', 'DeepFilterNet, loudnorm'],
    ['add-bgm', 'Loop a music track under a video', '<video> <bgm_track> [--volume <percentage>]', 'ffmpeg'],
    ['caption', 'Transcribe and burn in captions', '<video_path> [--preset shorts|longs]', 'Whisper on Groq'],
    ['transcribe-cloud', 'Write an .srt from the audio', '<video_path>', 'Whisper on Groq'],
    ['inspect-video', 'Scan for black and frozen frames', '<video_path> [--black-duration <s>]', 'ffprobe'],
    ['review-audio', 'Flag audio problems before publishing', '<video_or_audio_path>', ''],
    ['downscale', 'Bring a video down to 1080p', '<video_path> [-o <output>]', 'ffmpeg'],
  ]],
  ['meta', 'Titles and metadata', [
    ['create', 'Write the whole metadata.json', '[<project_path>] [--skip-ai]', 'Claude'],
    ['titles', 'Generate and score title ideas', '[--traffic search|browse|both] [--channel-size small|mid|large]', 'Claude'],
    ['approve-title', 'List the titles and approve one', '<project> [<rank_or_title>]', ''],
    ['desc', 'Write a two or three sentence description', '[<project_path>]', 'Claude'],
    ['tweet', 'Draft the launch tweet, under 240 characters', '[<project_path>]', 'Claude'],
    ['timestamps', 'Turn captions into chapters', '[<captions_srt_path>]', 'Claude'],
    ['resources', 'List the links the video promised', '[<project_path>]', ''],
    ['recommend', 'Pick the videos to send viewers to next', '[<project_path>]', ''],
    ['prepare-recommendations', 'Index the channel for recommendations', '[<channel>] [--limit <int>] [--fresh]', 'YouTube Data API'],
    ['read', 'Print a project’s metadata', '[<project_or_video_path>] [--json]', ''],
    ['manual', 'Fill in the metadata by hand', '<video_path>', ''],
  ]],
  ['publish', 'Posting', [
    ['yt', 'Upload with thumbnail, playlist and schedule', '<video_path> [--playlist <name>] [--title <rank_or_title>]', 'YouTube Data API'],
    ['x', 'Post a tweet, with an image if you like', '[--image] [--substack] <tweet_content>', ''],
    ['substack', 'Post a Substack note', '[<text>] [-i <images>...] [-v <video>]', 'Playwright'],
    ['linkedin', 'Share a LinkedIn post', '[<text>] [-f <file>] [--url <url>]', ''],
    ['devto', 'Publish, schedule or draft from Markdown', '<markdown_file> [--tags <tags>...] [--schedule "YYYY-MM-DD HH:MM"]', ''],
    ['email', 'Send the broadcast to subscribers', '--title <title> --description <desc> --url <url>', 'Resend'],
    ['yap', 'Turn a spoken ramble into a post', '--platform <linkedin|substack>', ''],
  ]],
  ['research', 'Reddit and Skool', [
    ['reddit post', 'Scrape a post and its comments', '<url> [--max-comments <int>] [--json]', 'Playwright'],
    ['reddit analyze', 'Read the mood of a thread', '<url> [--json]', 'Groq'],
    ['reddit sub', 'Scrape a subreddit feed', '<subreddit> [--best|--hot] [--limit <int>]', 'Playwright'],
    ['reddit search', 'Scrape search results', '<query> [--sort <sort>] [--time <time>]', 'Playwright'],
    ['reddit profile', 'Scrape a user’s posts and comments', '<username_or_url> [--posts <int>]', 'Playwright'],
    ['reddit serve', 'Answer scrape requests as JSON lines', '[--port <int>] [--headless]', ''],
    ['skool post', 'Scrape a Skool post', '<url> [--max-comments <int>] [--json]', 'Playwright'],
    ['skool community', 'Scrape a community’s feed', '<url_or_slug> [--limit <int>]', 'Playwright'],
  ]],
  ['ideas', 'What to make next', [
    ['from-comments', 'Turn a video’s comments into ideas', '<video> [--limit <int>] [--order relevance|time]', 'Claude'],
    ['from-outlier', 'Turn an outlier video into ideas', '<video> [--fresh-summary] [--json]', ''],
    ['export', 'Send ideas to the Google Sheet', '[--file <path> | --idea <text>]', 'Google Sheets'],
    ['archive', 'Archive the ideas already reviewed', '[--dry-run]', 'Google Sheets'],
  ]],
  ['yt', 'The channel', [
    ['info', 'Read a video’s numbers from Studio', '<video> [--fresh] [--days <int>]', 'YouTube Studio'],
    ['channel-stats', 'Read the channel’s 28-day figures', '[--fresh] [--history]', 'YouTube Studio'],
    ['endscreen', 'Add an end screen from a template', '<video>... [--template <name>]', ''],
    ['add-to-playlist', 'Put a video in a playlist', '<video> <playlist_id_or_name>', 'YouTube Data API'],
    ['titles', 'Print a channel’s titles', '[<channel>] [--limit <int>] [--numbered]', 'YouTube Data API'],
    ['count-uploads', 'Count uploads over 7, 14 and 30 days', '[<channel>] [--fresh]', 'YouTube Data API'],
    ['summarize', 'Summarise any video', '<video> [--model <model>]', ''],
    ['comments', 'Scrape a video’s comments', '<video> [--limit <int>]', ''],
  ]],
  ['broll', 'B-roll clips', [
    ['list', 'Show the templates and their variables', '[<template>]', ''],
    ['find', 'Check where a phrase is said', '<phrase> [--srt <word_srt>] [--after <timestamp>]', ''],
    ['render', 'Render every clip in a cue file', '<cue_file.json> [--only <file>...] [--dry-run]', 'HyperFrames'],
    ['clip', 'Render one clip from flags', '<template> -o <output.mp4> [--cue <phrase>] [--var key=value...]', 'HyperFrames'],
  ]],
];
const total = groups.reduce((n, g) => n + g[2].length, 0);

/* ------------------------------------------------------------------ page */

const arrow = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>';
const arrowBack = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M19 12H6M12 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>';

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Phantom Editor: a video editor that isn't there</title>
<meta name="description" content="Phantom is an open-source command line that takes a YouTube video from raw recording to uploaded: trims, audio, titles, B-roll and posts included.">
<meta property="og:title" content="Phantom Editor">
<meta property="og:description" content="A video editor that isn't there. ${total} commands that take a YouTube video from raw recording to uploaded.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://phantom.hassandev.me">
<meta property="og:image" content="https://phantom.hassandev.me/assets/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0f1f10">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet"><!-- taste-skill-ignore: the mono face sets literal code and terminal output only -->
<link rel="stylesheet" href="styles.css">
<script>document.documentElement.classList.add('js')</script>
</head>
<body>

<header class="hero" id="top">
  <nav class="nav" aria-label="Main">
    <a class="wordmark" href="#top">phantom</a>
    <ul class="nav-links">
      <li><a class="link" href="#pipeline">Pipeline</a></li>
      <li><a class="link" href="#broll">B-roll</a></li>
      <li><a class="link" href="#videos">Videos</a></li>
      <li><a class="link" href="#commands">Commands</a></li>
      <li><a class="link" href="${GITHUB}">GitHub</a></li>
    </ul>
  </nav>

  <div class="hero-copy">
    <h1 class="display lines">
      <span class="line"><span data-line style="--i:0">A video editor</span></span>
      <span class="line"><span data-line style="--i:1">that isn’t there</span></span>
    </h1>
    <p class="hero-sub" data-rise style="--i:3">Phantom is the command line I built to take my YouTube videos from raw recording to uploaded. Trims, audio, titles, B-roll and posts included.</p>
    <div class="actions" data-rise style="--i:4">
      <a class="button" href="${GITHUB}">Star on GitHub</a>
      <a class="link-plain" href="#pipeline">See the nine stages</a>
    </div>
  </div>

  <div class="stage">
    <div class="term shutter" data-ui id="status">
      <div class="term-bar">
        <span class="term-title">Every video I’m making, and its next step</span>
        <div class="seg" role="group" aria-label="Filter the status readout">
          <button type="button" aria-pressed="true" data-flag="">all</button>
          <button type="button" aria-pressed="false" data-flag="--pending">--pending</button>
          <button type="button" aria-pressed="false" data-flag="--finished">--finished</button>
          <button type="button" aria-pressed="false" data-flag="--less">--less</button>
        </div>
      </div>
      <pre class="term-body" tabindex="0" aria-label="Output of phantom projects status"><span class="t-ok">$</span> phantom projects status<span id="status-flag"></span>\n\n${heroReadout}</pre>
    </div>
  </div>
</header>

<main>

<section class="pipeline" id="pipeline" aria-labelledby="clause">
  <div class="pipe-left">
    <h2 class="display" id="clause" aria-live="polite">${stages[START - 1].clause}</h2>
    <p class="pipe-text" id="stage-text">${stages[START - 1].text}</p>
  </div>
  <div class="pipe-right">
    <div class="term folder" data-ui>
      <pre class="term-body"><span class="t-dim">~/Videos/YT Projects/</span>\n<b>My new app changes YouTube forever</b>\nStage <span id="stage-n">${START}</span>/9: <b class="t-ok">[<span id="stage-label">${stages[START - 1].label}</span>]</b>\n\n${stageFiles.map(([f, k]) => `<span class="frow${START >= k ? ' is-there' : ''}" data-from="${k}">  <span class="mark"></span> ${f}</span>`).join('\n')}\n\n<b>➜ Next step:</b> <span id="stage-next">${esc(stages[START - 1].next)}</span>\n<span class="t-ok">$</span> <span id="stage-cmd">${esc(stages[START - 1].cmd)}</span></pre>
    </div>
  </div>
  <div class="pipe-slider">
    <label class="sr-only" for="stage">Stage of the video, one to nine</label>
    <div class="track" id="track" style="--p:${(START - 1) / 8}"><span class="track-fill"></span><input type="range" id="stage" min="1" max="9" step="1" value="${START}"></div>
    <ol class="stage-names">
      ${stages.map((s, i) => `<li${i + 1 === START ? ' class="is-on"' : ''}><button type="button" data-go="${i + 1}">${s.name}</button></li>`).join('\n      ')}
    </ol>
  </div>
  <script type="application/json" id="stage-data">${JSON.stringify(stages)}</script>
</section>

<section class="outputs" id="outputs" aria-labelledby="outputs-h">
  <div class="outputs-head wrap">
    <h2 class="head" id="outputs-h" data-reveal>What one run leaves behind</h2>
    <div class="arrows" data-reveal>
      <button type="button" class="sq" id="out-prev" aria-label="Previous output">${arrowBack}</button>
      <button type="button" class="sq" id="out-next" aria-label="Next output">${arrow}</button>
    </div>
  </div>
  <div class="row" id="out-row" tabindex="0" aria-label="Files and reports from one run">
    ${outputs.map((o, i) => `<figure class="out${i === 1 ? ' is-lit' : ''}">
      <div class="term" data-ui>
        <div class="term-bar"><span class="term-title">${esc(o.file)}</span></div>
        <pre class="term-body">${o.pre}</pre>
      </div>
      <figcaption>
        <h3 class="lead">${o.name}</h3>
        <p>${o.text}</p>
      </figcaption>
    </figure>`).join('\n    ')}
  </div>
</section>

<section class="broll" id="broll" aria-labelledby="broll-h">
  <div class="broll-field" id="broll-field" data-theme="dark">
    <video id="broll-video" class="shutter" data-reveal muted loop playsinline autoplay preload="metadata" poster="assets/broll/step-dark.jpg" src="assets/broll/step-dark.mp4" width="1280" height="720" aria-label="A B-roll clip rendered by phantom broll"></video>
    <p class="field-note" id="broll-note">step-card, rendered by phantom</p>
  </div>
  <div class="broll-col">
    <div class="broll-intro">
      <h2 class="head" id="broll-h" data-reveal>B-roll, timed to the words</h2>
      <p data-reveal>Each template is built once. Per video I write a small cue file and run one command, and every clip lands on the exact word that starts it. It costs no LLM tokens.</p>
      <p data-reveal>These five clips were rendered by Phantom for this page, in this page’s colours.</p>
      <div class="seg seg-page" role="group" aria-label="Theme of the clips" data-reveal>
        <button type="button" aria-pressed="true" data-theme="dark">Dark theme</button>
        <button type="button" aria-pressed="false" data-theme="light">Light theme</button>
      </div>
    </div>
    ${broll.map((b) => `<article class="clip" data-clip="${b.id}" data-name="${b.name}">
      <h3 class="lead">${b.head}</h3>
      <p>${b.text}</p>
      <pre class="cmd" tabindex="0"><code>${esc(b.cmd)}</code></pre>
      <button type="button" class="button button-quiet" data-play="${b.id}">Play ${b.name}</button>
    </article>`).join('\n    ')}
  </div>
</section>

<section class="videos" id="videos" aria-labelledby="videos-h">
  <div class="ledger">
    <h2 class="lead" id="videos-h" data-reveal>Videos it has shipped</h2>
    <p class="ledger-note" data-reveal>Every one of these went through the pipeline, from raw.mp4 to the upload. Autumn 2026.</p>
    <ol class="rows">
      ${videos.map(([id, title, len, date], i) => `<li data-reveal style="--i:${i}">
        <a class="vrow" href="https://www.youtube.com/watch?v=${id}" data-thumb="${i}">
          ${i < 3 ? `<img class="vphone" src="assets/thumbs/${id}.jpg" alt="Thumbnail of the video ${esc(title)}" width="1280" height="720" loading="lazy">` : ''}
          <span class="vtitle">${esc(title)}</span>
          <span class="vlen nums">${len}</span>
          <span class="vdate nums">${date}</span>
        </a>
      </li>`).join('\n      ')}
    </ol>
  </div>
  <div class="preview" id="preview" aria-hidden="true">
    ${videos.map(([id, title], i) => `<img${i === 0 ? ' class="is-on"' : ''} src="assets/thumbs/${id}.jpg" alt="" width="1280" height="720" loading="lazy">`).join('\n    ')}
  </div>
</section>

<section class="commands wrap" id="commands" aria-labelledby="commands-h">
  <div class="commands-head">
    <h2 class="head" id="commands-h" data-reveal>All ${total} commands,<br>in eight groups</h2>
    <a class="button" href="${GITHUB}#readme" data-reveal>Read the source</a>
  </div>
  <div class="agenda">
    <div class="tabs" role="tablist" aria-label="Command groups">
      ${groups.map(([g, what, list], i) => `<button type="button" role="tab" id="tab-${g}" aria-controls="panel-${g}" aria-selected="${i === 0}" ${i === 0 ? '' : 'tabindex="-1"'}><span class="tab-name">${g}</span><span class="tab-what">${list.length} commands</span></button>`).join('\n      ')}
    </div>
    <div class="panels">
      ${groups.map(([g, what, list], i) => `<div class="panel" role="tabpanel" id="panel-${g}" aria-labelledby="tab-${g}"${i === 0 ? '' : ' data-off'}>
        <h3 class="panel-h">phantom ${g} <span>${what}</span></h3>
        <ul class="bands">
          ${list.map(([name, what2, usage, engine]) => `<li class="band">
            <span class="band-name">${name}</span>
            <span class="band-main"><span class="band-what">${what2}</span><code>phantom ${g} ${name} ${esc(usage)}</code></span>
            <span class="band-engine">${engine}</span>
          </li>`).join('\n          ')}
        </ul>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="cta wrap" aria-label="Get the code">
  <p data-reveal>All of it is on GitHub. Read it, fork it, or lift the one script you need.</p>
  <div class="actions" data-reveal>
    <a class="button" href="${GITHUB}">Star on GitHub</a>
    <a class="link-plain" href="${YOUTUBE}">Subscribe on YouTube</a>
  </div>
</section>

</main>

<footer class="tiles">
  <div class="tile t-say">
    <p class="lead">Built by Hassan Aziz for his own channel, and never finished.</p>
    <p class="small">© 2026 Hassan Aziz. B-roll clips and thumbnails on this page are his own.</p>
  </div>
  <nav class="tile t-nav" aria-label="Sections">
    <ul>
      <li><a class="link" href="#pipeline">Pipeline</a></li>
      <li><a class="link" href="#outputs">Outputs</a></li>
      <li><a class="link" href="#broll">B-roll</a></li>
      <li><a class="link" href="#videos">Videos</a></li>
      <li><a class="link" href="#commands">Commands</a></li>
    </ul>
  </nav>
  <div class="tile t-install">
    <p class="small">To try it</p>
    <pre class="cmd"><code>git clone ${GITHUB}
cd phantom-editor
uv sync && ./install.sh</code></pre>
  </div>
  <div class="tile t-links">
    <ul>
      <li><a class="link" href="${YOUTUBE}">YouTube</a></li>
      <li><a class="link" href="${X}">X</a></li>
      <li><a class="link" href="https://github.com/hassanaziz0012">GitHub</a></li>
      <li><a class="link" href="${SITE}">hassandev.me</a></li>
    </ul>
  </div>
  <div class="tile t-mark" aria-hidden="true"><span>phantom</span></div>
  <a class="tile t-go" href="${GITHUB}">
    <span class="lead">Star it on GitHub</span>
    <svg viewBox="0 0 48 48" width="56" height="56" aria-hidden="true"><path d="M8 40L40 8M14 8h26v26" fill="none" stroke="currentColor" stroke-width="4"/></svg>
  </a>
</footer>

<script src="main.js" defer></script>
</body>
</html>
`;

// ✓ ✗ ➜ are the tool's literal terminal output, kept as printed.
const out = html.split('\n').map((l) => (/[✓✗➜➔]/.test(l) && !l.includes('application/json') ? l + '<!-- taste-skill-ignore -->' : l)).join('\n');
writeFileSync(new URL('./index.html', import.meta.url), out);
console.log(`index.html written: ${total} commands, ${videos.length} videos, ${outputs.length} outputs`);
