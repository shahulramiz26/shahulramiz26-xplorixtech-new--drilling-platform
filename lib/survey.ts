/* ==========================================================================
 * DOWNHOLE SURVEY GEOMETRY — for the DrilAxis preview
 *
 * DrilAxis is not built yet, so there are no real readings. What is real here
 * is the arithmetic: given a dip and a direction at each station, where the
 * hole actually is, how far that is from the planned line, and where it will
 * come out if nothing changes. The sample stations are generated; every
 * distance on the screen is then worked out from them, so the picture, the
 * table and the headline number always agree.
 * ========================================================================== */

export interface Station {
  depth: number        // metres along the hole
  dip: number          // degrees below horizontal, negative = down
  azimuth: number      // degrees from north
  north: number; east: number; down: number    // position, metres from the collar
  offset: number       // metres from the planned line at the same depth
  dogleg: number       // degrees of bend per 30 m since the last station
}

export interface Survey {
  id: string
  plannedDepth: number
  drilled: number
  plannedDip: number
  plannedAzimuth: number
  tolerance: number           // metres off the planned line that is still acceptable
  stations: Station[]         // station 0 is the collar
  offNow: number              // metres off plan at the deepest station
  projectedMiss: number       // metres off target if the hole carries on as it is going
  firstOver?: number          // depth where it first went past the tolerance
  target: { north: number; east: number; down: number }
  projectedEnd: { north: number; east: number; down: number }
  /* The turn that would bring the hole back inside the target, said the way a
   * driller would be told: lift or drop, left or right, over how many metres. */
  correction?: { lift: number; turn: number; over: number; feasible: boolean }
  /* The first station from which the hole, carried straight on, would already
   * have missed the target: the depth at which DrilAxis would have spoken. */
  warnedAt?: number
  driftPer100: number         // metres further off plan per 100 m, over the last stretch
}

const rad = (d: number) => (d * Math.PI) / 180
const unit = (dip: number, az: number) => ({
  north: Math.cos(rad(dip)) * Math.cos(rad(az)),
  east: Math.cos(rad(dip)) * Math.sin(rad(az)),
  down: -Math.sin(rad(dip)),
})
const dist = (a: { north: number; east: number; down: number }, b: { north: number; east: number; down: number }) =>
  Math.hypot(a.north - b.north, a.east - b.east, a.down - b.down)

export interface SurveySpec {
  id: string
  plannedDepth: number
  drilled: number
  plannedDip?: number        // default −60
  plannedAzimuth?: number    // default 135
  offPlan: number            // metres off the planned line at the drilled depth
  spacing?: number           // metres between stations, default 30
  tolerance?: number         // default 5
  /* Which way the hole wanders. lift > 0 flattens the hole, turn > 0 swings it
   * clockwise. Only the proportion matters; the size is set by offPlan. */
  lift?: number
  turn?: number
}

function walk(spec: Required<Omit<SurveySpec, 'id' | 'offPlan'>>, scale: number, depths: number[]) {
  const out: Omit<Station, 'offset'>[] = [{ depth: 0, dip: spec.plannedDip, azimuth: spec.plannedAzimuth, north: 0, east: 0, down: 0, dogleg: 0 }]
  let pos = { north: 0, east: 0, down: 0 }
  let prev = out[0]
  depths.forEach(depth => {
    // Drift builds slowly near the collar and faster with depth, which is how
    // a hole in layered ground actually behaves.
    const f = Math.pow(depth / spec.drilled, 1.25)
    const dip = spec.plannedDip + spec.lift * scale * f
    const azimuth = spec.plannedAzimuth + spec.turn * scale * f
    const a = unit(prev.dip, prev.azimuth), b = unit(dip, azimuth)
    const len = depth - prev.depth
    // Average of the direction at the top and bottom of the interval.
    pos = { north: pos.north + ((a.north + b.north) / 2) * len, east: pos.east + ((a.east + b.east) / 2) * len, down: pos.down + ((a.down + b.down) / 2) * len }
    const bend = (Math.acos(Math.min(1, a.north * b.north + a.east * b.east + a.down * b.down)) * 180) / Math.PI
    const st = { depth, dip, azimuth, ...pos, dogleg: len > 0 ? (bend / len) * 30 : 0 }
    out.push(st)
    prev = st
  })
  return out
}

export function buildSurvey(s: SurveySpec): Survey {
  const spec = {
    plannedDepth: s.plannedDepth, drilled: s.drilled,
    plannedDip: s.plannedDip ?? -60, plannedAzimuth: s.plannedAzimuth ?? 135,
    spacing: s.spacing ?? 30, tolerance: s.tolerance ?? 5,
    lift: s.lift ?? 1, turn: s.turn ?? 1.6,
  }
  const depths: number[] = []
  for (let d = spec.spacing; d < spec.drilled; d += spec.spacing) depths.push(d)
  depths.push(spec.drilled)

  const line = unit(spec.plannedDip, spec.plannedAzimuth)
  const onPlan = (depth: number) => ({ north: line.north * depth, east: line.east * depth, down: line.down * depth })
  const offAtEnd = (scale: number) => {
    const w = walk(spec, scale, depths)
    return dist(w[w.length - 1], onPlan(spec.drilled))
  }
  // Angles are small, so the distance off plan grows in step with them: find
  // the size of drift that lands exactly on the recorded figure.
  const base = offAtEnd(1)
  let scale = base > 0 ? s.offPlan / base : 0
  for (let i = 0; i < 3 && base > 0; i++) scale *= s.offPlan / (offAtEnd(scale) || 1)

  const stations: Station[] = walk(spec, scale, depths).map(st => ({
    ...st,
    dip: +st.dip.toFixed(1), azimuth: +st.azimuth.toFixed(1),
    offset: +dist(st, onPlan(st.depth)).toFixed(1),
    dogleg: +st.dogleg.toFixed(2),
  }))

  const last = stations[stations.length - 1]
  const target = onPlan(spec.plannedDepth)
  const togo = Math.max(0, spec.plannedDepth - spec.drilled)
  const heading = unit(last.dip, last.azimuth)
  const projectedEnd = { north: last.north + heading.north * togo, east: last.east + heading.east * togo, down: last.down + heading.down * togo }
  const projectedMiss = +dist(projectedEnd, target).toFixed(1)

  // Aim from where the hole is now straight at the target.
  let correction: Survey['correction']
  if (togo > 0 && projectedMiss > spec.tolerance) {
    const v = { north: target.north - last.north, east: target.east - last.east, down: target.down - last.down }
    const h = Math.hypot(v.north, v.east)
    const wantDip = (-Math.atan2(v.down, h) * 180) / Math.PI
    const wantAz = ((Math.atan2(v.east, v.north) * 180) / Math.PI + 360) % 360
    const want = unit(wantDip, wantAz)
    const angle = (Math.acos(Math.min(1, want.north * heading.north + want.east * heading.east + want.down * heading.down)) * 180) / Math.PI
    // A hole can be bent about 3 degrees in 30 m without hurting the rods, and
    // it has to bend that way and then straighten, so half of that is usable.
    const feasible = angle <= (togo / 30) * 1.5
    correction = { lift: +(wantDip - last.dip).toFixed(1), turn: +(wantAz - last.azimuth).toFixed(1), over: Math.round(Math.min(togo, Math.max(30, (angle / 3) * 30))), feasible }
  }

  const warnedAt = stations.slice(1).find(st => {
    const h = unit(st.dip, st.azimuth)
    const left = spec.plannedDepth - st.depth
    return dist({ north: st.north + h.north * left, east: st.east + h.east * left, down: st.down + h.down * left }, target) > spec.tolerance
  })?.depth

  const back = stations[Math.max(0, stations.length - 3)]
  const run = last.depth - back.depth
  return {
    id: s.id, plannedDepth: spec.plannedDepth, drilled: spec.drilled,
    plannedDip: spec.plannedDip, plannedAzimuth: spec.plannedAzimuth, tolerance: spec.tolerance,
    stations, offNow: last.offset, projectedMiss,
    firstOver: stations.find(st => st.offset > spec.tolerance)?.depth,
    target, projectedEnd, correction, warnedAt,
    driftPer100: run > 0 ? +(((last.offset - back.offset) / run) * 100).toFixed(1) : 0,
  }
}
