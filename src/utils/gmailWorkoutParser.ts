export interface ParsedGmailWorkout {
  id: string;
  emailId: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  workoutTitle: string;
  distanceKm: string;
  timeMins: string;
  avgPace: string;
  avgHr: string;
  rpeMana: number;
  notes: string;
  source: 'Strava' | 'Garmin' | 'Nike' | 'Apple' | 'TrainingPeaks' | 'Coros' | 'Gmail Log';
  selected: boolean;
}

// Convert seconds/text time to minutes string
export function parseDurationToMins(timeStr: string): string {
  // matches 1h 15m, 1:15:30, 45:20, 45 mins
  const hmsMatch = timeStr.match(/(\d+):(\d{2}):(\d{2})/);
  if (hmsMatch) {
    const hours = parseInt(hmsMatch[1], 10);
    const mins = parseInt(hmsMatch[2], 10);
    return String(hours * 60 + mins);
  }
  const msMatch = timeStr.match(/(\d+):(\d{2})/);
  if (msMatch) {
    const mins = parseInt(msMatch[1], 10);
    return String(mins);
  }
  const wordedMatch = timeStr.match(/(?:(\d+)\s*(?:h|hr|hours?))?\s*(?:(\d+)\s*(?:m|min|mins?))?/i);
  if (wordedMatch && (wordedMatch[1] || wordedMatch[2])) {
    const hours = parseInt(wordedMatch[1] || '0', 10);
    const mins = parseInt(wordedMatch[2] || '0', 10);
    return String(hours * 60 + mins);
  }
  return '45';
}

export function parseWorkoutFromEmail(
  emailId: string,
  subject: string,
  from: string,
  dateStr: string,
  bodySnippet: string
): ParsedGmailWorkout {
  const fullText = `${subject} ${bodySnippet}`;
  
  // Detect Source
  let source: ParsedGmailWorkout['source'] = 'Gmail Log';
  if (/strava/i.test(from) || /strava/i.test(fullText)) source = 'Strava';
  else if (/garmin/i.test(from) || /garmin/i.test(fullText)) source = 'Garmin';
  else if (/nike/i.test(from) || /nike/i.test(fullText)) source = 'Nike';
  else if (/apple/i.test(from) || /fitness/i.test(fullText)) source = 'Apple';
  else if (/trainingpeaks/i.test(from) || /trainingpeaks/i.test(fullText)) source = 'TrainingPeaks';
  else if (/coros/i.test(from) || /coros/i.test(fullText)) source = 'Coros';

  // Distance parser (e.g. 10.5 km, 10.5km, 6.2 mi, 6.2 miles, 10 km)
  let distanceKm = '10.0';
  const kmMatch = fullText.match(/(\d+(?:\.\d+)?)\s*(?:km|k\b|kilometers?)/i);
  const miMatch = fullText.match(/(\d+(?:\.\d+)?)\s*(?:mi|miles?)/i);
  if (kmMatch) {
    distanceKm = parseFloat(kmMatch[1]).toFixed(1);
  } else if (miMatch) {
    const kmVal = parseFloat(miMatch[1]) * 1.60934;
    distanceKm = kmVal.toFixed(1);
  }

  // Duration parser
  let timeMins = '45';
  const timeMatch = fullText.match(/(?:time|duration|elapsed|moving time)[:\s]*([0-9:hm\s]+)/i) ||
    fullText.match(/(\d{1,2}:\d{2}(?::\d{2})?)/) ||
    fullText.match(/(\d+)\s*(?:mins?|minutes)/i);
  if (timeMatch) {
    timeMins = parseDurationToMins(timeMatch[1] || timeMatch[0]);
  }

  // Average Pace parser (e.g. 4:35 /km, 4'35", 7:15 /mi)
  let avgPace = '4:45 /km';
  const paceMatch = fullText.match(/(?:pace|avg pace|speed)[:\s]*(\d+[:'’]\d{2})\s*(?:\/km|\/mi|min\/km)?/i) ||
    fullText.match(/(\d+[:'’]\d{2})\s*(?:\/km|min\/km)/i);
  if (paceMatch) {
    avgPace = `${paceMatch[1].replace(/['’]/, ':')} /km`;
  } else if (parseFloat(distanceKm) > 0 && parseInt(timeMins, 10) > 0) {
    const totalSecs = parseInt(timeMins, 10) * 60;
    const distNum = parseFloat(distanceKm);
    const paceSecPerKm = Math.round(totalSecs / distNum);
    const pM = Math.floor(paceSecPerKm / 60);
    const pS = paceSecPerKm % 60;
    avgPace = `${pM}:${pS < 10 ? '0' : ''}${pS} /km`;
  }

  // Heart Rate parser (e.g. 158 bpm, avg hr: 162)
  let avgHr = '155';
  const hrMatch = fullText.match(/(?:hr|heart rate|bpm)[:\s]*(\d{2,3})/i) ||
    fullText.match(/(\d{2,3})\s*bpm/i);
  if (hrMatch) {
    const parsedHr = parseInt(hrMatch[1], 10);
    if (parsedHr >= 90 && parsedHr <= 220) {
      avgHr = String(parsedHr);
    }
  }

  // RPE Mana Estimate based on HR or Pace
  let rpeMana = 7;
  const hrNum = parseInt(avgHr, 10);
  if (hrNum >= 170) rpeMana = 9;
  else if (hrNum >= 160) rpeMana = 8;
  else if (hrNum >= 145) rpeMana = 7;
  else if (hrNum >= 130) rpeMana = 5;
  else rpeMana = 4;

  // Title formatting
  let cleanTitle = subject
    .replace(/^(re:|fwd:|fw:)\s*/i, '')
    .replace(/^(strava|garmin connect|nike run club|apple fitness):\s*/i, '')
    .trim();
  if (!cleanTitle || cleanTitle.length < 3) {
    cleanTitle = `${source} Activity (${distanceKm} KM)`;
  }

  // Format date
  let formattedDate = new Date().toISOString().split('T')[0];
  try {
    if (dateStr) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toISOString().split('T')[0];
      }
    }
  } catch (err) {
    // fallback
  }

  return {
    id: `gmail-run-${emailId || Math.random().toString(36).substring(2, 9)}`,
    emailId,
    subject,
    from,
    date: formattedDate,
    snippet: bodySnippet.slice(0, 180),
    workoutTitle: cleanTitle,
    distanceKm,
    timeMins,
    avgPace,
    avgHr,
    rpeMana,
    notes: `Imported via ${source} sync (${from}). Snippet: "${bodySnippet.slice(0, 80)}..."`,
    source,
    selected: true,
  };
}

// Fetch messages from Gmail API using OAuth token
export async function fetchGmailWorkouts(accessToken: string): Promise<ParsedGmailWorkout[]> {
  try {
    // Query for fitness and workout related emails
    const queries = [
      'subject:(run OR workout OR strava OR garmin OR "nike run" OR "tempo" OR "interval" OR "marathon" OR "10k" OR "5k")',
      'from:(strava OR garmin OR nike OR trainingpeaks OR coros)',
    ];
    const qParam = encodeURIComponent(queries.join(' OR '));
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${qParam}&maxResults=15`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }
    );

    if (!listRes.ok) {
      if (listRes.status === 401) {
        throw new Error('Gmail token expired or unauthorized. Please re-authenticate with Google.');
      }
      throw new Error(`Gmail API returned status ${listRes.status}`);
    }

    const listData = await listRes.json();
    const messages = listData.messages || [];

    if (messages.length === 0) {
      return [];
    }

    const parsedResults: ParsedGmailWorkout[] = [];

    // Fetch individual email details in parallel (max 8)
    const detailPromises = messages.slice(0, 8).map(async (msg: { id: string }) => {
      try {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/json',
            },
          }
        );
        if (!msgRes.ok) return null;
        const msgData = await msgRes.json();

        // Extract headers
        const headers = msgData.payload?.headers || [];
        const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || 'Workout Activity';
        const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'Runner';
        const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';
        const snippet = msgData.snippet || '';

        return parseWorkoutFromEmail(msg.id, subject, from, date, snippet);
      } catch (e) {
        console.warn('Error fetching message details:', e);
        return null;
      }
    });

    const detailedWorkouts = await Promise.all(detailPromises);
    for (const w of detailedWorkouts) {
      if (w) parsedResults.push(w);
    }

    return parsedResults;
  } catch (error: any) {
    console.error('Error fetching Gmail workouts:', error);
    throw error;
  }
}
