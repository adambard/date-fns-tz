import assert from 'power-assert'
import format from 'date-fns/format'
import utcToZonedTime from '.'

describe('utcToZonedTime', function() {
  it('returns the equivalent date at the time zone for a date string and IANA tz', function() {
    var result = utcToZonedTime('2014-06-25T10:00:00.123Z', 'America/New_York')
    assert.equal(
      format(result, "yyyy-MM-dd'T'HH:mm:ss.SSS"),
      '2014-06-25T06:00:00.123'
    )
  })

  it('returns the equivalent date at the time zone for a date instance and IANA tz', function() {
    var result = utcToZonedTime(
      new Date('2014-06-25T10:00:00.123Z'),
      'Europe/Paris'
    )
    assert.equal(
      format(result, "yyyy-MM-dd'T'HH:mm:ss.SSS"),
      '2014-06-25T12:00:00.123'
    )
  })

  it('returns the same date/time for UTC', function() {
    var result = utcToZonedTime('2014-06-25T10:00:00.123Z', 'UTC')
    assert.equal(
      format(result, "yyyy-MM-dd'T'HH:mm:ss.SSS"),
      '2014-06-25T10:00:00.123'
    )
  })

  it('returns the equivalent date at the time zone for a date string and tz offset', function() {
    var result = utcToZonedTime('2014-06-25T10:00:00.123Z', '-04:00')
    assert.equal(
      format(result, "yyyy-MM-dd'T'HH:mm:ss.SSS"),
      '2014-06-25T06:00:00.123'
    )
  })

  it('returns the equivalent date at the time zone for a date instance and tz offset', function() {
    var result = utcToZonedTime(new Date('2014-06-25T10:00:00.123Z'), '+0200')
    assert.equal(
      format(result, "yyyy-MM-dd'T'HH:mm:ss.SSS"),
      '2014-06-25T12:00:00.123'
    )
  })

  it('returns the same date/time for Z', function() {
    var result = utcToZonedTime('2014-06-25T10:00:00.123Z', 'Z')
    assert.equal(
      format(result, "yyyy-MM-dd'T'HH:mm:ss.SSS"),
      '2014-06-25T10:00:00.123'
    )
  })

  it('does not wrap to the following day when the result is midnight', function() {
    var result = utcToZonedTime(
      new Date('Thu Jan 23 2020 05:00:00 GMT+0000 (Greenwich Mean Time)'),
      'America/New_York' // -5 hours
    )
    assert.equal(
      format(result, "yyyy-MM-dd'T'HH:mm:ss.SSS"),
      '2020-01-23T00:00:00.000'
    )
  })

  it('returns the correct date/time during time change', function() {
    // zoned time one day behind
    [
      [
        new Date('Sun Nov 1 2020 06:45:00 GMT-0000 (Greenwich Mean Time)'),
        'America/Los_Angeles', // -7 hours
        '2020-10-31T23:45:00.000'
      ],
      [
        new Date('Sun Nov 1 2020 08:45:00 GMT-0000 (Greenwich Mean Time)'),
        'America/Los_Angeles', // -7 hours
        '2020-11-01T01:45:00.000'
      ],
      [
        new Date('Sun Nov 1 2020 09:45:00 GMT-0000 (Greenwich Mean Time)'),
        'America/Los_Angeles', // -8 hours
        '2020-11-01T01:45:00.000'
      ],
      [
        new Date('2021-03-14T02:45:00.000Z'),
        'America/Los_Angeles', // -8 hours
        '2021-03-13T18:45:00.000'
      ],
      [
        new Date('2021-03-14T02:45:00.000Z'),
        'America/New_York', // -5 hours
        '2021-03-13T21:45:00.000'
      ],
      [
        new Date('2021-03-14T01:45:00.000Z'),
        'America/New_York', // -5 hours
        '2021-03-13T20:45:00.000'
      ],
      [
        new Date('2021-03-14T06:05:00.000Z'),
        'America/New_York', // -5 hours (before DST)
        '2021-03-14T01:05:00.000'
      ],
      [
        new Date('2021-03-14T07:05:00.000Z'),
        'America/New_York', // -4 hours (during DST)
        '2021-03-14T03:05:00.000'
      ]
    ].forEach(([input, tz, expected]) => {
      const result = utcToZonedTime(input, tz);
      assert.equal(format(result, "yyyy-MM-dd'T'HH:mm:ss.SSS"), expected)
    })
  })
})
