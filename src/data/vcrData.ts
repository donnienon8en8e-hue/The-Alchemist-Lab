export interface VcrRow {
  test30min?: number;
  test45min?: number;
  test60min: number;
  velocityMs: number;
  timePerKm: string;
  timePer400m: string;
  regen70pct: string;
  tempo85pct: string;
  tempo90pct: string;
  tempo97pct: string;
  interval100pct: string;
}

export const VCR_TABLE_DATA: VcrRow[] = [
  { test60min: 9000, velocityMs: 2.5, timePerKm: "6:40", timePer400m: "2:40", regen70pct: "9:31", tempo85pct: "7:51", tempo90pct: "7:24", tempo97pct: "6:52", interval100pct: "6:20-6:30" },
  { test45min: 7020, test60min: 9360, velocityMs: 2.6, timePerKm: "6:25", timePer400m: "2:34", regen70pct: "9:10", tempo85pct: "7:32", tempo90pct: "7:07", tempo97pct: "6:37", interval100pct: "6:05-6:15" },
  { test30min: 4860, test45min: 7290, test60min: 9720, velocityMs: 2.7, timePerKm: "6:10", timePer400m: "2:28", regen70pct: "8:49", tempo85pct: "7:16", tempo90pct: "6:52", tempo97pct: "6:22", interval100pct: "5:50-6:00" },
  { test30min: 5040, test45min: 7560, test60min: 10440, velocityMs: 2.8, timePerKm: "5:57", timePer400m: "2:23", regen70pct: "8:30", tempo85pct: "7:00", tempo90pct: "6:37", tempo97pct: "6:08", interval100pct: "5:37-5:47" },
  { test30min: 5220, test45min: 8000, test60min: 10800, velocityMs: 3.0, timePerKm: "5:33", timePer400m: "2:13", regen70pct: "7:56", tempo85pct: "6:32", tempo90pct: "6:10", tempo97pct: "5:44", interval100pct: "5:13-5:23" },
  { test30min: 5580, test45min: 8370, test60min: 11160, velocityMs: 3.1, timePerKm: "5:23", timePer400m: "2:09", regen70pct: "7:40", tempo85pct: "6:20", tempo90pct: "5:53", tempo97pct: "5:33", interval100pct: "5:03-5:13" },
  { test30min: 5760, test45min: 8640, test60min: 11520, velocityMs: 3.2, timePerKm: "5:13", timePer400m: "2:05", regen70pct: "7:26", tempo85pct: "6:08", tempo90pct: "5:47", tempo97pct: "5:22", interval100pct: "4:53-5:03" },
  { test30min: 5940, test45min: 8910, test60min: 11880, velocityMs: 3.3, timePerKm: "5:03", timePer400m: "2:01", regen70pct: "7:13", tempo85pct: "5:57", tempo90pct: "5:37", tempo97pct: "5:12", interval100pct: "4:43-4:53" },
  { test30min: 6120, test45min: 9180, test60min: 12240, velocityMs: 3.4, timePerKm: "4:54", timePer400m: "1:58", regen70pct: "7:00", tempo85pct: "5:46", tempo90pct: "5:27", tempo97pct: "5:03", interval100pct: "4:34-4:44" },
  { test30min: 6300, test45min: 9450, test60min: 12600, velocityMs: 3.5, timePerKm: "4:46", timePer400m: "1:54", regen70pct: "6:43", tempo85pct: "5:36", tempo90pct: "5:17", tempo97pct: "4:55", interval100pct: "4:26-4:36" },
  { test30min: 6480, test45min: 9720, test60min: 12960, velocityMs: 3.6, timePerKm: "4:33", timePer400m: "1:51", regen70pct: "6:37", tempo85pct: "5:27", tempo90pct: "5:09", tempo97pct: "4:46", interval100pct: "4:18-4:28" },
  { test30min: 6660, test45min: 9990, test60min: 13320, velocityMs: 3.7, timePerKm: "4:30", timePer400m: "1:48", regen70pct: "6:26", tempo85pct: "5:18", tempo90pct: "5:00", tempo97pct: "4:39", interval100pct: "4:10-4:20" },
  { test30min: 6840, test45min: 10260, test60min: 13680, velocityMs: 3.8, timePerKm: "4:23", timePer400m: "1:45", regen70pct: "6:16", tempo85pct: "5:10", tempo90pct: "4:52", tempo97pct: "4:31", interval100pct: "4:03-4:13" },
  { test30min: 7020, test45min: 10530, test60min: 14040, velocityMs: 3.9, timePerKm: "4:16", timePer400m: "1:42", regen70pct: "6:06", tempo85pct: "5:02", tempo90pct: "4:45", tempo97pct: "4:24", interval100pct: "3:56-4:06" },
  { test30min: 7200, test45min: 10800, test60min: 14400, velocityMs: 4.0, timePerKm: "4:10", timePer400m: "1:40", regen70pct: "5:57", tempo85pct: "4:54", tempo90pct: "4:38", tempo97pct: "4:15", interval100pct: "3:50-4:00" },
  { test30min: 7380, test45min: 11070, test60min: 14760, velocityMs: 4.1, timePerKm: "4:04", timePer400m: "1:38", regen70pct: "5:43", tempo85pct: "4:47", tempo90pct: "4:31", tempo97pct: "4:11", interval100pct: "3:44-3:54" },
  { test30min: 7560, test45min: 11340, test60min: 15120, velocityMs: 4.2, timePerKm: "3:58", timePer400m: "1:35", regen70pct: "5:40", tempo85pct: "4:40", tempo90pct: "4:25", tempo97pct: "4:05", interval100pct: "3:38-3:48" },
  { test30min: 7740, test45min: 11610, test60min: 15480, velocityMs: 4.3, timePerKm: "3:53", timePer400m: "1:33", regen70pct: "5:32", tempo85pct: "4:34", tempo90pct: "4:19", tempo97pct: "4:00", interval100pct: "3:33-3:43" },
  { test30min: 7920, test45min: 11880, test60min: 15840, velocityMs: 4.4, timePerKm: "3:47", timePer400m: "1:31", regen70pct: "5:25", tempo85pct: "4:27", tempo90pct: "4:13", tempo97pct: "3:54", interval100pct: "3:27-3:37" },
  { test30min: 8100, test45min: 12150, test60min: 16200, velocityMs: 4.5, timePerKm: "3:42", timePer400m: "1:29", regen70pct: "5:17", tempo85pct: "4:21", tempo90pct: "4:07", tempo97pct: "3:49", interval100pct: "3:22-3:32" },
  { test30min: 8280, test45min: 12420, test60min: 16560, velocityMs: 4.6, timePerKm: "3:37", timePer400m: "1:27", regen70pct: "5:11", tempo85pct: "4:16", tempo90pct: "4:02", tempo97pct: "3:44", interval100pct: "3:17-3:27" },
  { test30min: 8460, test45min: 12690, test60min: 16920, velocityMs: 4.7, timePerKm: "3:33", timePer400m: "1:25", regen70pct: "5:04", tempo85pct: "4:10", tempo90pct: "3:56", tempo97pct: "3:39", interval100pct: "3:13-3:23" },
  { test30min: 8640, test45min: 12960, test60min: 17280, velocityMs: 4.8, timePerKm: "3:28", timePer400m: "1:23", regen70pct: "4:53", tempo85pct: "4:05", tempo90pct: "3:51", tempo97pct: "3:35", interval100pct: "3:08-3:18" },
  { test30min: 8820, test45min: 13230, test60min: 17640, velocityMs: 4.9, timePerKm: "3:24", timePer400m: "1:22", regen70pct: "4:52", tempo85pct: "4:00", tempo90pct: "3:47", tempo97pct: "3:30", interval100pct: "3:04-3:14" },
  { test30min: 9000, test45min: 13500, test60min: 18000, velocityMs: 5.0, timePerKm: "3:20", timePer400m: "1:20", regen70pct: "4:46", tempo85pct: "3:55", tempo90pct: "3:42", tempo97pct: "3:26", interval100pct: "3:00-3:10" },
  { test30min: 9180, test45min: 13770, test60min: 18360, velocityMs: 5.1, timePerKm: "3:16", timePer400m: "1:18", regen70pct: "4:40", tempo85pct: "3:51", tempo90pct: "3:38", tempo97pct: "3:22", interval100pct: "2:56-3:06" },
  { test30min: 9360, test45min: 14040, test60min: 18720, velocityMs: 5.2, timePerKm: "3:12", timePer400m: "1:16", regen70pct: "4:35", tempo85pct: "3:46", tempo90pct: "3:34", tempo97pct: "3:18", interval100pct: "2:52-3:02" },
  { test30min: 9540, test45min: 14310, test60min: 19080, velocityMs: 5.3, timePerKm: "3:09", timePer400m: "1:15", regen70pct: "4:30", tempo85pct: "3:42", tempo90pct: "3:30", tempo97pct: "3:15", interval100pct: "2:49-2:59" },
  { test30min: 9720, test45min: 14580, test60min: 19440, velocityMs: 5.4, timePerKm: "3:05", timePer400m: "1:14", regen70pct: "4:25", tempo85pct: "3:38", tempo90pct: "3:26", tempo97pct: "3:10", interval100pct: "2:45-2:55" },
  { test30min: 9900, test45min: 14850, test60min: 19800, velocityMs: 5.5, timePerKm: "3:01", timePer400m: "1:13", regen70pct: "4:20", tempo85pct: "3:34", tempo90pct: "3:22", tempo97pct: "3:07", interval100pct: "2:41-2:51" },
  { test30min: 10000, test45min: 15120, test60min: 20160, velocityMs: 5.6, timePerKm: "2:59", timePer400m: "1:10", regen70pct: "4:15", tempo85pct: "3:30", tempo90pct: "3:18", tempo97pct: "3:04", interval100pct: "2:39-2:49" },
  { test30min: 10260, test45min: 15390, test60min: 20520, velocityMs: 5.7, timePerKm: "2:55", timePer400m: "1:10", regen70pct: "4:11", tempo85pct: "3:26", tempo90pct: "3:15", tempo97pct: "3:01", interval100pct: "2:35-2:45" },
  { test30min: 10440, test45min: 15660, test60min: 20880, velocityMs: 5.8, timePerKm: "2:52", timePer400m: "1:09", regen70pct: "4:06", tempo85pct: "3:23", tempo90pct: "3:12", tempo97pct: "2:58", interval100pct: "2:32-2:42" },
  { test30min: 10620, test45min: 15930, test60min: 21240, velocityMs: 5.9, timePerKm: "2:49", timePer400m: "1:08", regen70pct: "4:02", tempo85pct: "3:19", tempo90pct: "3:08", tempo97pct: "2:55", interval100pct: "2:29-2:39" },
  { test30min: 10800, test45min: 16200, test60min: 21600, velocityMs: 6.0, timePerKm: "2:47", timePer400m: "1:07", regen70pct: "3:58", tempo85pct: "3:16", tempo90pct: "3:05", tempo97pct: "2:52", interval100pct: "2:27-2:37" },
  { test30min: 10980, test45min: 16470, test60min: 21960, velocityMs: 6.1, timePerKm: "2:44", timePer400m: "1:06", regen70pct: "3:54", tempo85pct: "3:13", tempo90pct: "3:02", tempo97pct: "2:49", interval100pct: "2:24-2:34" },
  { test30min: 11160, test45min: 16740, test60min: 22320, velocityMs: 6.2, timePerKm: "2:41", timePer400m: "1:05", regen70pct: "3:50", tempo85pct: "3:09", tempo90pct: "2:59", tempo97pct: "2:46", interval100pct: "2:21-2:31" },
  { test30min: 11340, test45min: 17010, test60min: 22680, velocityMs: 6.3, timePerKm: "2:39", timePer400m: "1:04", regen70pct: "3:47", tempo85pct: "3:07", tempo90pct: "2:56", tempo97pct: "2:44", interval100pct: "2:19-2:29" },
  { test30min: 11520, test45min: 17280, test60min: 23040, velocityMs: 6.4, timePerKm: "2:36", timePer400m: "1:03", regen70pct: "3:43", tempo85pct: "3:04", tempo90pct: "2:54", tempo97pct: "2:41", interval100pct: "2:16-2:26" },
  { test30min: 11700, test45min: 17550, test60min: 23400, velocityMs: 6.5, timePerKm: "2:34", timePer400m: "1:02", regen70pct: "3:40", tempo85pct: "3:01", tempo90pct: "2:51", tempo97pct: "2:39", interval100pct: "2:14-2:24" },
];

/**
 * Finds closest VcrRow given test distance or target velocity
 */
export function findVcrByTest(distanceMeters: number, testType: '30min' | '45min' | '60min'): VcrRow {
  let closest = VCR_TABLE_DATA[0];
  let minDiff = Infinity;

  for (const row of VCR_TABLE_DATA) {
    let target = row.test60min;
    if (testType === '30min' && row.test30min) target = row.test30min;
    if (testType === '45min' && row.test45min) target = row.test45min;

    const diff = Math.abs(target - distanceMeters);
    if (diff < minDiff) {
      minDiff = diff;
      closest = row;
    }
  }

  return closest;
}

export function findVcrByVelocity(velocityMs: number): VcrRow {
  let closest = VCR_TABLE_DATA[0];
  let minDiff = Infinity;

  for (const row of VCR_TABLE_DATA) {
    const diff = Math.abs(row.velocityMs - velocityMs);
    if (diff < minDiff) {
      minDiff = diff;
      closest = row;
    }
  }

  return closest;
}
