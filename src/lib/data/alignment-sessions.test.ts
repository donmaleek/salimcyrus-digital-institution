import {
  alignmentProcess,
  alignmentSessions,
  getAlignmentSession,
} from './alignment-sessions'

describe('alignment sessions', () => {
  it('publishes the two distinct confidential pathways', () => {
    expect(alignmentSessions.map((session) => session.slug)).toEqual([
      'identity-life-alignment',
      'single-motherhood-life-alignment',
    ])
  })

  it.each(alignmentSessions)('$shortTitle has complete structured content', (session) => {
    expect(session.audience).toHaveLength(6)
    expect(session.themes).toHaveLength(6)
    expect(session.principle).not.toHaveLength(0)
    expect(session.closing).not.toHaveLength(0)
    expect(getAlignmentSession(session.slug)).toBe(session)
  })

  it('uses the five-step Salim Cyrus approach', () => {
    expect(alignmentProcess.map(({ step }) => step)).toEqual([
      'Listen',
      'Understand',
      'Examine',
      'Align',
      'Move forward',
    ])
  })

  it('does not resolve an unknown public route', () => {
    expect(getAlignmentSession('unknown')).toBeUndefined()
  })
})
