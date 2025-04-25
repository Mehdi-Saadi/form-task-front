import moment from 'moment-jalaali';

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false })

export function jalaliToGregorian(jalaliDate: string): string | null {
  // Convert Persian digits to English digits
  const enDigits = jalaliDate.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());

  // Parse with moment-jalaali
  const m = moment(enDigits, 'jYYYY/jMM/jDD', true)
  return m.isValid() ? m.format('YYYY-MM-DD') : null
}

export function gregorianToJalali(gregDate: string): string {
  const m = moment(gregDate, 'YYYY-MM-DD')
  return m.format('jYYYY/jMM/jDD')
}

export function toPersianDigits(input: string): string {
  return input.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
}

export function toEnglishDigits(input: string): string {
  return input.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
}
