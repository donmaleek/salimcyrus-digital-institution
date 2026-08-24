import { slugify } from './slugify'

describe('slugify', () => {
  it('lowercases and hyphenates a normal title', () => {
    expect(slugify('Why Discipline Beats Motivation')).toBe('why-discipline-beats-motivation')
  })

  it('strips punctuation', () => {
    expect(slugify("People Vent on Social Media Because They Aren't Heard")).toBe(
      'people-vent-on-social-media-because-they-aren-t-heard'
    )
  })

  it('collapses repeated separators into one hyphen', () => {
    expect(slugify('Too   Many -- Spaces')).toBe('too-many-spaces')
  })

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  --Leading and trailing--  ')).toBe('leading-and-trailing')
  })

  it('returns an empty string for input with no letters or numbers', () => {
    expect(slugify('...???...')).toBe('')
  })
})
